/**
 * Test Utilities
 * 
 * Common utilities and helpers for tests
 */

import { vi } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database connection
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

/**
 * Create a test database connection
 * @returns Database client and connection
 */
export function createTestDbConnection() {
  const client = postgres(TEST_DB_URL);
  const db = drizzle(client);
  return { client, db };
}

/**
 * Create a test fixture file
 * @param filename - Name of the fixture file
 * @param content - Content to write to the file
 * @returns Path to the created fixture file
 */
export async function createTestFixture(filename: string, content: string): Promise<string> {
  const fixturesDir = path.join(__dirname, '../fixtures');
  const filePath = path.join(fixturesDir, filename);
  
  try {
    await fs.access(fixturesDir);
  } catch (error) {
    await fs.mkdir(fixturesDir, { recursive: true });
  }
  
  await fs.writeFile(filePath, content);
  return filePath;
}

/**
 * Create a mock for a class
 * @param methods - Methods to mock
 * @returns Mocked class instance
 */
export function createClassMock<T>(methods: Record<string, any> = {}): T {
  const mock = {} as T;
  
  for (const [key, value] of Object.entries(methods)) {
    if (typeof value === 'function') {
      (mock as any)[key] = vi.fn(value);
    } else {
      (mock as any)[key] = value;
    }
  }
  
  return mock;
}

/**
 * Wait for a specified time
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random string
 * @param length - Length of the string
 * @returns Random string
 */
export function randomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Mock bcrypt functions
 * @returns Mocked bcrypt functions
 */
export function mockBcrypt() {
  return {
    hash: vi.fn().mockImplementation((data) => Promise.resolve(`hashed_${data}`)),
    compare: vi.fn().mockImplementation((data, hash) => Promise.resolve(hash === `hashed_${data}`))
  };
}
