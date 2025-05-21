#!/usr/bin/env node

/**
 * Script to reset and reseed the test database
 * Usage: node reset-test-db.js [--fixtures=users,reports]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const postgres = require('postgres');

// Parse command line arguments
const args = process.argv.slice(2);
let fixtures = ['users', 'reports']; // Default fixtures to load

// Check for --fixtures argument
const fixturesArg = args.find(arg => arg.startsWith('--fixtures='));
if (fixturesArg) {
  fixtures = fixturesArg.replace('--fixtures=', '').split(',');
}

// Database connection
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

async function resetTestDatabase() {
  console.log('Resetting test database...');
  
  try {
    // Connect to the database
    const sql = postgres(TEST_DB_URL);
    
    // Create a unique schema name for isolation
    const schemaName = `test_${Date.now()}`;
    
    console.log(`Creating schema: ${schemaName}`);
    await sql`CREATE SCHEMA IF NOT EXISTS ${sql(schemaName)}`;
    
    // Set the search path to the new schema
    await sql`SET search_path TO ${sql(schemaName)}, public`;
    
    // Run migrations
    console.log('Running migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });
    
    // Load fixtures
    console.log('Loading fixtures...');
    for (const fixture of fixtures) {
      const fixturePath = path.join(__dirname, '../tests/fixtures', `${fixture}.json`);
      
      if (fs.existsSync(fixturePath)) {
        const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
        
        if (Array.isArray(fixtureData) && fixtureData.length > 0) {
          console.log(`Loading fixture: ${fixture}`);
          
          // Insert fixture data
          for (const record of fixtureData) {
            const columns = Object.keys(record);
            const values = Object.values(record);
            
            await sql`
              INSERT INTO ${sql(fixture)} ${sql(columns)}
              VALUES ${sql(values)}
            `;
          }
          
          console.log(`Loaded ${fixtureData.length} records into ${fixture}`);
        }
      } else {
        console.warn(`Fixture file not found: ${fixturePath}`);
      }
    }
    
    console.log('Test database reset complete!');
    console.log(`Schema: ${schemaName}`);
    
    // Close the connection
    await sql.end();
    
    return schemaName;
  } catch (error) {
    console.error('Error resetting test database:', error);
    process.exit(1);
  }
}

// Run the script
resetTestDatabase().catch(console.error);