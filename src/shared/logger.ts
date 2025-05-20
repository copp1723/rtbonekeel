/**
 * Logger Module
 *
 * This module provides centralized logging functionality for the application.
 * It supports different log levels and can log to both console and files.
 */
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const generalLogPath = path.join(logsDir, 'general.log');
const insightRunsLogPath = path.join(logsDir, 'insight_runs.log');

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Write to log file with timestamp
 * @param filePath - Path to the log file
 * @param level - Log level
 * @param message - Message to log
 * @param meta - Optional metadata to include
 */
function writeToLogFile(filePath: string, level: LogLevel, message: string, meta?: any): void {
  try {
    const timestamp = new Date().toISOString();
    const metaString = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
    const logEntry = `[${timestamp}] [${level}] ${message}${metaString}\n`;
    fs.appendFileSync(filePath, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

export interface LoggerMeta {
  event?: string;
  error?: string | Error;
  [key: string]: any;
}

export interface Logger {
  debug(message: string, meta?: LoggerMeta): void;
  info(message: string, meta?: LoggerMeta): void;
  warn(message: string, meta?: LoggerMeta): void;
  error(message: string, meta?: LoggerMeta): void;
}

const logger: Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

/**
 * General purpose logger for application events
 */
export const generalLogger: Logger = {
  debug: (message: string, meta?: LoggerMeta) => {
    logger.debug(message, meta);
    writeToLogFile(generalLogPath, LogLevel.DEBUG, message, meta);
  },
  info: (message: string, meta?: LoggerMeta) => {
    logger.info(message, meta);
    writeToLogFile(generalLogPath, LogLevel.INFO, message, meta);
  },
  warn: (message: string, meta?: LoggerMeta) => {
    logger.warn(message, meta);
    writeToLogFile(generalLogPath, LogLevel.WARN, message, meta);
  },
  error: (message: string, meta?: LoggerMeta) => {
    logger.error(message, meta);
    writeToLogFile(generalLogPath, LogLevel.ERROR, message, meta);
  },
};

/**
 * Specialized logger for insight generation runs
 */
export interface InsightRunLogData {
  platform: string;
  inputFile?: string;
  promptIntent: string;
  promptVersion: string;
  durationMs: number;
  outputSummary: string[];
  error?: string;
  timestamp?: string;
}

/**
 * Log insight generation run details
 * @param data - Insight run log data
 */
export function logInsightRun(data: InsightRunLogData): void {
  // Add timestamp if not provided
  const logData = {
    ...data,
    timestamp: data.timestamp || new Date().toISOString(),
  };
  // Log to console
  logger.info(
    '[INSIGHT RUN] Platform: ' + logData.platform! + ', Intent: ' + logData.promptIntent + ', Version: ' + logData.promptVersion,
    logData
  );
  logger.info(
    '[INSIGHT RUN] Duration: ' + logData.durationMs + 'ms, File: ' + (logData.inputFile || 'direct content'),
    logData
  );
  if (logData.error) {
    logger.error('[INSIGHT RUN] Error: ' + logData.error, logData);
  } else {
    logger.info('[INSIGHT RUN] Generated ' + logData.outputSummary.length + ' insights', logData);
  }
  // Write to insight runs log file
  writeToLogFile(insightRunsLogPath, LogLevel.INFO, 'Insight Generation Run', logData);
}

/**
 * Get task logs from DB (placeholder for DB integration)
 * @param taskId - Task ID to retrieve logs for
 * @returns Array of log entries
 */
export async function getTaskLogs(taskId: string): Promise<string[]> {
  // This is a placeholder. In a real implementation, this would
  // fetch logs from a database or other persistent storage.
  return ['Task ' + taskId + ' logs would be retrieved from DB'];
}

export function debug(message: string, meta?: LoggerMeta): void {
  logger.debug(message, meta);
}

export function info(message: string, meta?: LoggerMeta): void {
  logger.info(message, meta);
}

export function warn(message: string, meta?: LoggerMeta): void {
  logger.warn(message, meta);
}

export function error(message: string, meta?: LoggerMeta): void {
  logger.error(message, meta);
}

export function fatal(message: string, meta?: LoggerMeta): void {
  logger.error(message, { ...meta, level: 'fatal' });
}

export default logger;
