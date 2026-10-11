import { Logger } from '@nestjs/common';
import { RequestLoggingMiddleware } from '../src/request-logging.middleware';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;
  let setHeader: jest.Mock;
  let on: jest.Mock;
  let next: jest.Mock;
  let log: jest.SpyInstance;
  let error: jest.SpyInstance;
  let finish: (() => void) | undefined;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
    setHeader = jest.fn();
    on = jest.fn((event: string, callback: () => void) => {
      if (event === 'finish') finish = callback;
    });
    next = jest.fn();
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    finish = undefined;
  });

  afterEach(() => jest.restoreAllMocks());

  function invoke(options: {
    requestId?: string;
    path?: string;
    statusCode?: number;
  } = {}) {
    const request = {
      method: 'GET',
      path: options.path ?? '/api/tasks',
      header: jest.fn(() => options.requestId),
    } as any;
    const response = {
      setHeader,
      on,
      statusCode: options.statusCode ?? 200,
    } as any;

    middleware.use(request, response, next);
    return { request, response };
  }

  it('creates a request ID, returns it in the response, and logs structured timing', () => {
    invoke();
    expect(setHeader).toHaveBeenCalledWith('x-request-id', expect.any(String));
    expect(next).toHaveBeenCalledTimes(1);

    finish?.();
    const record = JSON.parse(String(log.mock.calls[0][0]));
    expect(record).toMatchObject({
      event: 'http_request',
      requestId: expect.any(String),
      method: 'GET',
      path: '/api/tasks',
      statusCode: 200,
      durationMs: expect.any(Number),
    });
  });

  it('preserves a safe caller-provided request ID', () => {
    invoke({ requestId: 'trace-123' });
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'trace-123');
  });

  it('replaces unsafe request IDs and does not log query strings', () => {
    invoke({ requestId: 'bad\nvalue', path: '/api/tasks' });
    expect(setHeader).toHaveBeenCalledWith('x-request-id', expect.not.stringContaining('\n'));
    finish?.();
    const record = JSON.parse(String(log.mock.calls[0][0]));
    expect(record.path).toBe('/api/tasks');
    expect(JSON.stringify(record)).not.toContain('secret');
  });

  it('uses error-level logging for server errors', () => {
    invoke({ statusCode: 503 });
    finish?.();
    expect(error).toHaveBeenCalledTimes(1);
    expect(log).not.toHaveBeenCalled();
  });
});
