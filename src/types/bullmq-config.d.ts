import type { Redis } from 'ioredis';

declare module 'bullmq-config' {
  export function isInMemoryMode(): boolean;
  export function getRedisClient(): Redis;
}

export function isInMemoryMode(): boolean;
export function getRedisClient(): Redis;
