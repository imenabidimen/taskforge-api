import { PrismaClient } from '@prisma/client';

describe('PostgreSQL persistence', () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('persists a user and an owned task', async () => {
    const user = await prisma.user.create({
      data: { email: 'integration@example.com', passwordHash: 'test-hash' },
    });

    const task = await prisma.task.create({
      data: { title: 'Verify database persistence', ownerId: user.id },
    });

    const stored = await prisma.task.findUnique({
      where: { id: task.id },
      include: { owner: true },
    });

    expect(stored?.title).toBe('Verify database persistence');
    expect(stored?.owner.email).toBe('integration@example.com');
  });

  it('persists production-order state and its audit history', async () => {
    const user = await prisma.user.create({
      data: { email: 'production-integration@example.com', passwordHash: 'test-hash' },
    });
    const order = await prisma.productionOrder.create({
      data: {
        orderNumber: 'PO-INTEGRATION-1',
        materialCode: 'MAT-1',
        plannedQuantity: 5,
        createdById: user.id,
      },
    });

    await prisma.productionOrder.update({
      where: { id: order.id },
      data: { status: 'RELEASED', version: { increment: 1 } },
    });
    await prisma.productionOrderEvent.create({
      data: {
        orderId: order.id,
        fromStatus: 'CREATED',
        toStatus: 'RELEASED',
        actorId: user.id,
        reason: 'integration test',
      },
    });

    const stored = await prisma.productionOrder.findUnique({
      where: { id: order.id },
      include: { createdBy: true, events: true },
    });
    expect(stored?.status).toBe('RELEASED');
    expect(stored?.version).toBe(1);
    expect(stored?.createdBy.email).toBe('production-integration@example.com');
    expect(stored?.events).toHaveLength(1);
    expect(stored?.events[0]).toMatchObject({
      fromStatus: 'CREATED',
      toStatus: 'RELEASED',
      actorId: user.id,
      reason: 'integration test',
    });
  });

  it('enforces production-order number uniqueness in PostgreSQL', async () => {
    const user = await prisma.user.create({
      data: { email: 'production-duplicate@example.com', passwordHash: 'test-hash' },
    });
    const data = {
      orderNumber: 'PO-DUPLICATE-1',
      materialCode: 'MAT-1',
      plannedQuantity: 5,
      createdById: user.id,
    };
    await prisma.productionOrder.create({ data });
    await expect(prisma.productionOrder.create({ data })).rejects.toMatchObject({
      code: 'P2002',
    });
  });

});
