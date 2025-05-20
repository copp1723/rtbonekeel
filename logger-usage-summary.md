# Logger Usage Summary Report
        
## Summary
- Total Logger Calls Found: 625
- Files with Logger Calls: 83

## Call Types
- Direct function calls (e.g., `error()`): 479
- Object method calls (e.g., `logger.error()`): 8
- Console calls (e.g., `console.log()`): 96
- Other logger-like calls: 42

## Method Usage
- error: 275
- info: 182
- warn: 74
- unknown: 42
- log: 29
- debug: 21
- fatal: 2

## Files with Logger Calls
- src/shared/errorHandler.ts
- src/shared/logger.ts
- src/utils/errorHandling.ts
- src/utils/errors.ts
- src/utils/logger.ts
- src/api/server.ts
- src/config/index.ts
- src/config/monitoring.ts
- src/config/secrets.ts
- src/core/ai/index.ts
- src/core/ai/llmAuditLogger.ts
- src/core/ai/modelFallback.ts
- src/core/ai/openai.ts
- src/core/ai/promptTemplate.ts
- src/features/auth/services/userCredentialService.ts
- src/features/email/services/emailIngestService.ts
- src/features/email/services/emailTemplates.ts
- src/features/scheduler/services/executePlan.ts
- src/features/workflow/services/attachmentParsers.ts
- src/index.ts
- src/middleware/dbContextMiddleware.ts
- src/middleware/monitoringMiddleware.ts
- src/middleware/performance.ts
- src/migrations/add-api-key-security-fields.ts
- src/migrations/migrationRunner.ts
- src/migrations/run-migrations.ts
- src/migrations/run-rls-migration.ts
- src/parsers/factory/ParserFactory.ts
- src/parsers/implementations/CSVParser.ts
- src/parsers/implementations/PDFParser.ts
- src/parsers/implementations/XLSXParser.ts
- src/parsers/utils/monitoring.ts
- src/server/routes/apiKeys.ts
- src/server/routes/auth.ts
- src/server/routes/emails.ts
- src/server/routes/health.ts
- src/server/routes/index.ts
- src/server/routes/jobs.ts
- src/server/routes/monitoring.ts
- src/server/routes/schedules.ts
- src/server/routes/workflows.ts
- src/services/alertMailer.ts
- src/services/apiKeyService.ts
- src/services/attachmentParsers.ts
- src/services/awsKmsService.ts
- src/services/bullmqService.ts
- src/services/credentialVault.ts
- src/services/datadogService.ts
- src/services/dbHealthCheck.ts
- src/services/emailQueue.ts
- src/services/enhancedApiKeyService.ts
- src/services/healthCheckScheduler.ts
- src/services/healthService.ts
- src/services/imapIngestionService.ts
- src/services/insightGenerator.ts
- src/services/jobQueue.ts
- src/services/jobQueueSystem.ts
- src/services/kmsEncryptionService.ts
- src/services/mailerService.ts
- src/services/migrationService.ts
- src/services/monitoringService.ts
- src/services/openai.ts
- src/services/performanceMonitor.ts
- src/services/queueManager.ts
- src/services/rbacService.ts
- src/services/redisHealthCheck.ts
- src/services/redisService.ts
- src/services/resultsPersistence.ts
- src/services/schedulerService.ts
- src/services/securityInitializer.ts
- src/services/securityMonitoringService.ts
- src/services/sentryService.ts
- src/services/stepHandlers.ts
- src/services/workflowEmailServiceFixed.ts
- src/services/workflowService.ts
- src/shared/db.ts
- src/shared/middleware/rateLimiter.ts
- src/shared/middleware/rbacMiddleware.ts
- src/utils/circuitBreaker.ts
- src/utils/encryption.ts
- src/utils/envValidator.ts
- src/utils/rateLimiter.ts
- src/utils/retry.ts

## Detailed Calls

### src/shared/errorHandler.ts:42
- Type: object
- Method: warn
- Code: `logger.warn('Operational error occurred', logContext)`


### src/shared/errorHandler.ts:44
- Type: object
- Method: error
- Code: `logger.error('Unexpected error occurred', logContext)`


### src/shared/errorHandler.ts:124
- Type: other
- Method: unknown
- Code: `process.on('uncaughtException', (error: Error) => {
    const appError = toAppError(error);
    logError(appError, { type: 'uncaughtException' });
    
    // Consider whether to crash the process or not based on error type
    if (!appError.isOperational) {
      logger.fatal('Uncaught exception - Application will exit', { error: appError });
      process.exit(1);
    }
  })`


### src/shared/errorHandler.ts:130
- Type: object
- Method: fatal
- Code: `logger.fatal('Uncaught exception - Application will exit', { error: appError })`


### src/shared/errorHandler.ts:135
- Type: other
- Method: unknown
- Code: `process.on('unhandledRejection', (reason: unknown) => {
    const appError = toAppError(reason);
    logError(appError, { type: 'unhandledRejection' });
    
    // Consider whether to crash the process or not based on error type
    if (!appError.isOperational) {
      logger.fatal('Unhandled rejection - Application will exit', { error: appError });
      process.exit(1);
    }
  })`


### src/shared/errorHandler.ts:141
- Type: object
- Method: fatal
- Code: `logger.fatal('Unhandled rejection - Application will exit', { error: appError })`


### src/shared/logger.ts:42
- Type: console
- Method: error
- Code: `console.error('Failed to write to log file:', error)`


### src/shared/logger.ts:63
- Type: console
- Method: debug
- Code: `console.debug(`[DEBUG] ${message}`)`


### src/shared/logger.ts:73
- Type: console
- Method: info
- Code: `console.info(`[INFO] ${message}`)`


### src/shared/logger.ts:83
- Type: console
- Method: warn
- Code: `console.warn(`[WARN] ${message}`)`


### src/shared/logger.ts:94
- Type: console
- Method: error
- Code: `console.error(`[ERROR] ${errorMessage}`)`


### src/shared/logger.ts:110
- Type: console
- Method: error
- Code: `console.error(`[FATAL] ${message}`)`


### src/shared/logger.ts:149
- Type: console
- Method: info
- Code: `console.info(
    `[INSIGHT RUN] Platform: ${logData.platform!}, Intent: ${logData.promptIntent}, Version: ${logData.promptVersion}`
  )`


### src/shared/logger.ts:152
- Type: console
- Method: info
- Code: `console.info(
    `[INSIGHT RUN] Duration: ${logData.durationMs}ms, File: ${logData.inputFile || 'direct content'}`
  )`


### src/shared/logger.ts:156
- Type: console
- Method: error
- Code: `console.error(`[INSIGHT RUN] Error: ${logData.error}`)`


### src/shared/logger.ts:158
- Type: console
- Method: info
- Code: `console.info(`[INSIGHT RUN] Generated ${logData.outputSummary.length} insights`)`


### src/utils/errorHandling.ts:65
- Type: direct
- Method: error
- Code: `error(`Error: ${errorData.message}`, errorData)`


### src/utils/errorHandling.ts:67
- Type: direct
- Method: warn
- Code: `warn(`Warning: ${errorData.message}`, errorData)`


### src/utils/errorHandling.ts:129
- Type: direct
- Method: info
- Code: `info(`Retry attempt ${attempt + 1}/${retries} after ${backoffDelay}ms`, {
        ...context,
        errorMessage: getErrorMessage(err),
        attempt: attempt + 1,
        maxRetries: retries,
        backoffDelay,
      })`


### src/utils/errors.ts:118
- Type: direct
- Method: warn
- Code: `warn('Operational error occurred', logData)`


### src/utils/errors.ts:120
- Type: direct
- Method: error
- Code: `error('Unexpected error occurred', logData)`


### src/utils/logger.ts:9
- Type: object
- Method: info
- Code: `logger.info('Minimal pino logger initialized successfully!')`


### src/api/server.ts:29
- Type: direct
- Method: info
- Code: `info(
  {
    event: 'server_startup',
    environment: config.env,
    timestamp: new Date().toISOString(),
  },
  'Server starting with validated configuration'
)`


### src/api/server.ts:39
- Type: console
- Method: log
- Code: `console.log('[1/5] Loading configuration...')`


### src/api/server.ts:42
- Type: console
- Method: log
- Code: `console.log('[2/5] Initializing Express app...')`


### src/api/server.ts:54
- Type: console
- Method: log
- Code: `console.log('[3/5] Applying middleware...')`


### src/api/server.ts:58
- Type: console
- Method: log
- Code: `console.log('[4/5] Setting up routes...')`


### src/api/server.ts:60
- Type: other
- Method: unknown
- Code: `(async () => {
    try {
      // Initialize monitoring services
      const monitoringStatus = await monitoringService.initialize();
      info(`Monitoring services initialized: Sentry=${monitoringStatus.sentryInitialized}, DataDog=${monitoringStatus.datadogInitialized}`);

      // Start performance monitoring
      import { startPerformanceMonitoring } from '../services/performanceMonitor.js';
      startPerformanceMonitoring();
      info('Performance monitoring started');

      // Initialize job queue service
      await initializeJobQueue();
      console.log('Job queue initialized');

      // Initialize the task scheduler
      await initializeScheduler();
      console.log('Task scheduler initialized');

      // Start health check schedulers
      startAllHealthChecks();
      console.log('Health check schedulers started');

      // Initialize email service if SendGrid API key is available
      if (config.apiKeys.sendgrid) {
        initializeMailer();
      } else {
        console.warn('SendGrid API key not found; email functionality will be limited');
      }

      // Register authentication and API routes
      await registerAuthRoutes(app);
      console.log('Authentication routes registered successfully');

      // Register job management routes
      app.use('/api/jobs', jobsRouter);

      // Register workflow routes
      app.use('/api/workflows', workflowsRouter);

      // Register monitoring routes
      registerMonitoringRoutes(app);
      console.log('Monitoring routes registered');

      console.log('Job management and workflow routes registered');
    } catch (err) {
      console.error('Failed to register routes:', err);
      // Track err in monitoring service
      monitoringService.trackError(err, { component: 'server_initialization' }, true);
    }
  })()`


### src/api/server.ts:64
- Type: direct
- Method: info
- Code: `info(`Monitoring services initialized: Sentry=${monitoringStatus.sentryInitialized}, DataDog=${monitoringStatus.datadogInitialized}`)`


### src/api/server.ts:69
- Type: direct
- Method: info
- Code: `info('Performance monitoring started')`


### src/api/server.ts:73
- Type: console
- Method: log
- Code: `console.log('Job queue initialized')`


### src/api/server.ts:77
- Type: console
- Method: log
- Code: `console.log('Task scheduler initialized')`


### src/api/server.ts:81
- Type: console
- Method: log
- Code: `console.log('Health check schedulers started')`


### src/api/server.ts:87
- Type: console
- Method: warn
- Code: `console.warn('SendGrid API key not found; email functionality will be limited')`


### src/api/server.ts:92
- Type: console
- Method: log
- Code: `console.log('Authentication routes registered successfully')`


### src/api/server.ts:102
- Type: console
- Method: log
- Code: `console.log('Monitoring routes registered')`


### src/api/server.ts:104
- Type: console
- Method: log
- Code: `console.log('Job management and workflow routes registered')`


### src/api/server.ts:106
- Type: console
- Method: error
- Code: `console.error('Failed to register routes:', err)`


### src/api/server.ts:180
- Type: other
- Method: unknown
- Code: `app.post('/api/tasks', rateLimiters.taskSubmission, async (req: Request, res: Response) => {
    try {
      const { task } = req.body;
      if (!task || typeof task !== 'string') {
        return res.status(400).json({ error: 'Task is required and must be a string' });
      }
      // Parse the task to determine its type and parameters
      const parsedTask = await parseTask(task);
      // Generate task ID
      const taskId = crypto.randomUUID();
      // Create the task object and insert into database
      await db.insert(taskLogs).values({
        id: taskId,
        userId: req.user?.claims?.sub,
        taskType: parsedTask.type,
        taskText: task,
        taskData: parsedTask.parameters,
        status: 'pending',
      });
      // Enqueue the task for processing with job queue
      const jobId = await enqueueJob(taskId);
      console.log(`Task ${taskId} submitted and enqueued as job ${jobId}`);
      // Return the task ID
      return res.status(201).json({
        id: taskId,
        jobId: jobId,
        message: 'Task submitted and enqueued successfully',
      });
    } catch (err) {
      // Use type-safe err handling
      const errorMessage = isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err);
      console.error('Error in task submission:', err);
      return res.status(500).json({
        err: 'Internal server err',
        message: err instanceof Error ? isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err) : 'Unknown err',
      });
    }
  })`


### src/api/server.ts:201
- Type: console
- Method: log
- Code: `console.log(`Task ${taskId} submitted and enqueued as job ${jobId}`)`


### src/api/server.ts:211
- Type: console
- Method: error
- Code: `console.error('Error in task submission:', err)`


### src/api/server.ts:219
- Type: other
- Method: unknown
- Code: `app.post('/submit-task', rateLimiters.taskSubmission, async (req: Request, res: Response) => {
    try {
      const { task } = req.body;
      if (!task || typeof task !== 'string') {
        return res.status(400).json({ error: 'Task is required and must be a string' });
      }
      // Parse the task to determine its type and parameters
      const parsedTask = await parseTask(task);
      // Generate task ID
      const taskId = crypto.randomUUID();
      // Create the task object and insert into database
      await db.insert(taskLogs).values({
        id: taskId,
        userId: req.user?.claims?.sub,
        taskType: parsedTask.type,
        taskText: task,
        taskData: parsedTask.parameters,
        status: 'pending',
      });
      // Enqueue the task with high priority (1 is highest)
      const jobId = await enqueueJob(taskId, 1);
      console.log(`Direct task ${taskId} submitted and enqueued as job ${jobId}`);
      // Return the task ID
      return res.status(201).json({
        id: taskId,
        jobId: jobId,
        message: 'Task submitted for immediate processing',
      });
    } catch (err) {
      // Use type-safe err handling
      const errorMessage = isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err);
      console.error('Error in direct task execution:', err);
      return res.status(500).json({
        err: 'Internal server err',
        message: err instanceof Error ? isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err) : 'Unknown err',
      });
    }
  })`


### src/api/server.ts:240
- Type: console
- Method: log
- Code: `console.log(`Direct task ${taskId} submitted and enqueued as job ${jobId}`)`


### src/api/server.ts:250
- Type: console
- Method: error
- Code: `console.error('Error in direct task execution:', err)`


### src/api/server.ts:260
- Type: console
- Method: log
- Code: `console.log('[5/5] Starting server...')`


### src/api/server.ts:261
- Type: other
- Method: unknown
- Code: `app.listen(config.server.port, config.server.host, () => {
    info(`Server running on ${config.server.host}:${config.server.port}`);
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  })`


### src/api/server.ts:262
- Type: direct
- Method: info
- Code: `info(`Server running on ${config.server.host}:${config.server.port}`)`


### src/api/server.ts:264
- Type: console
- Method: error
- Code: `console.error('Server failed to start:', err)`


### src/api/server.ts:269
- Type: other
- Method: unknown
- Code: `server.on('error', (err) => {
    console.error('Server failed to start:', err);
    monitoringService.trackError(err, { component: 'server_startup' }, true);
  })`


### src/api/server.ts:270
- Type: console
- Method: error
- Code: `console.error('Server failed to start:', err)`


### src/api/server.ts:276
- Type: direct
- Method: info
- Code: `info('SIGTERM received, shutting down gracefully')`


### src/api/server.ts:283
- Type: direct
- Method: info
- Code: `info('Server closed')`


### src/api/server.ts:289
- Type: direct
- Method: error
- Code: `error('Forced shutdown after timeout')`


### src/config/index.ts:102
- Type: direct
- Method: error
- Code: `error('Configuration validation failed:', {
        issues: err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      })`


### src/config/index.ts:109
- Type: direct
- Method: error
- Code: `error('Failed to load configuration:', err)`


### src/config/index.ts:114
- Type: direct
- Method: error
- Code: `error('Exiting due to invalid configuration in production environment')`


### src/config/index.ts:146
- Type: direct
- Method: warn
- Code: `warn('Email configuration is incomplete. Email functionality may not work correctly.')`


### src/config/index.ts:169
- Type: direct
- Method: warn
- Code: `warn('OTP email configuration is incomplete. OTP functionality may not work correctly.')`


### src/config/index.ts:195
- Type: direct
- Method: error
- Code: `error('Using a default encryption key in production. This is a security risk.')`


### src/config/index.ts:278
- Type: direct
- Method: warn
- Code: `warn('Failed to parse REDIS_URL, using individual settings instead')`


### src/config/monitoring.ts:112
- Type: direct
- Method: error
- Code: `error('Monitoring configuration validation failed:', {
        issues: err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      })`


### src/config/monitoring.ts:119
- Type: direct
- Method: error
- Code: `error('Failed to load monitoring configuration:', err)`


### src/config/secrets.ts:23
- Type: direct
- Method: warn
- Code: `warn('Using a default encryption key. This is insecure for production use.')`


### src/config/secrets.ts:26
- Type: direct
- Method: error
- Code: `error('Default encryption key detected in production environment. This is a security risk.')`


### src/config/secrets.ts:45
- Type: direct
- Method: error
- Code: `error('Failed to initialize encryption key for secrets', err)`


### src/core/ai/index.ts:68
- Type: direct
- Method: warn
- Code: `warn('Failed to initialize OpenAI. Some AI features may not work.')`


### src/core/ai/index.ts:81
- Type: direct
- Method: error
- Code: `error('Failed to initialize AI core:', err)`


### src/core/ai/llmAuditLogger.ts:64
- Type: direct
- Method: error
- Code: `error('Failed to log LLM interaction:', isError(err) ? err : String(err))`


### src/core/ai/llmAuditLogger.ts:129
- Type: direct
- Method: error
- Code: `error('Failed to get LLM usage stats:', isError(err) ? err : String(err))`


### src/core/ai/llmAuditLogger.ts:203
- Type: direct
- Method: error
- Code: `error('Failed to get recent LLM interactions:', isError(err) ? err : String(err))`


### src/core/ai/modelFallback.ts:168
- Type: direct
- Method: warn
- Code: `warn(`Primary model ${primaryModel.id} failed, trying fallbacks:`, err)`


### src/core/ai/modelFallback.ts:185
- Type: direct
- Method: info
- Code: `info(`Trying fallback model: ${fallbackModel.id}`)`


### src/core/ai/modelFallback.ts:198
- Type: direct
- Method: warn
- Code: `warn(`Fallback model ${fallbackModel.id} failed:`, fallbackError)`


### src/core/ai/openai.ts:86
- Type: direct
- Method: error
- Code: `error('Failed to initialize OpenAI client:', isError(err) ? err : String(err))`


### src/core/ai/openai.ts:112
- Type: direct
- Method: error
- Code: `error('Failed to initialize OpenAI client with credential:', isError(err) ? err : String(err))`


### src/core/ai/openai.ts:262
- Type: direct
- Method: error
- Code: `error('Failed to log completion:', isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:62
- Type: direct
- Method: info
- Code: `info(`Created prompts directory: ${PROMPTS_DIR}`)`


### src/core/ai/promptTemplate.ts:67
- Type: direct
- Method: info
- Code: `info(`Initialized prompt system with ${promptCache.size} templates`)`


### src/core/ai/promptTemplate.ts:69
- Type: direct
- Method: error
- Code: `error('Failed to initialize prompt system:', isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:90
- Type: direct
- Method: error
- Code: `error(`Error loading prompt file ${file}:`, isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:96
- Type: direct
- Method: error
- Code: `error('Error loading prompts:', isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:213
- Type: direct
- Method: error
- Code: `error(`Error loading prompt template ${name}:`, isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:278
- Type: direct
- Method: error
- Code: `error(`Error saving prompt template ${template.name}:`, isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:300
- Type: direct
- Method: info
- Code: `info(`Reloaded prompt template: ${file}`)`


### src/core/ai/promptTemplate.ts:302
- Type: direct
- Method: error
- Code: `error(`Error reloading prompt template ${file}:`, isError(err) ? err : String(err))`


### src/core/ai/promptTemplate.ts:307
- Type: direct
- Method: error
- Code: `error('Error checking for prompt updates:', isError(err) ? err : String(err))`


### src/features/auth/services/userCredentialService.ts:77
- Type: direct
- Method: error
- Code: `error('Security violation: Attempted to add credentials without proper encryption', err)`


### src/features/auth/services/userCredentialService.ts:87
- Type: direct
- Method: warn
- Code: `warn('Using default encryption key in development. Set ENCRYPTION_KEY for production.')`


### src/features/auth/services/userCredentialService.ts:125
- Type: direct
- Method: error
- Code: `error('Error saving credential:', err)`


### src/features/auth/services/userCredentialService.ts:198
- Type: direct
- Method: error
- Code: `error('Error loading credential:', err)`


### src/features/auth/services/userCredentialService.ts:239
- Type: direct
- Method: error
- Code: `error('Failed to list user credentials:', err)`


### src/features/auth/services/userCredentialService.ts:335
- Type: direct
- Method: error
- Code: `error('Error saving credential:', err)`


### src/features/auth/services/userCredentialService.ts:397
- Type: direct
- Method: error
- Code: `error('Error deleting credential:', err)`


### src/features/auth/services/userCredentialService.ts:461
- Type: direct
- Method: error
- Code: `error('Failed to hard delete user credential:', err)`


### src/features/auth/services/userCredentialService.ts:555
- Type: direct
- Method: error
- Code: `error('Error getting active credential:', err)`


### src/features/email/services/emailIngestService.ts:57
- Type: direct
- Method: info
- Code: `info(`Starting email ingestion for ${platform}`)`


### src/features/email/services/emailIngestService.ts:69
- Type: direct
- Method: info
- Code: `info(`Fetching emails for ${platform}...`)`


### src/features/email/services/emailIngestService.ts:75
- Type: direct
- Method: info
- Code: `info(`Found ${emailResults.length} emails with attachments for ${platform}`)`


### src/features/email/services/emailIngestService.ts:82
- Type: direct
- Method: info
- Code: `info(`Processing attachment: ${path.basename(filePath)}`)`


### src/features/email/services/emailIngestService.ts:88
- Type: direct
- Method: info
- Code: `info(`Successfully parsed ${parsedData.recordCount} records from ${path.basename(filePath)}`)`


### src/features/email/services/emailIngestService.ts:92
- Type: direct
- Method: info
- Code: `info(`Storing results for ${platform}`)`


### src/features/email/services/emailIngestService.ts:104
- Type: direct
- Method: info
- Code: `info(`Results stored with ID: ${storageResult.id}`)`


### src/features/email/services/emailIngestService.ts:109
- Type: direct
- Method: info
- Code: `info(`Generating insights for ${platform}`)`


### src/features/email/services/emailIngestService.ts:114
- Type: direct
- Method: info
- Code: `info(`Generated ${insights.length} insights`)`


### src/features/email/services/emailIngestService.ts:126
- Type: direct
- Method: error
- Code: `error(`Error processing attachment ${path.basename(filePath)}:`, isError(err) ? err : String(err))`


### src/features/email/services/emailIngestService.ts:162
- Type: direct
- Method: error
- Code: `error(`Email ingestion failed for ${platform}:`, isError(err) ? err : String(err))`


### src/features/email/services/emailTemplates.ts:85
- Type: console
- Method: error
- Code: `console.error('Error generating email template:', error)`


### src/features/scheduler/services/executePlan.ts:50
- Type: console
- Method: log
- Code: `console.log(`Created new plan in database with ID: ${planId}`)`


### src/features/scheduler/services/executePlan.ts:54
- Type: console
- Method: log
- Code: `console.log(`Executing step ${i}: ${step.tool}`)`


### src/features/scheduler/services/executePlan.ts:75
- Type: console
- Method: log
- Code: `console.log(`Created step record with ID: ${stepId}`)`


### src/features/scheduler/services/executePlan.ts:89
- Type: console
- Method: log
- Code: `console.log(`Step ${i} completed successfully`)`


### src/features/scheduler/services/executePlan.ts:91
- Type: console
- Method: error
- Code: `console.error(`Error in step ${i}:`, error)`


### src/features/scheduler/services/executePlan.ts:124
- Type: console
- Method: error
- Code: `console.error('Error executing plan:', error)`


### src/features/scheduler/services/executePlan.ts:147
- Type: other
- Method: unknown
- Code: `processedValue.replace(templateRegex, (_match, stepIndex, propertyPath) => {
        const index = parseInt(stepIndex, 10);
        if (index < 0 || index >= stepResults.length) {
          throw new Error(`Invalid step reference: step${index}`);
        }
        let result = stepResults[index].output;
        // If a property path is specified, traverse the object
        if (propertyPath) {
          // Remove leading dot and split by dots
          const props = propertyPath.substring(1).split('.');
          // Navigate through the properties
          try {
            for (const prop of props) {
              if (!result || typeof result !== 'object') {
                throw new Error(`Cannot access property '${prop}' of non-object value`);
              }
              result = result[prop];
            }
          } catch (e) {
            console.warn(
              `Failed to access property path ${propertyPath} in step ${index} output:`,
              e
            );
            // Return empty string for failed property access
            return '';
          }
        }
        // If the result is an object or array, stringify it
        if (typeof result === 'object' && result !== null) {
          return JSON.stringify(result);
        }
        return String(result);
      })`


### src/features/scheduler/services/executePlan.ts:166
- Type: console
- Method: warn
- Code: `console.warn(
              `Failed to access property path ${propertyPath} in step ${index} output:`,
              e
            )`


### src/features/workflow/services/attachmentParsers.ts:71
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'parsed_csv_records',
        file: path.basename(filePath),
        recordsCount: records.length,
        timestamp: new Date().toISOString(),
      },
      'Parsed CSV records'
    )`


### src/features/workflow/services/attachmentParsers.ts:98
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'error_parsing_csv',
        file: filePath,
        errorMessage,
        stack,
        timestamp: new Date().toISOString(),
      },
      'Error parsing CSV file'
    )`


### src/features/workflow/services/attachmentParsers.ts:145
- Type: console
- Method: warn
- Code: `console.warn(`Sheet not found: ${sheetName}`)`


### src/features/workflow/services/attachmentParsers.ts:188
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'parsed_excel_records',
        file: path.basename(filePath),
        recordsCount: records.length,
        timestamp: new Date().toISOString(),
      },
      'Parsed Excel records'
    )`


### src/features/workflow/services/attachmentParsers.ts:215
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'error_parsing_excel',
        file: filePath,
        errorMessage,
        stack,
        timestamp: new Date().toISOString(),
      },
      'Error parsing Excel file'
    )`


### src/features/workflow/services/attachmentParsers.ts:248
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'extracted_pdf_text',
        file: path.basename(filePath),
        charCount: text.length,
        timestamp: new Date().toISOString(),
      },
      'Extracted PDF text'
    )`


### src/features/workflow/services/attachmentParsers.ts:265
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'parsed_pdf_records',
        source: 'pdfContent',
        recordsCount: records.length,
        timestamp: new Date().toISOString(),
      },
      'Parsed PDF records'
    )`


### src/features/workflow/services/attachmentParsers.ts:292
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'error_parsing_pdf',
        file: filePath,
        errorMessage,
        stack,
        timestamp: new Date().toISOString(),
      },
      'Error parsing PDF file'
    )`


### src/features/workflow/services/attachmentParsers.ts:324
- Type: console
- Method: warn
- Code: `console.warn('Could not identify header row in PDF. Using first line as header.')`


### src/features/workflow/services/attachmentParsers.ts:356
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'parsed_pdf_records',
        source: 'pdfContent',
        recordsCount: records.length,
        timestamp: new Date().toISOString(),
      },
      'Parsed PDF records'
    )`


### src/features/workflow/services/attachmentParsers.ts:370
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'error_extracting_pdf_table',
        errorMessage,
        stack,
        timestamp: new Date().toISOString(),
      },
      'Error extracting tabular data from PDF'
    )`


### src/index.ts:9
- Type: other
- Method: unknown
- Code: `startServer().catch((error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
})`


### src/index.ts:10
- Type: console
- Method: error
- Code: `console.error('Failed to start server:', error)`


### src/middleware/dbContextMiddleware.ts:49
- Type: direct
- Method: debug
- Code: `debug({
          event: 'db_context_set',
          userId,
          isAdmin,
          clientIp,
        }, `Set database context for user ${userId} (admin: ${isAdmin}, IP: ${clientIp})`)`


### src/middleware/dbContextMiddleware.ts:63
- Type: direct
- Method: debug
- Code: `debug({
          event: 'db_context_cleared',
          clientIp,
        }, `Cleared database context (no authenticated user, IP: ${clientIp})`)`


### src/middleware/dbContextMiddleware.ts:72
- Type: direct
- Method: error
- Code: `error({
      event: 'db_context_error',
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 'Error setting database context')`


### src/middleware/monitoringMiddleware.ts:61
- Type: direct
- Method: info
- Code: `info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      event: 'api_request',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    })`


### src/middleware/monitoringMiddleware.ts:100
- Type: direct
- Method: error
- Code: `error('Error in error tracking middleware:',
      isError(middlewareError) ? middlewareError : String(middlewareError)
    )`


### src/middleware/monitoringMiddleware.ts:124
- Type: direct
- Method: info
- Code: `info('Monitoring middleware registered')`


### src/middleware/performance.ts:88
- Type: direct
- Method: warn
- Code: `warn({
        event: 'slow_request',
        method: req.method,
        path: req.path,
        responseTime,
        statusCode: res.statusCode,
      })`


### src/migrations/add-api-key-security-fields.ts:23
- Type: direct
- Method: info
- Code: `info('Starting migration: Add API Key Security Fields')`


### src/migrations/add-api-key-security-fields.ts:34
- Type: direct
- Method: info
- Code: `info('Migration already applied, skipping')`


### src/migrations/add-api-key-security-fields.ts:57
- Type: direct
- Method: info
- Code: `info('Migration completed successfully: Add API Key Security Fields')`


### src/migrations/add-api-key-security-fields.ts:61
- Type: direct
- Method: error
- Code: `error({
      event: 'migration_error',
      migration: 'add_api_key_security_fields',
      err: errorMessage,
    }, `Migration failed: ${errorMessage}`)`


### src/migrations/add-api-key-security-fields.ts:75
- Type: direct
- Method: info
- Code: `info('Starting rollback: Add API Key Security Fields')`


### src/migrations/add-api-key-security-fields.ts:96
- Type: direct
- Method: info
- Code: `info('Rollback completed successfully: Add API Key Security Fields')`


### src/migrations/add-api-key-security-fields.ts:100
- Type: direct
- Method: error
- Code: `error({
      event: 'migration_rollback_error',
      migration: 'add_api_key_security_fields',
      err: errorMessage,
    }, `Migration rollback failed: ${errorMessage}`)`


### src/migrations/migrationRunner.ts:43
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_system_initializing',
      timestamp: new Date().toISOString(),
    }, '⚙️ Initializing migration system')`


### src/migrations/migrationRunner.ts:56
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_system_initialized',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      migrationCount: migrations.length,
      migrations: migrations.map(m => ({
        id: m.id,
        name: m.name,
        timestamp: m.timestamp,
      })),
    }, `✅ Migration system initialized in ${totalDuration}ms with ${migrations.length} registered migrations`)`


### src/migrations/migrationRunner.ts:70
- Type: direct
- Method: error
- Code: `error({
      event: 'db_migration_system_initialization_error',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, '❌ Failed to initialize migration system')`


### src/migrations/migrationRunner.ts:91
- Type: direct
- Method: info
- Code: `info({
      event: 'db_pending_migrations_started',
      timestamp: new Date().toISOString(),
    }, '🔄 Running pending migrations...')`


### src/migrations/migrationRunner.ts:123
- Type: direct
- Method: error
- Code: `error({
        event: 'db_migrations_failed',
        timestamp: new Date().toISOString(),
        failedCount: failedCount,
        appliedCount: appliedCount,
        skippedCount: skippedCount,
        failedMigrations: results
          .filter((r) => r.status === 'failed')
          .map(m => ({
            id: m.id,
            name: m.name,
            error: m.error
          })),
      }, `❌ Migration process completed with errors: ${appliedCount} applied, ${failedCount} failed`)`


### src/migrations/migrationRunner.ts:140
- Type: direct
- Method: error
- Code: `error({
          event: 'db_migrations_exit',
          timestamp: new Date().toISOString(),
          reason: 'migration_failure',
          environment: 'production',
        }, '🛑 Exiting due to migration failures in production environment')`


### src/migrations/migrationRunner.ts:151
- Type: direct
- Method: info
- Code: `info({
        event: 'db_migrations_applied',
        timestamp: new Date().toISOString(),
        count: appliedCount,
        durationMs: totalDuration,
      }, `✅ Successfully applied ${appliedCount} migrations in ${totalDuration}ms`)`


### src/migrations/migrationRunner.ts:158
- Type: direct
- Method: info
- Code: `info({
        event: 'db_migrations_none_pending',
        timestamp: new Date().toISOString(),
      }, '✅ No migrations to apply')`


### src/migrations/migrationRunner.ts:168
- Type: direct
- Method: error
- Code: `error({
      event: 'db_migrations_error',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, '❌ Failed to run migrations')`


### src/migrations/migrationRunner.ts:188
- Type: direct
- Method: info
- Code: `info({
      event: 'db_rls_migration_started',
      timestamp: new Date().toISOString(),
    }, '🔒 Starting Row Level Security (RLS) migration...')`


### src/migrations/migrationRunner.ts:198
- Type: direct
- Method: warn
- Code: `warn({
        event: 'db_rls_migration_file_missing',
        timestamp: new Date().toISOString(),
        path: sqlPath,
      }, '⚠️ RLS migration SQL file not found, skipping')`


### src/migrations/migrationRunner.ts:206
- Type: direct
- Method: info
- Code: `info({
      event: 'db_rls_migration_file_found',
      timestamp: new Date().toISOString(),
      path: sqlPath,
    }, '📄 Found RLS migration SQL file')`


### src/migrations/migrationRunner.ts:220
- Type: direct
- Method: info
- Code: `info({
      event: 'db_rls_migration_statements',
      timestamp: new Date().toISOString(),
      statementCount: statements.length,
    }, `📝 Executing ${statements.length} RLS SQL statements`)`


### src/migrations/migrationRunner.ts:239
- Type: direct
- Method: debug
- Code: `debug({
          event: 'db_rls_statement_executed',
          timestamp: new Date().toISOString(),
          statementIndex: index,
          durationMs: statementDuration,
          statementPreview: statement.substring(0, 50) + (statement.length > 50 ? '...' : ''),
        }, `✅ Executed SQL statement ${index + 1}/${statements.length} (${statementDuration}ms)`)`


### src/migrations/migrationRunner.ts:250
- Type: direct
- Method: error
- Code: `error({
          event: 'db_rls_statement_error',
          timestamp: new Date().toISOString(),
          statementIndex: index,
          durationMs: statementDuration,
          error: isError(err) ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          statementPreview: statement.substring(0, 100) + (statement.length > 100 ? '...' : ''),
        }, `❌ Error executing SQL statement ${index + 1}/${statements.length}`)`


### src/migrations/migrationRunner.ts:267
- Type: direct
- Method: info
- Code: `info({
      event: 'db_rls_migration_completed',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      successCount,
      failureCount,
      totalStatements: statements.length,
    }, `✅ RLS migration completed in ${totalDuration}ms (${successCount} succeeded, ${failureCount} failed)`)`


### src/migrations/migrationRunner.ts:278
- Type: direct
- Method: error
- Code: `error({
      event: 'db_rls_migration_error',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, '❌ Error running RLS migration')`


### src/migrations/migrationRunner.ts:297
- Type: direct
- Method: info
- Code: `info({
    event: 'db_migration_started',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  }, '🔄 Database migration process started')`


### src/migrations/migrationRunner.ts:305
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_initializing',
      timestamp: new Date().toISOString(),
    }, '⚙️ Initializing migration system')`


### src/migrations/migrationRunner.ts:313
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_running_pending',
      timestamp: new Date().toISOString(),
    }, '⏳ Running pending migrations')`


### src/migrations/migrationRunner.ts:325
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_results',
      timestamp: new Date().toISOString(),
      applied: appliedCount,
      skipped: skippedCount,
      failed: failedCount,
      migrations: migrationResults.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        duration: r.duration,
      })),
    }, `📊 Migration results: ${appliedCount} applied, ${skippedCount} skipped, ${failedCount} failed`)`


### src/migrations/migrationRunner.ts:340
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_running_rls',
      timestamp: new Date().toISOString(),
    }, '🔒 Running Row Level Security (RLS) migration')`


### src/migrations/migrationRunner.ts:349
- Type: direct
- Method: info
- Code: `info({
      event: 'db_migration_completed',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      success: true,
    }, `✅ Database migration completed successfully in ${totalDuration}ms`)`


### src/migrations/migrationRunner.ts:358
- Type: direct
- Method: error
- Code: `error({
      event: 'db_migration_failed',
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      environment: process.env.NODE_ENV || 'development',
    }, '❌ Database migration failed')`


### src/migrations/migrationRunner.ts:369
- Type: direct
- Method: error
- Code: `error({
        event: 'db_migration_exit',
        timestamp: new Date().toISOString(),
        reason: 'migration_failure',
        environment: 'production',
      }, '🛑 Exiting due to migration failures in production environment')`


### src/migrations/migrationRunner.ts:386
- Type: direct
- Method: info
- Code: `info('Migration process completed')`


### src/migrations/migrationRunner.ts:390
- Type: direct
- Method: error
- Code: `error('Migration process failed', {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/migrations/run-migrations.ts:37
- Type: direct
- Method: error
- Code: `error(`Failed to create migrations table: ${errorMessage}`)`


### src/migrations/run-migrations.ts:56
- Type: direct
- Method: error
- Code: `error(`Failed to check migration status: ${errorMessage}`)`


### src/migrations/run-migrations.ts:73
- Type: direct
- Method: error
- Code: `error(`Failed to record migration: ${errorMessage}`)`


### src/migrations/run-migrations.ts:83
- Type: direct
- Method: info
- Code: `info('Starting database migrations')`


### src/migrations/run-migrations.ts:95
- Type: direct
- Method: info
- Code: `info(`Migration already applied: ${name}`)`


### src/migrations/run-migrations.ts:100
- Type: direct
- Method: info
- Code: `info(`Applying migration: ${name}`)`


### src/migrations/run-migrations.ts:106
- Type: direct
- Method: info
- Code: `info(`Migration applied successfully: ${name}`)`


### src/migrations/run-migrations.ts:108
- Type: direct
- Method: error
- Code: `error(`Migration failed: ${name}`)`


### src/migrations/run-migrations.ts:113
- Type: direct
- Method: info
- Code: `info('All migrations completed successfully')`


### src/migrations/run-migrations.ts:116
- Type: direct
- Method: error
- Code: `error(`Migration process failed: ${errorMessage}`)`


### src/migrations/run-migrations.ts:130
- Type: direct
- Method: error
- Code: `error(`Migration failed: ${errorMessage}`)`


### src/migrations/run-rls-migration.ts:20
- Type: direct
- Method: info
- Code: `info('Starting RLS migration...')`


### src/migrations/run-rls-migration.ts:36
- Type: direct
- Method: info
- Code: `info(`Executed SQL statement: ${statement.substring(0, 50)}...`)`


### src/migrations/run-rls-migration.ts:38
- Type: direct
- Method: error
- Code: `error({
          event: 'rls_migration_statement_error',
          err: err instanceof Error ? err.message : String(err),
          statement: statement.substring(0, 100),
        }, 'Error executing SQL statement')`


### src/migrations/run-rls-migration.ts:49
- Type: direct
- Method: info
- Code: `info('RLS migration completed successfully')`


### src/migrations/run-rls-migration.ts:51
- Type: direct
- Method: error
- Code: `error({
      event: 'rls_migration_error',
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 'Error running RLS migration')`


### src/migrations/run-rls-migration.ts:64
- Type: direct
- Method: info
- Code: `info('RLS migration script completed')`


### src/migrations/run-rls-migration.ts:68
- Type: direct
- Method: error
- Code: `error('RLS migration script failed', error)`


### src/parsers/factory/ParserFactory.ts:203
- Type: direct
- Method: error
- Code: `error('Error checking for duplicate file', { fileHash, err })`


### src/parsers/factory/ParserFactory.ts:226
- Type: direct
- Method: info
- Code: `info('Stored file hash', { fileHash, metadata, expiresAt })`


### src/parsers/factory/ParserFactory.ts:228
- Type: direct
- Method: error
- Code: `error('Error storing file hash', { fileHash, err })`


### src/parsers/implementations/CSVParser.ts:78
- Type: direct
- Method: info
- Code: `info({
        event: 'parsed_csv_records',
        file: options._fileName || 'unknown',
        recordCount: records.length,
        timestamp: new Date().toISOString(),
      }, 'Parsed CSV records')`


### src/parsers/implementations/CSVParser.ts:95
- Type: direct
- Method: error
- Code: `error({
        event: 'csv_parser_error',
        file: options._fileName || 'unknown',
        err: err instanceof Error ? err.message : String(err),
        parser: 'CSVParser',
      })`


### src/parsers/implementations/CSVParser.ts:150
- Type: other
- Method: unknown
- Code: `parser.on('end', () => {
          try {
            // Validate with schema if provided
            const validatedRecords = this.validateWithSchema(records, options.schema);
            
            // Log successful parsing
            info({
              event: 'parsed_csv_stream',
              file: options._fileName || 'unknown',
              recordCount: validatedRecords.length,
              timestamp: new Date().toISOString(),
            }, 'Parsed CSV stream');
            
            // Create and return the result
            resolve(this.createResult(validatedRecords, {
              ...options,
              _metadata: {
                delimiter: options.delimiter || ',',
                headerRow: options.columns !== false,
                streaming: true,
              },
            }));
          } catch (err) {
            reject(err);
          }
        })`


### src/parsers/implementations/CSVParser.ts:156
- Type: direct
- Method: info
- Code: `info({
              event: 'parsed_csv_stream',
              file: options._fileName || 'unknown',
              recordCount: validatedRecords.length,
              timestamp: new Date().toISOString(),
            }, 'Parsed CSV stream')`


### src/parsers/implementations/PDFParser.ts:92
- Type: direct
- Method: info
- Code: `info({
        event: 'extracted_pdf_text',
        file: options._fileName || 'unknown',
        charCount: text.length,
        timestamp: new Date().toISOString(),
      }, 'Extracted PDF text')`


### src/parsers/implementations/PDFParser.ts:118
- Type: direct
- Method: error
- Code: `error({
        event: 'pdf_parser_error',
        file: options._fileName || 'unknown',
        err: err instanceof Error ? err.message : String(err),
        parser: 'PDFParser',
      })`


### src/parsers/implementations/XLSXParser.ts:122
- Type: direct
- Method: info
- Code: `info({
        event: 'parsed_xlsx_records',
        file: options._fileName || 'unknown',
        recordCount: validatedRecords.length,
        sheetCount: sheetsToProcess.length,
        timestamp: new Date().toISOString(),
      }, 'Parsed XLSX records')`


### src/parsers/implementations/XLSXParser.ts:142
- Type: direct
- Method: error
- Code: `error({
        event: 'xlsx_parser_error',
        file: options._fileName || 'unknown',
        err: err instanceof Error ? err.message : String(err),
        parser: 'XLSXParser',
      })`


### src/parsers/utils/monitoring.ts:76
- Type: direct
- Method: debug
- Code: `debug({
    event: 'parser_start',
    id,
    fileType,
    fileName,
    fileSize,
    timestamp: new Date().toISOString(),
  })`


### src/parsers/utils/monitoring.ts:153
- Type: direct
- Method: info
- Code: `info({
    event: success ? 'parser_success' : 'parser_failure',
    id,
    fileType,
    fileName,
    fileSize,
    duration: `${duration.toFixed(2)}ms`,
    recordCount,
    timestamp: new Date().toISOString(),
    ...(error ? { error } : {}),
  })`


### src/parsers/utils/monitoring.ts:167
- Type: direct
- Method: debug
- Code: `debug({
    event: 'parser_memory_usage',
    id,
    fileType,
    fileName,
    rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB',
    timestamp: new Date().toISOString(),
  })`


### src/parsers/utils/monitoring.ts:196
- Type: direct
- Method: info
- Code: `info({
    event: 'parser_duplicate',
    fileType,
    fileName,
    fileSize,
    fileHash,
    timestamp: new Date().toISOString(),
  })`


### src/server/routes/apiKeys.ts:30
- Type: direct
- Method: info
- Code: `info(`API Key operation: ${req.method} ${req.path}`, {
    ip: req.ip,
    userId: req.user?.claims?.sub,
    method: req.method,
    path: req.path,
  })`


### src/server/routes/apiKeys.ts:43
- Type: other
- Method: unknown
- Code: `router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const service = req.query.service as string | undefined;
    const results = await getApiKeys(userId, service);

    res.json(results);
  } catch (err) {
    console.error('Error getting API keys:', err);
    res.status(500).json({ err: 'Failed to retrieve API keys' });
  }
})`


### src/server/routes/apiKeys.ts:51
- Type: console
- Method: error
- Code: `console.error('Error getting API keys:', err)`


### src/server/routes/apiKeys.ts:59
- Type: other
- Method: unknown
- Code: `router.get('/:id', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const apiKeyId = req.params.id;

    const apiKey = await getApiKeyById(apiKeyId, userId);
    res.json(apiKey);
  } catch (err) {
    console.error('Error getting API key:', err);

    if (err instanceof Error && err.message === 'API key not found or access denied') {
      return res.status(404).json({ err: 'API key not found or access denied' });
    }

    res.status(500).json({ err: 'Failed to retrieve API key' });
  }
})`


### src/server/routes/apiKeys.ts:67
- Type: console
- Method: error
- Code: `console.error('Error getting API key:', err)`


### src/server/routes/apiKeys.ts:81
- Type: other
- Method: unknown
- Code: `router.post('/', rateLimiters.apiKeyCreation, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { service, keyName, keyValue, label, additionalData, expiresAt } = req.body;

    // Validate required fields
    if (!service || !keyName || !keyValue) {
      return res.status(400).json({
        error: 'Service, key name, and key value are required'
      });
    }

    // Create API key
    const apiKey = await addApiKey(
      userId,
      service,
      keyName,
      keyValue,
      {
        label,
        additionalData,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      }
    );

    // Return the created API key with masked key value
    res.status(201).json({
      id: apiKey.id,
      service: apiKey.service,
      keyName: apiKey.keyName,
      label: apiKey.label,
      created: apiKey.createdAt,
    });
  } catch (err) {
    console.error('Error creating API key:', err);
    res.status(500).json({ err: 'Failed to create API key' });
  }
})`


### src/server/routes/apiKeys.ts:115
- Type: console
- Method: error
- Code: `console.error('Error creating API key:', err)`


### src/server/routes/apiKeys.ts:123
- Type: other
- Method: unknown
- Code: `router.put('/:id', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const apiKeyId = req.params.id;
    const { keyValue, label, additionalData, active, expiresAt } = req.body;

    // Update API key
    const apiKey = await updateApiKey(
      apiKeyId,
      userId,
      {
        keyValue,
        label,
        additionalData,
        active,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      }
    );

    res.json({
      id: apiKey.id,
      service: apiKey.service,
      keyName: apiKey.keyName,
      label: apiKey.label,
      active: apiKey.active,
      updated: apiKey.updatedAt,
    });
  } catch (err) {
    console.error('Error updating API key:', err);

    if (err instanceof Error && err.message === 'API key not found or access denied') {
      return res.status(404).json({ err: 'API key not found or access denied' });
    }

    res.status(500).json({ err: 'Failed to update API key' });
  }
})`


### src/server/routes/apiKeys.ts:151
- Type: console
- Method: error
- Code: `console.error('Error updating API key:', err)`


### src/server/routes/apiKeys.ts:164
- Type: other
- Method: unknown
- Code: `router.delete('/:id', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const apiKeyId = req.params.id;

    const success = await deleteApiKey(apiKeyId, userId);

    if (success) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'API key not found or access denied' });
    }
  } catch (err) {
    console.error('Error deleting API key:', err);
    res.status(500).json({ err: 'Failed to delete API key' });
  }
})`


### src/server/routes/apiKeys.ts:177
- Type: console
- Method: error
- Code: `console.error('Error deleting API key:', err)`


### src/server/routes/auth.ts:20
- Type: other
- Method: unknown
- Code: `authRouter.get(
  '/user',
  isAuthenticated,
  routeHandler(async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized - User ID not found' });
        return;
      }
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      // Return user without sensitive information
      const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      };
      res.json(safeUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  })
)`


### src/server/routes/auth.ts:23
- Type: other
- Method: unknown
- Code: `routeHandler(async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized - User ID not found' });
        return;
      }
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      // Return user without sensitive information
      const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      };
      res.json(safeUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  })`


### src/server/routes/auth.ts:45
- Type: console
- Method: error
- Code: `console.error('Error fetching user:', error)`


### src/server/routes/emails.ts:20
- Type: other
- Method: unknown
- Code: `router.post('/notifications/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const { recipientEmail, sendOnCompletion, sendOnFailure } = req.body;
    const result = await configureNotification(workflowId, {
      recipientEmail,
      sendOnCompletion,
      sendOnFailure,
    });
    return res.json(result);
  } catch (error) {
    console.error('Error configuring notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to configure notification',
    });
  }
})`


### src/server/routes/emails.ts:31
- Type: console
- Method: error
- Code: `console.error('Error configuring notification:', error)`


### src/server/routes/emails.ts:42
- Type: other
- Method: unknown
- Code: `router.get('/notifications/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const settings = await getNotificationSettings(workflowId);
    return res.json(settings);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get notification settings',
    });
  }
})`


### src/server/routes/emails.ts:48
- Type: console
- Method: error
- Code: `console.error('Error getting notification settings:', error)`


### src/server/routes/emails.ts:59
- Type: other
- Method: unknown
- Code: `router.delete('/notifications/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const result = await deleteNotification(workflowId);
    return res.json(result);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
})`


### src/server/routes/emails.ts:65
- Type: console
- Method: error
- Code: `console.error('Error deleting notification:', error)`


### src/server/routes/emails.ts:76
- Type: other
- Method: unknown
- Code: `router.get('/logs/:workflowId', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const logs = await getEmailLogs(workflowId);
    return res.json(logs);
  } catch (error) {
    console.error('Error getting email logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get email logs',
    });
  }
})`


### src/server/routes/emails.ts:82
- Type: console
- Method: error
- Code: `console.error('Error getting email logs:', error)`


### src/server/routes/emails.ts:93
- Type: other
- Method: unknown
- Code: `router.post('/retry/:emailLogId', async (req: Request, res: Response) => {
  try {
    const { emailLogId } = req.params;
    const result = await retryEmail(emailLogId);
    return res.json(result);
  } catch (error) {
    console.error('Error retrying email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retry email',
    });
  }
})`


### src/server/routes/emails.ts:99
- Type: console
- Method: error
- Code: `console.error('Error retrying email:', error)`


### src/server/routes/health.ts:33
- Type: direct
- Method: error
- Code: `error(`Health summary err: ${message}`)`


### src/server/routes/health.ts:47
- Type: direct
- Method: error
- Code: `error(`Health checks err: ${message}`)`


### src/server/routes/health.ts:66
- Type: direct
- Method: error
- Code: `error(`Health check err: ${message}`)`


### src/server/routes/health.ts:80
- Type: direct
- Method: error
- Code: `error(`Health checks err: ${message}`)`


### src/server/routes/health.ts:88
- Type: other
- Method: unknown
- Code: `router.get('/logs/:checkId', async (req, res) => {
  try {
    const { checkId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await getHealthLogs(checkId, limit);
    res.json(logs);
  } catch (err: unknown) {
    const message = isError(err) ? err.message : String(err);
    error(`Health logs err: ${message}`);
    res.status(500).json({ err: 'Failed to get health logs' });
  }
})`


### src/server/routes/health.ts:96
- Type: direct
- Method: error
- Code: `error(`Health logs err: ${message}`)`


### src/server/routes/health.ts:117
- Type: direct
- Method: error
- Code: `error(`Queue health check failed: ${message}`, {
      event: 'queue_health_check_error',
      err: message
    })`


### src/server/routes/health.ts:146
- Type: direct
- Method: error
- Code: `error(`Health check err: ${message}`)`


### src/server/routes/health.ts:157
- Type: console
- Method: log
- Code: `console.log('Health monitoring routes registered')`


### src/server/routes/index.ts:22
- Type: console
- Method: log
- Code: `console.log('Auth, workflow, email, and schedule routes registered')`


### src/server/routes/jobs.ts:13
- Type: other
- Method: unknown
- Code: `router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const jobs = await listJobs(
      status as string | undefined,
      limit ? parseInt(limit as string) : 100
    );
    res.json({ jobs });
  } catch (error) {
      // Use type-safe error handling
      const errorMessage = isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error);
      // Use type-safe error handling
      const errorMessage = isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error);
    // Use type-safe error handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
        : String(error)
      : String(error);
    // Use type-safe error handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? isError(error)
          ? error instanceof Error
            ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
            : String(error)
          : String(error)
        : String(error)
      : String(error);
    console.error('Error listing jobs:', error);
    res.status(500).json({
      error: 'Failed to list jobs',
      message:
        error instanceof Error
          ? isError(error)
            ? error instanceof Error
              ? isError(error)
                ? error instanceof Error
                  ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
                  : String(error)
                : String(error)
              : String(error)
            : String(error)
          : 'Unknown error',
    });
  }
})`


### src/server/routes/jobs.ts:42
- Type: console
- Method: error
- Code: `console.error('Error listing jobs:', error)`


### src/server/routes/jobs.ts:61
- Type: other
- Method: unknown
- Code: `router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await getJobById(id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    // Get associated task information
    const taskData = await db
      .select()
      .from(taskLogs)
      .where(eq(taskLogs.id, job.taskId || ''));
    const task = taskData.length > 0 ? taskData[0] : null;
    res.json({
      job,
      task,
    });
  } catch (error) {
    console.error(`Error getting job ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to get job details',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : 'Unknown error',
    });
  }
})`


### src/server/routes/jobs.ts:80
- Type: console
- Method: error
- Code: `console.error(`Error getting job ${req.params.id}:`, error)`


### src/server/routes/jobs.ts:95
- Type: other
- Method: unknown
- Code: `router.post('/:id/retry', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await retryJob(id);
    if (!success) {
      res.status(400).json({ error: 'Failed to retry job' });
      return;
    }
    res.json({
      message: 'Job retry initiated',
      jobId: id,
    });
  } catch (error) {
    console.error(`Error retrying job ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to retry job',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : 'Unknown error',
    });
  }
})`


### src/server/routes/jobs.ts:108
- Type: console
- Method: error
- Code: `console.error(`Error retrying job ${req.params.id}:`, error)`


### src/server/routes/jobs.ts:123
- Type: other
- Method: unknown
- Code: `router.post('/enqueue/:taskId', isAuthenticated, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;
    // Verify task exists
    const taskData = await db.select().from(taskLogs).where(eq(taskLogs.id, taskId.toString()));
    if (taskData.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const jobId = await enqueueJob(taskId, priority || 1);
    res.json({
      message: 'Job enqueued successfully',
      jobId,
    });
  } catch (error) {
    console.error(`Error enqueuing job for task ${req.params.taskId}:`, error);
    res.status(500).json({
      error: 'Failed to enqueue job',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : 'Unknown error',
    });
  }
})`


### src/server/routes/jobs.ts:139
- Type: console
- Method: error
- Code: `console.error(`Error enqueuing job for task ${req.params.taskId}:`, error)`


### src/server/routes/monitoring.ts:28
- Type: direct
- Method: error
- Code: `error('Failed to get health summary:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:44
- Type: direct
- Method: error
- Code: `error('Failed to get health checks:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:60
- Type: direct
- Method: error
- Code: `error('Failed to run health checks:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:85
- Type: direct
- Method: error
- Code: `error('Failed to run health check:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:96
- Type: other
- Method: unknown
- Code: `router.get('/health/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    
    const logs = await getHealthLogs(id, limit);
    res.json(logs);
  } catch (err) {
    error('Failed to get health logs:', isError(err) ? err : String(err));
    res.status(500).json({
      err: 'Failed to get health logs',
      message: isError(err) ? err.message : String(err),
    });
  }
})`


### src/server/routes/monitoring.ts:104
- Type: direct
- Method: error
- Code: `error('Failed to get health logs:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:121
- Type: direct
- Method: error
- Code: `error('Failed to get err rate data:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:138
- Type: direct
- Method: error
- Code: `error('Failed to get performance metrics:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:155
- Type: direct
- Method: error
- Code: `error('Failed to get database performance metrics:', isError(err) ? err : String(err))`


### src/server/routes/monitoring.ts:169
- Type: direct
- Method: info
- Code: `info('Monitoring routes registered')`


### src/server/routes/schedules.ts:45
- Type: other
- Method: unknown
- Code: `router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    // Validate request body
    const validationResult = createScheduleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.format(),
      });
    }
    const { intent, platform, cronExpression, workflowId } = validationResult.data;
    // Create the schedule
    const schedule = await createSchedule({
      userId: req.user.claims.sub,
      intent,
      platform,
      cronExpression,
      workflowId,
    });
    res.status(201).json(schedule);
  } catch (error) {
      // Use type-safe error handling
      const errorMessage = isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error);
      // Use type-safe error handling
      const errorMessage = isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error);
    // Use type-safe error handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
        : String(error)
      : String(error);
    // Use type-safe error handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? isError(error)
          ? error instanceof Error
            ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
            : String(error)
          : String(error)
        : String(error)
      : String(error);
    console.error('Error creating schedule:', error);
    res.status(500).json({
      error: 'Failed to create schedule',
      message:
        error instanceof Error
          ? isError(error)
            ? error instanceof Error
              ? isError(error)
                ? error instanceof Error
                  ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
                  : String(error)
                : String(error)
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:86
- Type: console
- Method: error
- Code: `console.error('Error creating schedule:', error)`


### src/server/routes/schedules.ts:105
- Type: other
- Method: unknown
- Code: `router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    // Extract query parameters
    const status = req.query.status as string;
    const platform = req.query.platform! as string;
    const intent = req.query.intent! as string;
    // List schedules with filtering
    const schedulesList = await listSchedules({
      userId: req.user.claims.sub,
      status,
      platform,
      intent,
    });
    res.json(schedulesList);
  } catch (error) {
      // Use type-safe error handling
      const errorMessage = isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error);
      // Use type-safe error handling
      const errorMessage = isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error);
    // Use type-safe error handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
        : String(error)
      : String(error);
    // Use type-safe error handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? isError(error)
          ? error instanceof Error
            ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
            : String(error)
          : String(error)
        : String(error)
      : String(error);
    console.error('Error listing schedules:', error);
    res.status(500).json({
      error: 'Failed to list schedules',
      message:
        error instanceof Error
          ? isError(error)
            ? error instanceof Error
              ? isError(error)
                ? error instanceof Error
                  ? isError(error) ? (error instanceof Error ? isError(error) ? (error instanceof Error ? error.message : String(error)) : String(error) : String(error)) : String(error)
                  : String(error)
                : String(error)
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:140
- Type: console
- Method: error
- Code: `console.error('Error listing schedules:', error)`


### src/server/routes/schedules.ts:159
- Type: other
- Method: unknown
- Code: `router.get('/:id', isAuthenticated, validateScheduleId, async (req: any, res) => {
  try {
    const schedule = await getSchedule(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    // Check if the schedule belongs to the authenticated user
    if (schedule.userId! !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(schedule);
  } catch (error) {
    console.error(`Error getting schedule ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to get schedule',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:171
- Type: console
- Method: error
- Code: `console.error(`Error getting schedule ${req.params.id}:`, error)`


### src/server/routes/schedules.ts:186
- Type: other
- Method: unknown
- Code: `router.put('/:id', isAuthenticated, validateScheduleId, async (req: any, res) => {
  try {
    // Get the schedule to check ownership
    const existingSchedule = await getSchedule(req.params.id);
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    // Check if the schedule belongs to the authenticated user
    if (existingSchedule.userId! !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Validate request body
    const validationResult = updateScheduleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.format(),
      });
    }
    // Update the schedule
    const updatedSchedule = await updateSchedule(req.params.id, validationResult.data);
    res.json(updatedSchedule);
  } catch (error) {
    console.error(`Error updating schedule ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to update schedule',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:209
- Type: console
- Method: error
- Code: `console.error(`Error updating schedule ${req.params.id}:`, error)`


### src/server/routes/schedules.ts:224
- Type: other
- Method: unknown
- Code: `router.delete('/:id', isAuthenticated, validateScheduleId, async (req: any, res) => {
  try {
    // Get the schedule to check ownership
    const existingSchedule = await getSchedule(req.params.id);
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    // Check if the schedule belongs to the authenticated user
    if (existingSchedule.userId! !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Delete the schedule
    const result = await deleteSchedule(req.params.id);
    if (result) {
      res.status(204).end();
    } else {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  } catch (error) {
    console.error(`Error deleting schedule ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to delete schedule',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:243
- Type: console
- Method: error
- Code: `console.error(`Error deleting schedule ${req.params.id}:`, error)`


### src/server/routes/schedules.ts:258
- Type: other
- Method: unknown
- Code: `router.post('/:id/retry', isAuthenticated, validateScheduleId, async (req: any, res) => {
  try {
    // Get the schedule to check ownership
    const existingSchedule = await getSchedule(req.params.id);
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    // Check if the schedule belongs to the authenticated user
    if (existingSchedule.userId! !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Only allow retrying failed schedules
    if (existingSchedule.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed schedules can be retried' });
    }
    // Retry the schedule
    const updatedSchedule = await retrySchedule(req.params.id);
    res.json(updatedSchedule);
  } catch (error) {
    console.error(`Error retrying schedule ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to retry schedule',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:277
- Type: console
- Method: error
- Code: `console.error(`Error retrying schedule ${req.params.id}:`, error)`


### src/server/routes/schedules.ts:292
- Type: other
- Method: unknown
- Code: `router.get('/:id/logs', isAuthenticated, validateScheduleId, async (req: any, res) => {
  try {
    // Get the schedule to check ownership
    const existingSchedule = await getSchedule(req.params.id);
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    // Check if the schedule belongs to the authenticated user
    if (existingSchedule.userId! !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Get logs for the schedule
    const logs = await getScheduleLogs(req.params.id);
    res.json(logs);
  } catch (error) {
    console.error(`Error getting logs for schedule ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to get schedule logs',
      message:
        error instanceof Error
          ? error instanceof Error
            ? error instanceof Error
              ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error))
              : String(error)
            : String(error)
          : String(error),
    });
  }
})`


### src/server/routes/schedules.ts:307
- Type: console
- Method: error
- Code: `console.error(`Error getting logs for schedule ${req.params.id}:`, error)`


### src/server/routes/workflows.ts:17
- Type: other
- Method: unknown
- Code: `router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    // Access user ID from the user object (if available)
    const userId = req.user ? (req.user as any).claims?.sub : null;
    const workflows = await getWorkflows(status, userId);
    res.json(workflows);
    return;
  } catch (error) {
    console.error('Error getting workflows:', error);
    res.status(500).json({ error: 'Failed to get workflows' });
    return;
  }
})`


### src/server/routes/workflows.ts:26
- Type: console
- Method: error
- Code: `console.error('Error getting workflows:', error)`


### src/server/routes/workflows.ts:34
- Type: other
- Method: unknown
- Code: `router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const workflowId = req.params.id;
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    const userId = req.user ? (req.user as any).claims?.sub : null;
    // If userId is provided and doesn't match, deny access
    if (userId && workflow.userId! && workflow.userId! !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    res.json(workflow);
    return;
  } catch (error) {
    console.error('Error getting workflow:', error);
    res.status(500).json({ error: 'Failed to get workflow' });
    return;
  }
})`


### src/server/routes/workflows.ts:51
- Type: console
- Method: error
- Code: `console.error('Error getting workflow:', error)`


### src/server/routes/workflows.ts:59
- Type: other
- Method: unknown
- Code: `router.post('/:id/reset', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const workflowId = req.params.id;
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    const userId = req.user ? (req.user as any).claims?.sub : null;
    // If userId is provided and doesn't match, deny access
    if (userId && workflow.userId! && workflow.userId! !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const resetResult = await resetWorkflow(workflowId);
    res.json(resetResult);
    return;
  } catch (error) {
    console.error('Error resetting workflow:', error);
    res.status(500).json({ error: 'Failed to reset workflow' });
    return;
  }
})`


### src/server/routes/workflows.ts:77
- Type: console
- Method: error
- Code: `console.error('Error resetting workflow:', error)`


### src/server/routes/workflows.ts:85
- Type: other
- Method: unknown
- Code: `router.post('/:id/notifications', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;
    if (!emails) {
      res.status(400).json({ error: 'Email addresses are required' });
      return;
    }
    const workflowId = req.params.id;
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }
    const userId = req.user ? (req.user as any).claims?.sub : null;
    // If userId is provided and doesn't match, deny access
    if (userId && workflow.userId! && workflow.userId! !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    // Configure notifications for the workflow
    const updatedWorkflow = await configureWorkflowNotifications(workflowId, emails);
    res.json(updatedWorkflow);
    return;
  } catch (error) {
    console.error('Error configuring workflow notifications:', error);
    res.status(500).json({ error: 'Failed to configure workflow notifications' });
    return;
  }
})`


### src/server/routes/workflows.ts:109
- Type: console
- Method: error
- Code: `console.error('Error configuring workflow notifications:', error)`


### src/services/alertMailer.ts:44
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock sendAdminAlert', { message, severity, options })`


### src/services/alertMailer.ts:60
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock sendImmediateAdminAlert', { message, severity, options })`


### src/services/alertMailer.ts:74
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock configureAlertRecipients', { recipients })`


### src/services/alertMailer.ts:92
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock configureAlertThresholds', { thresholds })`


### src/services/apiKeyService.ts:45
- Type: direct
- Method: warn
- Code: `warn('Warning: Using default encryption key. Set ENCRYPTION_KEY in production.')`


### src/services/apiKeyService.ts:83
- Type: direct
- Method: error
- Code: `error(`Error adding API key: ${errorMessage}`)`


### src/services/apiKeyService.ts:127
- Type: direct
- Method: error
- Code: `error(`Error getting API keys: ${errorMessage}`)`


### src/services/apiKeyService.ts:167
- Type: direct
- Method: error
- Code: `error(`Error getting API key by ID: ${errorMessage}`)`


### src/services/apiKeyService.ts:247
- Type: direct
- Method: error
- Code: `error(`Error updating API key: ${errorMessage}`)`


### src/services/apiKeyService.ts:273
- Type: direct
- Method: error
- Code: `error(`Error deleting API key: ${errorMessage}`)`


### src/services/attachmentParsers.ts:49
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock parseByExtension', { filePath, options })`


### src/services/attachmentParsers.ts:82
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock parseCSV', { filePath, options })`


### src/services/attachmentParsers.ts:112
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock parseExcel', { filePath, options })`


### src/services/attachmentParsers.ts:142
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock parsePDF', { filePath, options })`


### src/services/awsKmsService.ts:32
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock initializeKmsService', { options })`


### src/services/awsKmsService.ts:43
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock createKey', { description })`


### src/services/awsKmsService.ts:55
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock scheduleKeyDeletion', { keyId, pendingWindowInDays })`


### src/services/awsKmsService.ts:71
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock logSecurityEvent', { eventType, userId, details, severity })`


### src/services/bullmqService.ts:100
- Type: direct
- Method: error
- Code: `error({
        event: 'redis_connection_error',
        errorMessage: err.message,
        timestamp: new Date().toISOString(),
      }, `Redis connection error: ${err.message}`)`


### src/services/bullmqService.ts:109
- Type: direct
- Method: info
- Code: `info({
      event: 'redis_connected',
      timestamp: new Date().toISOString(),
    }, 'Redis connection established')`


### src/services/bullmqService.ts:116
- Type: direct
- Method: warn
- Code: `warn({
      event: 'redis_connection_failed',
      errorMessage: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }, 'Redis connection failed, using in-memory mode')`


### src/services/bullmqService.ts:153
- Type: direct
- Method: info
- Code: `info(`Created queue: ${queueName}`, {
    event: 'queue_created',
    queueName,
    timestamp: new Date().toISOString(),
  })`


### src/services/bullmqService.ts:188
- Type: direct
- Method: info
- Code: `info(`Created scheduler for queue: ${queueName}`, {
    event: 'scheduler_created',
    queueName,
    timestamp: new Date().toISOString(),
  })`


### src/services/bullmqService.ts:217
- Type: direct
- Method: info
- Code: `info({
        event: 'scheduler_closed',
        queueName: name,
        timestamp: new Date().toISOString(),
      }, `Closed scheduler for queue: ${name}`)`


### src/services/bullmqService.ts:227
- Type: direct
- Method: info
- Code: `info({
        event: 'queue_closed',
        queueName: name,
        timestamp: new Date().toISOString(),
      }, `Closed queue: ${name}`)`


### src/services/bullmqService.ts:237
- Type: direct
- Method: info
- Code: `info({
        event: 'worker_closed',
        workerName: name,
        timestamp: new Date().toISOString(),
      }, `Closed worker: ${name}`)`


### src/services/bullmqService.ts:247
- Type: direct
- Method: info
- Code: `info({
        event: 'redis_connection_closed',
        timestamp: new Date().toISOString(),
      }, 'Redis connection closed')`


### src/services/bullmqService.ts:253
- Type: direct
- Method: error
- Code: `error({
      event: 'close_connections_error',
      errorMessage: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }, 'Error closing connections')`


### src/services/credentialVault.ts:52
- Type: direct
- Method: warn
- Code: `warn(`Credential not found: ${id} for user ${userId}`)`


### src/services/credentialVault.ts:61
- Type: direct
- Method: error
- Code: `error('Failed to get credential by ID:', isError(err) ? err : String(err))`


### src/services/credentialVault.ts:87
- Type: direct
- Method: warn
- Code: `warn('Using default encryption key. Set ENCRYPTION_KEY in production.')`


### src/services/credentialVault.ts:108
- Type: direct
- Method: info
- Code: `info(`Credential added for user ${userId} on platform ${platform}`)`


### src/services/credentialVault.ts:111
- Type: direct
- Method: error
- Code: `error('Failed to add credential:', isError(err) ? err : String(err))`


### src/services/credentialVault.ts:147
- Type: direct
- Method: error
- Code: `error('Failed to get credentials:', isError(err) ? err : String(err))`


### src/services/datadogService.ts:32
- Type: direct
- Method: warn
- Code: `warn('DataDog API key not provided, metrics tracking disabled')`


### src/services/datadogService.ts:38
- Type: direct
- Method: info
- Code: `info('DataDog initialized successfully')`


### src/services/datadogService.ts:43
- Type: direct
- Method: error
- Code: `error('Failed to initialize DataDog', {
      event: 'datadog_init_error',
      error: caughtError.message,
      stack: caughtError.stack
    })`


### src/services/datadogService.ts:60
- Type: direct
- Method: debug
- Code: `debug(`DataDog not initialized, skipping metric: ${name}`)`


### src/services/datadogService.ts:75
- Type: direct
- Method: error
- Code: `error('Failed to flush metrics buffer', {
        event: 'datadog_flush_error',
        error: err instanceof Error ? err.message : String(err),
      })`


### src/services/datadogService.ts:191
- Type: direct
- Method: info
- Code: `info(`Flushed ${metricsBuffer.length} metrics to DataDog`)`


### src/services/datadogService.ts:199
- Type: direct
- Method: error
- Code: `error('Failed to flush metrics to DataDog', {
      event: 'datadog_flush_error',
      error: caughtError.message,
      stack: caughtError.stack
    })`


### src/services/dbHealthCheck.ts:25
- Type: direct
- Method: info
- Code: `info('PostgreSQL health check: OK', { duration: responseTime })`


### src/services/dbHealthCheck.ts:41
- Type: direct
- Method: error
- Code: `error('PostgreSQL health check failed', {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
      duration: responseTime,
    })`


### src/services/emailQueue.ts:52
- Type: direct
- Method: error
- Code: `error({
          event: 'email_queue_process_error',
          ...formatError(error),
        })`


### src/services/emailQueue.ts:94
- Type: direct
- Method: info
- Code: `info({
            event: 'email_sent',
            emailId: email.id,
            recipient: email.recipientEmail,
          })`


### src/services/emailQueue.ts:145
- Type: direct
- Method: error
- Code: `error({
            event: 'email_send_error',
            emailId: email.id,
            recipient: email.recipientEmail,
            attempt: attempts,
            maxAttempts: email.maxAttempts,
            ...formatError(err),
          })`


### src/services/emailQueue.ts:208
- Type: direct
- Method: error
- Code: `error({
            event: 'email_queue_retry_error',
            emailId: id,
            ...formatError(error),
          })`


### src/services/emailQueue.ts:217
- Type: direct
- Method: error
- Code: `error({
        event: 'email_retry_error',
        emailId: id,
        ...formatError(err),
      })`


### src/services/enhancedApiKeyService.ts:52
- Type: direct
- Method: warn
- Code: `warn('Warning: Using default encryption key. Set ENCRYPTION_KEY in production.')`


### src/services/enhancedApiKeyService.ts:107
- Type: direct
- Method: error
- Code: `error({
      event: 'api_key_creation_error',
      err: errorMessage,
      userId,
      service,
      keyName,
    }, `Error adding API key: ${errorMessage}`)`


### src/services/enhancedApiKeyService.ts:176
- Type: direct
- Method: error
- Code: `error({
      event: 'api_keys_retrieval_error',
      err: errorMessage,
      userId,
      service,
    }, `Error getting API keys: ${errorMessage}`)`


### src/services/enhancedApiKeyService.ts:246
- Type: direct
- Method: error
- Code: `error({
      event: 'api_key_retrieval_error',
      err: errorMessage,
      userId,
      apiKeyId: id,
    }, `Error getting API key by ID: ${errorMessage}`)`


### src/services/enhancedApiKeyService.ts:369
- Type: direct
- Method: error
- Code: `error({
      event: 'api_key_update_error',
      err: errorMessage,
      userId,
      apiKeyId: id,
    }, `Error updating API key: ${errorMessage}`)`


### src/services/enhancedApiKeyService.ts:432
- Type: direct
- Method: error
- Code: `error({
      event: 'api_key_deletion_error',
      err: errorMessage,
      userId,
      apiKeyId: id,
    }, `Error deleting API key: ${errorMessage}`)`


### src/services/healthCheckScheduler.ts:33
- Type: direct
- Method: error
- Code: `error({
      event: 'health_check_scheduler_invalid_cron',
      schedule,
      timestamp: new Date().toISOString(),
    }, `Invalid cron expression for health check scheduler: ${schedule}`)`


### src/services/healthCheckScheduler.ts:41
- Type: direct
- Method: warn
- Code: `warn({
      event: 'health_check_scheduler_fallback',
      schedule,
      timestamp: new Date().toISOString(),
    }, `Falling back to default schedule: ${schedule}`)`


### src/services/healthCheckScheduler.ts:50
- Type: other
- Method: unknown
- Code: `cron.schedule(schedule, async () => {
      try {
        info({
          event: 'health_check_scheduler_running',
          schedule,
          timestamp: new Date().toISOString(),
        }, 'Running scheduled health checks');
        
        // Run all health checks
        const results = await runAllHealthChecks();
        
        // Log the results
        const statuses = {
          ok: results.filter(r => r.status === 'ok').length,
          warning: results.filter(r => r.status === 'warning').length,
          error: results.filter(r => r.status === 'error').length,
        };
        
        info({
          event: 'health_check_scheduler_completed',
          schedule,
          checks: results.length,
          statuses,
          timestamp: new Date().toISOString(),
        }, `Completed scheduled health checks: ${statuses.ok} ok, ${statuses.warning} warnings, ${statuses.error} errors`);
      } catch (err) {
        // Log error but don't stop the scheduler
        error({
          event: 'health_check_scheduler_error',
          schedule,
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
        }, 'Error running scheduled health checks');
      }
    }, {
      scheduled: true,
      timezone: 'UTC', // Use UTC to avoid timezone issues
    })`


### src/services/healthCheckScheduler.ts:52
- Type: direct
- Method: info
- Code: `info({
          event: 'health_check_scheduler_running',
          schedule,
          timestamp: new Date().toISOString(),
        }, 'Running scheduled health checks')`


### src/services/healthCheckScheduler.ts:68
- Type: direct
- Method: info
- Code: `info({
          event: 'health_check_scheduler_completed',
          schedule,
          checks: results.length,
          statuses,
          timestamp: new Date().toISOString(),
        }, `Completed scheduled health checks: ${statuses.ok} ok, ${statuses.warning} warnings, ${statuses.error} errors`)`


### src/services/healthCheckScheduler.ts:77
- Type: direct
- Method: error
- Code: `error({
          event: 'health_check_scheduler_error',
          schedule,
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
        }, 'Error running scheduled health checks')`


### src/services/healthCheckScheduler.ts:93
- Type: direct
- Method: info
- Code: `info({
      event: 'health_check_scheduler_started',
      schedule,
      timestamp: new Date().toISOString(),
    }, `Health check scheduler started with schedule: ${schedule}`)`


### src/services/healthCheckScheduler.ts:99
- Type: direct
- Method: error
- Code: `error({
      event: 'health_check_scheduler_start_error',
      schedule,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    }, 'Error starting health check scheduler')`


### src/services/healthCheckScheduler.ts:120
- Type: direct
- Method: info
- Code: `info({
      event: 'health_check_scheduler_stopped',
      schedule: currentSchedule,
      timestamp: new Date().toISOString(),
    }, 'Health check scheduler stopped')`


### src/services/healthService.ts:43
- Type: console
- Method: log
- Code: `console.log(`Registered health check: ${name}`)`


### src/services/healthService.ts:156
- Type: console
- Method: error
- Code: `console.error('Error storing health check result:', error)`


### src/services/imapIngestionService.ts:61
- Type: direct
- Method: info
- Code: `info('Fetching emails with attachments', {
      platform,
      downloadDir,
      batchSize: options.batchSize,
      maxResults: options.maxResults,
      markSeen: options.markSeen,
    })`


### src/services/imapIngestionService.ts:105
- Type: direct
- Method: error
- Code: `error('Failed to fetch emails with attachments', {
      platform,
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/imapIngestionService.ts:132
- Type: direct
- Method: info
- Code: `info('Configuring IMAP connection', {
      host: options.host,
      port: options.port,
      user: options.user,
      tls: options.tls,
    })`


### src/services/imapIngestionService.ts:149
- Type: direct
- Method: error
- Code: `error('Failed to configure IMAP connection', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/insightGenerator.ts:49
- Type: direct
- Method: info
- Code: `info('Generating insights', {
      reportId,
      platform: options.platform,
      reportType: options.reportType,
      audience: options.audience,
    })`


### src/services/insightGenerator.ts:84
- Type: direct
- Method: error
- Code: `error('Failed to generate insights', {
      reportId,
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/insightGenerator.ts:103
- Type: direct
- Method: info
- Code: `info('Getting insights', {
      reportId,
    })`


### src/services/insightGenerator.ts:132
- Type: direct
- Method: error
- Code: `error('Failed to get insights', {
      reportId,
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/insightGenerator.ts:151
- Type: direct
- Method: info
- Code: `info('Deleting insights', {
      reportId,
    })`


### src/services/insightGenerator.ts:162
- Type: direct
- Method: error
- Code: `error('Failed to delete insights', {
      reportId,
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/jobQueue.ts:102
- Type: direct
- Method: error
- Code: `error('Redis client error: ' + err.message)`


### src/services/jobQueue.ts:106
- Type: direct
- Method: error
- Code: `error('Failed to initialize Redis client: ' + errorMessage)`


### src/services/jobQueue.ts:130
- Type: direct
- Method: error
- Code: `error('Failed to initialize queue scheduler: ' + errorMessage)`


### src/services/jobQueue.ts:143
- Type: direct
- Method: info
- Code: `info('BullMQ initialized with Redis connection', { event: 'bullmq_initialized', timestamp: new Date().toISOString() })`


### src/services/jobQueue.ts:148
- Type: direct
- Method: warn
- Code: `warn(`Failed to initialize BullMQ, falling back to in-memory queue: ${errorMessage}`, {
      event: 'bullmq_initialization_failed',
      errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    })`


### src/services/jobQueue.ts:228
- Type: direct
- Method: info
- Code: `info('BullMQ worker initialized with type-safe job processing')`


### src/services/jobQueue.ts:231
- Type: direct
- Method: error
- Code: `error('Failed to initialize type-safe BullMQ worker', { error: err })`


### src/services/jobQueue.ts:235
- Type: direct
- Method: info
- Code: `info('In-memory job processor initialized', { event: 'in_memory_processor_initialized', timestamp: new Date().toISOString() })`


### src/services/jobQueue.ts:312
- Type: direct
- Method: error
- Code: `error(`Error in job processor for task ${data.taskId}: ${errorMessage}`, {
      originalError: err,
      taskId: data.taskId
    })`


### src/services/jobQueue.ts:351
- Type: direct
- Method: info
- Code: `info(`Job ${job.id} completed`)`


### src/services/jobQueue.ts:357
- Type: direct
- Method: error
- Code: `error(`Job ${jobId} failed: ${err.message}`, { error: err })`


### src/services/jobQueue.ts:362
- Type: direct
- Method: error
- Code: `error('Failed to initialize job queue: ' + errorMessage)`


### src/services/jobQueue.ts:543
- Type: direct
- Method: error
- Code: `error(`Error retrying job ${jobId}: ${errorMessage}`, {
      event: 'retry_job_error',
      jobId,
      errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    })`


### src/services/jobQueue.ts:563
- Type: direct
- Method: error
- Code: `error('Error cleaning up completed jobs: ' + (err instanceof Error ? err.message : String(err)), {
      event: 'cleanup_completed_jobs_error',
      originalError: err, // Include the original error object
      timestamp: new Date().toISOString(),
    })`


### src/services/jobQueueSystem.ts:20
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'job_queue_system_initializing',
        timestamp: new Date().toISOString(),
      },
      'Initializing job queue system...'
    )`


### src/services/jobQueueSystem.ts:37
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'job_queue_system_initialized',
        timestamp: new Date().toISOString(),
      },
      'Job queue system initialized successfully'
    )`


### src/services/jobQueueSystem.ts:54
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'job_queue_system_init_error',
        errorMessage,
        timestamp: new Date().toISOString(),
      },
      `Error initializing job queue system: ${errorMessage}`
    )`


### src/services/jobQueueSystem.ts:70
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'job_queue_system_shutting_down',
        timestamp: new Date().toISOString(),
      },
      'Shutting down job queue system...'
    )`


### src/services/jobQueueSystem.ts:79
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'job_queue_system_shutdown_complete',
        timestamp: new Date().toISOString(),
      },
      'Job queue system shutdown complete'
    )`


### src/services/jobQueueSystem.ts:96
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'job_queue_system_shutdown_error',
        errorMessage,
        timestamp: new Date().toISOString(),
      },
      `Error shutting down job queue system: ${errorMessage}`
    )`


### src/services/kmsEncryptionService.ts:31
- Type: direct
- Method: info
- Code: `info('Initializing KMS encryption service', {
      region: options.region,
      keyId: options.keyId ? '***' : 'not provided',
    })`


### src/services/kmsEncryptionService.ts:43
- Type: direct
- Method: error
- Code: `error('Failed to initialize KMS encryption service', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/kmsEncryptionService.ts:65
- Type: direct
- Method: info
- Code: `info('Encrypting data', {
      keyId: options.keyId ? '***' : 'default',
      dataLength: typeof data === 'string' ? data.length : data.byteLength,
    })`


### src/services/kmsEncryptionService.ts:77
- Type: direct
- Method: error
- Code: `error('Failed to encrypt data', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/kmsEncryptionService.ts:99
- Type: direct
- Method: info
- Code: `info('Decrypting data', {
      keyId: options.keyId ? '***' : 'default',
      dataLength: data.byteLength,
    })`


### src/services/kmsEncryptionService.ts:111
- Type: direct
- Method: error
- Code: `error('Failed to decrypt data', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/kmsEncryptionService.ts:134
- Type: direct
- Method: info
- Code: `info('Generating data key', {
      keyId: options.keyId ? '***' : 'default',
    })`


### src/services/kmsEncryptionService.ts:148
- Type: direct
- Method: error
- Code: `error('Failed to generate data key', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/kmsEncryptionService.ts:172
- Type: direct
- Method: info
- Code: `info('Re-encrypting data', {
      sourceKeyId: '***',
      destinationKeyId: '***',
      dataLength: data.byteLength,
    })`


### src/services/kmsEncryptionService.ts:185
- Type: direct
- Method: error
- Code: `error('Failed to re-encrypt data', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/mailerService.ts:40
- Type: console
- Method: warn
- Code: `console.warn('SendGrid API key not provided; email functionality is disabled')`


### src/services/mailerService.ts:44
- Type: console
- Method: log
- Code: `console.log('SendGrid mailer service initialized successfully')`


### src/services/mailerService.ts:46
- Type: console
- Method: error
- Code: `console.error('Failed to initialize mailer service:', error)`


### src/services/mailerService.ts:105
- Type: console
- Method: log
- Code: `console.log(`Email sent successfully. Log ID: ${logId}`)`


### src/services/mailerService.ts:134
- Type: console
- Method: error
- Code: `console.error('Failed to send email:', error)`


### src/services/mailerService.ts:177
- Type: console
- Method: error
- Code: `console.error(`Failed to get email logs for workflow ${workflowId}:`, error)`


### src/services/migrationService.ts:77
- Type: direct
- Method: info
- Code: `info('Initializing migration service')`


### src/services/migrationService.ts:80
- Type: direct
- Method: info
- Code: `info('Migration service initialized')`


### src/services/migrationService.ts:82
- Type: direct
- Method: error
- Code: `error('Failed to initialize migration service', {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/migrationService.ts:96
- Type: direct
- Method: debug
- Code: `debug(`Registered migration: ${migration.name}`)`


### src/services/migrationService.ts:124
- Type: direct
- Method: debug
- Code: `debug(`Ensured migrations table exists: ${this.options.migrationTableName}`)`


### src/services/migrationService.ts:126
- Type: direct
- Method: error
- Code: `error('Failed to create migrations table', {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/migrationService.ts:147
- Type: direct
- Method: error
- Code: `error(`Failed to check migration status for ${id}`, {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/migrationService.ts:184
- Type: direct
- Method: debug
- Code: `debug(`Recorded migration ${migration.name} as ${status}`)`


### src/services/migrationService.ts:186
- Type: direct
- Method: error
- Code: `error(`Failed to record migration ${migration.name}`, {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/migrationService.ts:209
- Type: direct
- Method: error
- Code: `error('Failed to get applied migrations', {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/migrationService.ts:231
- Type: direct
- Method: error
- Code: `error('Failed to get pending migrations', {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/migrationService.ts:252
- Type: direct
- Method: info
- Code: `info('No pending migrations to apply')`


### src/services/migrationService.ts:256
- Type: direct
- Method: info
- Code: `info(`Running ${pendingMigrations.length} pending migrations`)`


### src/services/migrationService.ts:264
- Type: direct
- Method: info
- Code: `info(`Applying migration: ${migration.name}`)`


### src/services/migrationService.ts:269
- Type: direct
- Method: info
- Code: `info(`Migration applied successfully: ${migration.name}`)`


### src/services/migrationService.ts:273
- Type: direct
- Method: error
- Code: `error(`Migration failed: ${migration.name}`)`


### src/services/migrationService.ts:278
- Type: direct
- Method: error
- Code: `error(`Migration failed with error: ${migration.name}`, {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        })`


### src/services/migrationService.ts:304
- Type: direct
- Method: error
- Code: `error(`Migration process stopped due to failure in ${migration.name}`)`


### src/services/migrationService.ts:312
- Type: direct
- Method: info
- Code: `info(`Migration process completed: ${appliedCount} applied, ${failedCount} failed`)`


### src/services/monitoringService.ts:54
- Type: direct
- Method: info
- Code: `info('Monitoring is disabled by configuration')`


### src/services/monitoringService.ts:68
- Type: direct
- Method: info
- Code: `info(`Monitoring service initialized: Sentry=${sentryInitialized}, DataDog=${datadogInitialized}`)`


### src/services/monitoringService.ts:80
- Type: direct
- Method: error
- Code: `error('Failed to initialize monitoring service:', isError(err) ? err : String(err))`


### src/services/monitoringService.ts:129
- Type: direct
- Method: error
- Code: `error('Failed to send critical error alert:',
          isError(alertError) ? alertError : String(alertError)
        )`


### src/services/monitoringService.ts:155
- Type: direct
- Method: error
- Code: `error('Failed to track error:', isError(trackError) ? trackError : String(trackError))`


### src/services/monitoringService.ts:204
- Type: direct
- Method: error
- Code: `error('Failed to send error rate alert:',
          isError(alertError) ? alertError : String(alertError)
        )`


### src/services/monitoringService.ts:212
- Type: direct
- Method: warn
- Code: `warn(`Slow API response: ${method} ${path} took ${durationMs}ms`)`


### src/services/monitoringService.ts:228
- Type: direct
- Method: error
- Code: `error('Failed to track API request:', isError(err) ? err : String(err))`


### src/services/monitoringService.ts:248
- Type: direct
- Method: warn
- Code: `warn(`Slow database query: ${operation} on ${table} took ${durationMs}ms`)`


### src/services/monitoringService.ts:264
- Type: direct
- Method: error
- Code: `error('Failed to track database query:', isError(err) ? err : String(err))`


### src/services/monitoringService.ts:281
- Type: direct
- Method: info
- Code: `info(`System resource tracking started with interval of ${intervalMs}ms`)`


### src/services/monitoringService.ts:299
- Type: direct
- Method: info
- Code: `info('Monitoring service shut down successfully')`


### src/services/monitoringService.ts:301
- Type: direct
- Method: error
- Code: `error('Error shutting down monitoring service:', isError(err) ? err : String(err))`


### src/services/openai.ts:84
- Type: direct
- Method: info
- Code: `info('Initializing OpenAI service')`


### src/services/openai.ts:93
- Type: direct
- Method: error
- Code: `error('Failed to initialize OpenAI service', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/openai.ts:113
- Type: direct
- Method: info
- Code: `info('Running OpenAI completion', {
      model: params.model || 'default',
      promptLength: params.prompt.length,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    })`


### src/services/openai.ts:136
- Type: direct
- Method: error
- Code: `error('Failed to run OpenAI completion', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/openai.ts:156
- Type: direct
- Method: info
- Code: `info('Running OpenAI chat completion', {
      model: params.model || 'default',
      messageCount: params.messages.length,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    })`


### src/services/openai.ts:182
- Type: direct
- Method: error
- Code: `error('Failed to run OpenAI chat completion', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/openai.ts:204
- Type: direct
- Method: info
- Code: `info('Generating embeddings', {
      model: model || 'default',
      textLength: text.length,
    })`


### src/services/openai.ts:216
- Type: direct
- Method: error
- Code: `error('Failed to generate embeddings', {
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/performanceMonitor.ts:108
- Type: direct
- Method: debug
- Code: `debug('Performance metrics collected')`


### src/services/performanceMonitor.ts:110
- Type: direct
- Method: error
- Code: `error('Error collecting performance metrics:', err)`


### src/services/performanceMonitor.ts:157
- Type: direct
- Method: error
- Code: `error('Error storing metrics in database:', err)`


### src/services/performanceMonitor.ts:179
- Type: direct
- Method: error
- Code: `error('Error checking if table exists:', err)`


### src/services/performanceMonitor.ts:205
- Type: direct
- Method: info
- Code: `info(`Created ${PERFORMANCE_METRICS_TABLE} table`)`


### src/services/performanceMonitor.ts:207
- Type: direct
- Method: error
- Code: `error('Error creating metrics table:', err)`


### src/services/performanceMonitor.ts:221
- Type: direct
- Method: error
- Code: `error('Error cleaning up old metrics:', err)`


### src/services/performanceMonitor.ts:235
- Type: direct
- Method: info
- Code: `info('Performance monitoring started')`


### src/services/queueManager.ts:83
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'queue_manager_initialized',
          timestamp: new Date().toISOString(),
        },
        'Queue manager initialized with Redis'
      )`


### src/services/queueManager.ts:93
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'in_memory_queue_manager_initialized',
          timestamp: new Date().toISOString(),
        },
        'Queue manager initialized in in-memory mode'
      )`


### src/services/queueManager.ts:103
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'queue_manager_init_error',
        errorMessage,
        timestamp: new Date().toISOString(),
      },
      `Error initializing queue manager: ${errorMessage}`
    )`


### src/services/queueManager.ts:183
- Type: direct
- Method: info
- Code: `info(
    {
      event: 'in_memory_job_processing',
      jobId: job.id,
      queueName: job.queueName,
      jobName: job.jobName,
      timestamp: new Date().toISOString(),
    },
    `Processing in-memory job ${job.id} (${job.jobName}) in queue ${job.queueName}`
  )`


### src/services/queueManager.ts:243
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'job_added',
          jobId,
          queueName,
          jobName,
          timestamp: new Date().toISOString(),
        },
        `Added job ${jobId} (${jobName}) to queue ${queueName}`
      )`


### src/services/queueManager.ts:269
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'in_memory_job_added',
          jobId,
          queueName,
          jobName,
          timestamp: new Date().toISOString(),
        },
        `Added in-memory job ${jobId} (${jobName}) to queue ${queueName}`
      )`


### src/services/queueManager.ts:296
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'add_job_error',
        queueName,
        jobName,
        errorMessage,
        timestamp: new Date().toISOString(),
      },
      `Error adding job to queue ${queueName}: ${errorMessage}`
    )`


### src/services/queueManager.ts:360
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'repeated_job_added',
          jobId,
          queueName,
          jobName,
          pattern,
          timestamp: new Date().toISOString(),
        },
        `Added repeatable job ${jobId} (${jobName}) to queue ${queueName} with pattern ${pattern}`
      )`


### src/services/queueManager.ts:388
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'in_memory_repeated_job_added',
          jobId,
          queueName,
          jobName,
          pattern,
          timestamp: new Date().toISOString(),
        },
        `Added in-memory repeatable job ${jobId} (${jobName}) to queue ${queueName} with pattern ${pattern}`
      )`


### src/services/queueManager.ts:416
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'add_repeated_job_error',
        queueName,
        jobName,
        pattern,
        errorMessage,
        timestamp: new Date().toISOString(),
      },
      `Error adding repeatable job to queue ${queueName}: ${errorMessage}`
    )`


### src/services/rbacService.ts:74
- Type: direct
- Method: warn
- Code: `warn(`Unknown role: ${role}, defaulting to readonly`)`


### src/services/rbacService.ts:102
- Type: direct
- Method: warn
- Code: `warn(`Unknown role: ${role}, defaulting to readonly`)`


### src/services/rbacService.ts:132
- Type: direct
- Method: warn
- Code: `warn(`API key not found or inactive: ${apiKeyId}`)`


### src/services/rbacService.ts:137
- Type: direct
- Method: warn
- Code: `warn(`API key expired: ${apiKeyId}`)`


### src/services/rbacService.ts:150
- Type: direct
- Method: warn
- Code: `warn(`Permission denied for API key ${apiKeyId}: ${resource}:${action}`)`


### src/services/rbacService.ts:161
- Type: direct
- Method: error
- Code: `error(`Failed to check API key permission: ${errorMessage}`, {
      event: 'api_key_permission_check_error',
      error: errorMessage,
      apiKeyId,
      resource,
      action,
    })`


### src/services/rbacService.ts:195
- Type: direct
- Method: warn
- Code: `warn(`Invalid role: ${role}`)`


### src/services/rbacService.ts:213
- Type: direct
- Method: info
- Code: `info(
      `Updated permissions for API key ${apiKeyId}`,
      {
        event: 'api_key_permissions_updated',
        apiKeyId,
        role,
        hasCustomPermissions: !!customPermissions,
      }
    )`


### src/services/rbacService.ts:230
- Type: direct
- Method: error
- Code: `error(
      `Failed to update API key permissions: ${errorMessage}`,
      {
        event: 'api_key_permissions_update_error',
        error: errorMessage,
        apiKeyId,
        role,
      }
    )`


### src/services/redisHealthCheck.ts:76
- Type: direct
- Method: error
- Code: `error('Redis health check error', {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    })`


### src/services/redisService.ts:82
- Type: direct
- Method: info
- Code: `info('🔄 Initializing Redis service', {
        event: 'redis_service_initializing',
        timestamp: new Date().toISOString(),
      })`


### src/services/redisService.ts:99
- Type: direct
- Method: info
- Code: `info('⚙️ Redis configuration loaded', {
          event: 'redis_config_loaded',
          timestamp: new Date().toISOString(),
          host: this.options.host,
          port: this.options.port,
          db: this.options.db,
          tls: this.options.tls,
        })`


### src/services/redisService.ts:108
- Type: direct
- Method: info
- Code: `info('⚙️ Using default Redis configuration', {
          event: 'redis_using_default_config',
          timestamp: new Date().toISOString(),
          host: this.options.host,
          port: this.options.port,
          db: this.options.db,
          tls: this.options.tls,
        })`


### src/services/redisService.ts:120
- Type: direct
- Method: info
- Code: `info('📦 Importing ioredis module', {
          event: 'redis_importing_module',
          timestamp: new Date().toISOString(),
        })`


### src/services/redisService.ts:128
- Type: direct
- Method: info
- Code: `info('✅ ioredis module imported successfully', {
          event: 'redis_module_imported',
          timestamp: new Date().toISOString(),
        })`


### src/services/redisService.ts:133
- Type: direct
- Method: warn
- Code: `warn('ioredis module not found, falling back to in-memory mode', {
          event: 'redis_module_import_failed',
          timestamp: new Date().toISOString(),
        })`


### src/services/redisService.ts:144
- Type: direct
- Method: info
- Code: `info(`Redis service initialization ${connected ? 'completed' : 'failed'} in ${durationMs}ms`, {
          event: 'redis_service_init_result',
          timestamp: new Date().toISOString(),
          durationMs,
          connected,
          inMemoryMode: this.inMemoryMode,
        })`


### src/services/redisService.ts:155
- Type: direct
- Method: info
- Code: `info('Redis service running in in-memory mode', {
        event: 'redis_in_memory_mode',
        timestamp: new Date().toISOString(),
      })`


### src/services/redisService.ts:163
- Type: direct
- Method: error
- Code: `error('Failed to initialize Redis service', {
        event: 'redis_service_init_error',
        timestamp: new Date().toISOString(),
        durationMs,
        error: isError(err) ? err.message : String(err),
        stack: isError(err) ? err.stack : undefined,
      })`


### src/services/redisService.ts:188
- Type: direct
- Method: info
- Code: `info('🔌 Connecting to Redis server', {
        event: 'redis_connecting',
        timestamp: new Date().toISOString(),
        host: this.options.host,
        port: this.options.port,
        tls: this.options.tls,
        db: this.options.db,
        connectionTimeout: this.options.connectionTimeout,
      })`


### src/services/redisService.ts:214
- Type: direct
- Method: debug
- Code: `debug('🔄 Redis event handlers registered', {
        event: 'redis_event_handlers_registered',
        timestamp: new Date().toISOString(),
      })`


### src/services/redisService.ts:220
- Type: direct
- Method: info
- Code: `info('⏳ Waiting for Redis connection (timeout: ' + this.options.connectionTimeout + 'ms)', {
        event: 'redis_waiting_for_connection',
        timestamp: new Date().toISOString(),
        timeoutMs: this.options.connectionTimeout,
      })`


### src/services/redisService.ts:231
- Type: direct
- Method: info
- Code: `info('✅ Connected to Redis in ' + totalDuration + 'ms', {
          event: 'redis_connection_successful',
          timestamp: new Date().toISOString(),
          durationMs: totalDuration,
          host: this.options.host,
          port: this.options.port,
        })`


### src/services/redisService.ts:239
- Type: direct
- Method: warn
- Code: `warn('⏱️ Redis connection timed out after ' + totalDuration + 'ms', {
          event: 'redis_connection_timeout',
          timestamp: new Date().toISOString(),
          durationMs: totalDuration,
          host: this.options.host,
          port: this.options.port,
          timeoutMs: this.options.connectionTimeout,
        })`


### src/services/redisService.ts:253
- Type: direct
- Method: error
- Code: `error('❌ Failed to connect to Redis', {
        event: 'redis_connection_error',
        timestamp: new Date().toISOString(),
        durationMs: totalDuration,
        host: this.options.host,
        port: this.options.port,
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })`


### src/services/redisService.ts:277
- Type: direct
- Method: warn
- Code: `warn('Redis connection timeout')`


### src/services/redisService.ts:301
- Type: direct
- Method: info
- Code: `info('Connected to Redis')`


### src/services/redisService.ts:310
- Type: direct
- Method: error
- Code: `error('Redis error', {
      error: err.message,
      stack: err.stack,
    })`


### src/services/redisService.ts:323
- Type: direct
- Method: warn
- Code: `warn('Disconnected from Redis')`


### src/services/redisService.ts:338
- Type: direct
- Method: error
- Code: `error('Max reconnect attempts reached, giving up', {
        event: 'redis_max_reconnect_attempts',
        timestamp: new Date().toISOString(),
        timeoutMs: this.options.maxReconnectDelay,
      })`


### src/services/redisService.ts:354
- Type: direct
- Method: info
- Code: `info(`Scheduling Redis reconnect attempt ${this.reconnectAttempts} in ${delay}ms`, {
      event: 'redis_reconnect_scheduled',
      timestamp: new Date().toISOString(),
      interval: delay,
    })`


### src/services/redisService.ts:363
- Type: direct
- Method: error
- Code: `error('Reconnect attempt failed', {
          event: 'redis_reconnect_failed',
          timestamp: new Date().toISOString(),
          durationMs: delay,
          host: this.options.host,
          port: this.options.port,
          error: isError(err) ? err.message : String(err),
          attempt: this.reconnectAttempts,
        })`


### src/services/redisService.ts:389
- Type: direct
- Method: debug
- Code: `debug(`Redis health check started with interval ${this.options.healthCheckInterval}ms`)`


### src/services/redisService.ts:413
- Type: direct
- Method: debug
- Code: `debug(`Redis health check: OK (${latency}ms)`, {
        event: 'redis_health_check',
        timestamp: new Date().toISOString(),
        durationMs: latency,
        host: this.options.host,
        port: this.options.port,
      })`


### src/services/redisService.ts:422
- Type: direct
- Method: error
- Code: `error('Redis health check failed', {
        event: 'redis_health_check_failed',
        timestamp: new Date().toISOString(),
        host: this.options.host,
        port: this.options.port,
        error: isError(err) ? err.message : String(err),
      })`


### src/services/redisService.ts:483
- Type: direct
- Method: info
- Code: `info('Redis connection closed')`


### src/services/redisService.ts:485
- Type: direct
- Method: error
- Code: `error('Error closing Redis connection', {
          error: isError(err) ? err.message : String(err),
        })`


### src/services/resultsPersistence.ts:62
- Type: console
- Method: log
- Code: `console.log(`Stored results to ${filePath}`)`


### src/services/resultsPersistence.ts:95
- Type: console
- Method: log
- Code: `console.log(`Found duplicate report: ${report.id}`)`


### src/services/resultsPersistence.ts:128
- Type: console
- Method: log
- Code: `console.log(`Stored report source: ${sourceId}`)`


### src/services/resultsPersistence.ts:153
- Type: console
- Method: log
- Code: `console.log(`Using existing report: ${duplicateId}`)`


### src/services/resultsPersistence.ts:170
- Type: console
- Method: log
- Code: `console.log(`Stored report data: ${reportId}`)`


### src/services/resultsPersistence.ts:236
- Type: console
- Method: error
- Code: `console.error('Error storing results:', error)`


### src/services/schedulerService.ts:38
- Type: direct
- Method: info
- Code: `info(
      { event: 'scheduler_service_init', timestamp: new Date().toISOString() },
      'Initializing scheduler service'
    )`


### src/services/schedulerService.ts:44
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'scheduler_service_enabled_count',
        count: enabledSchedules.length,
        timestamp: new Date().toISOString(),
      },
      'Found enabled schedules count'
    )`


### src/services/schedulerService.ts:58
- Type: direct
- Method: error
- Code: `error(
            {
              event: 'schedule_invalid_cron',
              scheduleId: schedule.id,
              cron: schedule.cron,
              timestamp: new Date().toISOString(),
            },
            'Invalid cron expression for schedule'
          )`


### src/services/schedulerService.ts:82
- Type: direct
- Method: error
- Code: `error(
          {
            event: 'schedule_service_start_failed',
            scheduleId: schedule.id,
            errorMessage,
            stack: err instanceof Error ? err.stack : undefined,
            timestamp: new Date().toISOString(),
          },
          'Failed to start schedule'
        )`


### src/services/schedulerService.ts:97
- Type: direct
- Method: warn
- Code: `warn(
        {
          event: 'scheduler_service_startup_errors',
          errors: startupErrors,
          timestamp: new Date().toISOString(),
        },
        `Scheduler initialized with startup errors`
      )`


### src/services/schedulerService.ts:106
- Type: direct
- Method: info
- Code: `info(
        { event: 'scheduler_service_init_complete', timestamp: new Date().toISOString() },
        'Scheduler initialized successfully'
      )`


### src/services/schedulerService.ts:113
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'scheduler_service_init_error',
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error initializing scheduler service'
    )`


### src/services/schedulerService.ts:162
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_create_error',
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error creating schedule'
    )`


### src/services/schedulerService.ts:186
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_get_error',
        scheduleId,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error getting schedule'
    )`


### src/services/schedulerService.ts:207
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_list_error',
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error listing schedules'
    )`


### src/services/schedulerService.ts:269
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_update_error',
        scheduleId,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error updating schedule'
    )`


### src/services/schedulerService.ts:299
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_delete_error',
        scheduleId,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error deleting schedule'
    )`


### src/services/schedulerService.ts:321
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'schedule_service_start_schedule',
        scheduleId: schedule.id,
        cron: schedule.cron,
        timestamp: new Date().toISOString(),
      },
      'Starting schedule with cron'
    )`


### src/services/schedulerService.ts:337
- Type: other
- Method: unknown
- Code: `cron.schedule(
        schedule.cron,
        async () => {
          try {
            await executeScheduledWorkflow(schedule);
          } catch (executionError) {
            error(
              {
                event: 'schedule_service_execute_error',
                scheduleId: schedule.id,
                errorMessage: getErrorMessage(executionError),
                stack: executionError instanceof Error ? executionError.stack : undefined,
                timestamp: new Date().toISOString(),
              },
              'Error executing scheduled workflow'
            );
            // Log error but don't kill the scheduler
          }
        },
        options
      )`


### src/services/schedulerService.ts:343
- Type: direct
- Method: error
- Code: `error(
              {
                event: 'schedule_service_execute_error',
                scheduleId: schedule.id,
                errorMessage: getErrorMessage(executionError),
                stack: executionError instanceof Error ? executionError.stack : undefined,
                timestamp: new Date().toISOString(),
              },
              'Error executing scheduled workflow'
            )`


### src/services/schedulerService.ts:360
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'schedule_service_start_schedule_success',
          scheduleId: schedule.id,
          timestamp: new Date().toISOString(),
        },
        'Schedule started successfully'
      )`


### src/services/schedulerService.ts:369
- Type: direct
- Method: error
- Code: `error(
        {
          event: 'schedule_service_start_schedule_error',
          scheduleId: schedule.id,
          errorMessage: getErrorMessage(cronError),
          stack: cronError instanceof Error ? cronError.stack : undefined,
          timestamp: new Date().toISOString(),
        },
        'Failed to create cron job for schedule'
      )`


### src/services/schedulerService.ts:391
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_start_error',
        scheduleId: schedule.id,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error starting schedule'
    )`


### src/services/schedulerService.ts:411
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'schedule_service_stop_schedule',
          scheduleId,
          timestamp: new Date().toISOString(),
        },
        'Stopping schedule'
      )`


### src/services/schedulerService.ts:421
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'schedule_service_stop_schedule_success',
          scheduleId,
          timestamp: new Date().toISOString(),
        },
        'Schedule stopped successfully'
      )`


### src/services/schedulerService.ts:432
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_stop_error',
        scheduleId,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error stopping schedule'
    )`


### src/services/schedulerService.ts:450
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'schedule_service_execute_workflow',
        scheduleId: schedule.id,
        workflowId: schedule.workflowId!,
        timestamp: new Date().toISOString(),
      },
      'Executing scheduled workflow'
    )`


### src/services/schedulerService.ts:486
- Type: direct
- Method: error
- Code: `error(
        {
          event: 'schedule_service_task_log_insert_error',
          scheduleId: schedule.id,
          workflowId: schedule.workflowId!,
          errorMessage: getErrorMessage(insertError),
          stack: insertError instanceof Error ? insertError.stack : undefined,
          timestamp: new Date().toISOString(),
        },
        'Error inserting task log, trying alternative approach'
      )`


### src/services/schedulerService.ts:514
- Type: direct
- Method: error
- Code: `error(
          {
            event: 'schedule_service_task_log_insert_error_second_attempt',
            scheduleId: schedule.id,
            workflowId: schedule.workflowId!,
            errorMessage: getErrorMessage(secondError),
            stack: secondError instanceof Error ? secondError.stack : undefined,
            timestamp: new Date().toISOString(),
          },
          'Second attempt at inserting task log failed'
        )`


### src/services/schedulerService.ts:530
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'schedule_service_execute_workflow_queued',
        scheduleId: schedule.id,
        workflowId: schedule.workflowId!,
        taskId,
        timestamp: new Date().toISOString(),
      },
      'Scheduled workflow execution queued'
    )`


### src/services/schedulerService.ts:542
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_execute_workflow_error',
        scheduleId: schedule.id,
        workflowId: schedule.workflowId!,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error executing scheduled workflow'
    )`


### src/services/schedulerService.ts:568
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'schedule_service_execute_workflow_skip',
          workflowId,
          timestamp: new Date().toISOString(),
        },
        'Workflow is already running or locked, skipping execution'
      )`


### src/services/schedulerService.ts:580
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'schedule_service_execute_workflow_result',
        workflowId,
        status: result.status,
        timestamp: new Date().toISOString(),
      },
      'Scheduled workflow executed'
    )`


### src/services/schedulerService.ts:591
- Type: direct
- Method: info
- Code: `info(
        {
          event: 'schedule_service_execute_workflow_continue',
          workflowId,
          currentStep: result.currentStep,
          timestamp: new Date().toISOString(),
        },
        'Workflow is paused, continuing execution'
      )`


### src/services/schedulerService.ts:604
- Type: direct
- Method: error
- Code: `error(
      {
        event: 'schedule_service_execute_workflow_by_id_error',
        workflowId,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      'Error executing workflow'
    )`


### src/services/securityInitializer.ts:45
- Type: direct
- Method: info
- Code: `info('Initializing security services')`


### src/services/securityInitializer.ts:49
- Type: direct
- Method: info
- Code: `info('Running database migrations')`


### src/services/securityInitializer.ts:52
- Type: direct
- Method: info
- Code: `info('Database migrations completed successfully')`


### src/services/securityInitializer.ts:55
- Type: direct
- Method: error
- Code: `error({
          event: 'migrations_error',
          err: errorMessage,
        }, `Failed to run database migrations: ${errorMessage}`)`


### src/services/securityInitializer.ts:74
- Type: direct
- Method: warn
- Code: `warn('KMS service initialization failed, using fallback encryption')`


### src/services/securityInitializer.ts:87
- Type: direct
- Method: warn
- Code: `warn('KMS encryption initialization failed, using fallback encryption')`


### src/services/securityInitializer.ts:104
- Type: direct
- Method: warn
- Code: `warn('Key rotation initialization failed')`


### src/services/securityInitializer.ts:117
- Type: direct
- Method: warn
- Code: `warn('Security monitoring initialization failed')`


### src/services/securityInitializer.ts:120
- Type: direct
- Method: info
- Code: `info('Security services initialization completed')`


### src/services/securityInitializer.ts:124
- Type: direct
- Method: error
- Code: `error({
      event: 'security_initialization_error',
      err: errorMessage,
    }, `Failed to initialize security services: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:66
- Type: direct
- Method: info
- Code: `info('Security monitoring is disabled')`


### src/services/securityMonitoringService.ts:72
- Type: direct
- Method: error
- Code: `error(`Invalid cron schedule: ${securityMonitoringConfig.schedule}`)`


### src/services/securityMonitoringService.ts:82
- Type: direct
- Method: error
- Code: `error({
          event: 'security_monitoring_error',
          err: errorMessage,
        }, `Scheduled security monitoring failed: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:90
- Type: direct
- Method: info
- Code: `info({
      event: 'security_monitoring_initialized',
      enabled: securityMonitoringConfig.enabled,
      schedule: securityMonitoringConfig.schedule,
      timeWindowMinutes: securityMonitoringConfig.timeWindowMinutes,
    }, 'Security monitoring service initialized')`


### src/services/securityMonitoringService.ts:100
- Type: direct
- Method: error
- Code: `error({
      event: 'security_monitoring_initialization_error',
      err: errorMessage,
    }, `Failed to initialize security monitoring service: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:114
- Type: direct
- Method: debug
- Code: `debug('Running security event check')`


### src/services/securityMonitoringService.ts:132
- Type: direct
- Method: debug
- Code: `debug('Security event check completed')`


### src/services/securityMonitoringService.ts:135
- Type: direct
- Method: error
- Code: `error({
      event: 'security_event_check_error',
      err: errorMessage,
    }, `Failed to check security events: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:168
- Type: direct
- Method: warn
- Code: `warn({
          event: 'security_alert_failed_logins',
          ipAddress: ip.ipAddress,
          count: ip.count,
          threshold: securityMonitoringConfig.alertThresholds.failedLogins,
          timeWindowMinutes: securityMonitoringConfig.timeWindowMinutes,
        }, `Security Alert: Excessive failed login attempts from IP ${ip.ipAddress}`)`


### src/services/securityMonitoringService.ts:182
- Type: direct
- Method: error
- Code: `error({
      event: 'failed_logins_check_error',
      err: errorMessage,
    }, `Failed to check for failed logins: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:215
- Type: direct
- Method: warn
- Code: `warn({
          event: 'security_alert_api_key_creation',
          userId: user.userId,
          count: user.count,
          threshold: securityMonitoringConfig.alertThresholds.apiKeyCreation,
          timeWindowMinutes: securityMonitoringConfig.timeWindowMinutes,
        }, `Security Alert: Excessive API key creation by user ${user.userId}`)`


### src/services/securityMonitoringService.ts:228
- Type: direct
- Method: error
- Code: `error({
      event: 'api_key_creation_check_error',
      err: errorMessage,
    }, `Failed to check for API key creation: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:261
- Type: direct
- Method: warn
- Code: `warn({
          event: 'security_alert_permission_denied',
          userId: user.userId,
          count: user.count,
          threshold: securityMonitoringConfig.alertThresholds.permissionDenied,
          timeWindowMinutes: securityMonitoringConfig.timeWindowMinutes,
        }, `Security Alert: Excessive permission denied events for user ${user.userId}`)`


### src/services/securityMonitoringService.ts:274
- Type: direct
- Method: error
- Code: `error({
      event: 'permission_denied_check_error',
      err: errorMessage,
    }, `Failed to check for permission denied events: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:303
- Type: direct
- Method: warn
- Code: `warn({
        event: 'security_alert_encryption_failures',
        count: encryptionFailures[0].count,
        threshold: securityMonitoringConfig.alertThresholds.encryptionFailures,
        timeWindowMinutes: securityMonitoringConfig.timeWindowMinutes,
      }, `Security Alert: Excessive encryption failures detected`)`


### src/services/securityMonitoringService.ts:314
- Type: direct
- Method: error
- Code: `error({
      event: 'encryption_failures_check_error',
      err: errorMessage,
    }, `Failed to check for encryption failures: ${errorMessage}`)`


### src/services/securityMonitoringService.ts:328
- Type: direct
- Method: info
- Code: `info('Security monitoring service stopped')`


### src/services/sentryService.ts:44
- Type: direct
- Method: warn
- Code: `warn('Sentry DSN not provided, error tracking disabled')`


### src/services/sentryService.ts:65
- Type: direct
- Method: info
- Code: `info('Sentry initialized successfully')`


### src/services/sentryService.ts:69
- Type: direct
- Method: error
- Code: `error('Failed to initialize Sentry', {
      event: 'sentry_init_error',
      error: caughtError.message,
      stack: caughtError.stack
    })`


### src/services/sentryService.ts:116
- Type: direct
- Method: info
- Code: `info(`Error captured in Sentry with ID: ${eventId}`, {
      event: 'sentry_capture',
      errorId: eventId,
      statusCode: appError.statusCode,
      isOperational: appError.isOperational
    })`


### src/services/sentryService.ts:126
- Type: direct
- Method: error
- Code: `error('Failed to capture error in Sentry', {
      event: 'sentry_capture_error',
      error: caughtError.message,
      stack: caughtError.stack
    })`


### src/services/sentryService.ts:167
- Type: direct
- Method: error
- Code: `error('Failed to capture message in Sentry', {
      event: 'sentry_message_error',
      error: errorObj.message,
      stack: errorObj.stack
    })`


### src/services/sentryService.ts:199
- Type: direct
- Method: error
- Code: `error('Error flushing Sentry events', {
      event: 'sentry_flush_error',
      error: caughtError.message,
      stack: caughtError.stack
    })`


### src/services/stepHandlers.ts:28
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock emailHandler', { config, context })`


### src/services/stepHandlers.ts:47
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock httpHandler', { config, context })`


### src/services/stepHandlers.ts:67
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock dataProcessingHandler', { config, context })`


### src/services/stepHandlers.ts:86
- Type: direct
- Method: warn
- Code: `warn('[STUB] Using mock delayHandler', { config, context })`


### src/services/workflowEmailServiceFixed.ts:34
- Type: direct
- Method: info
- Code: `info('Sending workflow completion email', {
      workflowId,
      recipients: recipients || 'default recipients',
    })`


### src/services/workflowEmailServiceFixed.ts:50
- Type: direct
- Method: error
- Code: `error('Failed to send workflow completion email', {
      workflowId,
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/workflowEmailServiceFixed.ts:80
- Type: direct
- Method: info
- Code: `info('Configuring workflow email notifications', {
      workflowId,
      recipients: options.recipientEmail,
    })`


### src/services/workflowEmailServiceFixed.ts:95
- Type: direct
- Method: error
- Code: `error('Failed to configure workflow email notifications', {
      workflowId,
      error: err instanceof Error ? err.message : String(err),
    })`


### src/services/workflowService.ts:44
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'workflow_created',
        workflowId: workflow.id,
        stepsCount: stepsWithIds.length,
        timestamp: new Date().toISOString(),
      },
      'Workflow created'
    )`


### src/services/workflowService.ts:55
- Type: console
- Method: error
- Code: `console.error('Error creating workflow:', err)`


### src/services/workflowService.ts:142
- Type: direct
- Method: debug
- Code: `debug(
                {
                  event: 'email_completion_sending',
                  workflowId,
                  recipients,
                  timestamp: new Date().toISOString(),
                },
                'Sending workflow completion email'
              )`


### src/services/workflowService.ts:170
- Type: direct
- Method: debug
- Code: `debug(
                {
                  event: 'email_completion_sending',
                  workflowId,
                  recipients,
                  timestamp: new Date().toISOString(),
                },
                'Sending workflow completion email'
              )`


### src/services/workflowService.ts:182
- Type: direct
- Method: info
- Code: `info(
              {
                event: 'email_completion_sent',
                workflowId,
                messageId: emailResult.message,
                timestamp: new Date().toISOString(),
              },
              'Workflow completion email sent'
            )`


### src/services/workflowService.ts:195
- Type: console
- Method: error
- Code: `console.error(`Failed to send completion email for workflow ${workflowId}:`, emailError)`


### src/services/workflowService.ts:206
- Type: direct
- Method: debug
- Code: `debug(
        {
          event: 'step_execution_start',
          workflowId,
          stepIndex: currentStepIndex + 1,
          totalSteps: steps.length,
          stepName: currentStep.name,
          timestamp: new Date().toISOString(),
        },
        'Executing workflow step'
      )`


### src/services/workflowService.ts:246
- Type: console
- Method: error
- Code: `console.error(`Error executing step ${currentStepIndex + 1}/${steps.length}:`, err)`


### src/services/workflowService.ts:307
- Type: console
- Method: error
- Code: `console.error('Error running workflow:', err)`


### src/services/workflowService.ts:330
- Type: console
- Method: error
- Code: `console.error('Error unlocking workflow:', unlockError)`


### src/services/workflowService.ts:346
- Type: console
- Method: error
- Code: `console.error('Error getting workflow:', err)`


### src/services/workflowService.ts:380
- Type: console
- Method: error
- Code: `console.error('Error listing workflows:', err)`


### src/services/workflowService.ts:402
- Type: console
- Method: error
- Code: `console.error('Error resetting workflow:', err)`


### src/services/workflowService.ts:414
- Type: console
- Method: error
- Code: `console.error('Error deleting workflow:', err)`


### src/services/workflowService.ts:447
- Type: console
- Method: error
- Code: `console.error('Error getting workflows:', err)`


### src/services/workflowService.ts:494
- Type: direct
- Method: info
- Code: `info(
      {
        event: 'workflow_notification_configured',
        workflowId,
        recipientEmail,
        timestamp: new Date().toISOString(),
      },
      'Configured workflow notifications'
    )`


### src/services/workflowService.ts:505
- Type: console
- Method: error
- Code: `console.error('Error configuring workflow notifications:', err)`


### src/shared/db.ts:78
- Type: direct
- Method: info
- Code: `info('Using DATABASE_URL for database connection')`


### src/shared/db.ts:98
- Type: direct
- Method: info
- Code: `info('Using PostgreSQL environment variables for database connection')`


### src/shared/db.ts:121
- Type: direct
- Method: info
- Code: `info(`Connecting to database: ${maskedConnectionString}`)`


### src/shared/db.ts:133
- Type: direct
- Method: debug
- Code: `debug('PostgreSQL notice', {
        event: 'postgres_notice',
        message: notice.message,
        severity: notice.severity,
      })`


### src/shared/db.ts:166
- Type: direct
- Method: info
- Code: `info('Closing database connection')`


### src/shared/db.ts:168
- Type: direct
- Method: info
- Code: `info('Database connection closed')`


### src/shared/db.ts:170
- Type: direct
- Method: error
- Code: `error('Database connection close error', {
      event: 'database_close_error',
      error: isError(err) ? err.message : String(err),
      stack: isError(err) ? err.stack : undefined,
    })`


### src/shared/db.ts:180
- Type: direct
- Method: info
- Code: `info('SIGINT received, closing database connection')`


### src/shared/db.ts:186
- Type: direct
- Method: info
- Code: `info('SIGTERM received, closing database connection')`


### src/shared/middleware/rateLimiter.ts:45
- Type: object
- Method: warn
- Code: `logger.warn(`Rate limit exceeded for ${req.ip} on ${req.method} ${req.path}`, {
        ip: req.ip,
        method: req.method,
        path: req.path,
        headers: req.headers,
        rateLimitConfig: {
          windowMs: options.windowMs,
          max: options.max,
        },
      })`


### src/shared/middleware/rbacMiddleware.ts:78
- Type: console
- Method: log
- Code: `console.log('Admin access granted in development mode')`


### src/shared/middleware/rbacMiddleware.ts:90
- Type: console
- Method: warn
- Code: `console.warn('Permission checking for user roles not fully implemented')`


### src/shared/middleware/rbacMiddleware.ts:105
- Type: object
- Method: error
- Code: `logger.error({
        event: 'permission_check_error',
        err: errorMessage,
        resource,
        action,
        method: req.method,
        path: req.path,
      }, `Permission check err: ${errorMessage}`)`


### src/shared/middleware/rbacMiddleware.ts:146
- Type: console
- Method: log
- Code: `console.log('Admin access granted in development mode')`


### src/shared/middleware/rbacMiddleware.ts:171
- Type: object
- Method: error
- Code: `logger.error({
      event: 'admin_check_error',
      err: errorMessage,
      method: req.method,
      path: req.path,
    }, `Admin check err: ${errorMessage}`)`


### src/utils/circuitBreaker.ts:154
- Type: direct
- Method: error
- Code: `error(`Error getting circuit state for ${this.name}:`, err)`


### src/utils/circuitBreaker.ts:186
- Type: direct
- Method: error
- Code: `error(`Error updating circuit state for ${this.name}:`, err)`


### src/utils/circuitBreaker.ts:191
- Type: direct
- Method: info
- Code: `info(`Circuit ${this.name} state changed from ${currentState} to ${newState}`)`


### src/utils/circuitBreaker.ts:227
- Type: direct
- Method: error
- Code: `error(`Error recording success for circuit ${this.name}:`, err)`


### src/utils/circuitBreaker.ts:275
- Type: direct
- Method: error
- Code: `error(`Error recording failure for circuit ${this.name}:`, err)`


### src/utils/circuitBreaker.ts:293
- Type: direct
- Method: error
- Code: `error(`Error getting last failure for circuit ${this.name}:`, err)`


### src/utils/circuitBreaker.ts:322
- Type: direct
- Method: error
- Code: `error(`Error resetting circuit ${this.name}:`, err)`


### src/utils/circuitBreaker.ts:325
- Type: direct
- Method: info
- Code: `info(`Circuit ${this.name} has been reset to CLOSED state`)`


### src/utils/encryption.ts:38
- Type: direct
- Method: warn
- Code: `warn('Using default encryption key. This is NOT secure for production.')`


### src/utils/encryption.ts:56
- Type: direct
- Method: error
- Code: `error('Failed to initialize encryption:', err)`


### src/utils/encryption.ts:125
- Type: direct
- Method: error
- Code: `error(`Encryption err: ${errorMessage}`)`


### src/utils/encryption.ts:173
- Type: direct
- Method: error
- Code: `error(`Decryption err: ${errorMessage}`)`


### src/utils/encryption.ts:207
- Type: direct
- Method: error
- Code: `error('Failed to decrypt legacy data:', err)`


### src/utils/encryption.ts:262
- Type: direct
- Method: error
- Code: `error(`Security event logging err: ${errorMessage}`)`


### src/utils/encryption.ts:290
- Type: direct
- Method: error
- Code: `error('Encryption test failed:', err)`


### src/utils/envValidator.ts:129
- Type: direct
- Method: error
- Code: `error(`Missing required environment variables: ${result.missing.join(', ')}`)`


### src/utils/envValidator.ts:132
- Type: direct
- Method: error
- Code: `error(`Using default values for: ${result.usingDefaults.join(', ')}`)`


### src/utils/envValidator.ts:135
- Type: other
- Method: unknown
- Code: `logSecurityEvent(
      'env_validation_failed',
      undefined,
      {
        environment: nodeEnv,
        missing: result.missing,
        usingDefaults: result.usingDefaults,
      },
      'critical'
    ).catch((err) => {
      error('Failed to log security event:', err);
    })`


### src/utils/envValidator.ts:145
- Type: direct
- Method: error
- Code: `error('Failed to log security event:', err)`


### src/utils/envValidator.ts:149
- Type: direct
- Method: error
- Code: `error('Exiting due to missing or default environment variables in production')`


### src/utils/envValidator.ts:155
- Type: direct
- Method: warn
- Code: `warn(`Recommended environment variables not set: ${result.recommendations.join(', ')}`)`


### src/utils/envValidator.ts:176
- Type: direct
- Method: error
- Code: `error(`Required environment variable ${key} is not set`)`


### src/utils/envValidator.ts:186
- Type: direct
- Method: error
- Code: `error(`Environment variable ${key} is using a default value in production`)`


### src/utils/envValidator.ts:189
- Type: direct
- Method: warn
- Code: `warn(`Environment variable ${key} is using a default value`)`


### src/utils/rateLimiter.ts:53
- Type: direct
- Method: info
- Code: `info(`Rate limiter "${name}" created: ${this.maxRequests} requests per ${this.windowMs}ms`)`


### src/utils/rateLimiter.ts:87
- Type: direct
- Method: info
- Code: `info(`Rate limit for "${this.name}" reached, waiting...`)`


### src/utils/rateLimiter.ts:108
- Type: direct
- Method: warn
- Code: `warn(`Rate limiter "${this.name}" paused: ${reason}`)`


### src/utils/rateLimiter.ts:117
- Type: direct
- Method: info
- Code: `info(`Rate limiter "${this.name}" resumed`)`


### src/utils/rateLimiter.ts:167
- Type: direct
- Method: debug
- Code: `debug(`Resolving ${toResolve.length} waiting requests for "${this.name}"`)`


### src/utils/rateLimiter.ts:177
- Type: direct
- Method: warn
- Code: `warn('IMAP rate limit reached, throttling requests')`


### src/utils/rateLimiter.ts:184
- Type: direct
- Method: warn
- Code: `warn('Email processing rate limit reached, throttling processing')`


### src/utils/retry.ts:78
- Type: direct
- Method: warn
- Code: `warn(`Retry operation exceeded maximum time of ${maxRetryTime}ms`)`


### src/utils/retry.ts:89
- Type: direct
- Method: info
- Code: `info(`Retry attempt ${attempt}/${retries} after ${delay}ms delay`, {
        err:
          err instanceof Error
            ? err instanceof Error
              ? err instanceof Error
                ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err))
                : String(err)
              : String(err)
            : String(err),
        attempt,
        delay,
      })`

