/**
 * BullMQ Configuration
 *
 * Central configuration for BullMQ queues, workers, and schedulers.
 * This file provides standardized configuration options and connection management.
 */

import IORedis from 'ioredis';
import type { ConnectionOptions, JobsOptions } from '../types/bullmq/index.standardized.js';
import { debug, info, warn, error } from '../shared/logger.js';
import { isError } from '../utils/errorUtils.js';

// Redis client instance
let redisClient: IORedis | null = null;

// In-memory mode flag
let inMemoryMode = false;

// Default connection options
export const defaultConnectionOptions: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Default job options
export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: 100,
  removeOnFail: 100,
};

// Default worker options
export const defaultWorkerOptions = {
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
  limiter: {
    max: 100,
    duration: 60000,
  },
};

/**
 * Initialize Redis connection
 *
 * @param options Optional connection options
 * @returns Redis client instance or null if connection fails
 */
export async function initializeRedis(options?: ConnectionOptions): Promise<IORedis | null> {
  try {
    if (process.env.FORCE_IN_MEMORY_QUEUE === 'true') {
      throw new Error('Forcing in-memory queue mode');
    }

    const connectionOptions = {
      ...defaultConnectionOptions,
      ...options,
    };

    redisClient = new IORedis(connectionOptions);

    redisClient.on('error', (err: Error) => {
      error({
        event: 'redis_connection_error',
        errorMessage: err.message,
        timestamp: new Date().toISOString(),
      }, `Redis connection error: ${err.message}`);
    });

    await redisClient.ping();

    info({
      event: 'redis_connected',
      timestamp: new Date().toISOString(),
    }, 'Redis connection established');

    inMemoryMode = false;
    return redisClient;
  } catch (err) {
    warn({
      event: 'redis_connection_failed',
      errorMessage: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }, 'Redis connection failed, using in-memory mode');

    inMemoryMode = true;
    return null;
  }
}

/**
 * Get the Redis client instance
 *
 * @returns Redis client instance or null if not initialized
 */
export function getRedisClient(): IORedis | null {
  return redisClient;
}

/**
 * Check if the system is running in in-memory mode
 *
 * @returns True if in-memory mode is active, false otherwise
 */
export function isInMemoryMode(): boolean {
  return inMemoryMode;
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      info({
        event: 'redis_connection_closed',
        timestamp: new Date().toISOString(),
      }, 'Redis connection closed');
    } catch (err) {
      error({
        event: 'redis_connection_close_error',
        errorMessage: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      }, 'Error closing Redis connection');
      throw err;
    }
  }
}

/**
 * Get connection options for BullMQ
 *
 * @returns Connection options object for BullMQ
 */
export function getConnectionOptions(): { connection: IORedis | null } {
  return { connection: redisClient };
}

/**
 * Get queue configuration with default options
 *
 * @param options Optional additional options
 * @returns Queue configuration object
 */
export function getQueueConfig(options?: Record<string, any>): Record<string, any> {
  return {
    connection: redisClient,
    defaultJobOptions,
    ...options,
  };
}

/**
 * Get worker configuration with default options
 *
 * @param options Optional additional options
 * @returns Worker configuration object
 */
export function getWorkerConfig(options?: Record<string, any>): Record<string, any> {
  return {
    connection: redisClient,
    ...defaultWorkerOptions,
    ...options,
  };
}

/**
 * Get scheduler configuration with default options
 *
 * @param options Optional additional options
 * @returns Scheduler configuration object
 */
export function getSchedulerConfig(options?: Record<string, any>): Record<string, any> {
  return {
    connection: redisClient,
    ...options,
  };
}
