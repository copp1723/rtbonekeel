/**
 * Validation Utilities Tests
 * 
 * Tests for the validation utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUrl,
  isValidDate,
  isValidPhoneNumber,
  isEmptyString,
  isNullOrUndefined,
  isStrongPassword,
  isValidUsername,
  isNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isInRange,
  isLengthInRange,
  isOneOf,
  validateObject,
  type ValidationSchema
} from '../../../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user-name@domain.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@example.')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://www.example.com/path?query=value')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('htp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date strings', () => {
      expect(isValidDate('2023-01-01')).toBe(true);
      expect(isValidDate('2023/01/01')).toBe(true);
      expect(isValidDate('01/01/2023')).toBe(true);
      expect(isValidDate('January 1, 2023')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDate('not a date')).toBe(false);
      expect(isValidDate('2023-13-01')).toBe(false);
      expect(isValidDate('2023-01-32')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('+1234567890')).toBe(true);
      expect(isValidPhoneNumber('123-456-7890')).toBe(true);
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abcdefghij')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('isEmptyString', () => {
    it('should return true for empty strings', () => {
      expect(isEmptyString('')).toBe(true);
      expect(isEmptyString('   ')).toBe(true);
      expect(isEmptyString(null)).toBe(true);
      expect(isEmptyString(undefined)).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmptyString('test')).toBe(false);
      expect(isEmptyString('   test   ')).toBe(false);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true for null or undefined values', () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for non-null and non-undefined values', () => {
      expect(isNullOrUndefined('')).toBe(false);
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe('validateObject', () => {
    it('should validate an object against a schema', () => {
      // Define a test schema
      const schema: ValidationSchema<{ name: string; age: number }> = {
        name: (value) => typeof value === 'string' && value.length > 0,
        age: (value) => typeof value === 'number' && value >= 18
      };

      // Valid object
      const validObject = { name: 'John', age: 25 };
      const validResult = validateObject(validObject, schema);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual({});

      // Invalid object
      const invalidObject = { name: '', age: 15 };
      const invalidResult = validateObject(invalidObject, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveProperty('name');
      expect(invalidResult.errors).toHaveProperty('age');
    });

    it('should handle custom error messages', () => {
      // Define a test schema with custom error messages
      const schema: ValidationSchema<{ name: string; age: number }> = {
        name: (value) => 
          typeof value === 'string' && value.length > 0 ? true : 'Name is required',
        age: (value) => 
          typeof value === 'number' && value >= 18 ? true : 'Must be at least 18 years old'
      };

      // Invalid object
      const invalidObject = { name: '', age: 15 };
      const invalidResult = validateObject(invalidObject, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.name).toBe('Name is required');
      expect(invalidResult.errors.age).toBe('Must be at least 18 years old');
    });
  });
});
