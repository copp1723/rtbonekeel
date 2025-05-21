import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { AppError } from '../index.js';
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.APP_VERSION || '0.0.0';

/**
 * Initialize Sentry for error tracking
 */
export function initializeSentry() {
  if (!SENTRY_DSN) {
    info('Sentry DSN not provided, skipping Sentry initialization');
    return false;
  }

  try {
    debug('Initializing Sentry...');
    
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      release: RELEASE,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      integrations: [
        // Updated to use the new integration format
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        nodeProfilingIntegration()
      ],
    });
    
    info('Sentry initialized successfully');
    return true;
  } catch (err) {
    const errorMessage = isError(err) ? err.message : String(err);
    warn(`Failed to initialize Sentry: ${errorMessage}`);
    return false;
  }
}

/**
 * Capture an exception in Sentry
 */
export function captureException(error, context = {}) {
  if (!isSentryInitialized()) {
    debug('Sentry not initialized, skipping exception capture');
    return;
  }

  try {
    if (error instanceof AppError) {
      // For operational errors, we might want to handle them differently
      if (!error.isOperational) {
        Sentry.captureException(error, { 
          extra: { 
            ...context,
            ...error.context
          } 
        });
      }
    } else {
      Sentry.captureException(error, { extra: context });
    }
  } catch (err) {
    warn('Failed to capture exception in Sentry', { error: err });
  }
}

/**
 * Set user information for Sentry
 */
export function setUser(userId, email) {
  if (!isSentryInitialized()) return;
  
  try {
    Sentry.setUser({
      id: userId,
      email: email || undefined,
    });
  } catch (err) {
    warn('Failed to set user in Sentry', { error: err });
  }
}

/**
 * Clear user information from Sentry
 */
export function clearUser() {
  if (!isSentryInitialized()) return;
  
  try {
    Sentry.setUser(null);
  } catch (err) {
    warn('Failed to clear user in Sentry', { error: err });
  }
}

/**
 * Set extra context for Sentry
 */
export function setContext(name, context) {
  if (!isSentryInitialized()) return;
  
  try {
    Sentry.setContext(name, context);
  } catch (err) {
    warn('Failed to set context in Sentry', { error: err });
  }
}

/**
 * Set tag for Sentry
 */
export function setTag(key, value) {
  if (!isSentryInitialized()) return;
  
  try {
    Sentry.setTag(key, value);
  } catch (err) {
    warn('Failed to set tag in Sentry', { error: err });
  }
}

/**
 * Get Sentry request handler middleware
 */
export function getSentryRequestHandler() {
  if (!isSentryInitialized()) {
    return (req, res, next) => next();
  }
  
  // Updated to use the new handler format
  return Sentry.requestHandler();
}

/**
 * Get Sentry error handler middleware
 */
export function getSentryErrorHandler() {
  if (!isSentryInitialized()) {
    return (err, req, res, next) => next(err);
  }
  
  // Updated to use the new handler format
  return Sentry.errorHandler();
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized() {
  // Updated to use the new client check
  return Sentry.getClient() !== null;
}

export default {
  initializeSentry,
  captureException,
  setUser,
  clearUser,
  setContext,
  setTag,
  getSentryRequestHandler,
  getSentryErrorHandler,
  isSentryInitialized
};