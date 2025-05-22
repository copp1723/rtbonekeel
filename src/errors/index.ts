// Errors module barrel exports
export * from './handlers/errorHandlers.js.js';
export * from './handlers/retryHandler.js.js';
export * from './types/DomainErrors.js.js';
export * from './utils/errorUtils.js.js';

// Error types
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

// Error utilities
export const isAppError = (err: unknown): err is AppError => 
  err instanceof Error && 'code' in err;

export const toAppError = (err: unknown, code = 'UNKNOWN_ERROR'): AppError => {
  if (isAppError(err)) return err;
  
  const error = err instanceof Error ? err : new Error(String(err));
  return Object.assign(error, { code }) as AppError;
};

// Common error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT'
}

export const ERROR_CODES = Object.values(ErrorCode);