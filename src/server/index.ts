/**
 * Server Entry Point
 * 
 * Configures and starts the Express server with all routes and middleware
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupAuth } from './auth.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerMonitoringRoutes } from './routes/monitoring.js';
import { registerDashboardRoutes } from './routes/dashboards.js';
import { registerLogRoutes } from './routes/logs.js';
import { debug, info, error } from '../shared/logger.js';

// Create Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Set up authentication
setupAuth(app).catch(err => {
  error('Failed to set up authentication:', err);
  process.exit(1);
});

// Register routes
registerHealthRoutes(app);
registerMonitoringRoutes(app);
registerDashboardRoutes(app);
registerLogRoutes(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  info(`Server running on port ${PORT}`);
});

export default app;