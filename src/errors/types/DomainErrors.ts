/**
 * Domain-specific error classes
 * 
 * This module provides specialized error classes for different domains
 * of the application, all extending the BaseError class.
 */
import { BaseError, ErrorCode } from './BaseError.js';

/**
 * Error for validation failures
 */
export class ValidationError extends BaseError {
  /**
   * Create a new ValidationError
   * 
   * @param message - Error message
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string,
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      true,
      details,
      cause
    );
  }
}

/**
 * Error for authentication failures
 */
export class AuthenticationError extends BaseError {
  /**
   * Create a new AuthenticationError
   * 
   * @param message - Error message
   * @param code - Specific authentication error code
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string = 'Authentication failed',
    code: ErrorCode = 'AUTHENTICATION_FAILED',
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      code,
      401,
      true,
      details,
      cause
    );
  }
}

/**
 * Error for authorization failures
 */
export class AuthorizationError extends BaseError {
  /**
   * Create a new AuthorizationError
   * 
   * @param message - Error message
   * @param code - Specific authorization error code
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string = 'Insufficient permissions',
    code: ErrorCode = 'AUTHORIZATION_FAILED',
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      code,
      403,
      true,
      details,
      cause
    );
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends BaseError {
  /**
   * Create a new NotFoundError
   * 
   * @param resource - Resource type that wasn't found
   * @param id - ID of the resource that wasn't found
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    resource: string = 'Resource',
    id?: string | number,
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
      
    super(
      message,
      'NOT_FOUND',
      404,
      true,
      { resource, id, ...details },
      cause
    );
  }
}

/**
 * Error for database operations
 */
export class DatabaseError extends BaseError {
  /**
   * Create a new DatabaseError
   * 
   * @param message - Error message
   * @param code - Specific database error code
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string = 'Database operation failed',
    code: ErrorCode = 'DATABASE_ERROR',
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      code,
      500,
      true,
      details,
      cause
    );
  }
}

/**
 * Error for external service failures
 */
export class ExternalServiceError extends BaseError {
  /**
   * Create a new ExternalServiceError
   * 
   * @param service - Name of the external service
   * @param message - Error message
   * @param code - Specific external service error code
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    service: string,
    message: string = 'External service request failed',
    code: ErrorCode = 'EXTERNAL_SERVICE_ERROR',
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      code,
      502,
      true,
      { service, ...details },
      cause
    );
  }
}

/**
 * Error for rate limiting
 */
export class RateLimitError extends BaseError {
  /**
   * Create a new RateLimitError
   * 
   * @param message - Error message
   * @param retryAfter - Seconds until retry is allowed
   * @param details - Additional error details
   */
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    details: Record<string, unknown> = {}
  ) {
    super(
      message,
      'RATE_LIMIT_EXCEEDED',
      429,
      true,
      { retryAfter, ...details }
    );
  }
}

/**
 * Error for workflow execution failures
 */
export class WorkflowError extends BaseError {
  /**
   * Create a new WorkflowError
   * 
   * @param workflowId - ID of the workflow
   * @param message - Error message
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    workflowId: string,
    message: string = 'Workflow execution failed',
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      'WORKFLOW_ERROR',
      500,
      true,
      { workflowId, ...details },
      cause
    );
  }
}

/**
 * Error for internal server errors
 */
export class InternalError extends BaseError {
  /**
   * Create a new InternalError
   * 
   * @param message - Error message
   * @param details - Additional error details
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string = 'An internal server error occurred',
    details: Record<string, unknown> = {},
    cause?: Error | unknown
  ) {
    super(
      message,
      'INTERNAL_ERROR',
      500,
      false, // Not operational - this is a bug
      details,
      cause
    );
  }
}
