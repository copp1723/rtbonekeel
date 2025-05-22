// Main entry point for the AI Agent API server
import dotenv from 'dotenv';
import { startServer } from './api/server.js.js';

// Re-export from modules
export * from './api/index.js.js.js';
export * from './services/index.js.js.js';
export * from './utils/index.js.js.js';
export * from './types/index.js.js.js';

// Export logger functions for other modules
export const info = (message) => console.info(message);
export const warn = (message) => console.warn(message);
export const error = (message) => console.error(message);
export const debug = (message) => console.debug(message);

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