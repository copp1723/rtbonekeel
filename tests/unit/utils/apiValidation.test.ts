/**
 * API Validation Utilities Tests
 * 
 * Tests for the API validation utility functions
 */
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  validateData,
  safeValidateData,
  formatZodError,
} from '../../../src/utils/apiValidation.js';

describe('API Validation Utilities', () => {
  describe('formatZodError', () => {
    it('should format Zod errors correctly', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
        age: z.number().min(18),
      });
      
      // Create invalid data
      const invalidData = {
        name: 'Jo',
        email: 'not-an-email',
        age: 16,
      };
      
      // Parse the data and catch the error
      let zodError;
      try {
        schema.parse(invalidData);
      } catch (err) {
        zodError = err;
      }
      
      // Format the error
      const formattedError = formatZodError(zodError);
      
      // Check the structure
      expect(formattedError.status).toBe('error');
      expect(formattedError.code).toBe('validation_error');
      expect(formattedError.message).toBe('The request data failed validation');
      expect(formattedError.errors).toBeDefined();
      
      // Check specific error messages
      expect(formattedError.errors['name']).toContain(expect.stringContaining('at least'));
      expect(formattedError.errors['email']).toContain(expect.stringContaining('email'));
      expect(formattedError.errors['age']).toContain(expect.stringContaining('18'));
    });
  });
  
  describe('validateBody', () => {
    it('should validate request body and call next on success', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create mock request, response, and next
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };
      const res = {};
      const next = vi.fn();
      
      // Create middleware
      const middleware = validateBody(schema);
      
      // Call middleware
      middleware(req, res, next);
      
      // Check that next was called
      expect(next).toHaveBeenCalled();
      
      // Check that the body was validated
      expect(req.body).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
    
    it('should return 400 on validation failure', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create mock request, response, and next
      const req = {
        body: {
          name: 'John Doe',
          email: 'not-an-email',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();
      
      // Create middleware
      const middleware = validateBody(schema);
      
      // Call middleware
      middleware(req, res, next);
      
      // Check that status and json were called
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].status).toBe('error');
      expect(res.json.mock.calls[0][0].code).toBe('validation_error');
      
      // Check that next was not called
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should use custom error handler if provided', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create custom error handler
      const customErrorHandler = vi.fn();
      
      // Create mock request, response, and next
      const req = {
        body: {
          name: 'John Doe',
          email: 'not-an-email',
        },
      };
      const res = {};
      const next = vi.fn();
      
      // Create middleware with custom error handler
      const middleware = validateBody(schema, { errorHandler: customErrorHandler });
      
      // Call middleware
      middleware(req, res, next);
      
      // Check that custom error handler was called
      expect(customErrorHandler).toHaveBeenCalled();
      
      // Check that next was not called
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('validateQuery', () => {
    it('should validate request query and call next on success', () => {
      // Create a Zod schema
      const schema = z.object({
        page: z.string().transform(val => parseInt(val, 10)),
        limit: z.string().transform(val => parseInt(val, 10)),
      });
      
      // Create mock request, response, and next
      const req = {
        query: {
          page: '1',
          limit: '10',
        },
      };
      const res = {};
      const next = vi.fn();
      
      // Create middleware
      const middleware = validateQuery(schema);
      
      // Call middleware
      middleware(req, res, next);
      
      // Check that next was called
      expect(next).toHaveBeenCalled();
      
      // Check that the query was validated and transformed
      expect(req.query).toEqual({
        page: 1,
        limit: 10,
      });
    });
  });
  
  describe('validateParams', () => {
    it('should validate request params and call next on success', () => {
      // Create a Zod schema
      const schema = z.object({
        id: z.string().uuid(),
      });
      
      // Create mock request, response, and next
      const req = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
      };
      const res = {};
      const next = vi.fn();
      
      // Create middleware
      const middleware = validateParams(schema);
      
      // Call middleware
      middleware(req, res, next);
      
      // Check that next was called
      expect(next).toHaveBeenCalled();
      
      // Check that the params were validated
      expect(req.params).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });
    });
  });
  
  describe('validateData', () => {
    it('should validate data and return it on success', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create valid data
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      // Validate the data
      const result = validateData(schema, validData);
      
      // Check the result
      expect(result).toEqual(validData);
    });
    
    it('should throw an error on validation failure', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create invalid data
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
      };
      
      // Validate the data
      expect(() => validateData(schema, invalidData)).toThrow();
    });
  });
  
  describe('safeValidateData', () => {
    it('should return success and data on validation success', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create valid data
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      // Validate the data
      const result = safeValidateData(schema, validData);
      
      // Check the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });
    
    it('should return failure and error on validation failure', () => {
      // Create a Zod schema
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      // Create invalid data
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
      };
      
      // Validate the data
      const result = safeValidateData(schema, invalidData);
      
      // Check the result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.status).toBe('error');
      expect(result.error.code).toBe('validation_error');
    });
  });
});
