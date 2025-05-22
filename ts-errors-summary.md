# TypeScript Error Summary
Generated on: Thu May 22 15:21:15 UTC 2025

## Error Count
Total errors: 873

## Error Categories
### Missing Exports
      1 src/tests/db-upgrade.test 2.ts(8,10): error TS2305: Module '"../index.js"' has no exported member 'users'.
      1 src/tests/db-upgrade.test 2.ts(55,10): error TS2305: Module '"../index.js"' has no exported member 'db'.
      1 src/services/queueManager.ts(7,10): error TS2724: '"bullmq"' has no exported member named 'JobsOptions'. Did you mean 'JobOptions'?
      1 src/services/jobQueue.standardized.ts(9,22): error TS2724: '"../index.js"' has no exported member named 'isError'. Did you mean 'error'?
      1 src/services/jobQueue.standardized.ts(9,10): error TS2305: Module '"../index.js"' has no exported member 'isAppError'.
      1 src/services/jobQueue.standardized.ts(8,24): error TS2305: Module '"../index.js"' has no exported member 'isNull'.
      1 src/services/jobQueue.standardized.ts(8,20): error TS2305: Module '"../index.js"' has no exported member 'eq'.
      1 src/services/jobQueue.standardized.ts(8,15): error TS2305: Module '"../index.js"' has no exported member 'and'.
      1 src/services/jobQueue.standardized.ts(8,10): error TS2305: Module '"../index.js"' has no exported member 'sql'.
      1 src/services/jobQueue.standardized.ts(21,26): error TS2305: Module '"../index.js"' has no exported member 'getRedisClient'.
      1 src/services/jobQueue.standardized.ts(21,10): error TS2305: Module '"../index.js"' has no exported member 'isInMemoryMode'.
      1 src/services/jobQueue.standardized.ts(16,30): error TS2724: '"bullmq"' has no exported member named 'JobsOptions'. Did you mean 'JobOptions'?
      1 src/services/jobQueue.standardized.ts(11,33): error TS2305: Module '"../index.js"' has no exported member 'taskLogs'.
      1 src/services/jobQueue.standardized.ts(11,10): error TS2305: Module '"../index.js"' has no exported member 'jobs'.
      1 src/services/jobQueue.standardized.ts(10,10): error TS2305: Module '"../index.js"' has no exported member 'db'.
      1 src/services/bullmqService.ts(9,34): error TS2724: '"bullmq"' has no exported member named 'JobsOptions'. Did you mean 'JobOptions'?
      1 src/services/bullmqService.standardized.ts(9,15): error TS2305: Module '"../index.js"' has no exported member 'ConnectionOptions'.
      1 src/services/bullmqService.standardized.ts(8,59): error TS2724: '"bullmq"' has no exported member named 'JobsOptions'. Did you mean 'JobOptions'?
      1 src/services/bullmqService.standardized.ts(8,41): error TS2305: Module '"bullmq"' has no exported member 'QueueEvents'.
      1 src/services/bullmqService.standardized.ts(8,110): error TS2724: '"bullmq"' has no exported member named 'QueueEventsOptions'. Did you mean 'QueueOptions'?
      1 src/services/bullmqService.standardized.ts(319,10): error TS2305: Module '"../index.js"' has no exported member 'defaultJobOptions'.
      1 src/services/bullmqService.standardized.ts(29,3): error TS2305: Module '"../index.js"' has no exported member 'closeRedisConnection'.
      1 src/services/bullmqService.standardized.ts(28,3): error TS2305: Module '"../index.js"' has no exported member 'getSchedulerConfig'.
      1 src/services/bullmqService.standardized.ts(27,3): error TS2305: Module '"../index.js"' has no exported member 'getWorkerConfig'.
      1 src/services/bullmqService.standardized.ts(26,3): error TS2305: Module '"../index.js"' has no exported member 'getQueueConfig'.
      1 src/services/bullmqService.standardized.ts(25,3): error TS2305: Module '"../index.js"' has no exported member 'isInMemoryMode'.
      1 src/services/bullmqService.standardized.ts(24,3): error TS2305: Module '"../index.js"' has no exported member 'getRedisClient'.
      1 src/services/bullmqService.standardized.ts(23,3): error TS2305: Module '"../index.js"' has no exported member 'initializeRedis'.
      1 src/services/bullmqService.standardized.ts(20,3): error TS2305: Module '"../index.js"' has no exported member 'TaskJobData'.
      1 src/services/bullmqService.standardized.ts(19,3): error TS2305: Module '"../index.js"' has no exported member 'ReportJobData'.
      1 src/services/bullmqService.standardized.ts(18,3): error TS2305: Module '"../index.js"' has no exported member 'WorkflowJobData'.
      1 src/services/bullmqService.standardized.ts(17,3): error TS2305: Module '"../index.js"' has no exported member 'InsightJobData'.
      1 src/services/bullmqService.standardized.ts(16,3): error TS2305: Module '"../index.js"' has no exported member 'EmailJobData'.
      1 src/services/bullmqService.standardized.ts(15,3): error TS2305: Module '"../index.js"' has no exported member 'QueueRegistry'.
      1 src/services/bullmqService.standardized.ts(14,3): error TS2305: Module '"../index.js"' has no exported member 'BaseJobData'.
      1 src/services/bullmqService.standardized.ts(12,10): error TS2305: Module '"../index.js"' has no exported member 'QUEUE_NAMES'.
      1 src/services/bullmqService.standardized.ts(11,10): error TS2724: '"../index.js"' has no exported member named 'isError'. Did you mean 'error'?
      1 src/server/routes/workflows.refactored.ts(9,3): error TS2614: Module '"../index.js"' has no exported member 'resetWorkflow'. Did you mean to use 'import resetWorkflow from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(8,3): error TS2614: Module '"../index.js"' has no exported member 'getWorkflows'. Did you mean to use 'import getWorkflows from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(7,3): error TS2614: Module '"../index.js"' has no exported member 'getWorkflow'. Did you mean to use 'import getWorkflow from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(14,46): error TS2614: Module '"../index.js"' has no exported member 'sendNotFound'. Did you mean to use 'import sendNotFound from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(14,31): error TS2614: Module '"../index.js"' has no exported member 'sendForbidden'. Did you mean to use 'import sendForbidden from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(14,15): error TS2614: Module '"../index.js"' has no exported member 'sendBadRequest'. Did you mean to use 'import sendBadRequest from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(13,10): error TS2614: Module '"../index.js"' has no exported member 'asyncHandler'. Did you mean to use 'import asyncHandler from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(12,10): error TS2614: Module '"../index.js"' has no exported member 'isAuthenticated'. Did you mean to use 'import isAuthenticated from "../index.js"' instead?
      1 src/server/routes/workflows.refactored.ts(10,3): error TS2614: Module '"../index.js"' has no exported member 'configureWorkflowNotifications'. Did you mean to use 'import configureWorkflowNotifications from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(8,10): error TS2614: Module '"../index.js"' has no exported member 'isAuthenticated'. Did you mean to use 'import isAuthenticated from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(6,10): error TS2614: Module '"../index.js"' has no exported member 'isError'. Did you mean to use 'import isError from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(19,46): error TS2614: Module '"../index.js"' has no exported member 'sendNotFound'. Did you mean to use 'import sendNotFound from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(19,31): error TS2614: Module '"../index.js"' has no exported member 'sendForbidden'. Did you mean to use 'import sendForbidden from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(19,15): error TS2614: Module '"../index.js"' has no exported member 'sendBadRequest'. Did you mean to use 'import sendBadRequest from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(18,10): error TS2614: Module '"../index.js"' has no exported member 'asyncHandler'. Did you mean to use 'import asyncHandler from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(16,3): error TS2614: Module '"../index.js"' has no exported member 'getScheduleLogs'. Did you mean to use 'import getScheduleLogs from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(15,3): error TS2614: Module '"../index.js"' has no exported member 'retrySchedule'. Did you mean to use 'import retrySchedule from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(14,3): error TS2614: Module '"../index.js"' has no exported member 'deleteSchedule'. Did you mean to use 'import deleteSchedule from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(13,3): error TS2614: Module '"../index.js"' has no exported member 'updateSchedule'. Did you mean to use 'import updateSchedule from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(12,3): error TS2614: Module '"../index.js"' has no exported member 'listSchedules'. Did you mean to use 'import listSchedules from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(11,3): error TS2614: Module '"../index.js"' has no exported member 'getSchedule'. Did you mean to use 'import getSchedule from "../index.js"' instead?
      1 src/server/routes/schedules.refactored.ts(10,3): error TS2614: Module '"../index.js"' has no exported member 'createSchedule'. Did you mean to use 'import createSchedule from "../index.js"' instead?

### Module Resolution Issues
      1 src/utils/routeHandler.ts(7,40): error TS2307: Cannot find module './apiResponse.js.js.js' or its corresponding type declarations.
      1 src/utils/retry.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/rateLimiter.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/pdfExtractor.ts(11,25): error TS2307: Cannot find module './errorUtils.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(9,15): error TS2307: Cannot find module './drizzleUtils.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(8,15): error TS2307: Cannot find module './drizzleImports.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(7,15): error TS2307: Cannot find module './crypto.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(6,15): error TS2307: Cannot find module './circuitBreaker.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(5,15): error TS2307: Cannot find module './canonicalExports.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(4,15): error TS2307: Cannot find module './apiValidation.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(3,15): error TS2307: Cannot find module './apiResponse.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(20,15): error TS2307: Cannot find module './validation.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(2,15): error TS2307: Cannot find module './apiErrorHandler.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(19,15): error TS2307: Cannot find module './routeHandler.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(18,15): error TS2307: Cannot find module './retry.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(17,15): error TS2307: Cannot find module './rateLimiter.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(16,15): error TS2307: Cannot find module './errors.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(15,15): error TS2307: Cannot find module './errorUtils.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(14,15): error TS2307: Cannot find module './errorHandling.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(13,15): error TS2307: Cannot find module './envValidator.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(12,15): error TS2307: Cannot find module './environmentUtils.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(11,15): error TS2307: Cannot find module './encryption.js.js.js' or its corresponding type declarations.
      1 src/utils/index.ts(10,15): error TS2307: Cannot find module './drizzleWrapper.js.js.js' or its corresponding type declarations.
      1 src/utils/errors.ts(9,50): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/errors.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/errors.ts(14,15): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/errorHandling.ts(6,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/errorHandling.ts(5,65): error TS2307: Cannot find module './errorUtils.js.js.js' or its corresponding type declarations.
      1 src/utils/environmentUtils.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/environmentUtils.ts(7,64): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/envValidator.ts(8,34): error TS2307: Cannot find module './encryption.js.js.js' or its corresponding type declarations.
      1 src/utils/envValidator.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/encryption.ts(9,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/encryption.ts(8,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/encryption.ts(286,26): error TS2307: Cannot find module 'crypto-js' or its corresponding type declarations.
      1 src/utils/encryption.ts(11,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/encryption.ts(10,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/drizzleWrapper.ts(4,21): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/drizzleWrapper.ts(2,30): error TS2307: Cannot find module './drizzleImports.js.js.js' or its corresponding type declarations.
      1 src/utils/drizzleWrapper.ts(1,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/drizzleUtils.ts(1,38): error TS2307: Cannot find module './drizzleImports.js.js.js' or its corresponding type declarations.
      1 src/utils/drizzleImports.ts(33,15): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/circuitBreaker.ts(9,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/circuitBreaker.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/circuitBreaker.ts(10,37): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/apiValidation.ts(9,25): error TS2307: Cannot find module './errorUtils.js.js.js' or its corresponding type declarations.
      1 src/utils/apiValidation.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/apiResponse.ts(7,33): error TS2307: Cannot find module './errorHandling.js.js.js' or its corresponding type declarations.
      1 src/utils/apiErrorHandler.ts(6,8): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/apiErrorHandler.ts(10,8): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/utils/apiErrorHandler.ts(1,26): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/types/index.ts(2,15): error TS2307: Cannot find module './bullmq/index.js.js' or its corresponding type declarations.
      1 src/types/bullmq/workerTypes.ts(1,26): error TS2307: Cannot find module './jobTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/queueTypes.ts(14,38): error TS2307: Cannot find module './jobTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/queueTypes.ts(13,8): error TS2307: Cannot find module './jobTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/jobTypes.ts(8,29): error TS2307: Cannot find module './baseTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/index.ts(8,15): error TS2307: Cannot find module './baseTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/index.ts(17,24): error TS2307: Cannot find module './workerTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/index.ts(14,23): error TS2307: Cannot find module './queueTypes.js.js' or its corresponding type declarations.
      1 src/types/bullmq/index.ts(11,33): error TS2307: Cannot find module './jobTypes.js.js' or its corresponding type declarations.
      1 src/tools/summarizeText.ts(7,30): error TS2307: Cannot find module './extractCleanContent.js.js.js' or its corresponding type declarations.
      1 src/tools/index.ts(9,15): error TS2307: Cannot find module './extractCleanContent.js.js.js' or its corresponding type declarations.
      1 src/tools/index.ts(10,15): error TS2307: Cannot find module './summarizeText.js.js.js' or its corresponding type declarations.
      1 src/tools/archived/summarizeText.ts(9,25): error TS2307: Cannot find module './extractCleanContent.js.js.js' or its corresponding type declarations.
      1 src/shared/types/database.ts(2,35): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/shared/middleware/rbacMiddleware.ts(9,39): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/shared/middleware/rbacMiddleware.ts(8,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/shared/middleware/rbacMiddleware.ts(7,29): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/shared/middleware/rbacMiddleware.ts(10,34): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(9,15): error TS2307: Cannot find module './types/database.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(8,15): error TS2307: Cannot find module './schema.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(7,15): error TS2307: Cannot find module './report-schema.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(6,15): error TS2307: Cannot find module './outputStorage.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(5,15): error TS2307: Cannot find module './middleware/rbacMiddleware.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(4,15): error TS2307: Cannot find module './middleware/rateLimiter.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(3,15): error TS2307: Cannot find module './errorHandler.js.js' or its corresponding type declarations.
      1 src/shared/index.ts(2,15): error TS2307: Cannot find module './db.js.js' or its corresponding type declarations.
      1 src/shared/errorHandler.ts(2,20): error TS2307: Cannot find module './logger.js.js' or its corresponding type declarations.
      1 src/shared/db.ts(21,31): error TS2307: Cannot find module './report-schema.js.js' or its corresponding type declarations.
      1 src/shared/db.ts(20,25): error TS2307: Cannot find module './schema.js.js' or its corresponding type declarations.
      1 src/shared/db.ts(19,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/services/workflowService.ts(23,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/workflowService.ts(21,45): error TS2307: Cannot find module './workflowEmailServiceFixed.js.js.js' or its corresponding type declarations.
      1 src/services/workflowService.ts(19,30): error TS2307: Cannot find module './stepHandlers.js.js.js' or its corresponding type declarations.
      1 src/services/workflowService.ts(15,67): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/workflowService.ts(14,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/workflowService.ts(13,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/taskParser.ts(3,33): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/taskParser.ts(2,24): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/stepHandlers.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/sentryService.ts(9,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/sentryService.ts(8,26): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/sentryService.ts(11,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityMonitoringService.ts(9,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityMonitoringService.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityMonitoringService.ts(7,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityMonitoringService.ts(6,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(9,41): error TS2307: Cannot find module './kmsEncryptionService.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(8,38): error TS2307: Cannot find module './awsKmsService.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(7,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(6,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(12,31): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(11,46): error TS2307: Cannot find module './securityMonitoringService.js.js.js' or its corresponding type declarations.
      1 src/services/securityInitializer.ts(10,39): error TS2307: Cannot find module './keyRotationService.js.js.js' or its corresponding type declarations.
      1 src/services/schedulerService.ts(8,42): error TS2307: Cannot find module './workflowService.js.js.js' or its corresponding type declarations.
      1 src/services/schedulerService.ts(7,37): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/schedulerService.ts(6,33): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/schedulerService.ts(5,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/schedulerService.ts(13,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/schedulerService.ts(12,28): error TS2307: Cannot find module './jobQueue.js.js.js' or its corresponding type declarations.
      1 src/services/resultsPersistence.ts(13,30): error TS2307: Cannot find module './attachmentParsers.js.js.js' or its corresponding type declarations.
      1 src/services/resultsPersistence.ts(11,40): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/resultsPersistence.ts(10,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/redisService.ts(9,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/redisService.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/redisService.ts(10,24): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/redisHealthCheck.ts(8,35): error TS2307: Cannot find module './healthService.js.js.js' or its corresponding type declarations.
      1 src/services/redisHealthCheck.ts(6,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/redisHealthCheck.ts(11,27): error TS2307: Cannot find module './redisService.js.js.js' or its corresponding type declarations.
      1 src/services/rbacService.ts(9,39): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/rbacService.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/rbacService.ts(7,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/rbacService.ts(6,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/rbacService.ts(11,34): error TS2307: Cannot find module './awsKmsService.js.js.js' or its corresponding type declarations.
      1 src/services/queueManager.ts(8,33): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/queueManager.ts(35,8): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/queueManager.ts(21,8): error TS2307: Cannot find module './bullmqService.js.js.js' or its corresponding type declarations.
      1 src/services/queueManager.ts(12,22): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/queueManager.ts(11,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/queueManager.ts(10,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/performanceMonitor.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/performanceMonitor.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/performanceMonitor.ts(11,31): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/performanceMonitor.ts(10,39): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/openai.ts(7,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/notificationService.ts(9,72): error TS2307: Cannot find module './alertMailer.js.js.js' or its corresponding type declarations.
      1 src/services/notificationService.ts(8,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/notificationService.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/notificationService.ts(12,78): error TS2307: Cannot find module './environmentService.js.js.js' or its corresponding type declarations.
      1 src/services/notificationService.ts(11,33): error TS2307: Cannot find module './datadogService.js.js.js' or its corresponding type declarations.
      1 src/services/notificationService.ts(10,32): error TS2307: Cannot find module './sentryService.js.js.js' or its corresponding type declarations.
      1 src/services/migrationService.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/migrationService.ts(11,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/migrationService.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/mailerService.ts(8,27): error TS2307: Cannot find module '...' or its corresponding type declarations.
      1 src/services/mailerService.ts(7,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/mailerService.ts(6,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/mailerService.ts(5,29): error TS2307: Cannot find module '...' or its corresponding type declarations.
      1 src/services/kmsEncryptionService.ts(8,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/keyRotationService.ts(7,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/keyRotationService.ts(18,57): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/keyRotationService.ts(17,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/keyRotationService.ts(16,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/keyRotationService.ts(15,8): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(9,40): error TS2307: Cannot find module './queueManager.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(8,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(7,51): error TS2307: Cannot find module './bullmqService.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(14,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(13,48): error TS2307: Cannot find module './distributedScheduler.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(12,41): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(113,15): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(112,15): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(111,15): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(110,15): error TS2307: Cannot find module './distributedScheduler.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(11,44): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(109,15): error TS2307: Cannot find module './queueManager.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(108,15): error TS2307: Cannot find module './bullmqService.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueueSystem.ts(10,43): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueue.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueue.ts(4,50): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueue.ts(3,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueue.ts(295,54): error TS2307: Cannot find module './schedulerService.js.js.js' or its corresponding type declarations.
      1 src/services/jobQueue.ts(2,37): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/insightGenerator.ts(7,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(9,15): error TS2307: Cannot find module './emailQueue.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(8,15): error TS2307: Cannot find module './credentialVault.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(7,15): error TS2307: Cannot find module './apiKeyService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(6,15): error TS2307: Cannot find module './redisService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(5,15): error TS2307: Cannot find module './jobQueue.standardized.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(4,15): error TS2307: Cannot find module './bullmqService.standardized.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(3,15): error TS2307: Cannot find module './monitoringService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(24,15): error TS2307: Cannot find module './workflowService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(23,15): error TS2307: Cannot find module './taskParser.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(22,15): error TS2307: Cannot find module './sentryService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(21,15): error TS2307: Cannot find module './securityMonitoringService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(20,15): error TS2307: Cannot find module './securityInitializer.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(2,15): error TS2307: Cannot find module './healthService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(19,15): error TS2307: Cannot find module './schedulerService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(18,15): error TS2307: Cannot find module './rbacService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(17,15): error TS2307: Cannot find module './queueManager.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(16,15): error TS2307: Cannot find module './notificationService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(15,15): error TS2307: Cannot find module './migrationService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(14,15): error TS2307: Cannot find module './mailerService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(13,15): error TS2307: Cannot find module './kmsEncryptionService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(12,15): error TS2307: Cannot find module './keyRotationService.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(11,15): error TS2307: Cannot find module './healthCheckScheduler.js.js.js' or its corresponding type declarations.
      1 src/services/index.ts(10,15): error TS2307: Cannot find module './environmentSafetyService.js.js.js' or its corresponding type declarations.
      1 src/services/imapIngestionService.ts(7,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/healthCheckScheduler.ts(82,40): error TS2307: Cannot find module './healthService.js.js.js' or its corresponding type declarations.
      1 src/services/healthCheckScheduler.ts(36,40): error TS2307: Cannot find module './healthService.js.js.js' or its corresponding type declarations.
      1 src/services/environmentService.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/environmentSafetyService.ts(9,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/environmentSafetyService.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/environmentSafetyService.ts(11,34): error TS2307: Cannot find module './notificationService.js.js.js' or its corresponding type declarations.
      1 src/services/environmentSafetyService.ts(10,79): error TS2307: Cannot find module './environmentService.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(9,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(14,41): error TS2307: Cannot find module './rbacService.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(13,34): error TS2307: Cannot find module './awsKmsService.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(12,66): error TS2307: Cannot find module './kmsEncryptionService.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(11,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/enhancedApiKeyService.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailTemplateService.ts(11,27): error TS2307: Cannot find module './mailerService.js.js.js' or its corresponding type declarations.
      1 src/services/emailTemplateService.ts(10,8): error TS2307: Cannot find module './emailTemplateEngine.js.js.js' or its corresponding type declarations.
      1 src/services/emailService.ts(3,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailService.ts(1,31): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailQueue.ts(8,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailQueue.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailQueue.ts(5,65): error TS2307: Cannot find module './mailerService.js.js.js' or its corresponding type declarations.
      1 src/services/emailQueue.ts(3,47): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailQueue.ts(2,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/emailQueue.ts(1,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/dbHealthCheck.ts(9,35): error TS2307: Cannot find module './healthService.js.js.js' or its corresponding type declarations.
      1 src/services/dbHealthCheck.ts(6,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/dbHealthCheck.ts(10,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/datadogService.ts(9,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/credentialVault.ts(8,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/credentialVault.ts(7,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/credentialVault.ts(12,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/credentialVault.ts(11,66): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/credentialVault.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/bullmqService.ts(24,8): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/bullmqService.ts(15,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/bullmqService.ts(14,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/bullmqService.ts(12,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/awsKmsService.ts(7,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/attachmentParsers.ts(8,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/apiKeyService.ts(9,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/apiKeyService.ts(8,66): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/apiKeyService.ts(7,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/apiKeyService.ts(6,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/apiKeyService.ts(10,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/alertMailer.ts(11,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/aiInsightService.ts(6,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/aiInsightService.ts(5,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/aiInsightService.ts(4,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/aiInsightService.ts(3,24): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/services/aiInsightService.ts(2,38): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/server/routes/workflows.ts(12,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/workflows.ts(11,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/schedules.ts(8,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/schedules.ts(6,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/schedules.ts(17,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/monitoring.ts(9,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/monitoring.ts(8,31): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/monitoring.ts(7,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/monitoring.ts(18,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/monitoring.ts(11,35): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/monitoring.ts(10,54): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/logs.ts(9,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/logs.ts(8,31): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/logs.ts(7,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/logs.ts(10,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/jobs.ts(9,26): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/jobs.ts(8,20): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/jobs.ts(7,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/jobs.ts(6,60): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/jobs.ts(5,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(9,26): error TS2307: Cannot find module './emails.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(8,31): error TS2307: Cannot find module './credentials.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(7,24): error TS2307: Cannot find module './auth.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(6,27): error TS2307: Cannot find module './apiKeys.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(14,29): error TS2307: Cannot find module './workflows.refactored.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(13,29): error TS2307: Cannot find module './schedules.refactored.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(12,30): error TS2307: Cannot find module './monitoring.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(11,24): error TS2307: Cannot find module './jobs.js.js' or its corresponding type declarations.
      1 src/server/routes/index.ts(10,26): error TS2307: Cannot find module './health.js.js' or its corresponding type declarations.
      1 src/server/routes/emails.ts(14,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/dashboards.ts(9,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/dashboards.ts(8,31): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/dashboards.ts(7,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/dashboards.ts(10,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/credentials.ts(9,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/credentials.ts(23,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/credentials.ts(16,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/credentials.ts(11,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/credentials.ts(10,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/auth.ts(3,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/auth.ts(2,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/apiKeys.ts(7,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/apiKeys.ts(19,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/apiKeys.ts(12,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/routes/apiKeys.ts(11,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/index.ts(9,27): error TS2307: Cannot find module './auth.js.js' or its corresponding type declarations.
      1 src/server/index.ts(8,26): error TS2307: Cannot find module 'cookie-parser' or its corresponding type declarations.
      1 src/server/index.ts(7,18): error TS2307: Cannot find module 'cors' or its corresponding type declarations.
      1 src/server/index.ts(14,36): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/server/index.ts(13,35): error TS2307: Cannot find module './routes/logs.js.js' or its corresponding type declarations.
      1 src/server/index.ts(12,41): error TS2307: Cannot find module './routes/dashboards.js.js' or its corresponding type declarations.
      1 src/server/index.ts(11,42): error TS2307: Cannot find module './routes/monitoring.js.js' or its corresponding type declarations.
      1 src/server/index.ts(10,38): error TS2307: Cannot find module './routes/health.js.js' or its corresponding type declarations.
      1 src/scripts/seed-staging-db.ts(9,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/scripts/seed-staging-db.ts(7,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/scripts/seed-staging-db.ts(10,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/prompts/promptRouter.ts(14,8): error TS2307: Cannot find module './insightPromptEngine.js.js' or its corresponding type declarations.
      1 src/prompts/promptRouter.ts(11,8): error TS2307: Cannot find module './automotiveAnalystPrompt.js.js' or its corresponding type declarations.
      1 src/prompts/index.ts(32,8): error TS2307: Cannot find module './insightPromptEngine.js.js' or its corresponding type declarations.
      1 src/prompts/index.ts(21,8): error TS2307: Cannot find module './promptRouter.js.js' or its corresponding type declarations.
      1 src/prompts/index.ts(11,8): error TS2307: Cannot find module './automotiveAnalystPrompt.js.js' or its corresponding type declarations.
      1 src/prompts/examples/insightPromptExample.ts(12,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/utils/monitoring.ts(9,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/utils/monitoring.ts(8,31): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(9,55): error TS2307: Cannot find module './base/types.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(41,27): error TS2307: Cannot find module './implementations/PDFParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(40,28): error TS2307: Cannot find module './implementations/XLSXParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(39,27): error TS2307: Cannot find module './implementations/CSVParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(38,31): error TS2307: Cannot find module './base/types.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(37,31): error TS2307: Cannot find module './factory/ParserFactory.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(34,15): error TS2307: Cannot find module './utils/fileUtils.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(31,31): error TS2307: Cannot find module './factory/ParserFactory.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(28,64): error TS2307: Cannot find module './implementations/PDFParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(27,47): error TS2307: Cannot find module './implementations/XLSXParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(26,45): error TS2307: Cannot find module './implementations/CSVParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(23,28): error TS2307: Cannot find module './base/BaseParser.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(20,8): error TS2307: Cannot find module './errors/ParserError.js.js' or its corresponding type declarations.
      1 src/parsers/index.ts(10,25): error TS2307: Cannot find module './base/IParser.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/XLSXParser.ts(17,52): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/XLSXParser.ts(16,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/XLSXParser.ts(15,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/XLSXParser.ts(14,28): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/XLSXParser.ts(13,60): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/XLSXParser.ts(12,28): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/PDFParser.ts(16,52): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/PDFParser.ts(15,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/PDFParser.ts(14,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/PDFParser.ts(13,28): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/PDFParser.ts(12,60): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/PDFParser.ts(11,28): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/CSVParser.ts(17,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/CSVParser.ts(16,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/CSVParser.ts(15,28): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/CSVParser.ts(14,60): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/implementations/CSVParser.ts(13,28): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/factory/ParserFactory.ts(21,20): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/factory/ParserFactory.ts(17,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/factory/ParserFactory.ts(16,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/factory/ParserFactory.ts(15,67): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/factory/ParserFactory.ts(14,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/factory/ParserFactory.ts(13,31): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/base/IParser.ts(9,60): error TS2307: Cannot find module './types.js.js' or its corresponding type declarations.
      1 src/parsers/base/BaseParser.ts(33,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/base/BaseParser.ts(28,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/base/BaseParser.ts(27,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/base/BaseParser.ts(24,8): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/parsers/base/BaseParser.ts(18,25): error TS2307: Cannot find module './IParser.js.js' or its corresponding type declarations.
      1 src/parsers/base/BaseParser.ts(17,60): error TS2307: Cannot find module './types.js.js' or its corresponding type declarations.
      1 src/migrations/run-rls-migration.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/run-rls-migration.ts(7,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/run-migrations.ts(8,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/run-migrations.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/run-migrations.ts(6,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/run-migrations.ts(16,37): error TS2307: Cannot find module './add-api-key-security-fields.js.js.js' or its corresponding type declarations.
      1 src/migrations/migrationRunner.ts(9,45): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/migrationRunner.ts(8,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/migrationRunner.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/migrationRunner.ts(21,37): error TS2307: Cannot find module './add-api-key-security-fields.js.js.js' or its corresponding type declarations.
      1 src/migrations/migrationRunner.ts(10,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/index.ts(1,15): error TS2307: Cannot find module './1699999999999-CreateSecretVaultAndMigrateSecrets.js.js.js' or its corresponding type declarations.
      1 src/migrations/add-api-key-security-fields.ts(16,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/add-api-key-security-fields.ts(15,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/add-api-key-security-fields.ts(14,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/1699999999999-CreateSecretVaultAndMigrateSecrets.ts(3,36): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/migrations/1699999999999-CreateSecretVaultAndMigrateSecrets.ts(2,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/rbac.ts(7,30): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/performance.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/monitoringMiddleware.ts(9,50): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/monitoringMiddleware.ts(11,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/monitoringMiddleware.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/errorMiddleware.ts(6,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/errorMiddleware.ts(5,27): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/environmentSafetyMiddleware.ts(9,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/environmentSafetyMiddleware.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/environmentSafetyMiddleware.ts(12,58): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/environmentSafetyMiddleware.ts(11,34): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/environmentSafetyMiddleware.ts(10,64): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/dbContextMiddleware.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/middleware/dbContextMiddleware.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/index.ts(9,15): error TS2307: Cannot find module './types/index.js.js.js' or its corresponding type declarations.
      1 src/index.ts(8,15): error TS2307: Cannot find module './utils/index.js.js.js' or its corresponding type declarations.
      1 src/index.ts(7,15): error TS2307: Cannot find module './services/index.js.js.js' or its corresponding type declarations.
      1 src/index.ts(6,15): error TS2307: Cannot find module './api/index.js.js.js' or its corresponding type declarations.
      1 src/index.ts(3,29): error TS2307: Cannot find module './api/server.js.js' or its corresponding type declarations.
      1 src/features/workflow/services/attachmentParsers.ts(8,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/workflow/services/attachmentParsers.ts(15,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/scheduler/services/executePlan.ts(4,23): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/scheduler/services/executePlan.ts(3,20): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailTemplates.ts(5,26): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailTemplateService.ts(11,27): error TS2307: Cannot find module './mailerService.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailTemplateService.ts(10,8): error TS2307: Cannot find module './emailTemplateEngine.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(16,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(15,32): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(14,34): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(13,30): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(12,34): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(11,44): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/email/services/emailIngestService.ts(10,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/auth/services/userCredentialService.ts(9,20): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/auth/services/userCredentialService.ts(8,25): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/auth/services/userCredentialService.ts(12,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/auth/services/userCredentialService.ts(11,84): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/auth/services/userCredentialService.ts(10,33): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/features/api/index.ts(7,15): error TS2307: Cannot find module './services/apiIngestService.js.js' or its corresponding type declarations.
      1 src/errors/utils/errorUtils.ts(8,31): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/errors/utils/errorUtils.ts(7,38): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/errors/types/DomainErrors.ts(7,38): error TS2307: Cannot find module './BaseError.js.js' or its corresponding type declarations.
      1 src/errors/index.ts(5,15): error TS2307: Cannot find module './utils/errorUtils.js.js' or its corresponding type declarations.
      1 src/errors/index.ts(4,15): error TS2307: Cannot find module './types/DomainErrors.js.js' or its corresponding type declarations.
      1 src/errors/index.ts(3,15): error TS2307: Cannot find module './handlers/retryHandler.js.js' or its corresponding type declarations.
      1 src/errors/index.ts(2,15): error TS2307: Cannot find module './handlers/errorHandlers.js.js' or its corresponding type declarations.
      1 src/errors/handlers/retryHandler.ts(8,35): error TS2307: Cannot find module './errorHandlers.js.js' or its corresponding type declarations.
      1 src/errors/handlers/retryHandler.ts(7,46): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/errors/handlers/retryHandler.ts(6,22): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/errors/handlers/errorHandlers.ts(9,27): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/errors/handlers/errorHandlers.ts(8,61): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/errors/handlers/errorHandlers.ts(10,42): error TS2307: Cannot find module '../index.js.js' or its corresponding type declarations.
      1 src/data-source.ts(3,29): error TS2307: Cannot find module './entities/SecretVault.js.js' or its corresponding type declarations.
      1 src/core/ai/promptTemplate.ts(11,18): error TS2307: Cannot find module 'yaml' or its corresponding type declarations.
      1 src/core/ai/promptTemplate.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/openai.ts(9,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/openai.ts(8,35): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/openai.ts(13,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/openai.ts(12,38): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/openai.ts(11,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/openai.ts(10,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/modelFallback.ts(8,31): error TS2307: Cannot find module './openai.js.js.js' or its corresponding type declarations.
      1 src/core/ai/modelFallback.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/llmAuditLogger.ts(9,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/llmAuditLogger.ts(8,29): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/llmAuditLogger.ts(7,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/index.ts(7,39): error TS2307: Cannot find module './openai.js.js.js' or its corresponding type declarations.
      1 src/core/ai/index.ts(30,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/core/ai/index.ts(29,8): error TS2307: Cannot find module './modelFallback.js.js.js' or its corresponding type declarations.
      1 src/core/ai/index.ts(24,8): error TS2307: Cannot find module './llmAuditLogger.js.js.js' or its corresponding type declarations.
      1 src/core/ai/index.ts(17,8): error TS2307: Cannot find module './promptTemplate.js.js.js' or its corresponding type declarations.
      1 src/config/secrets.ts(8,41): error TS2307: Cannot find module './defaults.js.js.js' or its corresponding type declarations.
      1 src/config/secrets.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/notificationConfig.ts(9,39): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/notificationConfig.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/monitoring.ts(7,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/integrationConfig.ts(8,20): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/integrationConfig.ts(11,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/integrationConfig.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/index.ts(38,51): error TS2307: Cannot find module './secrets.js.js.js' or its corresponding type declarations.
      1 src/config/index.ts(37,8): error TS2307: Cannot find module './defaults.js.js.js' or its corresponding type declarations.
      1 src/config/index.ts(25,8): error TS2307: Cannot find module './schema.js.js.js' or its corresponding type declarations.
      1 src/config/index.ts(11,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/environmentSafetyConfig.ts(9,39): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/environmentSafetyConfig.ts(8,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/environmentSafetyConfig.ts(10,38): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/defaults.ts(7,39): error TS2307: Cannot find module './schema.js.js.js' or its corresponding type declarations.
      1 src/config/bullmq.config.ts(9,53): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/bullmq.config.ts(11,25): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/config/bullmq.config.ts(10,42): error TS2307: Cannot find module '../index.js.js.js' or its corresponding type declarations.
      1 src/api/server.ts(292,54): error TS2307: Cannot find module '../.js.js' or its corresponding type declarations.
      1 src/api/server.ts(233,50): error TS2307: Cannot find module '../.js.js' or its corresponding type declarations.
      1 src/api/server.ts(200,57): error TS2307: Cannot find module './routes/apiIngestRoutes.js.js' or its corresponding type declarations.
      1 src/api/server.ts(199,57): error TS2307: Cannot find module './routes/workflowsRouter.js.js' or its corresponding type declarations.
      1 src/api/server.ts(198,52): error TS2307: Cannot find module './routes/jobsRouter.js.js' or its corresponding type declarations.
      1 src/api/server.ts(129,51): error TS2307: Cannot find module '../.js.js' or its corresponding type declarations.
      1 src/api/server.ts(125,47): error TS2307: Cannot find module './routes/monitoringRoutes.js.js' or its corresponding type declarations.
      1 src/api/server.ts(122,43): error TS2307: Cannot find module './routes/healthRoutes.js.js' or its corresponding type declarations.
      1 src/api/index.ts(7,15): error TS2307: Cannot find module './routes/workflowsRouter.js.js' or its corresponding type declarations.
      1 src/api/index.ts(6,15): error TS2307: Cannot find module './routes/jobsRouter.js.js' or its corresponding type declarations.
      1 src/api/index.ts(5,15): error TS2307: Cannot find module './routes/apiIngestRoutes.js.js' or its corresponding type declarations.
      1 src/api/index.ts(4,15): error TS2307: Cannot find module './routes/monitoringRoutes.js.js' or its corresponding type declarations.
      1 src/api/index.ts(3,15): error TS2307: Cannot find module './routes/healthRoutes.js.js' or its corresponding type declarations.
      1 src/api/index.ts(2,15): error TS2307: Cannot find module './server.js.js' or its corresponding type declarations.

### Type Errors
     11         Type 'Promise<Response<any, Record<string, any>>>' is not assignable to type 'void | Promise<void>'.
     11           Type 'Promise<Response<any, Record<string, any>>>' is not assignable to type 'Promise<void>'.
     11             Type 'Response<any, Record<string, any>>' is not assignable to type 'void'.
      7       Type '(req: Request, res: Response) => Promise<express.Response<any, Record<string, any>>>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
      5       Type '(req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
      5         Type 'Response<any, Record<string, any>>' is not assignable to type 'void | Promise<void>'.
      4       Type '(req: any, res: Response) => Promise<Response<any, Record<string, any>>>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
      3     Type '{ role: string; content: string; }[]' is not assignable to type 'ChatCompletionMessageParam[]'.
      3       Type '{ role: string; content: string; }' is not assignable to type 'ChatCompletionMessageParam'.
      2     Type '() => void' is not assignable to type 'BufferEncoding'.
      2       Type '(req: any, res: Response<any, Record<string, any>, number>) => Promise<Response<any, Record<string, any>, number>>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
      2         Type 'Promise<Response<any, Record<string, any>, number>>' is not assignable to type 'void | Promise<void>'.
      2           Type 'Promise<Response<any, Record<string, any>, number>>' is not assignable to type 'Promise<void>'.
      2             Type 'Response<any, Record<string, any>, number>' is not assignable to type 'void'.
      1 src/middleware/performance.ts(58,3): error TS2322: Type '(chunk?: any, encoding?: BufferEncoding, callback?: () => void) => Response<any, Record<string, any>>' is not assignable to type '{ (cb?: () => void): Response<any, Record<string, any>>; (chunk: any, cb?: () => void): Response<any, Record<string, any>>; (chunk: any, encoding: BufferEncoding, cb?: () => void): Response<...>; }'.
      1 src/middleware/monitoringMiddleware.ts(48,3): error TS2322: Type '(chunk?: any, encoding?: BufferEncoding, callback?: () => void) => Response<any, Record<string, any>>' is not assignable to type '{ (cb?: () => void): Response<any, Record<string, any>>; (chunk: any, cb?: () => void): Response<any, Record<string, any>>; (chunk: any, encoding: BufferEncoding, cb?: () => void): Response<...>; }'.
      1 src/middleware/cache.ts(86,7): error TS2322: Type 'Response<any, Record<string, any>>' is not assignable to type 'void'.

### Unknown Types

### Files with Most Errors
     42 src/services/bullmqService.standardized.ts
     31 src/services/jobQueue.standardized.ts
     27 src/server/routes/schedules.refactored.ts
     24 src/server/routes/workflows.refactored.ts
     23 src/services/index.ts
     20 src/services/jobQueueSystem.ts
     20 src/parsers/index.ts
     20 src/parsers/implementations/CSVParser.ts
     19 src/utils/index.ts
     17 src/server/routes/schedules.ts
