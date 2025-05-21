/**
 * Database Test Utilities
 * 
 * Utilities for database testing
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database connection
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

/**
 * Create a test database connection with a unique schema
 * @returns Database client, connection, and schema name
 */
export async function createTestDb() {
  // Create a unique schema name for isolation
  const schemaName = `test_${uuidv4().replace(/-/g, '_')}`;
  
  // Connect to the database
  const client = postgres(TEST_DB_URL);
  
  // Create the schema
  await client`CREATE SCHEMA IF NOT EXISTS ${client(schemaName)}`;
  
  // Set the search path to the new schema
  await client`SET search_path TO ${client(schemaName)}, public`;
  
  // Create the database connection with the schema
  const db = drizzle(client, { schema: schemaName });
  
  return { client, db, schemaName };
}

/**
 * Clean up a test database schema
 * @param client - Database client
 * @param schemaName - Schema name to clean up
 */
export async function cleanupTestDb(client: postgres.Sql, schemaName: string) {
  // Drop the schema
  await client`DROP SCHEMA IF EXISTS ${client(schemaName)} CASCADE`;
  
  // Close the connection
  await client.end();
}

/**
 * Run migrations on a test database
 * @param db - Database connection
 */
export async function runTestMigrations(db: ReturnType<typeof drizzle>) {
  const migrationsFolder = path.join(__dirname, '../../drizzle');
  
  try {
    await migrate(db, { migrationsFolder });
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Create a transaction for a test
 * @param db - Database connection
 * @returns Transaction object
 */
export async function createTestTransaction(db: ReturnType<typeof drizzle>) {
  // This is a simplified version - actual implementation would depend on how
  // transactions are handled in the application
  const tx = {} as any;
  
  // Mock transaction methods
  tx.commit = async () => {};
  tx.rollback = async () => {};
  
  return tx;
}

/**
 * Generate a random database record
 * @param table - Table name
 * @param overrides - Fields to override
 * @returns Random record
 */
export function generateRandomRecord(table: string, overrides: Record<string, any> = {}) {
  const baseRecord: Record<string, any> = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
  };
  
  // Add table-specific fields
  switch (table) {
    case 'users':
      baseRecord.name = `Test User ${Math.floor(Math.random() * 1000)}`;
      baseRecord.email = `test${Math.floor(Math.random() * 1000)}@example.com`;
      baseRecord.password_hash = 'hashed_password';
      break;
    case 'reports':
      baseRecord.title = `Test Report ${Math.floor(Math.random() * 1000)}`;
      baseRecord.status = 'draft';
      baseRecord.user_id = uuidv4();
      break;
    // Add more tables as needed
  }
  
  // Override with provided fields
  return { ...baseRecord, ...overrides };
}
