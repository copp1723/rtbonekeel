import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedisService } from '../../src/services/redisService'; // Adjust path as needed
import type { Redis as RedisClient } from 'ioredis';

// Mock ioredis
const mockRedisClient = {
  ping: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  quit: vi.fn(),
  connect: vi.fn().mockImplementation(() => Promise.resolve()), // Mock connect for ioredis v5+
  status: 'ready', // Initial status
};

vi.mock('ioredis', () => ({
  default: vi.fn(() => mockRedisClient),
}));

// Mock logger
vi.mock('../../src/shared/logger.js', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Mock config loader
vi.mock('../../src/config/index.js', () => ({ // Changed import path
  default: vi.fn().mockResolvedValue({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
}));

describe('RedisService', () => {
  let redisService: RedisService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate ioredis constructor behavior for event listeners
    mockRedisClient.on.mockImplementation((event, handler) => {
      if (event === 'connect') {
        // Store connect handler to call it manually
        (mockRedisClient as any)._connectHandler = handler;
      }
      if (event === 'error') {
        (mockRedisClient as any)._errorHandler = handler;
      }
      if (event === 'close') {
        (mockRedisClient as any)._closeHandler = handler;
      }
      return mockRedisClient as any;
    });
     mockRedisClient.once.mockImplementation((event, handler) => {
      if (event === 'connected') {
        (mockRedisClient as any)._connectedOnceHandler = handler;
      }
       if (event === 'error') {
        (mockRedisClient as any)._errorOnceHandler = handler;
      }
      return mockRedisClient as any;
    });
    redisService = new RedisService();
  });

  afterEach(async () => {
    await redisService.close();
  });

  it('should initialize and connect to Redis successfully', async () => {
    mockRedisClient.ping.mockResolvedValue('PONG');
    
    // Capture the promise returned by initialize()
    const initializePromise = redisService.initialize();

    // Simulate the async nature of connection and event emission
    // Allow microtasks to run so that event listeners can be set up by RedisService
    await new Promise(setImmediate);

    // Manually trigger connect event as ioredis would
    if ((mockRedisClient as any)._connectHandler) {
      (mockRedisClient as any)._connectHandler();
    }
    // Manually trigger 'connected' event for waitForConnection
    if ((mockRedisClient as any)._connectedOnceHandler) {
      (mockRedisClient as any)._connectedOnceHandler();
    }

    const initialized = await initializePromise; // Await the completion of initialize()

    expect(initialized).toBe(true);
    expect(redisService.isAvailable()).toBe(true);
    expect(redisService.getStatus()).toBe('connected');
    expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockRedisClient.on).toHaveBeenCalledWith('close', expect.any(Function));
  });

  it('should handle connection error during initialization', async () => {
    const connectError = new Error('Connection failed');
    
    // Temporarily unmock and re-mock ioredis for this specific test case
    vi.unmock('ioredis');
    vi.doMock('ioredis', () => ({
      default: vi.fn(() => ({
        ...mockRedisClient,
        ping: vi.fn().mockRejectedValue(connectError), // Fail ping
        on: vi.fn().mockImplementation((event, handler) => {
          if (event === 'error') {
            // Call error handler immediately for test
            handler(connectError);
          }
        }),
        once: vi.fn().mockImplementation((event, handler) => {
          if (event === 'error') {
            // Call error handler immediately for waitForConnection
            handler(connectError);
          }
        }),
        connect: vi.fn().mockRejectedValue(connectError) // Mock connect to fail
      })),
    }));

    // Re-create RedisService instance with the new mock for ioredis
    const FailingRedisService = (await import('../../src/services/redisService')).RedisService;
    redisService = new FailingRedisService();

    const initialized = await redisService.initialize();

    expect(initialized).toBe(false);
    expect(redisService.isAvailable()).toBe(false);
    expect(redisService.getStatus()).toBe('error');
  });

  it('should handle Redis error event', async () => {
    // Initialize and connect
    const initializePromise = redisService.initialize();
    await new Promise(setImmediate);
    if ((mockRedisClient as any)._connectHandler) {
      (mockRedisClient as any)._connectHandler();
    }
    if ((mockRedisClient as any)._connectedOnceHandler) {
      (mockRedisClient as any)._connectedOnceHandler();
    }
    await initializePromise;

    const testError = new Error('Redis test error');
    const errorSpy = vi.spyOn(redisService, 'emit');

    // Simulate error event from ioredis client
    expect((mockRedisClient as any)._errorHandler).toBeDefined();
    (mockRedisClient as any)._errorHandler(testError);

    expect(errorSpy).toHaveBeenCalledWith('error', testError);
    // The status might remain 'connected' or change depending on exact handling of non-fatal errors
    // For this test, we primarily check if the error is emitted.
  });

  it('should handle disconnect event and attempt to reconnect', async () => {
    mockRedisClient.ping.mockResolvedValue('PONG');
    const initializePromise = redisService.initialize();
    await new Promise(setImmediate);
     if ((mockRedisClient as any)._connectHandler) {
      (mockRedisClient as any)._connectHandler();
    }
    if ((mockRedisClient as any)._connectedOnceHandler) {
      (mockRedisClient as any)._connectedOnceHandler();
    }
    const initialized = await initializePromise;

    expect(initialized).toBe(true);
    expect(redisService.getStatus()).toBe('connected');

    const reconnectSpy = vi.spyOn(redisService as any, 'scheduleReconnect');
    const disconnectSpy = vi.spyOn(redisService, 'emit');

    // Simulate close event from ioredis client
    expect((mockRedisClient as any)._closeHandler).toBeDefined();
    (mockRedisClient as any)._closeHandler();
    
    expect(redisService.getStatus()).toBe('disconnected');
    expect(disconnectSpy).toHaveBeenCalledWith('disconnected');
    expect(reconnectSpy).toHaveBeenCalled();
  });

  it('should perform health check successfully when connected', async () => {
    mockRedisClient.ping.mockResolvedValue('PONG');
    const initializePromise = redisService.initialize();
    await new Promise(setImmediate);
    if ((mockRedisClient as any)._connectHandler) {
      (mockRedisClient as any)._connectHandler();
    }
     if ((mockRedisClient as any)._connectedOnceHandler) {
      (mockRedisClient as any)._connectedOnceHandler();
    }
    const initialized = await initializePromise;
    expect(initialized).toBe(true);

    // Health check should be started automatically on connect.
    // We will test checkHealth directly or its effects.
    vi.useFakeTimers();

    const healthCheckEmitSpy = vi.spyOn(redisService, 'emit');
    // Manually call checkHealth as startHealthCheck is private and uses setInterval
    await redisService.checkHealth(); 
    
    expect(healthCheckEmitSpy).toHaveBeenCalledWith('healthCheck', 'connected');
    // Ping is called once during initial connect, and once by checkHealth directly.
    // If initialize already called ping, this might be 2 or more depending on mock setup.
    // Let's ensure it's called at least once by checkHealth.
    expect(mockRedisClient.ping).toHaveBeenCalled(); 

    vi.useRealTimers(); // Restore real timers
  });

  it('should attempt to reconnect after health check failure', async () => {
    // Initial successful connection
    mockRedisClient.ping.mockResolvedValue('PONG');
    const initializePromise = redisService.initialize();
    await new Promise(setImmediate);
    if ((mockRedisClient as any)._connectHandler) {
      (mockRedisClient as any)._connectHandler();
    }
    if ((mockRedisClient as any)._connectedOnceHandler) {
      (mockRedisClient as any)._connectedOnceHandler();
    }
    await initializePromise;
    expect(redisService.getStatus()).toBe('connected');

    // Mock ping to fail for health check
    mockRedisClient.ping.mockRejectedValue(new Error('Ping failed'));
    const scheduleReconnectSpy = vi.spyOn(redisService as any, 'scheduleReconnect');
    const healthCheckEmitSpy = vi.spyOn(redisService, 'emit');
    mockRedisClient.status = 'connecting'; // Simulate client status change before health check

    await redisService.checkHealth();

    expect(healthCheckEmitSpy).toHaveBeenCalledWith('healthCheck', 'error'); // or 'connecting' depending on logic
    expect(scheduleReconnectSpy).toHaveBeenCalled();
  });

  it('should enter in-memory mode if ioredis import fails', async () => {
    // Mock ioredis import to fail
    vi.unmock('ioredis');
    vi.doMock('ioredis', () => {
      throw new Error('Cannot find module ioredis');
    });

    const FailingImportRedisService = (await import('../../src/services/redisService')).RedisService;
    const newRedisService = new FailingImportRedisService();
    
    const initialized = await newRedisService.initialize();

    expect(initialized).toBe(false); // initialize returns false for in-memory mode
    // Check status or other public indicators of in-memory mode
    expect(newRedisService.getStatus()).toBe('disconnected'); // Or a specific status if in-memory has one
    // We can also check that connect was not attempted with the ioredis mock
    expect(vi.mocked(await import('ioredis')).default).toHaveBeenCalledTimes(0); // Assuming it was reset for this test block
  });

});
