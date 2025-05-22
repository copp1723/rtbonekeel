/**
 * Health Check Scheduler
 *
 * This module provides functionality to schedule periodic health checks.
 */
import cron from 'node-cron';

// Simple logger functions
const info = (message) => console.info(message);
const warn = (message) => console.warn(message);
const error = (message, err) => console.error(message, err);

// Store active schedulers
const activeSchedulers = {};

/**
 * Start running all health checks on a schedule
 * @param cronExpression Cron expression for scheduling (default: every 5 minutes)
 * @returns true if scheduler was started successfully, false otherwise
 */
export async function startAllHealthChecks(cronExpression = '*/5 * * * *') {
  try {
    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      error(`Invalid cron expression: ${cronExpression}`);
      return false;
    }

    // Stop existing scheduler if running
    if (activeSchedulers['all']) {
      activeSchedulers['all'].stop();
      delete activeSchedulers['all'];
    }

    // Import runAllHealthChecks function
    const healthService = await import('./healthService');
    const { runAllHealthChecks } = healthService;

    // Schedule health checks
    const task = cron.schedule(cronExpression, async () => {
      info('Running scheduled health checks');
      try {
        await runAllHealthChecks();
        info('Scheduled health checks completed successfully');
      } catch (err) {
        error('Error running scheduled health checks', err);
      }
    });

    // Store the scheduler
    activeSchedulers['all'] = task;

    info(`Health check scheduler started with schedule: ${cronExpression}`);
    return true;
  } catch (err) {
    error('Failed to start health check scheduler', err);
    return false;
  }
}

/**
 * Start a specific health check on a schedule
 * @param checkName Name of the health check to run
 * @param cronExpression Cron expression for scheduling
 * @returns true if scheduler was started successfully, false otherwise
 */
export async function startHealthCheck(checkName, cronExpression) {
  try {
    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      error(`Invalid cron expression: ${cronExpression}`);
      return false;
    }

    // Stop existing scheduler if running
    if (activeSchedulers[checkName]) {
      activeSchedulers[checkName].stop();
      delete activeSchedulers[checkName];
    }

    // Import runHealthCheck function
    const healthService = await import('./healthService');
    const { runHealthCheck } = healthService;

    // Schedule health check
    const task = cron.schedule(cronExpression, async () => {
      info(`Running scheduled health check: ${checkName}`);
      try {
        await runHealthCheck(checkName);
        info(`Scheduled health check completed: ${checkName}`);
      } catch (err) {
        error(`Error running scheduled health check: ${checkName}`, err);
      }
    });

    // Store the scheduler
    activeSchedulers[checkName] = task;

    info(`Health check scheduler started for ${checkName} with schedule: ${cronExpression}`);
    return true;
  } catch (err) {
    error(`Failed to start health check scheduler for ${checkName}`, err);
    return false;
  }
}

/**
 * Stop all health check schedulers
 */
export function stopAllHealthChecks() {
  Object.entries(activeSchedulers).forEach(([name, scheduler]) => {
    scheduler.stop();
    delete activeSchedulers[name];
    info(`Stopped health check scheduler: ${name}`);
  });
}

/**
 * Stop a specific health check scheduler
 * @param checkName Name of the health check scheduler to stop
 * @returns true if scheduler was stopped, false if it wasn't running
 */
export function stopHealthCheck(checkName) {
  const scheduler = activeSchedulers[checkName];
  if (scheduler) {
    scheduler.stop();
    delete activeSchedulers[checkName];
    info(`Stopped health check scheduler: ${checkName}`);
    return true;
  }
  return false;
}

/**
 * Get all active health check schedulers
 * @returns Object with scheduler names as keys and cron expressions as values
 */
export function getActiveSchedulers() {
  return Object.entries(activeSchedulers).reduce((acc, [name, scheduler]) => {
    acc[name] = scheduler.getExpression();
    return acc;
  }, {});
}

export default {
  startAllHealthChecks,
  startHealthCheck,
  stopAllHealthChecks,
  stopHealthCheck,
  getActiveSchedulers,
};