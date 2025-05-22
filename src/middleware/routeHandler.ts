/**
 * Route Handler Middleware
 * 
 * This module provides a wrapper for route handlers to handle async errors.
 */

/**
 * Wraps an async route handler to catch errors and pass them to the next middleware
 * @param fn The async route handler function
 * @returns A wrapped route handler that catches errors
 */
export const routeHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default routeHandler;