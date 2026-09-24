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
});
