import { NotFoundException } from '@nestjs/common';
import { TasksService } from '../src/tasks.service';

describe('TasksService', () => {
  function service() {
    const tasks = new Map<string, any>();
    const prisma = {
      task: {
        create: jest.fn(({ data }: any) => {
          const task = { id: crypto.randomUUID(), completed: false, createdAt: new Date(), updatedAt: new Date(), ...data };
          tasks.set(task.id, task);
          return Promise.resolve(task);
        }),
        findMany: jest.fn(({ where }: any) => Promise.resolve([...tasks.values()].filter(t => t.ownerId === where.ownerId))),
        updateMany: jest.fn(({ where, data }: any) => {
          const task = tasks.get(where.id);
          if (!task || task.ownerId !== where.ownerId) return Promise.resolve({ count: 0 });
          Object.assign(task, data);
          return Promise.resolve({ count: 1 });
        }),
        findUniqueOrThrow: jest.fn(({ where }: any) => Promise.resolve(tasks.get(where.id))),
      },
    };
    return new TasksService(prisma as any);
  }

  it('creates and lists tasks for their owner', async () => {
    const s = service();
    const task = await s.create('u1', 'Ship release');
    expect(task).toMatchObject({ ownerId: 'u1', title: 'Ship release', completed: false });
    expect(await s.findMine('u1')).toHaveLength(1);
    expect(await s.findMine('u2')).toHaveLength(0);
  });

  it('completes an owned task', async () => {
    const s = service();
    const task = await s.create('u1', 'Ship release');
    expect((await s.complete('u1', task.id)).completed).toBe(true);
  });

  it("prevents one user from completing another user's task", async () => {
    const s = service();
    const task = await s.create('u1', 'Private task');
    await expect(s.complete('u2', task.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});