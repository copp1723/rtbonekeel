/**
 * BaseError Class
 * 
 * Base class for all application errors with standardized properties.
 * Extends the native Error object with additional properties for better error handling.
 */

/**
 * Error codes for the application
 * These codes help categorize and identify errors
 */
export const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication errors (401)
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Authorization errors (403)
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Database errors (500)
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // External service errors (502)
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  API_ERROR: 'API_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Workflow errors (500)
  WORKFLOW_ERROR: 'WORKFLOW_ERROR',
  TASK_FAILED: 'TASK_FAILED',
  
  // Email errors (500)
  EMAIL_ERROR: 'EMAIL_ERROR',
  
  // Configuration errors (500)
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  
  // Internal errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR'
} as const;

// Type for error codes
export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Base error class for all application errors
 */
export class BaseError extends Error {
  /**
   * HTTP status code for the error
   */
  public readonly statusCode: number;
  
  /**
   * Error code from ERROR_CODES
   */
  public readonly code: ErrorCode;
  
  /**
   * Whether this is an operational error (expected in normal operation)
   * or a programming error (unexpected bug)
   */
  public readonly isOperational: boolean;
  
  /**
   * Additional details about the error
   */
  public readonly details: Record<string, unknown>;
  
  /**
   * Original error that caused this error (for wrapped errors)
   */
  public readonly cause?: Error | unknown;

  /**
   * Create a new BaseError
   * 
   * @param message - Human-readable error message
   * @param code - Error code from ERROR_CODES
   * @param statusCode - HTTP status code
   * @param isOperational - Whether this is an expected operational error
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string,
    code: ErrorCode = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.cause = cause;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Add additional details to the error
   * 
   * @param details - Additional details to add
   * @returns The error instance for chaining
   */
  public withDetails(details: Record<string, unknown>): this {
    Object.assign(this.details, details);
    return this;
  }

  /**
   * Convert error to a plain object for logging
   * 
   * @returns Plain object representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      details: this.details,
      stack: this.stack,
      cause: this.cause instanceof Error 
        ? { 
            message: this.cause.message, 
            name: this.cause.name,
            stack: this.cause.stack 
          } 
        : this.cause
    };
  }
}
