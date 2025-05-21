declare module 'bullmq' {
  export interface ConnectionOptions {
    host: string;
    port: number;
    password?: string;
    username?: string;
    tls?: boolean;
    db?: number;
    maxRetriesPerRequest?: number;
    enableReadyCheck?: boolean;
  }

  export interface JobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: {
      type: string;
      delay: number;
    };
    lifo?: boolean;
    timeout?: number;
    jobId?: string;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    stackTraceLimit?: number;
  }

  export interface QueueOptions {
    connection?: ConnectionOptions;
    prefix?: string;
    defaultJobOptions?: JobOptions;
  }

  export interface WorkerOptions {
    connection?: ConnectionOptions;
    prefix?: string;
    concurrency?: number;
    limiter?: {
      max: number;
      duration: number;
    };
  }

  export interface QueueSchedulerOptions {
    connection?: ConnectionOptions;
    prefix?: string;
  }

  export class Queue {
    constructor(name: string, options?: QueueOptions);
    add(name: string, data: any, options?: JobOptions): Promise<Job>;
    getJob(jobId: string): Promise<Job | null>;
    getJobs(types: string[], start?: number, end?: number, asc?: boolean): Promise<Job[]>;
    getJobCounts(): Promise<{ [key: string]: number }>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    close(): Promise<void>;
  }

  export class Worker {
    constructor(name: string, processor: (job: Job) => Promise<any>, options?: WorkerOptions);
    on(event: string, callback: (...args: any[]) => void): void;
    close(): Promise<void>;
  }

  export class QueueScheduler {
    constructor(name: string, options?: QueueSchedulerOptions);
    close(): Promise<void>;
  }

  export class Job {
    id: string;
    name: string;
    data: any;
    opts: JobOptions;
    progress(progress: number | object): Promise<void>;
    updateData(data: any): Promise<void>;
    update(data: any): Promise<void>;
    remove(): Promise<void>;
    retry(): Promise<void>;
    discard(): Promise<void>;
    moveToCompleted(returnValue: any, token: string, fetchNext?: boolean): Promise<any>;
    moveToFailed(err: Error, token: string, fetchNext?: boolean): Promise<any>;
  }
}