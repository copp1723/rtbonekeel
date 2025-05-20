/**
 * BullMQ Service (Standardized)
 *
 * Provides a unified interface for working with BullMQ queues, workers, and schedulers.
 * Implements type-safe queue operations using the defined job types.
 */

import { Queue, Worker, QueueScheduler, QueueEvents } from 'bullmq';
import type { ConnectionOptions, JobsOptions } from '../types/bullmq/index.standardized.js';
import { debug, info, warn, error } from '../shared/logger.js';
import { isError } from '../utils/errorUtils.js';
import { QUEUE_NAMES } from '../shared/constants.js';
import type {
  BaseJobData,
  QueueRegistry,
  EmailJobData,
  InsightJobData,
  WorkflowJobData,
  ReportJobData,
  TaskJobData
} from '../types/bullmq/index.standardized';
import {
  initializeRedis,
  getRedisClient,
  isInMemoryMode,
  getQueueConfig,
  getWorkerConfig,
  getSchedulerConfig,
  closeRedisConnection
} from '../config/bullmq.config';

// Queue instances registry
const queues: Map<string, Queue> = new Map();

// Worker instances registry
const workers: Map<string, Worker> = new Map();

// Scheduler instances registry
const schedulers: Map<string, QueueScheduler> = new Map();

// Queue events registry
const queueEvents: Map<string, QueueEvents> = new Map();

// Job types mapping
export const JOB_TYPES = {
  // Email jobs
  SEND_EMAIL: 'send-email',
  PROCESS_EMAIL: 'process-email',

  // Insight jobs
  GENERATE_INSIGHT: 'generate-insight',
  EVALUATE_INSIGHT: 'evaluate-insight',

  // Report jobs
  PROCESS_REPORT: 'process-report',
  EXPORT_REPORT: 'export-report',

  // Workflow jobs
  EXECUTE_WORKFLOW: 'execute-workflow',
  EXECUTE_WORKFLOW_STEP: 'execute-workflow-step',

  // Task jobs
  PROCESS_TASK: 'process-task',
  SCHEDULED_TASK: 'scheduled-task',

  // Health check jobs
  HEALTH_CHECK: 'health-check',
};

/**
 * Initialize the BullMQ service
 *
 * @param options Optional connection options
 * @returns True if initialization was successful, false otherwise
 */
export async function initialize(options?: ConnectionOptions): Promise<boolean> {
  try {
    await initializeRedis(options);
    return !isInMemoryMode();
  } catch (err) {
    error({
      event: 'bullmq_initialization_error',
      errorMessage: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }, 'Error initializing BullMQ service');
    return false;
  }
}

/**
 * Create a typed queue
 *
 * @param queueName Name of the queue to create
 * @param options Optional queue options
 * @returns Queue instance
 */
export function createQueue<T extends keyof QueueRegistry>(
  queueName: T,
  options?: Record<string, any>
): Queue<QueueRegistry[T]> {
  if (isInMemoryMode()) {
    throw new Error('Cannot create queue in in-memory mode');
  }

  if (queues.has(queueName as string)) {
    return queues.get(queueName as string) as Queue<QueueRegistry[T]>;
  }

  const queue = new Queue(queueName as string, getQueueConfig(options));

  queues.set(queueName as string, queue);

  info({
    event: 'queue_created',
    queueName,
    timestamp: new Date().toISOString(),
  }, `Created queue: ${queueName}`);

  return queue as Queue<QueueRegistry[T]>;
}

/**
 * Create a worker for processing jobs
 *
 * @param queueName Name of the queue to process
 * @param processor Job processor function
 * @param options Optional worker options
 * @returns Worker instance
 */
export function createWorker<T extends keyof QueueRegistry>(
  queueName: T,
  processor: (job: any) => Promise<any>,
  options?: Record<string, any>
): Worker<QueueRegistry[T]> {
  if (isInMemoryMode()) {
    throw new Error('Cannot create worker in in-memory mode');
  }

  if (workers.has(queueName as string)) {
    return workers.get(queueName as string) as Worker<QueueRegistry[T]>;
  }

  const worker = new Worker(queueName as string, processor, getWorkerConfig(options));

  workers.set(queueName as string, worker);

  info({
    event: 'worker_created',
    queueName,
    timestamp: new Date().toISOString(),
  }, `Created worker for queue: ${queueName}`);

  return worker as Worker<QueueRegistry[T]>;
}

/**
 * Create a queue scheduler
 *
 * @param queueName Name of the queue to create a scheduler for
 * @param options Optional scheduler options
 * @returns QueueScheduler instance
 */
export function createScheduler(
  queueName: string,
  options?: Record<string, any>
): QueueScheduler {
  if (isInMemoryMode()) {
    throw new Error('Cannot create scheduler in in-memory mode');
  }

  if (schedulers.has(queueName)) {
    return schedulers.get(queueName) as QueueScheduler;
  }

  const scheduler = new QueueScheduler(queueName, getSchedulerConfig(options));

  schedulers.set(queueName, scheduler);

  info({
    event: 'scheduler_created',
    queueName,
    timestamp: new Date().toISOString(),
  }, `Created scheduler for queue: ${queueName}`);

  return scheduler;
}

/**
 * Create queue events listener
 *
 * @param queueName Name of the queue to listen for events
 * @param options Optional options
 * @returns QueueEvents instance
 */
export function createQueueEvents(
  queueName: string,
  options?: Record<string, any>
): QueueEvents {
  if (isInMemoryMode()) {
    throw new Error('Cannot create queue events in in-memory mode');
  }

  if (queueEvents.has(queueName)) {
    return queueEvents.get(queueName) as QueueEvents;
  }

  const events = new QueueEvents(queueName, {
    connection: getRedisClient(),
    ...options,
  });

  queueEvents.set(queueName, events);

  info({
    event: 'queue_events_created',
    queueName,
    timestamp: new Date().toISOString(),
  }, `Created queue events for: ${queueName}`);

  return events;
}

/**
 * Get a typed queue instance
 *
 * @param queueName Name of the queue to get
 * @returns Queue instance or null if not found
 */
export function getQueue<T extends keyof QueueRegistry>(
  queueName: T
): Queue<QueueRegistry[T]> | null {
  return (queues.get(queueName as string) as Queue<QueueRegistry[T]>) || null;
}

/**
 * Close all connections
 */
export async function closeConnections(): Promise<void> {
  try {
    // Close all queue events
    for (const [name, events] of queueEvents.entries()) {
      await events.close();
      info({
        event: 'queue_events_closed',
        queueName: name,
        timestamp: new Date().toISOString(),
      }, `Closed queue events for: ${name}`);
    }

    // Close all schedulers
    for (const [name, scheduler] of schedulers.entries()) {
      await scheduler.close();
      info({
        event: 'scheduler_closed',
        queueName: name,
        timestamp: new Date().toISOString(),
      }, `Closed scheduler for queue: ${name}`);
    }

    // Close all workers
    for (const [name, worker] of workers.entries()) {
      await worker.close();
      info({
        event: 'worker_closed',
        workerName: name,
        timestamp: new Date().toISOString(),
      }, `Closed worker: ${name}`);
    }

    // Close all queues
    for (const [name, queue] of queues.entries()) {
      await queue.close();
      info({
        event: 'queue_closed',
        queueName: name,
        timestamp: new Date().toISOString(),
      }, `Closed queue: ${name}`);
    }

    // Close Redis connection
    await closeRedisConnection();
  } catch (err) {
    error({
      event: 'close_connections_error',
      errorMessage: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }, 'Error closing connections');

    throw err;
  }
}

// Export queue names and default options for convenience
export { QUEUE_NAMES };
export { defaultJobOptions } from '../config/bullmq.config';
