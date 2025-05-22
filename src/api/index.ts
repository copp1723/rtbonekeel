// API barrel exports
export * from './server.js.js';
export * from './routes/healthRoutes.js.js';
export * from './routes/monitoringRoutes.js.js';
export * from './routes/apiIngestRoutes.js.js';
export * from './routes/jobsRouter.js.js';
export * from './routes/workflowsRouter.js.js';

// Common middleware
export const rateLimiters = {
  api: (req: any, res: any, next: any) => next(),
  healthCheck: (req: any, res: any, next: any) => next(),
  taskSubmission: (req: any, res: any, next: any) => next()
};

// Authentication middleware
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
};

// Suspicious pattern detection
export const detectSuspiciousPatterns = (req: any, res: any, next: any) => next();