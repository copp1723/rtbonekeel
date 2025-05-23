/**
 * Error Utility Functions
 * 
 * This module provides utility functions for handling errors consistently
 * throughout the application.
 */

/**
 * Safely extracts a message from an unknown error
 * @param error The error to extract a message from
 * @returns The error message as a string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return String(error);
}

/**
 * Type guard to check if an object is an Error
 * @param error The object to check
 * @returns True if the object is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if an object has a specific property
 * @param obj The object to check
 * @param prop The property to check for
 * @returns True if the object has the property
 */
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is { [P in K]: unknown } {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

/**
 * Safely access a property on an unknown object
 * @param obj The object to access
 * @param prop The property to access
 * @returns The property value or undefined
 */
export function safeGet<T>(obj: unknown, prop: string): T | undefined {
  if (obj && typeof obj === 'object' && prop in obj) {
    return (obj as Record<string, T>)[prop];
  }
  return undefined;
}