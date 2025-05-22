// This file is needed for ESM compatibility
// It exports common utilities used throughout the application

// Logger exports
export const debug = console.debug;
export const info = console.info;
export const warn = console.warn;
export const error = console.error;
export const Logger = console;

// Error handling
export class AppError extends Error {
  constructor(message, isOperational = true, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.isOperational = isOperational;
    this.context = context;
  }
}
export const isError = (err) => err instanceof Error;
export const isAppError = (err) => err instanceof AppError;
export const toAppError = (err) => new AppError(err.message);
export const logError = console.error;
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};
export const getErrorMessage = (err) => err?.message || String(err);

// Database exports
export const db = {
  execute: async () => ({}),
  query: async () => ([]),
  transaction: async (fn) => await fn()
};
export const sql = { 
  identifier: (name) => name,
  raw: (query, params) => ({ query, params })
};
export const workflows = {};
export const WorkflowStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};
export const WorkflowStep = {};
export const Workflow = {};
export const reports = {};
export const insights = {};
export const users = [];
export const securityAuditLogs = {};

// Circuit breaker
export const circuitBreakerState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

// Security
export const checkApiKeyPermission = () => true;
export const logSecurityEvent = () => {};

// Migration
export const runMigrations = async () => true;

// Task logs
export const getTaskLogs = async () => [];