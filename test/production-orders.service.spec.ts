import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductionOrderStatus } from '@prisma/client';
import { ProductionOrdersService } from '../src/production-orders.service';

describe('ProductionOrdersService', () => {
  const currentOrder = {
    id: 'order-1',
    orderNumber: 'PO-100',
    materialCode: 'MAT-42',
    plannedQuantity: 25,
    status: ProductionOrderStatus.CREATED,
    version: 0,
    createdById: 'user-1',
  };

  function setup(overrides: {
    current?: typeof currentOrder | null;
    updateCount?: number;
  } = {}) {
    const order = overrides.current === undefined ? { ...currentOrder } : overrides.current;
    const tx = {
      productionOrder: {
        create: jest.fn(({ data }) => Promise.resolve({ id: 'order-1', ...data })),
        findFirst: jest.fn(() => Promise.resolve(order)),
        updateMany: jest.fn(() => Promise.resolve({ count: overrides.updateCount ?? 1 })),
        findUniqueOrThrow: jest.fn(() => Promise.resolve({
          ...currentOrder,
          status: ProductionOrderStatus.RELEASED,
          version: 1,
        })),
        findMany: jest.fn(() => Promise.resolve([])),
      },
      productionOrderEvent: {
        create: jest.fn(({ data }) => Promise.resolve({ id: 'event-1', ...data })),
      },
    };
    const prisma = {
      ...tx,
      $transaction: jest.fn((callback: (transaction: typeof tx) => unknown) => callback(tx)),
    };
    return { service: new ProductionOrdersService(prisma as never), prisma, tx };
  }

  it('creates an order owned by the authenticated user', async () => {
    const { service, tx } = setup();
    await service.create('user-1', {
      orderNumber: 'PO-100',
      materialCode: 'MAT-42',
      plannedQuantity: 25,
    });
    expect(tx.productionOrder.create).toHaveBeenCalledWith({
      data: {
        orderNumber: 'PO-100',
        materialCode: 'MAT-42',
        plannedQuantity: 25,
        createdById: 'user-1',
      },
    });
  });

  it('records the actor and reason when a valid transition succeeds', async () => {
    const { service, tx } = setup();
    await expect(
      service.transition('user-1', 'order-1', ProductionOrderStatus.RELEASED, 'Materials verified'),
    ).resolves.toMatchObject({ status: ProductionOrderStatus.RELEASED, version: 1 });

    expect(tx.productionOrder.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        createdById: 'user-1',
        status: ProductionOrderStatus.CREATED,
        version: 0,
      },
      data: {
        status: ProductionOrderStatus.RELEASED,
        version: { increment: 1 },
      },
    });
    expect(tx.productionOrderEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        fromStatus: ProductionOrderStatus.CREATED,
        toStatus: ProductionOrderStatus.RELEASED,
        actorId: 'user-1',
        reason: 'Materials verified',
      },
    });
  });

  it('rejects a transition that skips required states', async () => {
    const { service, tx } = setup();
    await expect(
      service.transition('user-1', 'order-1', ProductionOrderStatus.COMPLETED),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.productionOrder.updateMany).not.toHaveBeenCalled();
    expect(tx.productionOrderEvent.create).not.toHaveBeenCalled();
  });

  it('does not reveal orders owned by another user', async () => {
    const { service, tx } = setup({ current: null });
    await expect(
      service.transition('user-2', 'order-1', ProductionOrderStatus.RELEASED),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.productionOrder.findFirst).toHaveBeenCalledWith({
      where: { id: 'order-1', createdById: 'user-2' },
    });
  });

  it('rejects a concurrent update rather than recording a false transition', async () => {
    const { service, tx } = setup({ updateCount: 0 });
    await expect(
      service.transition('user-1', 'order-1', ProductionOrderStatus.RELEASED),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.productionOrderEvent.create).not.toHaveBeenCalled();
  });
});
