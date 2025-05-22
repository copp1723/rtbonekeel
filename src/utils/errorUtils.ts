/**
 * Error Utilities
 * 
 * This module provides utility functions for error handling.
 */

/**
 * Check if a value is an Error object
 * @param value Value to check
 * @returns True if the value is an Error object
 */
export function isError(value: unknown): boolean {
  return value instanceof Error || 
         (typeof value === 'object' && 
          value !== null && 
          'message' in value);
}

/**
 * Get a string message from an error
 * @param err Error object or value
 * @returns Error message as string
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

export default {
  isError,
  getErrorMessage
};