/**
 * Monitoring Service
 * 
 * This module provides functionality for system monitoring and metrics.
 */

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

interface MetricsHistoryEntry extends PerformanceMetrics {
  timestamp: string;
}

// Simple logger functions
const info = (message: unknown, ...args: unknown[]): void => console.info(message, ...args);
const warn = (message: unknown, ...args: unknown[]): void => console.warn(message, ...args);
const error = (message: unknown, err?: unknown, ...args: unknown[]): void =>
  console.error(message, err, ...args);

// Mock metrics data
const metrics: PerformanceMetrics = {
  cpu: 0,
  memory: 0,
  responseTime: 0,
  requestCount: 0,
  errorRate: 0,
};

// Mock metrics history
const metricsHistory: MetricsHistoryEntry[] = [];

// Update metrics periodically
setInterval(() => {
  // Simulate CPU usage (0-100%)
  metrics.cpu = Math.random() * 100;
  
  // Simulate memory usage (0-100%)
  metrics.memory = Math.random() * 100;
  
  // Simulate response time (0-500ms)
  metrics.responseTime = Math.random() * 500;
  
  // Simulate request count (0-1000)
  metrics.requestCount = Math.floor(Math.random() * 1000);
  
  // Simulate error rate (0-10%)
  metrics.errorRate = Math.random() * 10;
  
  // Add to history
  metricsHistory.push({
    timestamp: new Date().toISOString(),
    ...metrics
  });
  
  // Limit history to 100 entries
  if (metricsHistory.length > 100) {
    metricsHistory.shift();
  }
}, 60000); // Update every minute

/**
 * Get current performance metrics
 * @returns Performance metrics object
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * Get system metrics
 * @returns System metrics object
 */
export function getSystemMetrics(): {
  uptime: number;
  nodeVersion: string;
  platform: NodeJS.Platform;
  arch: string;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
} {
  return {
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };
}

/**
 * Get metrics history
 * @returns Array of metrics history entries
 */
export function getMetricsHistory(): MetricsHistoryEntry[] {
  return [...metricsHistory];
}

/**
 * Start performance monitoring
 */
export function startPerformanceMonitoring(): void {
  info('Performance monitoring started');
}

export default {
  getPerformanceMetrics,
  getSystemMetrics,
  getMetricsHistory,
  startPerformanceMonitoring
};