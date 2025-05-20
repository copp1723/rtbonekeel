import { Request, Response, NextFunction, RequestHandler } from 'express';
import { isError, toAppError } from '../utils/errorUtils.js';
import { debug, info, warn, error } from '../shared/logger.js';
// Use a type that allows for custom properties on the request
// ANY AUDIT [2023-05-19]: Express request objects can be extended with custom properties by middleware.
// Using index signatures with `any` is the most practical approach for Express request extensions.
type AnyRequest = Request & {
  [key: string]: any; // ANY AUDIT [2023-05-19]: Required for dynamic middleware properties
  user?: {
    claims?: {
      sub: string;
      [key: string]: any; // ANY AUDIT [2023-05-19]: Auth providers add various claim properties
    };
    [key: string]: any; // ANY AUDIT [2023-05-19]: Auth middleware adds various user properties
  };
};
/**
 * Helper function to wrap Express route handlers and provide consistent error handling
 * This also fixes TypeScript type compatibility issues with Express route handlers
 *
 * @param handler - Express route handler function
 * @returns Wrapped route handler with consistent error handling
 */
export const routeHandler = (handler: (req: AnyRequest, res: Response, next: NextFunction) => any): RequestHandler => { // ANY AUDIT [2023-05-19]: Express handlers can return various types including void, Promise<void>, or any data
  return async (req: AnyRequest, res: Response, next: NextFunction) => {
    try {
      const result = await handler(req, res, next);

      if (result !== undefined) {
        res.json(result);
      }
    } catch (error) {
      const errorMessage = isError(error)
        ? (error instanceof Error ? error.message : String(error))
        : String(error);

      error('Route handler error', {
        error: errorMessage,
        stack: isError(error) && error instanceof Error ? error.stack : undefined,
        route: req.originalUrl,
        method: req.method,
        user: req.user?.claims?.sub,
      });

      next(toAppError(error));
    }
  };
};
