import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, title: string) {
    return this.prisma.task.create({
      data: { ownerId, title },
    });
  }

  findMine(ownerId: string) {
    return this.prisma.task.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async complete(ownerId: string, id: string) {
    const result = await this.prisma.task.updateMany({
      where: { id, ownerId },
      data: { completed: true },
    });

    if (result.count === 0) throw new NotFoundException('Task not found');

    return this.prisma.task.findUniqueOrThrow({ where: { id } });
  }
}
