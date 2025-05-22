/**
 * Monitoring API Routes
 *
 * Exposes endpoints for monitoring dashboards and alerts with RBAC protection.
 */
import express, { Request, Response, Application } from 'express';
import { isAuthenticated } from '../auth.js';
import { requireAccess } from '../../middleware/rbac.js';
import { isError } from '../../utils/errorUtils.js';
import { debug, info, warn, error as logError } from '../../shared/logger.js';
import * as dashboardService from '../../services/dashboardService.js';
import {
  runAllHealthChecks,
  runHealthCheck,
  getLatestHealthChecks,
  getHealthLogs,
  getHealthSummary,
} from '../../services/healthService.js';

const router = express.Router();

/**
 * Get overall system health summary
 * Protected by RBAC - requires 'view' permission on 'monitoring'
 */
router.get('/health/summary', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Get all health checks
 * Protected by RBAC - requires 'view' permission on 'monitoring'
 */
router.get('/health/checks', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Run all health checks
 * Protected by RBAC - requires 'run-checks' permission on 'health'
 */
router.post('/health/checks/run', 
  isAuthenticated,
  requireAccess('health', 'run-checks'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Run a specific health check
 * Protected by RBAC - requires 'run-checks' permission on 'health'
 */
router.post('/health/checks/:id/run', 
  isAuthenticated,
  requireAccess('health', 'run-checks'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Get health logs for a specific check
 * Protected by RBAC - requires 'view' permission on 'monitoring'
 */
router.get('/health/logs/:id', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Get error rate data for dashboard
 * Protected by RBAC - requires 'view' permission on 'monitoring'
 */
router.get('/dashboard/error-rates', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Get performance metrics for dashboard
 * Protected by RBAC - requires 'view' permission on 'monitoring'
 */
router.get('/dashboard/performance', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Get database performance metrics for dashboard
 * Protected by RBAC - requires 'view' permission on 'monitoring'
 */
router.get('/dashboard/database', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Configure monitoring settings
 * Protected by RBAC - requires 'configure' permission on 'monitoring'
 */
router.post('/settings', 
  isAuthenticated,
  requireAccess('monitoring', 'configure'),
  async (req: Request, res: Response) => {
    try {
      const { alertThresholds, metricCollection, logLevels } = req.body;
      
      // Implementation would update monitoring settings
      // For now, return mock response
      res.json({
        status: 'success',
        message: 'Monitoring settings updated successfully',
        data: {
          alertThresholds,
          metricCollection,
          logLevels
        }
      });
    } catch (err) {
      logError({
        error: isError(err) ? err.message : String(err)
      }, 'Failed to update monitoring settings');
      
      res.status(500).json({
        error: 'Failed to update monitoring settings',
        message: isError(err) ? err.message : String(err),
      });
    }
  }
);

/**
 * Configure alert settings
 * Protected by RBAC - requires 'manage-alerts' permission on 'monitoring'
 */
router.post('/alerts', 
  isAuthenticated,
  requireAccess('monitoring', 'manage-alerts'),
  async (req: Request, res: Response) => {
    try {
      const { name, condition, threshold, recipients, enabled } = req.body;
      
      // Validate request body
      if (!name || !condition || threshold === undefined || !recipients) {
        return res.status(400).json({
          status: 'error',
          message: 'Name, condition, threshold, and recipients are required'
        });
      }
      
      // Implementation would create alert configuration
      // For now, return mock response
      res.status(201).json({
        status: 'success',
        message: 'Alert created successfully',
        data: {
          id: `alert-${Date.now()}`,
          name,
          condition,
          threshold,
          recipients,
          enabled: enabled !== undefined ? enabled : true,
          createdAt: new Date().toISOString()
        }
      });
    } catch (err) {
      logError({
        error: isError(err) ? err.message : String(err)
      }, 'Failed to create alert');
      
      res.status(500).json({
        error: 'Failed to create alert',
        message: isError(err) ? err.message : String(err),
      });
    }
  }
);

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