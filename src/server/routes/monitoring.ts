/**
 * Monitoring API Routes
 *
 * Exposes endpoints for monitoring dashboards and alerts.
 */
import express, { Request, Response, Application } from 'express';
import { isError } from '../index.js';
import { debug, info, warn, error as logError } from '../index.js';
import * as dashboardService from '../index.js';
import {
  runAllHealthChecks,
  runHealthCheck,
  getLatestHealthChecks,
  getHealthLogs,
  getHealthSummary,
} from '../index.js';

const router = express.Router();

/**
 * Get overall system health summary
 */
router.get('/health/summary', async (req: Request, res: Response) => {
  try {
    const summary = await getHealthSummary();
    res.json(summary);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to get health summary');
    
    res.status(500).json({
      error: 'Failed to get health summary',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Get all health checks
 */
router.get('/health/checks', async (req: Request, res: Response) => {
  try {
    const checks = await getLatestHealthChecks();
    res.json(checks);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to get health checks');
    
    res.status(500).json({
      error: 'Failed to get health checks',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Run all health checks
 */
router.post('/health/checks/run', async (req: Request, res: Response) => {
  try {
    const results = await runAllHealthChecks();
    res.json(results);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to run health checks');
    
    res.status(500).json({
      error: 'Failed to run health checks',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Run a specific health check
 */
router.post('/health/checks/:id/run', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runHealthCheck(id);
    
    if (!result) {
      return res.status(404).json({
        error: 'Health check not found',
        message: `No health check found with ID: ${id}`,
      });
    }
    
    res.json(result);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to run health check');
    
    res.status(500).json({
      error: 'Failed to run health check',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Get health logs for a specific check
 */
router.get('/health/logs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    
    const logs = await getHealthLogs(id, limit);
    res.json(logs);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to get health logs');
    
    res.status(500).json({
      error: 'Failed to get health logs',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Get error rate data for dashboard
 */
router.get('/dashboard/error-rates', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange ? parseInt(req.query.timeRange as string, 10) : 24;
    const data = await dashboardService.getErrorRateData(timeRange);
    res.json(data);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to get error rate data');
    
    res.status(500).json({
      error: 'Failed to get error rate data',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Get performance metrics for dashboard
 */
router.get('/dashboard/performance', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange ? parseInt(req.query.timeRange as string, 10) : 24;
    const data = await dashboardService.getPerformanceMetrics(timeRange);
    res.json(data);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to get performance metrics');
    
    res.status(500).json({
      error: 'Failed to get performance metrics',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Get database performance metrics for dashboard
 */
router.get('/dashboard/database', async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange ? parseInt(req.query.timeRange as string, 10) : 24;
    const data = await dashboardService.getDatabasePerformanceMetrics(timeRange);
    res.json(data);
  } catch (err) {
    logError({
      error: isError(err) ? err.message : String(err)
    }, 'Failed to get database performance metrics');
    
    res.status(500).json({
      error: 'Failed to get database performance metrics',
      message: isError(err) ? err.message : String(err),
    });
  }
});

/**
 * Register monitoring routes with an Express app
 * @param app Express application
 */
export function registerMonitoringRoutes(app: Application): void {
  app.use('/api/monitoring', router);
  info({}, 'Monitoring routes registered');
}

export default {
  router,
  registerMonitoringRoutes,
};
