import type { Queue, Worker, JobsOptions } from 'bullmq';

declare module 'bullmq-service-standardized' {
  export function initialize(): Promise<void>;
  export function createQueue(name: string, options?: JobsOptions): Queue;
  export function createWorker(name: string, processor: (job: any) => Promise<void>, options?: any): Worker;
  export function closeConnections(): Promise<void>;
}
