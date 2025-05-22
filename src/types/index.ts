// Types barrel exports
export * from './bullmq/index.js.js';

// Database types
export interface SelectApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

// Job types
export interface BaseJobData {
  id: string;
  type: string;
  [key: string]: any;
}

export interface EmailJobData extends BaseJobData {
  to: string;
  subject: string;
  body: string;
  attachments?: any[];
}

export interface InsightJobData extends BaseJobData {
  input: string;
  parameters: Record<string, any>;
}

export interface WorkflowJobData extends BaseJobData {
  workflowId: string;
  steps: any[];
}

export interface ReportJobData extends BaseJobData {
  reportType: string;
  parameters: Record<string, any>;
}

export interface TaskJobData extends BaseJobData {
  taskType: string;
  parameters: Record<string, any>;
}

// File types
export enum FileType {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
  JSON = 'json',
  XML = 'xml',
  TEXT = 'txt'
}

// Error types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT'
}

export const ERROR_CODES = Object.values(ErrorCode);