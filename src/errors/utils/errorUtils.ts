/**
 * Error Utilities
 * 
 * This module provides utility functions for working with errors,
 * including type guards, error transformation, and error enrichment.
 */
import { BaseError, ErrorCode } from '../types/BaseError.js';
import { InternalError } from '../types/DomainErrors.js';

/**
 * Interface for objects with a message property
 */
export interface ErrorWithMessage {
  message: string;
  stack?: string;
  name?: string;
}

/**
 * Type guard to check if a value is an Error
 * 
 * @param value - Value to check
 * @returns Whether the value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value is a BaseError
 * 
 * @param value - Value to check
 * @returns Whether the value is a BaseError
 */
export function isBaseError(value: unknown): value is BaseError {
  return value instanceof BaseError;
}

/**
 * Type guard to check if a value has a message property
 * 
 * @param value - Value to check
 * @returns Whether the value has a message property
 */
export function isErrorWithMessage(value: unknown): value is ErrorWithMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

/**
 * Convert any value to an object with a message property
 * 
 * @param value - Value to convert
 * @returns Object with a message property
 */
export function toErrorWithMessage(value: unknown): ErrorWithMessage {
  if (isErrorWithMessage(value)) return value;
  
  try {
    return new Error(JSON.stringify(value));
  } catch {
    // Fallback in case there are circular references
    return new Error(String(value));
  }
}

/**
 * Get a clean error message from any error type
 * 
 * @param error - Error to get message from
 * @returns Error message
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  
  return String(error);
}

/**
 * Get error stack if available
 * 
 * @param error - Error to get stack from
 * @returns Error stack or undefined
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  
  if (isErrorWithMessage(error) && error.stack) {
    return error.stack;
  }
  
  return undefined;
}

/**
 * Convert any error to a BaseError
 * 
 * @param error - Error to convert
 * @param defaultMessage - Default message if none is available
 * @param defaultCode - Default error code if none is available
 * @returns BaseError instance
 */
export function toBaseError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred',
  defaultCode: ErrorCode = 'UNEXPECTED_ERROR'
): BaseError {
  // If it's already a BaseError, return it
  if (isBaseError(error)) {
    return error;
  }
  
  // If it's a standard Error, convert it
  if (isError(error)) {
    return new InternalError(
      error.message || defaultMessage,
      {},
      error
    );
  }
  
  // If it has a message property, use that
  if (isErrorWithMessage(error)) {
    return new InternalError(
      error.message,
      {},
      error
    );
  }
  
  // For other values, convert to string
  return new InternalError(
    typeof error === 'string' ? error : defaultMessage,
    {
      originalError: error
    }
  );
}

/**
 * Enrich an error with additional details
 * 
 * @param error - Error to enrich
 * @param details - Details to add
 * @returns Enriched error
 */
export function enrichError(
  error: unknown,
  details: Record<string, unknown>
): BaseError {
  const baseError = toBaseError(error);
  return baseError.withDetails(details);
}

/**
 * Format error for logging with consistent structure
 * 
 * @param error - Error to format
 * @returns Formatted error object
 */
export function formatError(error: unknown): Record<string, unknown> {
  const baseError = toBaseError(error);
  return baseError.toJSON();
}

/**
 * Check if an error is a specific type
 * 
 * @param error - Error to check
 * @param errorType - Error constructor to check against
 * @returns Whether the error is of the specified type
 */
export function isErrorOfType<T extends Error>(
  error: unknown,
  errorType: new (...args: any[]) => T
): error is T {
  return isError(error) && error instanceof errorType;
}
