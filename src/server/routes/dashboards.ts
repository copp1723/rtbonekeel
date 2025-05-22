/**
 * Dashboard API Routes
 *
 * Exposes endpoints for dashboard access with RBAC protection
 */
import express, { Request, Response } from 'express';
import { isAuthenticated } from '../auth.js';
import { requireAccess } from '../../middleware/rbac.js';
import { debug, error as logError } from '../../shared/logger.js';
import { isError } from '../../utils/errorUtils.js';

const router = express.Router();

/**
 * Get all dashboards
 * Protected by RBAC - requires 'view' permission on 'dashboards'
 */
router.get('/', 
  isAuthenticated,
  requireAccess('dashboards', 'view'),
  async (req: Request, res: Response) => {
    try {
      // Implementation would fetch dashboards from database
      // For now, return mock data
      res.json({
        status: 'success',
        data: [
          { id: 'system-overview', name: 'System Overview', type: 'system' },
          { id: 'performance-metrics', name: 'Performance Metrics', type: 'performance' },
          { id: 'error-tracking', name: 'Error Tracking', type: 'errors' }
        ]
      });
    } catch (err) {
      logError('Failed to fetch dashboards:', isError(err) ? err.message : String(err));
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboards'
      });
    }
  }
);

/**
 * Get a specific dashboard
 * Protected by RBAC - requires 'view' permission on 'dashboards'
 */
router.get('/:id', 
  isAuthenticated,
  requireAccess('dashboards', 'view'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Implementation would fetch dashboard from database
      // For now, return mock data
      const dashboards = {
        'system-overview': {
          id: 'system-overview',
          name: 'System Overview',
          type: 'system',
          widgets: [
            { id: 'cpu-usage', type: 'chart', title: 'CPU Usage' },
            { id: 'memory-usage', type: 'chart', title: 'Memory Usage' },
            { id: 'active-users', type: 'counter', title: 'Active Users' }
          ]
        },
        'performance-metrics': {
          id: 'performance-metrics',
          name: 'Performance Metrics',
          type: 'performance',
          widgets: [
            { id: 'api-response-times', type: 'chart', title: 'API Response Times' },
            { id: 'database-queries', type: 'chart', title: 'Database Query Times' },
            { id: 'request-throughput', type: 'chart', title: 'Request Throughput' }
          ]
        },
        'error-tracking': {
          id: 'error-tracking',
          name: 'Error Tracking',
          type: 'errors',
          widgets: [
            { id: 'error-rate', type: 'chart', title: 'Error Rate' },
            { id: 'top-errors', type: 'table', title: 'Top Errors' },
            { id: 'error-distribution', type: 'pie-chart', title: 'Error Distribution' }
          ]
        }
      };
      
      const dashboard = dashboards[id as keyof typeof dashboards];
      
      if (!dashboard) {
        return res.status(404).json({
          status: 'error',
          message: `Dashboard with ID "${id}" not found`
        });
      }
      
      res.json({
        status: 'success',
        data: dashboard
      });
    } catch (err) {
      logError('Failed to fetch dashboard:', isError(err) ? err.message : String(err));
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard'
      });
    }
  }
);

/**
 * Create a new dashboard
 * Protected by RBAC - requires 'create' permission on 'dashboards'
 */
router.post('/', 
  isAuthenticated,
  requireAccess('dashboards', 'create'),
  async (req: Request, res: Response) => {
    try {
      const { name, type, widgets } = req.body;
      
      // Validate request body
      if (!name || !type) {
        return res.status(400).json({
          status: 'error',
          message: 'Name and type are required'
        });
      }
      
      // Implementation would create dashboard in database
      // For now, return mock response
      res.status(201).json({
        status: 'success',
        data: {
          id: `dashboard-${Date.now()}`,
          name,
          type,
          widgets: widgets || [],
          createdAt: new Date().toISOString()
        }
      });
    } catch (err) {
      logError('Failed to create dashboard:', isError(err) ? err.message : String(err));
      res.status(500).json({
        status: 'error',
        message: 'Failed to create dashboard'
      });
    }
  }
);

/**
 * Update a dashboard
 * Protected by RBAC - requires 'edit' permission on 'dashboards'
 */
router.put('/:id', 
  isAuthenticated,
  requireAccess('dashboards', 'edit'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, type, widgets } = req.body;
      
      // Validate request body
      if (!name && !type && !widgets) {
        return res.status(400).json({
          status: 'error',
          message: 'At least one field to update is required'
        });
      }
      
      // Implementation would update dashboard in database
      // For now, return mock response
      res.json({
        status: 'success',
        data: {
          id,
          name,
          type,
          widgets: widgets || [],
          updatedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      logError('Failed to update dashboard:', isError(err) ? err.message : String(err));
      res.status(500).json({
        status: 'error',
        message: 'Failed to update dashboard'
      });
    }
  }
);

/**
 * Delete a dashboard
 * Protected by RBAC - requires 'delete' permission on 'dashboards'
 */
router.delete('/:id', 
  isAuthenticated,
  requireAccess('dashboards', 'delete'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Implementation would delete dashboard from database
      // For now, return mock response
      res.json({
        status: 'success',
        message: `Dashboard with ID "${id}" deleted successfully`
      });
    } catch (err) {
      logError('Failed to delete dashboard:', isError(err) ? err.message : String(err));
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete dashboard'
      });
    }
  }
);

/**
 * Register dashboard routes with an Express app
 * @param app Express application
 */
export function registerDashboardRoutes(app: express.Application): void {
  app.use('/api/dashboards', router);
  debug('Dashboard routes registered');
}

export default {
  router,
  registerDashboardRoutes
};