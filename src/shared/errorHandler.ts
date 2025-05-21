import type { Request, Response, NextFunction } from 'express';
import logger from './logger.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public readonly context: Record<string, unknown>;

  constructor(
    message: string,
    public readonly isOperational = true,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.context = context;
  }
}

/**
 * Handle error with logging and context
 */
export function handleError(err: unknown, context: Record<string, unknown> = {}): AppError {
  const errorObj = err instanceof Error ? err : new Error(String(err));

  logger.error('Error occurred', {
    event: 'error_handled',
    error: errorObj.message,
    stack: errorObj.stack,
    ...context
  });

  return errorObj instanceof AppError
    ? new AppError(errorObj.message, errorObj.isOperational, { ...errorObj.context, ...context })
    : new AppError(errorObj.message, false, context);
}

/**
 * Log error with appropriate level and context
 */
export function logError(err: unknown, context: Record<string, unknown> = {}): void {
  const appError = handleError(err, context);

  if (appError.isOperational) {
    logger.warn('Operational error occurred', {
      error: appError.message,
      stack: appError.stack,
      ...appError.context
    });
  } else {
    logger.error('Unexpected error occurred', {
      error: appError.message,
      stack: appError.stack,
      ...appError.context
    });
  }
}

/**
 * Format error response for API clients
 */
export function errorResponse(
  res: Response,
  err: unknown,
  statusCode: number = 500,
  includeDetails: boolean = process.env.NODE_ENV !== 'production'
): Response {
  const appError = handleError(err);

  const response: Record<string, unknown> = {
    status: 'error',
    statusCode,
    message: appError.message
  };

  if (includeDetails && appError.context) {
    response.context = appError.context;
  }

  return res.status(statusCode).json(response);
}

/**
 * Global error handler middleware for Express
 */
export function errorHandlerMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error with request context
  logError(error, {
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    // Don't log the entire body as it might contain sensitive data
    body: Object.keys(req.body || {}).length > 0 ? '[REDACTED]' : undefined,
  });

  // Format the error response
  const response = errorResponse(
    res,
    error,
    500,
    process.env.NODE_ENV !== 'production'
  );

  // Send the response
  return response;
}

/**
 * Async handler to catch errors in async route handlers
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch((err) => {
      // Convert to AppError if not already
      const appError = handleError(err);
      next(appError);
    });
  };
}

/**
 * Handle uncaught exceptions and unhandled rejections
 */
export function setupGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    const appError = handleError(error);
    logError(appError, { type: 'uncaughtException' });

    // Consider whether to crash the process or not based on error type
    if (!(appError instanceof AppError) || !appError.isOperational) {
      logger.error('Uncaught exception - Application will exit', { error: appError });
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const appError = handleError(reason);
    logError(appError, { type: 'unhandledRejection' });

    // Consider whether to crash the process or not based on error type
    if (!(appError instanceof AppError) || !appError.isOperational) {
      logger.error('Unhandled rejection - Application will exit', { error: appError });
      process.exit(1);
    }
  });
}

/**
 * Try-catch wrapper for functions that return a value
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred',
  context: Record<string, any> = {},
  errorCode: string = 'UNEXPECTED_ERROR'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleError(error);

    // Only override the message if it's the default one
    if (appError.message === 'An unexpected error occurred' || !(appError instanceof AppError)) {
      appError.message = errorMessage;
    }

    // Add context to the error
    if (Object.keys(context).length > 0) {
      if (!(appError instanceof AppError)) {
        appError = new AppError(appError.message, false);
      }
      appError.context = { ...appError.context, ...context };
    }

    logError(appError);
    throw appError;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    backoffFactor?: number;
    maxDelay?: number;
    retryCondition?: (error: any) => boolean;
    context?: Record<string, any>;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    retryCondition = () => true,
    context = {},
  } = options;

  let attempts = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      const appError = handleError(error);
      const shouldRetry =
        attempts < maxRetries &&
        (retryCondition ? retryCondition(appError) : true);

      if (!shouldRetry) {
        logError(appError, {
          ...context,
          retryAttempts: attempts,
          maxRetries,
          willRetry: false
        });
        throw appError;
      }

      logError(appError, {
        ...context,
        retryAttempts: attempts,
        maxRetries,
        delay,
        willRetry: true
      });
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }
  // This should never be reached due to the throw in the catch block
  throw new Error('Unexpected error occurred');
}

/**
 * Log warning with context
 */
export function logWarning(message: string, context: Record<string, unknown> = {}) {
  logger.warn(message, { event: 'warning_logged', ...context });
}

/**
 * Log info with context
 */
export function logInfo(message: string, context: Record<string, unknown> = {}) {
  logger.info(message, { event: 'info_logged', ...context });
}
