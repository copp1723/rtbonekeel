// Utils barrel exports
export * from './apiErrorHandler.js';
export * from './apiResponse.js';
export * from './apiValidation.js';
export * from './canonicalExports.js';
export * from './circuitBreaker.js';
export * from './crypto.js';
export * from './drizzleImports.js';
export * from './drizzleUtils.js';
export * from './drizzleWrapper.js';
export * from './encryption.js';
export * from './environmentUtils.js';
export * from './envValidator.js';
export * from './errorHandling.js';
export * from './errorUtils.js';
export * from './errors.js';
export * from './rateLimiter.js';
export * from './retry.js';
export * from './routeHandler.js';
export * from './validation.js';

// Common error utilities
export const isError = (err: unknown): err is Error => err instanceof Error;
export const getErrorMessage = (err: unknown): string => isError(err) ? err.message : String(err);

// Common SQL utilities
export { sql, and, eq, isNull } from 'drizzle-orm';

// Common types
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

export const isAppError = (err: unknown): err is AppError => 
  isError(err) && 'code' in err;

export const toAppError = (err: unknown, code = 'UNKNOWN_ERROR'): AppError => {
  if (isAppError(err)) return err;
  
  const error = isError(err) ? err : new Error(String(err));
  return Object.assign(error, { code }) as AppError;
};