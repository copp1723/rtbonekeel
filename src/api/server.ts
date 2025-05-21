// src/api/server.ts
import type express from 'express';
import type { Request, Response } from 'express';
import type crypto from 'crypto';
import type apiIngestRoutes from './index.jsroutes/apiIngestRoutes.js';

// Import types from our global declarations
import '../types/index.d.ts';

// Mock implementations for development
const logger = {
  info: (message: any, ...args: any[]) => console.info(message, ...args),
  warn: (message: any, ...args: any[]) => console.warn(message, ...args),
  error: (message: any, ...args: any[]) => console.error(message, ...args),
};

const info = (message: string) => console.info(message);
const warn = (message: string) => console.warn(message);
const error = (message: string) => console.error(message);
const getErrorMessage = (err: unknown): string => err instanceof Error ? err.message : String(err);

// Mock configuration
const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  apiKeys: {
    sendgrid: process.env.SENDGRID_API_KEY,
  }
};

// Mock implementations for services
const db = { insert: () => ({ values: () => Promise.resolve() }) };
const taskLogs = {};
const rateLimiters = { 
  api: (_req: any, _res: any, next: Function) => next(),
  healthCheck: (_req: any, _res: any, next: Function) => next(),
  taskSubmission: (_req: any, _res: any, next: Function) => next()
};
const performanceMonitoring = (_req: any, _res: any, next: Function) => next();
const setDbContext = (_req: any, _res: any, next: Function) => next();
const errorHandlerMiddleware = (err: Error, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message });
};

// Mock service functions
const getPerformanceMetrics = () => ({ cpu: 0, memory: 0, responseTime: 0, requestCount: 0, errorRate: 0 });
const getSystemMetrics = () => ({ uptime: process.uptime() });
const getMetricsHistory = () => [];
const startPerformanceMonitoring = () => {};

// Mock task parser
class TaskParser {
  async parseUserRequest(task: string) {
    return {
      task: {
        id: crypto.randomUUID(),
        type: 'generic',
        parameters: {},
        status: 'pending'
      }
    };
  }
}

// Mock service objects
const monitoringService = {
  initialize: async () => ({ sentryInitialized: false, datadogInitialized: false }),
  trackError: (_err: any, _context?: any, _critical?: boolean) => {},
  shutdown: async () => {}
};

const redisService = {
  initialize: async () => true,
  close: async () => {}
};

// Mock route handlers
const routeHandler = (fn: Function) => {
  return async (req: Request, res: Response, next: Function) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
};

// Mock service initializers
const registerAuthRoutes = async (_app: any) => {};
const registerMonitoringRoutes = (_app: any) => {};
const initializeJobQueue = async () => {};
const initializeScheduler = async () => {};
const initializeMailer = () => {};
const startAllHealthChecks = () => {};
const migrateDatabase = async () => {};
const enqueueJob = async (_taskId: string, _priority?: number) => crypto.randomUUID();

// Log startup information
logger.info(
  {
    event: 'server_startup',
    environment: config.env,
    timestamp: new Date().toISOString(),
  },
  'Server starting with validated configuration'
);

const taskParser = new TaskParser();

async function startServer(): Promise<import('http').Server> {
  info('[1/5] Loading configuration...');
  // config is already loaded by import, no need to call loadConfig

  info('[2/5] Initializing Express app...');
  const app = express();
  app.use(express.json());
  // Serve static files from the public directory
  app.use(express.static('public'));
  // Apply global rate limiter to all routes
  app.use(rateLimiters.api);
  // Set up Swagger UI for API documentation
  // setupSwagger(app); // Disabled: No such file exists
  // Apply performance monitoring middleware
  app.use(performanceMonitoring);

  info('[3/5] Applying middleware...');
  // Apply database context middleware for RLS
  app.use(setDbContext);

  info('[4/5] Setting up routes...');
  // Configure and register authentication routes
  (async () => {
    try {
      // Initialize monitoring services
      const monitoringStatus = await monitoringService.initialize();
      logger.info(`Monitoring services initialized: Sentry=${monitoringStatus.sentryInitialized}, DataDog=${monitoringStatus.datadogInitialized}`);

      // Start performance monitoring
      startPerformanceMonitoring();
      logger.info('Performance monitoring started');

      // Run database migrations
      info('Running database migrations...');
      await migrateDatabase();
      info('Database migrations completed successfully');

      // Initialize Redis service
      info('Initializing Redis service...');
      const redisInitialized = await redisService.initialize();
      if (redisInitialized) {
        info('Redis service initialized successfully');
      } else {
        warn('Redis service initialization failed, using in-memory mode');
      }

      // Initialize job queue service
      await initializeJobQueue();
      info('Job queue initialized');

      // Initialize the task scheduler
      await initializeScheduler();
      info('Task scheduler initialized');

      // Start health check schedulers
      startAllHealthChecks();
      info('Health check schedulers started');

      // Initialize email service if SendGrid API key is available
      if (config.apiKeys.sendgrid) {
        initializeMailer();
      } else {
        warn('SendGrid API key not found; email functionality will be limited');
      }

      // Register authentication and API routes
      await registerAuthRoutes(app);
      info('Authentication routes registered successfully');

      // Register job management routes
      app.use('/api/jobs', jobsRouter);

      // Register workflow routes
      app.use('/api/workflows', workflowsRouter);
      
      // Register API ingestion routes
      app.use('/api/ingest', apiIngestRoutes);

      // Register monitoring routes
      registerMonitoringRoutes(app);
      info('Monitoring routes registered');

      info('Job management and workflow routes registered');
    } catch (err) {
      error('Failed to register routes:', { error: getErrorMessage(err) });
      // Track error in monitoring service
      monitoringService.trackError(err, { component: 'server_initialization' }, true);
    }
  })();

  // Set up routes
  const router = express.Router();
  // Health check
  router.get(
    '/health',
    rateLimiters.healthCheck,
    routeHandler(async (_req: Request, res: Response) => {
      // Import health service functions
      const getHealthSummary = async () => ({ overallStatus: 'ok' });
      const getLatestHealthChecks = async () => [];
      const summary = await getHealthSummary();
      const checks = await getLatestHealthChecks();

      res.status(summary.overallStatus === 'ok' ? 200 : 503).json({
        overallStatus: summary.overallStatus,
        version: '1.0.0',
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
    })
  );
  // Test-parser endpoint
  router.post(
    '/test-parser',
    routeHandler(async (req: Request, res: Response) => {
      const task = req.body.task || '';
      // Task parsing API key removed; EKO integration is no longer used
      const result = await taskParser.parseUserRequest(task);
      res.json(result);
    })
  );
  // Tasks listing endpoint
  router.get(
    '/tasks',
    routeHandler(async (_req: Request, res: Response) => {
      const tasks = await getTaskLogs('all');
      res.json(tasks);
    })
  );

  // Performance metrics endpoint
  router.get(
    '/performance',
    routeHandler(async (_req: Request, res: Response) => {
      // Use statically imported monitors
      const performanceMetrics = getPerformanceMetrics();
      const systemMetrics = getSystemMetrics();
      const metricsHistory = getMetricsHistory();

      res.json({
        performance: performanceMetrics,
        system: systemMetrics,
        history: metricsHistory.slice(-10), // last 10 snapshots
      });
    })
  );
  // Register API routes
  app.use('/api', router);
  // Serve the index.html file for the root route
  app.get(
    '/',
    routeHandler(async (_req: Request, res: Response) => {
      res.sendFile('index.html', { root: './public' });
    })
  );
  // Import job queue and database dependencies
  // API endpoint to submit a new task
  app.post('/api/tasks', rateLimiters.taskSubmission, async (req: Request, res: Response) => {
    try {
      const { task } = req.body;
      if (!task || typeof task !== 'string') {
        return res.status(400).json({ error: 'Task is required and must be a string' });
      }
      // Parse the task to determine its type and parameters
      const { task: parsedTask } = await taskParser.parseUserRequest(task);
      // Generate task ID
      const taskId = parsedTask.id || crypto.randomUUID();
      // Create the task object and insert into database
      await db.insert(taskLogs).values({
        id: taskId,
        userId: (req as any).user?.claims?.sub,
        taskType: parsedTask.type,
        taskText: task,
        taskData: parsedTask.parameters ?? {},
        status: parsedTask.status ?? 'pending',
      });
      // Enqueue the task for processing with job queue
      const jobId = await enqueueJob(taskId);
      console.log(`Task ${taskId} submitted and enqueued as job ${jobId}`);
      // Return the task ID
      res.status(201).json({
        id: taskId,
        jobId: jobId,
        message: 'Task submitted and enqueued successfully',
      });
    } catch (error) {
      console.error('Error in task submission:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: getErrorMessage(error),
      });
    }
  });
  // API endpoint for direct task execution
  app.post('/submit-task', rateLimiters.taskSubmission, async (req: Request, res: Response) => {
    try {
      const { task } = req.body;
      if (!task || typeof task !== 'string') {
        res.status(400).json({ error: 'Task is required and must be a string' });
        return;
      }
      // Parse the task to determine its type and parameters
      const { task: parsedTask } = await taskParser.parseUserRequest(task);
      // Generate task ID
      const taskId = parsedTask.id || crypto.randomUUID();
      // Create the task object and insert into database
      await db.insert(taskLogs).values({
        id: taskId,
        userId: (req as any).user?.claims?.sub,
        taskType: parsedTask.type,
        taskText: task,
        taskData: parsedTask.parameters ?? {},
        status: parsedTask.status ?? 'pending',
      });
      // Enqueue the task with high priority (1 is highest)
      const jobId = await enqueueJob(taskId, 1);
      console.log(`Direct task ${taskId} submitted and enqueued as job ${jobId}`);
      // Return the task ID
      res.status(201).json({
        id: taskId,
        jobId: jobId,
        message: 'Task submitted for immediate processing',
      });
    } catch (error) {
      console.error('Error in direct task execution:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: getErrorMessage(error),
      });
    }
  });
  // Add global error handler middleware
  app.use(errorHandlerMiddleware);

  info('[5/5] Starting server...');
  const server = app.listen(config.server.port, config.server.host, () => {
    logger.info(`Server running on ${config.server.host}:${config.server.port}`);
  }).on('error', (err) => {
    error('Server failed to start:', { error: err });
    process.exit(1);
  });

  // Add error handler for server startup
  server.on('error', (err) => {
    error('Server failed to start:', { error: err });
    monitoringService.trackError(err, { component: 'server_startup' }, true);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');

    // Shutdown monitoring services
    await monitoringService.shutdown();

    // Close Redis connection
    await redisService.close();
    logger.info('Redis connection closed');

    // Close server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  });

  return server;
}

export { startServer };
