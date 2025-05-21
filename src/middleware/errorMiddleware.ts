/**
 * Error handling middleware for Express
 */
import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
import logger from '../shared/logger.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler - for routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, new AppError(`Route not found: ${req.originalUrl}`, 404));
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Determine status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  
  // Send standardized error response
  sendError(res, err, { 
    statusCode,
    includeStack: process.env.NODE_ENV !== 'production'
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}