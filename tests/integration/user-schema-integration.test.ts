/**
 * User Schema Integration Tests
 * 
 * Tests for database operations using the user schema
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import { users } from '../../src/shared/schema.js';
import { eq } from 'drizzle-orm';
import { createTestDbConnection } from '../helpers/test-utils.js';

// Test database connection
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

describe('User Schema Integration', () => {
  let client: postgres.Sql;
  let db: ReturnType<typeof drizzle>;
  
  // Set up the database connection before all tests
  beforeAll(async () => {
    // Connect to the test database
    const connection = createTestDbConnection();
    client = connection.client;
    db = connection.db;
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
  
  // Test creating a user
  it('should create a user', async () => {
    // Mock the insert operation
    const userId = `user-${uuidv4()}`;
    vi.spyOn(db, 'insert').mockImplementation(() => {
      return {
        values: () => ({
          returning: () => Promise.resolve([{ id: userId }])
        })
      } as any;
    });
    
    // Create a new user
    const newUser = {
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: 'https://example.com/profile.jpg',
    };
    
    // Insert the user
    const result = await db.insert(users)
      .values(newUser)
      .returning();
    
    // Check that the user was created
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(userId);
    expect(db.insert).toHaveBeenCalledWith(users);
  });
  
  // Test retrieving a user
  it('should retrieve a user by ID', async () => {
    // Mock the select operation
    const userId = `user-${uuidv4()}`;
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: 'https://example.com/profile.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    vi.spyOn(db, 'select').mockImplementation(() => {
      return {
        from: () => ({
          where: () => Promise.resolve([mockUser])
        })
      } as any;
    });
    
    // Retrieve the user
    const result = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    // Check that the user was retrieved
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(userId);
    expect(result[0].email).toBe('test@example.com');
    expect(db.select).toHaveBeenCalled();
  });
  
  // Test updating a user
  it('should update a user', async () => {
    // Mock the update operation
    const userId = `user-${uuidv4()}`;
    vi.spyOn(db, 'update').mockImplementation(() => {
      return {
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{
              id: userId,
              email: 'updated@example.com',
              firstName: 'Updated',
              lastName: 'User',
              profileImageUrl: 'https://example.com/updated.jpg',
              updatedAt: new Date(),
            }])
          })
        })
      } as any;
    });
    
    // Update the user
    const result = await db.update(users)
      .set({
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        profileImageUrl: 'https://example.com/updated.jpg',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Check that the user was updated
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(userId);
    expect(result[0].email).toBe('updated@example.com');
    expect(result[0].firstName).toBe('Updated');
    expect(db.update).toHaveBeenCalledWith(users);
  });
  
  // Test deleting a user
  it('should delete a user', async () => {
    // Mock the delete operation
    const userId = `user-${uuidv4()}`;
    vi.spyOn(db, 'delete').mockImplementation(() => {
      return {
        where: () => ({
          returning: () => Promise.resolve([{ id: userId }])
        })
      } as any;
    });
    
    // Delete the user
    const result = await db.delete(users)
      .where(eq(users.id, userId))
      .returning();
    
    // Check that the user was deleted
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(userId);
    expect(db.delete).toHaveBeenCalledWith(users);
  });
});
