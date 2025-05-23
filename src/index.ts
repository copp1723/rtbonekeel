// Main entry point for the AI Agent API server
import dotenv from 'dotenv';
import { startServer } from './api/server';

// Re-export from modules
export * from './api/index';
export * from './services/index';
export * from './utils/index';
export * from './types/index';

// Export logger functions for other modules
export const info = (message: unknown): void => console.info(message);
export const warn = (message: unknown): void => console.warn(message);
export const error = (message: unknown): void => console.error(message);
export const debug = (message: unknown): void => console.debug(message);

// Export db from shared/db.js
export { db } from './shared/db.js';

// Export environment utility functions
export const getCurrentEnvironment = (): string => process.env.NODE_ENV || 'development';
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';

// Export safety check functions (stubs to fix imports)
export type SafetyCheckOperation = 'read' | 'write' | 'delete';
export const performSafetyCheck = (operation: SafetyCheckOperation): boolean => true;
export const sendNotification = (message: string): void => console.log(message);

// Export monitoring functions (stubs to fix imports)
export const trackApiRequest = (path: string, method: string): void => {};
export const trackError = (error: unknown): void => {};

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
const hostnameArg = args.find(arg => arg.startsWith('--hostname='));

// Set environment variables from command line arguments
if (portArg) {
  process.env.PORT = portArg.split('=')[1];
}

if (hostnameArg) {
  process.env.HOST = hostnameArg.split('=')[1];
}

// Start the server
startServer().catch((error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});