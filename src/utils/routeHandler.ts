/**
 * Route Handler Utilities
 * 
 * Provides consistent response handling for Express route handlers
 */
import type { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from './apiResponse.js';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Wraps an async route handler to provide consistent error handling and response formatting
 */
export function asyncHandler<T = any>(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await handler(req, res, next);
      
      // If headers already sent or result is undefined, don't send response
      if (res.headersSent || result === undefined) {
        return;
      }
      
      sendSuccess(res, result);
    } catch (error) {
      if (!res.headersSent) {
        sendError(res, error);
      }
      next(error);
    }
  };
}

/**
 * Creates a route handler that returns a standardized response
 */
export function createRouteHandler<T = any>(
  handler: (req: Request, res: Response) => Promise<T>
) {
  return asyncHandler(handler);
}