/**
 * Global type declarations for the project
 */

// Common module declarations for missing exports
declare module '../index.js' {
  // Logger functions
  export const debug: (message: string, ...args: any[]) => void;
  export const info: (message: string, ...args: any[]) => void;
  export const warn: (message: string, ...args: any[]) => void;
  export const error: (message: string, ...args: any[]) => void;
  export const fatal: (message: string, ...args: any[]) => void;
  export const logError: (error: Error | unknown, context?: Record<string, any>) => void;
  export const getErrorMessage: (error: Error | unknown) => string;
  export const formatError: (error: Error | unknown) => string;
  
  // Error handling
  export const isError: (error: unknown) => boolean;
  export const isAppError: (error: unknown) => boolean;
  export const toAppError: (error: unknown, defaultMessage?: string) => AppError;
  export class AppError extends Error {
    code: string;
    status: number;
    context?: Record<string, any>;
    constructor(message: string, code?: string, status?: number, context?: Record<string, any>);
  }
  export const ERROR_CODES: Record<string, string>;
  export enum ErrorCode {
    UNKNOWN = 'UNKNOWN',
    VALIDATION = 'VALIDATION',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
    INTERNAL = 'INTERNAL',
  }

  // Database
  export const db: any;
  export const sql: any;
  export const and: (...conditions: any[]) => any;
  export const eq: (column: any, value: any) => any;
  export const isNull: (column: any) => any;
  export const users: any;
  export const apiKeys: any;
  export const credentials: any;
  export const dealerCredentials: any;
  export const userCredentials: any;
  export const securityAuditLogs: any;
  export const healthChecks: any;
  export const healthLogs: any;
  export const reports: any;
  export const reportSources: any;
  export const schedules: any;
  export const taskLogs: any;
  export const tasks: any;
  export const jobs: any;
  export const workflows: any;
  export enum WorkflowStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
  }
  export interface WorkflowStep {
    id: string;
    name: string;
    status: string;
    order: number;
  }
  export interface Workflow {
    id: string;
    name: string;
    status: string;
    steps: WorkflowStep[];
  }
  export interface Migration {
    id: string;
    name: string;
    timestamp: number;
  }
  export const migrationService: any;
  export const runMigrations: () => Promise<void>;
  export const migrateDatabase: () => Promise<void>;

  // Queue management
  export const jobQueue: any;
  export const emailQueue: any;
  export const initializeJobQueue: () => Promise<void>;
  export const initializeScheduler: () => Promise<void>;
  export const initializeMailer: () => Promise<void>;
  export const enqueueJob: (jobData: any) => Promise<any>;
  export const initializeIngestionWorker: () => Promise<void>;
  export const initializeProcessingWorker: () => Promise<void>;
  export const initializeInsightWorker: () => Promise<void>;
  export const QUEUE_NAMES: Record<string, string>;
  export interface BaseJobData {
    id: string;
    type: string;
  }
  export interface EmailJobData extends BaseJobData {
    recipient: string;
    subject: string;
    body: string;
  }
  export interface InsightJobData extends BaseJobData {
    dataId: string;
  }
  export interface ReportJobData extends BaseJobData {
    reportId: string;
  }
  export interface WorkflowJobData extends BaseJobData {
    workflowId: string;
  }
  export interface TaskJobData extends BaseJobData {
    taskId: string;
  }
  export interface QueueRegistry {
    [key: string]: any;
  }
  export const Queue: any;
  export const Worker: any;
  export const Job: any;
  export const JobOptions: any;
  export const JobsOptions: any;
  export const ConnectionOptions: any;
  export const defaultJobOptions: any;

  // Redis
  export const redisService: any;
  export const initializeRedis: () => Promise<void>;
  export const getRedisClient: () => any;
  export const isInMemoryMode: () => boolean;
  export const getQueueConfig: () => any;
  export const getWorkerConfig: () => any;
  export const getSchedulerConfig: () => any;
  export const closeRedisConnection: () => Promise<void>;

  // Monitoring
  export const startAllHealthChecks: () => Promise<void>;
  export const performanceMonitoring: any;
  export const getPerformanceMetrics: () => any;
  export const getCacheStats: () => any;
  export const getSystemMetrics: () => any;
  export const getMetricsHistory: () => any;
  export const trackApiRequest: (req: any, res: any) => void;
  export const trackError: (error: Error | unknown) => void;
  export const registerMonitoringMiddleware: (app: any) => void;
  export const registerMonitoringRoutes: (app: any) => void;

  // Security
  export const initializeEncryption: () => Promise<void>;
  export const encryptData: (data: string) => Promise<string>;
  export const decryptData: (encryptedData: string) => Promise<string>;
  export const isEncryptionConfigured: () => boolean;
  export const rotateEncryptionKeys: () => Promise<void>;
  export const generateSecureKey: () => string;
  export const encrypt: (data: string, key: string) => string;
  export const deriveKey: (password: string, salt: string) => string;
  export const SecretVault: any;

  // API
  export const routeHandler: (handler: Function) => Function;
  export const errorHandlerMiddleware: (err: Error, req: any, res: any, next: any) => void;
  export const rateLimiters: any;
  export const registerAuthRoutes: (app: any) => void;
  export const SelectApiKey: any;

  // Parsers
  export const TaskParser: any;
  export const getTaskLogs: () => Promise<any[]>;
  export const recordParseStart: (parseId: string) => void;
  export const recordParseComplete: (parseId: string, count: number) => void;
  export const recordDuplicate: (parseId: string) => void;
  export const Logger: any;

  // Utilities
  export const circuitBreakerState: any;
}

// External module declarations
declare module 'crypto-js' {
  export const AES: {
    encrypt: (data: string, key: string) => any;
    decrypt: (encryptedData: any, key: string) => any;
  };
  export const SHA256: (data: string) => any;
  export const enc: {
    Utf8: any;
  };
}

declare module 'yaml' {
  export function parse(content: string): any;
  export function stringify(object: any): string;
}

declare module './emailTemplateEngine.js' {
  export function renderTemplate(template: string, data: any): string;
}

declare module './mailerService.js' {
  export function sendEmail(options: any): Promise<void>;
}

declare module './kmsEncryptionService.js' {
  export function encryptData(data: string): Promise<string>;
  export function decryptData(encryptedData: string): Promise<string>;
  export function isEncryptionConfigured(): boolean;
}

declare module './distributedScheduler.js' {
  export function createScheduler(options: any): any;
  export function scheduleJob(jobName: string, cronExpression: string, jobData: any): Promise<any>;
}

// Common interfaces
interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: Date;
}

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ParserOptions {
  validateData?: boolean;
  removeDuplicates?: boolean;
  maxRows?: number;
}

interface MigrationResult {
  success: boolean;
  message: string;
  migrations?: string[];
}