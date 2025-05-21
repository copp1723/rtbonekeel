/**
 * API Test Utilities
 * 
 * Utilities for API testing
 */

import { vi } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// JWT secret for testing
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

/**
 * Create a test JWT token
 * @param payload - Token payload
 * @returns JWT token
 */
export function createTestToken(payload: Record<string, any> = {}): string {
  const defaultPayload = {
    sub: uuidv4(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...payload
  };
  
  return jwt.sign(defaultPayload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Create a test Express app
 * @returns Express app
 */
export function createTestApp(): express.Application {
  const app = express();
  
  // Configure middleware
  app.use(express.json());
  
  return app;
}

/**
 * Create a supertest client for an Express app
 * @param app - Express app
 * @returns Supertest client
 */
export function createTestClient(app: express.Application) {
  return supertest(app);
}

/**
 * Create an authenticated test request
 * @param request - Supertest request
 * @param token - JWT token
 * @returns Authenticated request
 */
export function authenticatedRequest(request: supertest.Test, token: string): supertest.Test {
  return request.set('Authorization', `Bearer ${token}`);
}

/**
 * Mock Express request and response objects
 * @param options - Request options
 * @returns Mocked request and response objects
 */
export function mockExpressReqRes(options: {
  body?: Record<string, any>;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, any>;
  user?: Record<string, any>;
} = {}) {
  const { body = {}, params = {}, query = {}, headers = {}, user = null } = options;
  
  const req = {
    body,
    params,
    query,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    user,
    get: vi.fn((name: string) => headers[name.toLowerCase()])
  };
  
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis()
  };
  
  const next = vi.fn();
  
  return { req, res, next };
}

/**
 * Mock API response
 * @param status - HTTP status code
 * @param data - Response data
 * @param headers - Response headers
 * @returns Mocked response
 */
export function mockApiResponse<T>(status: number, data: T, headers: Record<string, string> = {}) {
  return {
    status,
    data,
    headers: {
      'content-type': 'application/json',
      ...headers
    }
  };
}
