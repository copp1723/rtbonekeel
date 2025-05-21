/**
 * Integration tests for route handler
 */
import express, { Request, Response } from 'express';
import request from 'supertest';
import { asyncHandler } from '../../../src/utils/routeHandler';
import { errorHandler } from '../../../src/middleware/errorMiddleware';

// Create test Express app
const createApp = () => {
  const app = express();
  app.use(express.json());
  
  // Success route
  app.get('/success', asyncHandler(async () => {
    return { message: 'Success' };
  }));
  
  // Error route
  app.get('/error', asyncHandler(async () => {
    throw new Error('Test error');
  }));
  
  // Custom status route
  app.get('/custom-status', asyncHandler(async (req: Request, res: Response) => {
    res.status(201);
    return { message: 'Created' };
  }));
  
  // Void return route
  app.get('/void-return', asyncHandler(async (req: Request, res: Response) => {
    res.status(204).end();
  }));
  
  // Add error handler middleware
  app.use(errorHandler);
  
  return app;
};

describe('Route Handler Integration Tests', () => {
  const app = createApp();
  
  it('should return success response with 200 status', async () => {
    const response = await request(app).get('/success');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Success',
      data: { message: 'Success' }
    });
  });
  
  it('should return error response with 500 status', async () => {
    const response = await request(app).get('/error');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'error',
        message: 'Test error'
      })
    );
  });
  
  it('should respect custom status codes', async () => {
    const response = await request(app).get('/custom-status');
    
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Success',
      data: { message: 'Created' }
    });
  });
  
  it('should handle void returns without sending duplicate responses', async () => {
    const response = await request(app).get('/void-return');
    
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});