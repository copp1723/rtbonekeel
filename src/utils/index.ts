// Utils barrel exports
export * from './apiErrorHandler.js.js.js';
export * from './apiResponse.js.js.js';
export * from './apiValidation.js.js.js';
export * from './canonicalExports.js.js.js';
export * from './circuitBreaker.js.js.js';
export * from './crypto.js.js.js';
export * from './drizzleImports.js.js.js';
export * from './drizzleUtils.js.js.js';
export * from './drizzleWrapper.js.js.js';
export * from './encryption.js.js.js';
export * from './environmentUtils.js.js.js';
export * from './envValidator.js.js.js';
export * from './errorHandling.js.js.js';
export * from './errorUtils.js.js.js';
export * from './errors.js.js.js';
export * from './rateLimiter.js.js.js';
export * from './retry.js.js.js';
export * from './routeHandler.js.js.js';
export * from './validation.js.js.js';

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