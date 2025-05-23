/**
 * Error Types and Constants
 * 
 * This module defines standard error types and error codes used throughout the application.
 */

/**
 * Standard error codes
 */
export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
  
  // API errors
  API_ERROR: 'API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication errors
  AUTH_ERROR: 'AUTH_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // File errors
  FILE_ERROR: 'FILE_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  
  // Environment errors
  ENV_ERROR: 'ENV_ERROR',
  MISSING_ENV_VAR: 'MISSING_ENV_VAR',
  
  // Integration errors
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Error code type derived from ERROR_CODES
 */
export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Application error interface
 */
export interface AppError extends Error {
  code: ErrorCode | string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * Custom error class for application errors
 */
export class ApplicationError extends Error implements AppError {
  code: ErrorCode | string;
  statusCode?: number;
  context?: Record<string, unknown>;
  
  constructor(message: string, code: ErrorCode | string = ERROR_CODES.UNKNOWN_ERROR, statusCode?: number, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context || {};
    
    // Ensure prototype chain is properly maintained
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}