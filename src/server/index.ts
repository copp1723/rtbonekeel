/**
 * Server setup and configuration
 */
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from '../middleware/errorMiddleware';
import apiRoutes from './routes';

/**
 * Configure and create Express application
 */
export function createApp() {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  
  // Parse JSON bodies
  app.use(express.json());
  
  // API routes
  app.use('/api', apiRoutes);
  
  // Handle 404s
  app.use(notFoundHandler);
  
  // Global error handler
  app.use(errorHandler);
  
  return app;
}

/**
 * Start the server
 */
export async function startServer(port = process.env.PORT || 3000) {
  const app = createApp();
  
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}