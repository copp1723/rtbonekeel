/**
 * Type Guard Utilities
 * 
 * This module provides type guard functions to safely work with unknown types.
 */

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value has a specific property
 */
export function hasProperty<K extends string>(value: unknown, property: K): value is { [P in K]: unknown } {
  return isObject(value) && property in value;
}

/**
 * Type guard to check if a value has a string message property
 */
export function hasStringMessage(value: unknown): value is { message: string } {
  return isObject(value) && 
         'message' in value && 
         typeof value.message === 'string';
}

/**
 * Type guard to check if a value is callable
 */
export function isCallable<T extends (...args: any[]) => any>(value: unknown): value is T {
  return typeof value === 'function';
}

/**
 * Safely get a property from an unknown object
 */
export function safeGetProperty<T>(obj: unknown, property: string): T | undefined {
  if (isObject(obj) && property in obj) {
    return obj[property] as T;
  }
  return undefined;
}

/**
 * Safely extract an error message from an unknown value
 */
export function getErrorMessage(value: unknown): string {
  if (isError(value)) {
    return value.message;
  }
  
  if (hasStringMessage(value)) {
    return value.message;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  return String(value);
}