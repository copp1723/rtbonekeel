declare module 'bullmq 2' {
  // AUDIT 2023-05-19: Replaced all 'any' with 'unknown' for improved type safety.
  export class Queue<T = any> {
    constructor(name: string, options?: unknown);
    add(name: string, data: T, opts?: unknown): Promise<unknown>;
    process(
      concurrencyOrFn: number | ((...args: unknown[]) => unknown),
      fn?: (...args: unknown[]) => unknown
    ): Promise<void>;
    getJob(jobId: string): Promise<unknown>;
    on(event: string, callback: (...args: unknown[]) => unknown): void;
  }

  export class Worker {
    constructor(
      queueName: string,
      processor: ((...args: unknown[]) => unknown) | string,
      options?: unknown
    );
    on(event: string, callback: (...args: unknown[]) => unknown): void;
    run(): Promise<void>;
  }

  export class Job<T = unknown> {
    id: string;
    name: string;
    data: T;
    opts: unknown;
    progress: number;
    attemptsMade: number;
    failedReason: string;
    stacktrace: string[];
    returnvalue: unknown;
    finishedOn: number;
    processedOn: number;
  }

  export interface JobsOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    repeat?: unknown;
    backoff?: unknown;
    lifo?: boolean;
    timeout?: number;
    jobId?: string;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    stackTraceLimit?: number;
  }
}
