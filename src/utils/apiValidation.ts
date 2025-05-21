/**
 * API Validation Utilities
 * 
 * Provides middleware and utilities for validating API requests using Zod schemas
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { debug, info, warn, error } from '../shared/logger.js';
import { isError } from './errorUtils.js';

/**
 * Standard error response structure
 */
export interface ValidationErrorResponse {
  status: 'error';
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  path?: string;
}

/**
 * Options for the validation middleware
 */
export interface ValidationOptions {
  /**
   * Whether to strip unknown fields from the validated data
   * Default: true
   */
  stripUnknown?: boolean;
  
  /**
   * Custom error handler function
   */
  errorHandler?: (
    err: z.ZodError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
}

/**
 * Default validation options
 */
const defaultValidationOptions: ValidationOptions = {
  stripUnknown: true,
};

/**
 * Format Zod validation errors into a standardized structure
 * 
 * @param zodError - Zod validation error
 * @returns Formatted error object
 */
export function formatZodError(zodError: z.ZodError): ValidationErrorResponse {
  const formattedErrors: Record<string, string[]> = {};
  
  // Group errors by path
  zodError.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });
  
  return {
    status: 'error',
    code: 'validation_error',
    message: 'The request data failed validation',
    errors: formattedErrors,
  };
}

/**
 * Default error handler for validation errors
 * 
 * @param err - Zod validation error
 * @param req - Express request
 * @param res - Express response
 */
export function defaultValidationErrorHandler(
  err: z.ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const formattedError = formatZodError(err);
  
  // Log the validation error
  debug('Validation error:', {
    path: req.path,
    method: req.method,
    errors: formattedError.errors,
  });
  
  res.status(400).json(formattedError);
}

/**
 * Create middleware for validating request body against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateBody<T extends z.ZodType>(
  schema: T,
  options: ValidationOptions = defaultValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body against the schema
      const validatedData = schema.parse(req.body);
      
      // Replace the request body with the validated data
      req.body = validatedData;
      
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Use custom error handler if provided, otherwise use default
        if (options.errorHandler) {
          options.errorHandler(err, req, res, next);
        } else {
          defaultValidationErrorHandler(err, req, res, next);
        }
      } else {
        // Pass other errors to the next error handler
        next(err);
      }
    }
  };
}

/**
 * Create middleware for validating request query parameters against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateQuery<T extends z.ZodType>(
  schema: T,
  options: ValidationOptions = defaultValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request query against the schema
      const validatedData = schema.parse(req.query);
      
      // Replace the request query with the validated data
      req.query = validatedData;
      
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Use custom error handler if provided, otherwise use default
        if (options.errorHandler) {
          options.errorHandler(err, req, res, next);
        } else {
          defaultValidationErrorHandler(err, req, res, next);
        }
      } else {
        // Pass other errors to the next error handler
        next(err);
      }
    }
  };
}

/**
 * Create middleware for validating request parameters against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateParams<T extends z.ZodType>(
  schema: T,
  options: ValidationOptions = defaultValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request parameters against the schema
      const validatedData = schema.parse(req.params);
      
      // Replace the request parameters with the validated data
      req.params = validatedData;
      
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Use custom error handler if provided, otherwise use default
        if (options.errorHandler) {
          options.errorHandler(err, req, res, next);
        } else {
          defaultValidationErrorHandler(err, req, res, next);
        }
      } else {
        // Pass other errors to the next error handler
        next(err);
      }
    }
  };
}

/**
 * Create middleware for validating the entire request against a Zod schema
 * 
 * @param bodySchema - Schema for request body
 * @param querySchema - Schema for request query
 * @param paramsSchema - Schema for request parameters
 * @param options - Validation options
 * @returns Express middleware function
 */
export function validateRequest(
  bodySchema?: z.ZodType,
  querySchema?: z.ZodType,
  paramsSchema?: z.ZodType,
  options: ValidationOptions = defaultValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body if schema is provided
      if (bodySchema) {
        req.body = bodySchema.parse(req.body);
      }
      
      // Validate query if schema is provided
      if (querySchema) {
        req.query = querySchema.parse(req.query);
      }
      
      // Validate params if schema is provided
      if (paramsSchema) {
        req.params = paramsSchema.parse(req.params);
      }
      
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Use custom error handler if provided, otherwise use default
        if (options.errorHandler) {
          options.errorHandler(err, req, res, next);
        } else {
          defaultValidationErrorHandler(err, req, res, next);
        }
      } else {
        // Pass other errors to the next error handler
        next(err);
      }
    }
  };
}

/**
 * Validate data against a schema without middleware
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws an error
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Safe version of validateData that returns a result object instead of throwing
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object containing success flag and either validated data or error
 */
export function safeValidateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: ValidationErrorResponse } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: formatZodError(err) };
    }
    
    // Handle non-Zod errors
    const errorMessage = isError(err) ? err.message : String(err);
    return {
      success: false,
      error: {
        status: 'error',
        code: 'validation_error',
        message: errorMessage,
      },
    };
  }
}

export default {
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  validateData,
  safeValidateData,
  formatZodError,
};
