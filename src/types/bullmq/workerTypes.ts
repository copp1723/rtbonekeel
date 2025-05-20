import type { Job } from './jobTypes.js';

export interface Worker<T = any> {
  name: string;
  processor: (job: Job<T>) => Promise<void>;
}

declare module './jobTypes.js' {
  interface Job<T = any> {
    attemptsMade: number;
    opts: {
      attempts?: number;
      backoff?: number | { type: string; delay: number };
    };
  }
}
