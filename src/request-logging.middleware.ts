import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,100}$/;

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const suppliedId = request.header('x-request-id');
    const requestId =
      suppliedId && REQUEST_ID_PATTERN.test(suppliedId)
        ? suppliedId
        : randomUUID();
    const startedAt = process.hrtime.bigint();

    response.setHeader('x-request-id', requestId);
    response.on('finish', () => {
      const durationMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const record = {
        event: 'http_request',
        requestId,
        method: request.method,
        // Do not log query strings: they can contain sensitive values.
        path: request.path,
        statusCode: response.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      };

      const serialized = JSON.stringify(record);
      if (response.statusCode >= 500) {
        this.logger.error(serialized);
      } else {
        this.logger.log(serialized);
      }
    });

    next();
  }
}
