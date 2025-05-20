/**
 * Error Handling System
 * 
 * This module exports a unified error handling system for the application.
 * It includes error classes, utilities, and handlers.
 */

// Export error types
export * from './types/BaseError.js';
export * from './types/DomainErrors.js';

// Export error utilities
export * from './utils/errorUtils.js';

// Export error handlers
export * from './handlers/errorHandlers.js';
export * from './handlers/retryHandler.js';

// Re-export common utilities with shorter names
import { 
  toBaseError, 
  isError, 
  isBaseError, 
  getErrorMessage, 
  getErrorStack,
  formatError,
  enrichError
} from './utils/errorUtils.js';

import {
  logFormattedError,
  errorHandlerMiddleware,
  formatErrorResponse,
  setupGlobalErrorHandlers,
  tryCatch,
  asyncHandler
} from './handlers/errorHandlers.js';

import {
  executeWithRetry
} from './handlers/retryHandler.js';

// Export common utilities
export {
  // Error utilities
  toBaseError,
  isError,
  isBaseError,
  getErrorMessage,
  getErrorStack,
  formatError,
  enrichError,
  
  // Error handlers
  logFormattedError,
  errorHandlerMiddleware,
  formatErrorResponse,
  setupGlobalErrorHandlers,
  tryCatch,
  asyncHandler,
  
  // Retry handler
  executeWithRetry
};
