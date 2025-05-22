/**
 * Monitoring API Routes
 * 
 * This module provides API endpoints for monitoring dashboards and metrics.
 */
import express from 'express';
import { Request, Response } from 'express';
import { getPerformanceMetrics, getSystemMetrics } from '../../services/monitoringService.js';
import { getHealthSummary } from '../../services/healthService.js';

const router = express.Router();

/**
 * GET /api/monitoring/dashboard/summary
 * Returns a summary of system health and performance
 */
router.get('/dashboard/summary', async (_req: Request, res: Response) => {
  try {
    const healthSummary = await getHealthSummary();
    const performanceMetrics = getPerformanceMetrics();
    const systemMetrics = getSystemMetrics();
    
    res.json({
      health: healthSummary,
      performance: performanceMetrics,
      system: systemMetrics,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving monitoring dashboard summary:', error);
    res.status(500).json({ error: 'Failed to retrieve monitoring dashboard summary' });
  }
});

/**
 * GET /api/monitoring/dashboard/error-rates
 * Returns error rate metrics
 */
router.get('/dashboard/error-rates', async (_req: Request, res: Response) => {
  try {
    const performanceMetrics = getPerformanceMetrics();
    
    res.json({
      errorRate: performanceMetrics.errorRate || 0,
      errorCount: performanceMetrics.errorCount || 0,
      requestCount: performanceMetrics.requestCount || 0,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving error rates dashboard:', error);
    res.status(500).json({ error: 'Failed to retrieve error rates dashboard' });
  }
});

/**
 * GET /api/monitoring/dashboard/performance
 * Returns performance metrics for API endpoints
 */
router.get('/dashboard/performance', async (_req: Request, res: Response) => {
  try {
    const performanceMetrics = getPerformanceMetrics();
    
    res.json({
      apiResponseTime: performanceMetrics.responseTime || 0,
      requestCount: performanceMetrics.requestCount || 0,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving performance dashboard:', error);
    res.status(500).json({ error: 'Failed to retrieve performance dashboard' });
  }
});

/**
 * GET /api/monitoring/dashboard/database
 * Returns database performance metrics
 */
router.get('/dashboard/database', async (_req: Request, res: Response) => {
  try {
    const performanceMetrics = getPerformanceMetrics();
    
    res.json({
      dbQueryDuration: performanceMetrics.dbQueryDuration || 0,
      dbQueryCount: performanceMetrics.dbQueryCount || 0,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving database dashboard:', error);
    res.status(500).json({ error: 'Failed to retrieve database dashboard' });
  }
});

/**
 * GET /api/monitoring/health/summary
 * Returns a summary of system health
 */
router.get('/health/summary', async (_req: Request, res: Response) => {
  try {
    const healthSummary = await getHealthSummary();
    
    res.json({
      ...healthSummary,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving health summary:', error);
    res.status(500).json({ error: 'Failed to retrieve health summary' });
  }
});

export default router;