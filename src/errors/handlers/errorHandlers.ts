/**
 * Error Handlers
 * 
 * This module provides functions for handling errors in different contexts,
 * including Express middleware, global error handlers, and function wrappers.
 */
import type { Request, Response, NextFunction } from 'express';
import { debug, info, warn, error as logError, fatal } from '../index.js';
import { BaseError } from '../index.js';
import { toBaseError, formatError } from '../index.js';

/**
 * Log an error with appropriate level based on error type
 * 
 * @param error - Error to log
 * @param context - Additional context for the log
 */
export function logFormattedError(
  error: unknown,
  context: Record<string, unknown> = {}
): void {
  const baseError = toBaseError(error);
  const formattedError = formatError(baseError);
  
  const logData = {
    ...formattedError,
    context: {
      ...baseError.details,
      ...context
    }
  };
  
  // Use appropriate log level based on error properties
  if (!baseError.isOperational) {
    // Non-operational errors are bugs and should be fixed
    logError('Unexpected error occurred', logData);
  } else if (baseError.statusCode >= 500) {
    // Server errors
    logError(`Server error: ${baseError.message}`, logData);
  } else if (baseError.statusCode >= 400) {
    // Client errors
    warn(`Client error: ${baseError.message}`, logData);
  } else {
    // Other errors
    info(`Error: ${baseError.message}`, logData);
  }
}

/**
 * Express error handler middleware
 * 
 * @param error - Error to handle
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandlerMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const baseError = toBaseError(error);
  
  // Log the error with request context
  logFormattedError(baseError, {
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    // Don't log the entire body as it might contain sensitive data
    body: Object.keys(req.body || {}).length > 0 ? '[REDACTED]' : undefined,
    ip: req.ip,
    userId: (req as any).user?.id || (req as any).user?.claims?.sub
  });
  
  // Format the error response
  const response = formatErrorResponse(baseError);
  
  // Send the response
  res.status(baseError.statusCode).json(response);
}

/**
 * Format an error for API response
 * 
 * @param error - Error to format
 * @param includeDetails - Whether to include error details
 * @returns Formatted error response
 */
export function formatErrorResponse(
  error: unknown,
  includeDetails: boolean = process.env.NODE_ENV !== 'production'
): Record<string, unknown> {
  const baseError = toBaseError(error);
  
  const response: Record<string, unknown> = {
    error: {
      message: baseError.message,
      code: baseError.code,
      status: baseError.statusCode
    }
  };
  
  // Include additional details in non-production environments
  if (includeDetails) {
    response.error = {
      ...response.error,
      details: baseError.details,
      stack: baseError.stack
    };
  }
  
  return response;
}

/**
 * Set up global error handlers for uncaught exceptions and unhandled rejections
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    const baseError = toBaseError(error);
    fatal('Uncaught exception - Application will exit', formatError(baseError));
    
    // Exit with error code
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    const baseError = toBaseError(reason);
    fatal('Unhandled rejection - Application will exit', formatError(baseError));
    
    // Exit with error code
    process.exit(1);
  });
  
  info('Global error handlers set up');
}

/**
 * Wrap an async function with error handling
 * 
 * @param fn - Function to wrap
 * @param errorMessage - Default error message
 * @param context - Additional context for error logging
 * @returns Wrapped function
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred',
  context: Record<string, unknown> = {}
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const baseError = toBaseError(err, errorMessage);
    
    // Add context to the error
    if (Object.keys(context).length > 0) {
      baseError.withDetails(context);
    }
    
    logFormattedError(baseError);
    throw baseError;
  }
}

/**
 * Express async handler to catch errors in route handlers
 * 
 * @param fn - Route handler function
 * @returns Wrapped route handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
