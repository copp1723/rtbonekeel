// Utils barrel exports
export * from './apiErrorHandler';
export * from './apiResponse';
export * from './apiValidation';
export * from './canonicalExports';
export * from './circuitBreaker';
export * from './crypto';
export * from './drizzleImports';
export * from './drizzleUtils';
export * from './drizzleWrapper';
export * from './encryption';
export * from './environmentUtils';
export * from './envValidator';
export * from './errorHandling';
export * from './errorUtils';
export * from './errors';
export * from './rateLimiter';
export * from './retry';
export * from './routeHandler';
export * from './validation';

// Re-export error utilities from errorUtils
export { isError, getErrorMessage, hasProperty, safeGet } from './errorUtils';

// Re-export type guards
export {
  isObject,
  hasStringMessage,
  isCallable,
  safeGetProperty
} from './typeGuards';

// Common SQL utilities
export { sql, and, eq, isNull } from 'drizzle-orm';

// Export error types and codes
export { ERROR_CODES, ApplicationError } from './errorTypes';
export type { ErrorCode, AppError } from './errorTypes';

// Error utility functions
export const isAppError = (err: unknown): err is AppError =>
  isError(err) && 'code' in err;

export const toAppError = (err: unknown, code = 'UNKNOWN_ERROR'): AppError => {
  if (isAppError(err)) return err;

  const error = isError(err) ? err : new Error(String(err));
  return Object.assign(error, { code, context: {} }) as AppError;
};