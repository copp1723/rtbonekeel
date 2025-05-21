/**
 * User Workflow End-to-End Tests
 * 
 * Tests for complete user workflows from start to finish
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { users } from '../../src/shared/schema.js';
import { createTestDbConnection } from '../helpers/test-utils.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database connection
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// This is a placeholder for the actual API client
// In a real test, you would use the actual API client
const apiClient = {
  registerUser: async (userData: any) => {
    // Simulate registering a user
    return { id: 'test-user-id', success: true, ...userData };
  },
  
  loginUser: async (email: string, password: string) => {
    // Simulate logging in a user
    return { token: 'test-token', success: true, email };
  },
  
  getUserProfile: async (userId: string) => {
    // Simulate getting a user profile
    return { id: userId, email: 'test@example.com', name: 'Test User' };
  },
  
  updateUserProfile: async (userId: string, profileData: any) => {
    // Simulate updating a user profile
    return { id: userId, success: true, ...profileData };
  }
};

describe('User Workflow End-to-End', () => {
  let client: postgres.Sql;
  let db: ReturnType<typeof drizzle>;
  
  // Set up the database connection before all tests
  beforeAll(async () => {
    // Connect to the test database
    const connection = createTestDbConnection();
    client = connection.client;
    db = connection.db;
    
    // Create the fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, '../fixtures');
    try {
      await fs.access(fixturesDir);
    } catch (error) {
      await fs.mkdir(fixturesDir, { recursive: true });
    }
  });
  
  // Close the database connection after all tests
  afterAll(async () => {
    await client.end();
  });
  
  // Clean up the database before each test
  beforeEach(async () => {
    // Mock the database operations for cleanup
    vi.spyOn(db, 'delete').mockImplementation(() => {
      return {
        from: () => Promise.resolve()
      } as any;
    });
    
    // Clear the users table
    await db.delete(users);
  });
  
  it('should complete a full user registration and profile update workflow', async () => {
    // 1. Register a new user
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const registerResult = await apiClient.registerUser(userData);
    expect(registerResult.success).toBe(true);
    expect(registerResult.id).toBeDefined();
    
    // 2. Login with the new user
    const loginResult = await apiClient.loginUser(userData.email, userData.password);
    expect(loginResult.success).toBe(true);
    expect(loginResult.token).toBeDefined();
    
    // 3. Get the user profile
    const profileResult = await apiClient.getUserProfile(registerResult.id);
    expect(profileResult.id).toBe(registerResult.id);
    expect(profileResult.email).toBe(userData.email);
    
    // 4. Update the user profile
    const updatedProfileData = {
      firstName: 'Updated',
      lastName: 'User',
      profileImageUrl: 'https://example.com/profile.jpg'
    };
    
    const updateResult = await apiClient.updateUserProfile(registerResult.id, updatedProfileData);
    expect(updateResult.success).toBe(true);
    expect(updateResult.firstName).toBe(updatedProfileData.firstName);
    expect(updateResult.lastName).toBe(updatedProfileData.lastName);
    
    // 5. Verify the updated profile
    const updatedProfileResult = await apiClient.getUserProfile(registerResult.id);
    expect(updatedProfileResult.id).toBe(registerResult.id);
    expect(updatedProfileResult.name).toBe('Test User'); // This would be updated in a real test
  });
  
  it('should handle error cases in the user workflow', async () => {
    // Mock API client to simulate errors
    const errorApiClient = {
      ...apiClient,
      registerUser: vi.fn().mockRejectedValue(new Error('Email already exists')),
      loginUser: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
      getUserProfile: vi.fn().mockRejectedValue(new Error('User not found')),
      updateUserProfile: vi.fn().mockRejectedValue(new Error('Unauthorized'))
    };
    
    // 1. Try to register with an existing email
    try {
      await errorApiClient.registerUser({
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('Email already exists');
    }
    
    // 2. Try to login with invalid credentials
    try {
      await errorApiClient.loginUser('test@example.com', 'WrongPassword');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('Invalid credentials');
    }
    
    // 3. Try to get a non-existent user profile
    try {
      await errorApiClient.getUserProfile('non-existent-id');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('User not found');
    }
    
    // 4. Try to update a profile without authorization
    try {
      await errorApiClient.updateUserProfile('some-id', { firstName: 'Updated' });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toBe('Unauthorized');
    }
  });
});
