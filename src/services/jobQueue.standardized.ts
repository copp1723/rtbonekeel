/**
 * Job Queue Service (Standardized)
 *
 * Provides a standardized interface for working with job queues.
 * Uses BullMQ for Redis-based queues with fallback to in-memory queues.
 */

import { sql, and, eq, isNull } from '../utils/drizzleImports.js';
// [2025-05-19] Updated to match actual file extension (.ts) per audit; see PR #[TBD]
import { isAppError, isError } from '../utils/errorUtils.js';
import { db } from '../shared/db.js';
import { jobs as jobQueueTable, taskLogs as tasks } from '../shared/schema.js';
import { v4 as uuidv4 } from 'uuid';
// [2025-05-19] Updated to match actual file extension (.ts) per audit; see PR #[TBD]
import { debug, info, warn, error } from '../shared/logger.js';

// Import BullMQ types from their individual files
import type { Queue } from '../types/bullmq/queueTypes.js';
import type { Worker } from '../types/bullmq/workerTypes.js';
import type { JobOptions } from '../types/bullmq/jobTypes.js';
import type { Job } from '../types/bullmq/jobTypes.js';
import type { Redis } from 'ioredis';

// Import standardized BullMQ service
import * as bullmqService from '../types/bullmq-service.js';
import { isInMemoryMode, getRedisClient } from '../types/bullmq-config.js';

// Local types
interface TaskJobData {
  taskId: string;
  workflowId?: string;
  [key: string]: unknown;
}

interface QueueOptions {
  defaultJobOptions: {
    removeOnComplete: number;
    removeOnFail: number;
    attempts: number;
    backoff: {
      type: string;
      delay: number;
    };
  };
}

interface BackoffOptions {
  type: string;
  delay: number;
  factor?: number;
}

// Job status types
type JobStatus = 'waiting' | 'active' | 'delayed' | 'completed' | 'failed' | 'paused' | 'stuck' | 'waiting-children' | 'processing' | 'pending';

// In-memory job structure
export interface InMemoryJob {
  id: string;
  taskId: string | null;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastError?: string | null;
  lastRunAt?: Date | null;
}

// In-memory job storage
const inMemoryJobs: InMemoryJob[] = [];

// Queue instances
let taskQueue: Queue<TaskJobData> | null = null;
let taskScheduler: QueueScheduler | null = null;

// Queue names
const TASK_QUEUE_NAME = 'task-queue';
const TASK_PROCESSOR_QUEUE = 'taskProcessor';

/**
 * Initialize the job queue system
 */
export async function initializeJobQueue(): Promise<void> {
  try {
    // Initialize BullMQ service
    await bullmqService.initialize();

    if (!isInMemoryMode()) {
      // Create task queue
      taskQueue = bullmqService.createQueue(TASK_PROCESSOR_QUEUE as any, {
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      } as QueueOptions);

      // Create scheduler
      taskScheduler = bullmqService.createScheduler(TASK_QUEUE_NAME);

      info('Job queue system initialized with Redis', {
        event: 'job_queue_initialized',
        mode: 'redis',
        timestamp: new Date().toISOString()
      });
    } else {
      info('Job queue system initialized in in-memory mode', {
        event: 'job_queue_initialized',
        mode: 'in-memory',
        timestamp: new Date().toISOString()
      });

      // Start in-memory job processor
      setInterval(processInMemoryJobs, 5000);
    }

    // Set up worker
    await setupWorker();
  } catch (err) {
    const errorMessage = isError(err) ? err.message : String(err);
    error(`Failed to initialize job queue: ${errorMessage}`, {
      event: 'job_queue_initialization_failed',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}

/**
 * Set up worker for processing jobs
 */
async function setupWorker(): Promise<void> {
  if (!isInMemoryMode()) {
    try {
      // Create worker using standardized service
      const worker = bullmqService.createWorker(
        TASK_PROCESSOR_QUEUE,
        async (job: Job<TaskJobData>) => {
          if (job?.id && job?.data?.taskId) {
            await processJob(job.id, job.data.taskId);
          }
        },
        {
          autorun: true,
          concurrency: 5
        }
      );

      // Set up event handlers
      worker.on('completed', async (job: Job<TaskJobData>) => {
        if (job?.id) {
          await updateJobStatus(job.id, 'completed');
          info(`Job ${job.id} completed successfully`);
        }
      });

      worker.on('failed', async (job: Job<TaskJobData> | undefined, err: Error) => {
        if (job?.id) {
          const jobError = err.message;
          await updateJobStatus(job.id, 'failed', jobError);
          
          if (job.attemptsMade < (job.opts?.attempts || 0)) {
            const nextRunAt = new Date(Date.now() + calculateBackoff(job.attemptsMade, job.opts || { type: 'exponential', delay: 1000 }));
            await updateJobForRetry(job.id, jobError, nextRunAt);
          }
        }
      });

      info('Job worker initialized', {
        event: 'job_worker_initialized',
        queue: TASK_PROCESSOR_QUEUE,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      const errorMessage = isError(err) ? err.message : String(err);
      error(`Failed to initialize job worker: ${errorMessage}`, {
        event: 'job_worker_initialization_failed',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    }
  }
}

/**
 * Calculate backoff delay based on attempts and options
 */
function calculateBackoff(attemptsMade: number, opts: { type?: string, delay?: number }): number {
  const type = opts.type || 'exponential';
  const delay = opts.delay || 1000;
  
  if (type === 'exponential') {
    return Math.pow(2, attemptsMade) * delay;
  }
  return delay * (attemptsMade + 1);
}

/**
 * Process in-memory jobs
 */
async function processInMemoryJobs(): Promise<void> {
  const now = new Date();
  const pendingJobs = inMemoryJobs.filter((job) => job.status === 'pending' && job.nextRunAt <= now);

  for (const job of pendingJobs) {
    try {
      job.status = 'processing';
      job.lastError = undefined;
      await processJob(job.id, job.taskId);
      job.status = 'completed';
      job.updatedAt = new Date();
    } catch (err) {
      const processError = err instanceof Error ? err.message : String(err);
      error(`Error processing job: ${processError}`, {
        originalError: err,
        taskId: job.taskId
      });

      await db.update(tasks).set({
        status: 'failed',
        error: processError,
      }).where(eq(tasks.id, job.taskId));

      throw err;
    }
  }
}

/**
 * Process a job
 */
async function processJob(jobId: string, taskId: string | null): Promise<boolean> {
  if (!taskId) {
    throw new Error('Task ID is required');
  }
  
  const job = inMemoryJobs.find(j => j.id === jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  try {
    const taskData = await db.select().from(tasks).where(
      eq(tasks.id, taskId as string) // Explicit cast since we already did null check
    );
    const task = taskData[0];

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    info(`Processing job ${jobId} for task ${taskId}`);

    job.status = 'completed';
    job.updatedAt = new Date();
    return true;
  } catch (err) {
    const processError = err instanceof Error ? err.message : String(err);
    job.status = 'failed';
    job.lastError = processError;
    job.updatedAt = new Date();
    throw err;
  }
}

/**
 * Add a new job to the queue
 */
export async function enqueueJob(taskId: string, options?: { maxAttempts?: number }): Promise<string> {
  const jobId = uuidv4();

  if (!isInMemoryMode()) {
    await db.insert(jobQueueTable).values({
      id: jobId,
      taskId,
      status: 'pending',
      maxAttempts: options?.maxAttempts || 3,
      nextRunAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } else {
    inMemoryJobs.push({
      id: jobId,
      taskId,
      status: 'pending',
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      nextRunAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return jobId;
}

/**
 * Update job status
 */
export async function updateJobStatus(jobId: string, status: JobStatus, error?: string): Promise<void> {
  if (isInMemoryMode()) {
    const job = inMemoryJobs.find((job) => job.id === jobId);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
      if (error) job.lastError = error;
    }
    return;
  }

  await db
    .update(jobQueueTable)
    .set({
      status,
      updatedAt: new Date(),
      lastError: error,
    })
    .where(eq(jobQueueTable.id, jobId.toString()));
}

/**
 * Update job for retry
 */
export async function updateJobForRetry(jobId: string, error: string, nextRunAt: Date): Promise<void> {
  if (isInMemoryMode()) {
    const job = inMemoryJobs.find((job) => job.id === jobId);
    if (job) {
      job.status = 'pending';
      job.attempts += 1;
      job.lastError = error;
      job.nextRunAt = nextRunAt;
      job.updatedAt = new Date();
    }
    return;
  }

  await db
    .update(jobQueueTable)
    .set({
      status: 'pending',
      attempts: sql`${jobQueueTable.attempts} + 1`,
      lastError: error,
      nextRunAt,
      updatedAt: new Date(),
    })
    .where(eq(jobQueueTable.id, jobId.toString()));
}

/**
 * Get job by ID
 */
export async function getJobById(jobId: string): Promise<InMemoryJob | null> {
  if (isInMemoryMode()) {
    return inMemoryJobs.find((job) => job.id === jobId) || null;
  }

  const results = await db.select().from(jobQueueTable).where(eq(jobQueueTable.id, jobId.toString()));
  return results.length > 0 ? {
    ...results[0],
    status: results[0].status as JobStatus
  } : null;
}

/**
 * List all jobs with optional filtering
 */
export async function listJobs(status?: JobStatus, limit: number = 100): Promise<InMemoryJob[]> {
  if (isInMemoryMode()) {
    let result = inMemoryJobs;
    if (status) {
      result = result.filter((job) => job.status === status);
    }
    return result.slice(0, limit);
  }

  let query = db.select().from(jobQueueTable);
  if (status) {
    query = query.where(eq(jobQueueTable.status, status));
  }
  
  const results = await query.limit(limit);
  return results.map(job => ({
    ...job,
    status: job.status as JobStatus
  }));
}

/**
 * Close all connections
 */
export async function closeConnections(): Promise<void> {
  if (!isInMemoryMode()) {
    await bullmqService.closeConnections();
  }
}
