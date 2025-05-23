// API barrel exports
export * from './server';
export * from './routes/healthRoutes';
export * from './routes/monitoringRoutes';
export * from './routes/apiIngestRoutes';
export * from './routes/jobsRouter';
export * from './routes/workflowsRouter';

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