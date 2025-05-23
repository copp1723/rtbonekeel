// Services barrel exports
export * from './healthService';
export * from './monitoringService';
export * from './bullmqService.standardized';
export * from './jobQueue.standardized';
export * from './redisService';
export * from './apiKeyService';
export * from './credentialVault';
export * from './emailQueue';
export * from './environmentSafetyService';
export * from './healthCheckScheduler';
export * from './keyRotationService';
export * from './kmsEncryptionService';
export * from './mailerService';
export * from './migrationService';
export * from './notificationService';
export * from './queueManager';
export * from './rbacService';
export * from './schedulerService';
export * from './securityInitializer';
export * from './securityMonitoringService';
export * from './sentryService';
export * from './taskParser';
export * from './workflowService';

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