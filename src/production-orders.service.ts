import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductionOrderStatus } from '@prisma/client';
import { PrismaService } from './prisma.service';

const ALLOWED_TRANSITIONS: Record<ProductionOrderStatus, ProductionOrderStatus[]> = {
  CREATED: ['RELEASED', 'CANCELLED'],
  RELEASED: ['RUNNING', 'CANCELLED'],
  RUNNING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class ProductionOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ownerId: string,
    input: { orderNumber: string; materialCode: string; plannedQuantity: number },
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.productionOrder.create({
          data: { ...input, createdById: ownerId },
        });
        return order;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Production order number already exists');
      }
      throw error;
    }
  }

  listMine(ownerId: string) {
    return this.prisma.productionOrder.findMany({
      where: { createdById: ownerId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        events: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
      },
    });
  }

  async transition(
    ownerId: string,
    orderId: string,
    nextStatus: ProductionOrderStatus,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.productionOrder.findFirst({
        where: { id: orderId, createdById: ownerId },
      });

      if (!current) throw new NotFoundException('Production order not found');

      if (!ALLOWED_TRANSITIONS[current.status].includes(nextStatus)) {
        throw new ConflictException(
          `Cannot transition production order from ${current.status} to ${nextStatus}`,
        );
      }

      // Compare-and-swap prevents two concurrent requests from applying
      // transitions against the same version of the order.
      const updated = await tx.productionOrder.updateMany({
        where: {
          id: current.id,
          createdById: ownerId,
          status: current.status,
          version: current.version,
        },
        data: { status: nextStatus, version: { increment: 1 } },
      });

      if (updated.count !== 1) {
        throw new ConflictException('Production order changed; reload and retry');
      }

      await tx.productionOrderEvent.create({
        data: {
          orderId: current.id,
          fromStatus: current.status,
          toStatus: nextStatus,
          actorId: ownerId,
          reason: reason?.trim() || null,
        },
      });

      return tx.productionOrder.findUniqueOrThrow({
        where: { id: current.id },
      });
    });
  }
}
