/**
 * Health Check API Routes
 * 
 * This module provides API endpoints for health monitoring and status checks.
 */
import express from 'express';
import { Request, Response } from 'express';
import { 
  runAllHealthChecks, 
  runHealthCheck, 
  getLatestHealthChecks, 
  getHealthLogs, 
  getHealthSummary 
} from '../../services/healthService.js';

const router = express.Router();

/**
 * GET /api/health
 * Returns a summary of system health
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const summary = await getHealthSummary();
    const checks = await getLatestHealthChecks();
    
    res.status(summary.overallStatus === 'ok' ? 200 : 503).json({
      overallStatus: summary.overallStatus,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      checks: checks.map(check => ({
        name: check.name,
        status: check.status,
        message: check.message,
        responseTime: check.responseTime,
        lastChecked: check.lastChecked,
        details: check.details,
      })),
    });
  } catch (error) {
    console.error('Error in health check endpoint:', error);
    res.status(500).json({
      overallStatus: 'error',
      message: 'Failed to retrieve health status',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/checks
 * Returns the latest health check results for all services
 */
router.get('/checks', async (_req: Request, res: Response) => {
  try {
    const checks = await getLatestHealthChecks();
    res.json(checks);
  } catch (error) {
    console.error('Error retrieving health checks:', error);
    res.status(500).json({ error: 'Failed to retrieve health checks' });
  }
});

/**
 * GET /api/health/checks/:id
 * Returns the latest health check result for a specific service
 */
router.get('/checks/:id', async (req: Request, res: Response) => {
  try {
    const check = await runHealthCheck(req.params.id);
    if (!check) {
      return res.status(404).json({ error: 'Health check not found' });
    }
    res.json(check);
  } catch (error) {
    console.error(`Error retrieving health check ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve health check' });
  }
});

/**
 * POST /api/health/checks/:id/run
 * Runs a health check for a specific service
 */
router.post('/checks/:id/run', async (req: Request, res: Response) => {
  try {
    const check = await runHealthCheck(req.params.id);
    if (!check) {
      return res.status(404).json({ error: 'Health check not found' });
    }
    res.json(check);
  } catch (error) {
    console.error(`Error running health check ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to run health check' });
  }
});

/**
 * GET /api/health/logs/:id
 * Returns the health check logs for a specific service
 */
router.get('/logs/:id', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await getHealthLogs(req.params.id, limit);
    res.json(logs);
  } catch (error) {
    console.error(`Error retrieving health logs for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve health logs' });
  }
});

/**
 * POST /api/health/run-all
 * Runs all health checks
 */
router.post('/run-all', async (_req: Request, res: Response) => {
  try {
    const results = await runAllHealthChecks();
    res.json(results);
  } catch (error) {
    console.error('Error running all health checks:', error);
    res.status(500).json({ error: 'Failed to run health checks' });
  }
});

export default router;