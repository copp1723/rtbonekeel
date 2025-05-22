// Main entry point for the AI Agent API server
import dotenv from 'dotenv';
import { startServer } from './api/server';

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

// Export logger functions for other modules
export const info = (message) => console.info(message);
export const warn = (message) => console.warn(message);
export const error = (message) => console.error(message);
export const debug = (message) => console.debug(message);

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});