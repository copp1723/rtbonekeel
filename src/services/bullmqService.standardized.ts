/**
 * BullMQ Service (Standardized)
 *
 * Provides a unified interface for working with BullMQ queues, workers, and schedulers.
 * Implements type-safe queue operations using the defined job types.
 */

import { Queue, Worker, QueueScheduler, QueueEvents, Job, JobsOptions, WorkerOptions, QueueSchedulerOptions, QueueEventsOptions } from 'bullmq';
import type { ConnectionOptions } from '../index.js';
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';
import { QUEUE_NAMES } from '../index.js';
import type {
  BaseJobData,
  QueueRegistry,
  EmailJobData,
  InsightJobData,
  WorkflowJobData,
  ReportJobData,
  TaskJobData
} from '../index.js';
import {
  initializeRedis,
  getRedisClient,
  isInMemoryMode,
  getQueueConfig,
  getWorkerConfig,
  getSchedulerConfig,
  closeRedisConnection
} from '../index.js';

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
} as const;

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
  options?: Record<string, unknown>
): Queue<QueueRegistry[T]> {
  if (isInMemoryMode()) {
    throw new Error('Cannot create queue in in-memory mode');
  }

  const queueNameStr = String(queueName);
  
  if (queues.has(queueNameStr)) {
    const existingQueue = queues.get(queueNameStr);
    if (!existingQueue) {
      throw new Error(`Queue ${queueNameStr} exists in registry but is undefined`);
    }
    return existingQueue as Queue<QueueRegistry[T]>;
  }

  const queue = new Queue<QueueRegistry[T]>(queueNameStr, getQueueConfig(options));

  queues.set(queueNameStr, queue);

  info({
    event: 'queue_created',
    queueName,
    timestamp: new Date().toISOString(),
  }, `Created queue: ${queueName}`);

  return queue;
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
  processor: (job: Job<QueueRegistry[T]>) => Promise<unknown>,
  options?: Partial<WorkerOptions>
): Worker<QueueRegistry[T]> {
  if (isInMemoryMode()) {
    throw new Error('Cannot create worker in in-memory mode');
  }

  const queueNameStr = String(queueName);
  
  if (workers.has(queueNameStr)) {
    const existingWorker = workers.get(queueNameStr);
    if (!existingWorker) {
      throw new Error(`Worker ${queueNameStr} exists in registry but is undefined`);
    }
    return existingWorker as Worker<QueueRegistry[T]>;
  }

  const worker = new Worker<QueueRegistry[T]>(queueNameStr, processor, getWorkerConfig(options));

  workers.set(queueNameStr, worker);

  info({
    event: 'worker_created',
    queueName,
    timestamp: new Date().toISOString(),
  }, `Created worker for queue: ${queueName}`);

  return worker;
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
  options?: Partial<QueueSchedulerOptions>
): QueueScheduler {
  if (isInMemoryMode()) {
    throw new Error('Cannot create scheduler in in-memory mode');
  }

  if (schedulers.has(queueName)) {
    const existingScheduler = schedulers.get(queueName);
    if (!existingScheduler) {
      throw new Error(`Scheduler ${queueName} exists in registry but is undefined`);
    }
    return existingScheduler;
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
  options?: Partial<QueueEventsOptions>
): QueueEvents {
  if (isInMemoryMode()) {
    throw new Error('Cannot create queue events in in-memory mode');
  }

  if (queueEvents.has(queueName)) {
    const existingEvents = queueEvents.get(queueName);
    if (!existingEvents) {
      throw new Error(`Queue events ${queueName} exists in registry but is undefined`);
    }
    return existingEvents;
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
  const queueNameStr = String(queueName);
  const queue = queues.get(queueNameStr);
  return queue ? (queue as Queue<QueueRegistry[T]>) : null;
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
export { defaultJobOptions } from '../index.js';
