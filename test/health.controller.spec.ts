import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from '../src/health.controller';
import { PrismaService } from '../src/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn();
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('reports liveness without depending on PostgreSQL', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('reports readiness when PostgreSQL responds', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'ok' },
    });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns a sanitized unavailable response when PostgreSQL fails', async () => {
    queryRaw.mockRejectedValue(new Error('private connection detail'));

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
    try {
      await controller.ready();
    } catch (error) {
      expect(error.getResponse()).toEqual({
        status: 'error',
        checks: { database: 'unavailable' },
      });
      expect(JSON.stringify(error.getResponse())).not.toContain('private connection detail');
    }
  });
});
