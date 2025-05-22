undefined

/**
 * Health‑check routes
 * -------------------
 * Simple endpoints used by load‑balancers, uptime monitors,
 * and the internal monitoring UI.
 *
 * All handlers are fully typed so the file compiles cleanly
 * under `strict` TypeScript settings.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Lightweight ping – returns plain‑text.
 */
router.get('/ping', (_req: Request, res: Response): void => {
  res.send('pong');
});

/**
 * JSON status for interactive probes.
 */
router.get('/status', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Comprehensive health summary (placeholder).
 * Replace with real checks as subsystems come online.
 */
router.get('/health', async (_req: Request, res: Response): Promise<void> => {
  // In a real implementation you might check database connectivity,
  // queue backlogs, third‑party API reachability, etc.
  res.json({
    healthy: true,
    checks: [],
  });
});

export default router;