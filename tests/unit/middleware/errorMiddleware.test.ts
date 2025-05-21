/**
 * Tests for error middleware
 */
import { Request, Response } from 'express';
import { AppError, errorHandler, notFoundHandler } from '../../../src/middleware/errorMiddleware';

// Mock Express response
const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

// Mock Express request
const mockRequest = () => {
  const req: Partial<Request> = {
    path: '/test',
    method: 'GET',
    originalUrl: '/test'
  };
  return req as Request;
};

// Mock logger to prevent actual logging during tests
jest.mock('../../../src/shared/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }
}));

describe('Error Middleware', () => {
  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom values', () => {
      const error = new AppError('Not found', 404, false);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with correct error message', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Route not found: /test'
        })
      );
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError with correct status code', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new AppError('Validation failed', 400);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed'
        })
      );
    });

    it('should handle regular Error with 500 status code', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Something went wrong');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Something went wrong'
        })
      );
    });

    it('should include stack trace in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Development error');

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error('Production error');
      error.stack = 'Error stack';

      errorHandler(error, req, res, next);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});