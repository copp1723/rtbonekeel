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
 * Read a fixture file
 * @param filename - Name of the fixture file
 * @returns Parsed fixture data
 */
export async function readFixture<T = any>(filename: string): Promise<T> {
  const filePath = path.join(__dirname, '../fixtures', filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read fixture file ${filename}: ${error}`);
  }
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

/**
 * Configure Sentry for testing
 */
export function configureSentryForTesting() {
  // Mock Sentry functions
  vi.mock('@sentry/node', () => ({
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    configureScope: vi.fn(),
    startTransaction: vi.fn().mockReturnValue({
      finish: vi.fn(),
      startChild: vi.fn().mockReturnValue({
        finish: vi.fn()
      })
    })
  }));
}

/**
 * Reset the test database with fixture data
 * @param db - Database connection
 * @param fixtures - Map of table names to fixture files
 */
export async function resetDatabaseWithFixtures(
  db: any,
  fixtures: Record<string, string>
): Promise<void> {
  for (const [table, fixtureFile] of Object.entries(fixtures)) {
    // Read the fixture data
    const data = await readFixture(fixtureFile);
    
    // Clear the table
    await db.delete(table);
    
    // Insert the fixture data
    if (Array.isArray(data)) {
      for (const record of data) {
        await db.insert(table).values(record);
      }
    }
  }
}