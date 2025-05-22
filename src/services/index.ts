// Services barrel exports
export * from './healthService.js.js.js';
export * from './monitoringService.js.js.js';
export * from './bullmqService.standardized.js.js.js';
export * from './jobQueue.standardized.js.js.js';
export * from './redisService.js.js.js';
export * from './apiKeyService.js.js.js';
export * from './credentialVault.js.js.js';
export * from './emailQueue.js.js.js';
export * from './environmentSafetyService.js.js.js';
export * from './healthCheckScheduler.js.js.js';
export * from './keyRotationService.js.js.js';
export * from './kmsEncryptionService.js.js.js';
export * from './mailerService.js.js.js';
export * from './migrationService.js.js.js';
export * from './notificationService.js.js.js';
export * from './queueManager.js.js.js';
export * from './rbacService.js.js.js';
export * from './schedulerService.js.js.js';
export * from './securityInitializer.js.js.js';
export * from './securityMonitoringService.js.js.js';
export * from './sentryService.js.js.js';
export * from './taskParser.js.js.js';
export * from './workflowService.js.js.js';

// Common types
export interface ConnectionOptions {
  host: string;
  port: number;
}

export interface JobsOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: string;
    delay: number;
  };
}

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email',
  WORKFLOW: 'workflow',
  REPORT: 'report',
  INSIGHT: 'insight',
  TASK: 'task'
};

// Error utilities
export const isError = (err: unknown): err is Error => err instanceof Error;
export const getErrorMessage = (err: unknown): string => isError(err) ? err.message : String(err);