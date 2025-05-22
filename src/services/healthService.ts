/**
 * Health Service
 * 
 * This module provides functionality for health checks and monitoring.
 */

// Simple logger functions
const info = (message) => console.info(message);
const warn = (message) => console.warn(message);
const error = (message, err) => console.error(message, err);

// Mock health check data
const healthChecks = {
  database: {
    name: 'database',
    status: 'ok',
    message: 'Database connection is healthy',
    responseTime: 15,
    lastChecked: new Date().toISOString(),
    details: { connectionPool: 5, activeQueries: 2 }
  },
  redis: {
    name: 'redis',
    status: 'ok',
    message: 'Redis connection is healthy',
    responseTime: 5,
    lastChecked: new Date().toISOString(),
    details: { usedMemory: '2.5MB', connectedClients: 3 }
  },
  api: {
    name: 'api',
    status: 'ok',
    message: 'API endpoints are responding',
    responseTime: 25,
    lastChecked: new Date().toISOString(),
    details: { endpoints: 12, failedEndpoints: 0 }
  }
};

// Health check logs
const healthLogs = [];

/**
 * Run all health checks
 * @returns Array of health check results
 */
export async function runAllHealthChecks() {
  info('Running all health checks');
  
  const results = [];
  
  for (const checkName of Object.keys(healthChecks)) {
    try {
      const result = await runHealthCheck(checkName);
      results.push(result);
    } catch (err) {
      error(`Error running health check for ${checkName}`, err);
      results.push({
        name: checkName,
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        details: { error: err instanceof Error ? err.message : String(err) }
      });
    }
  }
  
  return results;
}

/**
 * Run a specific health check
 * @param checkName Name of the health check to run
 * @returns Health check result
 */
export async function runHealthCheck(checkName) {
  info(`Running health check: ${checkName}`);
  
  if (!healthChecks[checkName]) {
    return null;
  }
  
  // Simulate health check execution
  const startTime = Date.now();
  
  // Mock implementation - in a real app, this would check actual services
  const check = { ...healthChecks[checkName] };
  check.lastChecked = new Date().toISOString();
  check.responseTime = Math.floor(Math.random() * 50) + 5;
  
  // Log the health check
  healthLogs.push({
    checkName,
    status: check.status,
    timestamp: check.lastChecked,
    responseTime: check.responseTime,
    details: check.details
  });
  
  // Limit logs to 1000 entries
  if (healthLogs.length > 1000) {
    healthLogs.shift();
  }
  
  return check;
}

/**
 * Get the latest health check results for all services
 * @returns Array of health check results
 */
export async function getLatestHealthChecks() {
  return Object.values(healthChecks);
}

/**
 * Get health check logs for a specific service
 * @param checkName Name of the health check
 * @param limit Maximum number of logs to return
 * @returns Array of health check logs
 */
export async function getHealthLogs(checkName, limit = 100) {
  return healthLogs
    .filter(log => log.checkName === checkName)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get a summary of system health
 * @returns Health summary object
 */
export async function getHealthSummary() {
  const checks = await getLatestHealthChecks();
  
  // Check if any service is not healthy
  const hasErrors = checks.some(check => check.status !== 'ok');
  
  return {
    overallStatus: hasErrors ? 'error' : 'ok',
    services: checks.length,
    healthy: checks.filter(check => check.status === 'ok').length,
    unhealthy: checks.filter(check => check.status !== 'ok').length,
    lastUpdated: new Date().toISOString()
  };
}

export default {
  runAllHealthChecks,
  runHealthCheck,
  getLatestHealthChecks,
  getHealthLogs,
  getHealthSummary
};