/**
 * Monitoring Service
 *
 * This service provides monitoring and alerting functionality by integrating
 * with Sentry and DataDog, as well as providing internal performance metrics.
 */
import os from 'os';
import { debug, info, warn, error } from '../index.js';
import * as sentryService from './sentryService.js';
import * as datadogService from './datadogService.js';
import monitoringConfig from '../config/monitoring.js';

// Performance metrics storage
let performanceMetrics = {
  cpu: 0,
  memory: 0,
  responseTime: 0,
  requestCount: 0,
  errorCount: 0,
  errorRate: 0,
  dbQueryDuration: 0,
  dbQueryCount: 0,
};

// Metrics history for trending
const metricsHistory: Array<{
  timestamp: Date;
  metrics: typeof performanceMetrics;
}> = [];

// Track initialization status
let initialized = false;

/**
 * Initialize monitoring services
 * @returns Object indicating which services were initialized
 */
export async function initialize(): Promise<{
  sentryInitialized: boolean;
  datadogInitialized: boolean;
}> {
  if (!monitoringConfig.enabled) {
    info('Monitoring is disabled by configuration');
    return { sentryInitialized: false, datadogInitialized: false };
  }

  // Initialize Sentry
  const sentryInitialized = sentryService.initializeSentry(monitoringConfig.sentry.dsn);
  
  // Initialize DataDog
  const datadogInitialized = datadogService.initializeDataDog();
  
  // Start system metrics collection
  if (datadogInitialized) {
    startSystemMetricsCollection();
  }
  
  initialized = true;
  
  return {
    sentryInitialized,
    datadogInitialized,
  };
}

/**
 * Track an error in monitoring systems
 * @param err Error to track
 * @param context Additional context
 * @param critical Whether this is a critical error
 */
export function trackError(err: unknown, context: Record<string, any> = {}, critical: boolean = false): void {
  if (!initialized || !monitoringConfig.enabled) {
    return;
  }

  // Increment error count
  performanceMetrics.errorCount++;
  
  // Calculate error rate if we have requests
  if (performanceMetrics.requestCount > 0) {
    performanceMetrics.errorRate = performanceMetrics.errorCount / performanceMetrics.requestCount;
  }
  
  // Track in Sentry
  sentryService.captureError(err, {
    ...context,
    critical,
    environment: monitoringConfig.sentry.environment,
  });
  
  // Track in DataDog
  datadogService.incrementMetric('errors.count', 1, [
    `critical:${critical}`,
    `environment:${monitoringConfig.datadog.env}`,
  ]);
  
  // Send alerts if this is a critical error or error rate exceeds threshold
  if (critical || performanceMetrics.errorRate > monitoringConfig.alertThresholds.errorRate) {
    sendAlerts(err, context, critical);
  }
}

/**
 * Track an API request
 * @param method HTTP method
 * @param path API path
 * @param statusCode HTTP status code
 * @param durationMs Duration in milliseconds
 */
export function trackApiRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
): void {
  if (!initialized || !monitoringConfig.enabled) {
    return;
  }

  // Update performance metrics
  performanceMetrics.requestCount++;
  performanceMetrics.responseTime = 
    (performanceMetrics.responseTime * (performanceMetrics.requestCount - 1) + durationMs) / 
    performanceMetrics.requestCount;
  
  // Recalculate error rate
  if (statusCode >= 500) {
    performanceMetrics.errorCount++;
    performanceMetrics.errorRate = performanceMetrics.errorCount / performanceMetrics.requestCount;
  }
  
  // Track in DataDog
  datadogService.trackApiRequest(method, path, statusCode, durationMs);
  
  // Check if response time exceeds threshold
  if (durationMs > monitoringConfig.alertThresholds.apiResponseTime) {
    warn(`Slow API response: ${method} ${path} took ${durationMs}ms`, {
      method,
      path,
      durationMs,
      threshold: monitoringConfig.alertThresholds.apiResponseTime,
    });
    
    // Track in DataDog as a separate metric
    datadogService.incrementMetric('api.slow_responses', 1, [
      `method:${method}`,
      `path:${path}`,
      `environment:${monitoringConfig.datadog.env}`,
    ]);
  }
}

/**
 * Track a database query
 * @param operation Query operation (e.g., 'select', 'insert')
 * @param table Table name
 * @param durationMs Duration in milliseconds
 * @param success Whether the query was successful
 */
export function trackDatabaseQuery(
  operation: string,
  table: string,
  durationMs: number,
  success: boolean = true
): void {
  if (!initialized || !monitoringConfig.enabled) {
    return;
  }

  // Update performance metrics
  performanceMetrics.dbQueryCount++;
  performanceMetrics.dbQueryDuration = 
    (performanceMetrics.dbQueryDuration * (performanceMetrics.dbQueryCount - 1) + durationMs) / 
    performanceMetrics.dbQueryCount;
  
  // Track in DataDog
  datadogService.trackDatabaseQuery(operation, table, durationMs, success);
  
  // Check if query duration exceeds threshold
  if (durationMs > monitoringConfig.alertThresholds.dbQueryDuration) {
    warn(`Slow database query: ${operation} on ${table} took ${durationMs}ms`, {
      operation,
      table,
      durationMs,
      threshold: monitoringConfig.alertThresholds.dbQueryDuration,
    });
    
    // Track in DataDog as a separate metric
    datadogService.incrementMetric('database.slow_queries', 1, [
      `operation:${operation}`,
      `table:${table}`,
      `environment:${monitoringConfig.datadog.env}`,
    ]);
  }
}

/**
 * Get current performance metrics
 * @returns Current performance metrics
 */
export function getPerformanceMetrics(): typeof performanceMetrics {
  return { ...performanceMetrics };
}

/**
 * Get system metrics
 * @returns System metrics
 */
export function getSystemMetrics(): {
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  memoryFree: number;
} {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  
  return {
    uptime: process.uptime(),
    cpuUsage: os.loadavg()[0] / os.cpus().length * 100,
    memoryUsage,
    memoryTotal: totalMemory,
    memoryFree: freeMemory,
  };
}

/**
 * Get metrics history
 * @returns Array of historical metrics
 */
export function getMetricsHistory(): Array<{
  timestamp: Date;
  metrics: typeof performanceMetrics;
}> {
  return [...metricsHistory];
}

/**
 * Start collecting system metrics periodically
 */
function startSystemMetricsCollection(): void {
  // Collect metrics every minute
  const interval = setInterval(() => {
    if (!monitoringConfig.enabled) {
      clearInterval(interval);
      return;
    }
    
    try {
      // Get current system metrics
      const systemMetrics = getSystemMetrics();
      
      // Update performance metrics
      performanceMetrics.cpu = systemMetrics.cpuUsage;
      performanceMetrics.memory = systemMetrics.memoryUsage;
      
      // Track in DataDog
      datadogService.trackSystemResources();
      
      // Store in history (keep last 60 entries = 1 hour)
      metricsHistory.push({
        timestamp: new Date(),
        metrics: { ...performanceMetrics },
      });
      
      // Limit history size
      if (metricsHistory.length > 60) {
        metricsHistory.shift();
      }
      
      // Check if metrics exceed thresholds
      if (systemMetrics.cpuUsage > monitoringConfig.alertThresholds.cpuUsage) {
        warn(`High CPU usage: ${systemMetrics.cpuUsage.toFixed(2)}%`, {
          cpuUsage: systemMetrics.cpuUsage,
          threshold: monitoringConfig.alertThresholds.cpuUsage,
        });
      }
      
      if (systemMetrics.memoryUsage > monitoringConfig.alertThresholds.memoryUsage) {
        warn(`High memory usage: ${systemMetrics.memoryUsage.toFixed(2)}%`, {
          memoryUsage: systemMetrics.memoryUsage,
          threshold: monitoringConfig.alertThresholds.memoryUsage,
        });
      }
    } catch (err) {
      error('Error collecting system metrics', err);
    }
  }, 60000); // Every minute
}

/**
 * Send alerts for critical errors or threshold violations
 * @param err Error that triggered the alert
 * @param context Additional context
 * @param critical Whether this is a critical error
 */
function sendAlerts(err: unknown, context: Record<string, any> = {}, critical: boolean = false): void {
  if (!monitoringConfig.enabled || !monitoringConfig.adminEmails.length) {
    return;
  }
  
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;
  
  // Log the alert
  error(`Sending alert: ${errorMessage}`, {
    error: errorMessage,
    stack: errorStack,
    context,
    critical,
  });
  
  // In a real implementation, this would send emails to admin emails
  // For now, we'll just log that alerts would be sent
  info(`Alert would be sent to: ${monitoringConfig.adminEmails.join(', ')}`, {
    recipients: monitoringConfig.adminEmails,
    subject: `[${critical ? 'CRITICAL' : 'ERROR'}] ${monitoringConfig.sentry.environment}: ${errorMessage}`,
  });
}

/**
 * Shutdown monitoring services
 */
export async function shutdown(): Promise<void> {
  if (!initialized || !monitoringConfig.enabled) {
    return;
  }
  
  try {
    // Flush DataDog metrics
    await datadogService.flushMetrics();
    
    // Flush Sentry events
    await sentryService.flushSentryEvents();
    
    info('Monitoring services shut down successfully');
  } catch (err) {
    error('Error shutting down monitoring services', err);
  }
}

export default {
  initialize,
  trackError,
  trackApiRequest,
  trackDatabaseQuery,
  getPerformanceMetrics,
  getSystemMetrics,
  getMetricsHistory,
  shutdown,
};