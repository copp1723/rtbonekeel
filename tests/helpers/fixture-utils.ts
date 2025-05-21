/**
 * Fixture Utilities
 * 
 * Utilities for working with test fixtures
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to fixtures directory
const fixturesDir = path.join(__dirname, '../fixtures');

/**
 * Read a fixture file
 * @param filename - Name of the fixture file
 * @returns Parsed fixture data
 */
export async function readFixture<T = any>(filename: string): Promise<T> {
  const filePath = path.join(fixturesDir, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read fixture file ${filename}: ${error}`);
  }
}

/**
 * Write data to a fixture file
 * @param filename - Name of the fixture file
 * @param data - Data to write
 */
export async function writeFixture(filename: string, data: any): Promise<void> {
  const filePath = path.join(fixturesDir, filename);
  
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Failed to write fixture file ${filename}: ${error}`);
  }
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

/**
 * Generate a large dataset for performance testing
 * @param baseRecord - Base record to duplicate
 * @param count - Number of records to generate
 * @returns Array of generated records
 */
export function generateLargeDataset<T extends Record<string, any>>(
  baseRecord: T,
  count: number
): T[] {
  const result: T[] = [];
  
  for (let i = 0; i < count; i++) {
    const record = { ...baseRecord };
    
    // Add a unique identifier
    if ('id' in record) {
      record.id = `${record.id}-${i}`;
    }
    
    // Add a unique email if present
    if ('email' in record) {
      const [name, domain] = (record.email as string).split('@');
      record.email = `${name}-${i}@${domain}`;
    }
    
    result.push(record);
  }
  
  return result;
}

/**
 * Create a test fixture file with sanitized data
 * @param filename - Name of the fixture file
 * @param data - Data to sanitize and save
 */
export async function createSanitizedFixture(
  filename: string,
  data: any
): Promise<void> {
  // Deep clone the data
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Sanitize sensitive fields
  const sanitizeObject = (obj: Record<string, any>) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      } else if (
        key.includes('password') ||
        key.includes('secret') ||
        key.includes('token') ||
        key.includes('key')
      ) {
        obj[key] = '[REDACTED]';
      } else if (
        key.includes('email') && 
        typeof obj[key] === 'string' && 
        !obj[key].includes('example.com')
      ) {
        // Replace real emails with example.com
        const [name] = obj[key].split('@');
        obj[key] = `${name}@example.com`;
      }
    }
  };
  
  if (typeof sanitized === 'object' && sanitized !== null) {
    if (Array.isArray(sanitized)) {
      sanitized.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          sanitizeObject(item);
        }
      });
    } else {
      sanitizeObject(sanitized);
    }
  }
  
  await writeFixture(filename, sanitized);
}