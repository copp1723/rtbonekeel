/**
 * Retry Handler
 * 
 * This module provides utilities for retrying operations that might fail temporarily.
 */
import { info } from '../index.js';
import { toBaseError, getErrorMessage } from '../index.js';
import { logFormattedError } from './errorHandlers.js';

/**
 * Options for retry operations
 */
export interface RetryOptions {
  /**
   * Number of retry attempts
   */
  retries?: number;
  
  /**
   * Initial delay in milliseconds
   */
  delay?: number;
  
  /**
   * Factor to multiply delay by after each attempt
   */
  backoffFactor?: number;
  
  /**
   * Maximum delay in milliseconds
   */
  maxDelay?: number;
  
  /**
   * Additional context for error logging
   */
  context?: Record<string, unknown>;
  
  /**
   * Function to determine if an error should trigger a retry
   */
  shouldRetry?: (error: unknown) => boolean;
  
  /**
   * Whether to add jitter to the delay
   */
  jitter?: boolean;
}

/**
 * Execute a function with retry logic
 * 
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Result of the function
 * @throws Last error encountered if all retries fail
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    context = {},
    shouldRetry = () => true,
    jitter = true
  } = options;
  
  let attempt = 0;
  let lastError: unknown;
  
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;
      
      // Don't retry if we've reached max retries or if shouldRetry returns false
      if (attempt > retries || !shouldRetry(err)) {
        logFormattedError(err, {
          ...context,
          attempt,
          maxRetries: retries,
          willRetry: false
        });
        throw toBaseError(err);
      }
      
      // Calculate backoff delay with optional jitter
      let backoffDelay = Math.min(
        delay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      // Add jitter if enabled (±25%)
      if (jitter) {
        const jitterFactor = 0.75 + Math.random() * 0.5; // 0.75 to 1.25
        backoffDelay = Math.floor(backoffDelay * jitterFactor);
      }
      
      // Log retry attempt
      info(`Retry attempt ${attempt}/${retries} after ${backoffDelay}ms`, {
        ...context,
        errorMessage: getErrorMessage(err),
        attempt,
        maxRetries: retries,
        backoffDelay,
        willRetry: true
      });
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  // This should never be reached due to the throw in the catch block
  throw toBaseError(lastError);
}
