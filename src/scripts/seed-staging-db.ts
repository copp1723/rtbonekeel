/**
 * Staging Database Seeder
 * 
 * This script seeds the staging database with representative, non-production test data.
 * It should only be run in the staging environment.
 */
import { db } from '../index.js';
import { sql } from 'drizzle-orm';
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.staging' });

// Verify we're in staging environment
if (process.env.NODE_ENV !== 'staging') {
  error('This script should only be run in the staging environment');
  process.exit(1);
}

/**
 * Seed users table with test data
 */
async function seedUsers(): Promise<boolean> {
  try {
    info('Seeding users table...');
    
    // Clear existing test users if any
    await db.execute(sql`
      DELETE FROM users 
      WHERE email LIKE '%@example.com' 
      OR email LIKE '%@test.com'
    `);
    
    // Insert test users
    await db.execute(sql`
      INSERT INTO users (id, email, name, role, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'admin@example.com', 'Admin User', 'admin', NOW(), NOW()),
        (gen_random_uuid(), 'user1@example.com', 'Test User 1', 'user', NOW(), NOW()),
        (gen_random_uuid(), 'user2@example.com', 'Test User 2', 'user', NOW(), NOW()),
        (gen_random_uuid(), 'manager@example.com', 'Manager User', 'manager', NOW(), NOW()),
        (gen_random_uuid(), 'readonly@example.com', 'Read Only User', 'readonly', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `);
    
    info('Users seeded successfully');
    return true;
  } catch (err) {
    error({
      event: 'seed_users_error',
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 'Failed to seed users');
    return false;
  }
}

/**
 * Seed API keys table with test data
 */
async function seedApiKeys(): Promise<boolean> {
  try {
    info('Seeding API keys table...');
    
    // Clear existing test API keys
    await db.execute(sql`
      DELETE FROM api_keys 
      WHERE name LIKE 'Test%' 
      OR name LIKE 'Staging%'
    `);
    
    // Insert test API keys
    await db.execute(sql`
      INSERT INTO api_keys (
        id, 
        name, 
        key_hash, 
        created_at, 
        updated_at, 
        user_id,
        auth_tag,
        key_version,
        permissions,
        role,
        rotation_status
      )
      SELECT 
        gen_random_uuid(), 
        'Test API Key ' || u.name, 
        encode(sha256(random()::text::bytea), 'hex'), 
        NOW(), 
        NOW(), 
        u.id,
        'test_auth_tag',
        'v1',
        '{"read": true, "write": true}'::jsonb,
        u.role,
        'active'
      FROM users u
      WHERE u.email LIKE '%@example.com'
    `);
    
    info('API keys seeded successfully');
    return true;
  } catch (err) {
    error({
      event: 'seed_api_keys_error',
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 'Failed to seed API keys');
    return false;
  }
}

/**
 * Configure third-party integrations to use test endpoints
 */
async function configureTestIntegrations(): Promise<boolean> {
  try {
    info('Configuring third-party integrations for test environment...');
    
    // Create or update integration_config table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS integration_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        config JSONB NOT NULL,
        environment VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Insert or update test integration configurations
    await db.execute(sql`
      INSERT INTO integration_config (name, config, environment, created_at, updated_at)
      VALUES 
        (
          'openai', 
          '{"api_url": "https://api.openai-staging.com/v1", "use_mock": true}'::jsonb, 
          'staging', 
          NOW(), 
          NOW()
        ),
        (
          'sendgrid', 
          '{"api_url": "https://api.sendgrid-staging.com/v3", "use_mock": true}'::jsonb, 
          'staging', 
          NOW(), 
          NOW()
        ),
        (
          'datadog', 
          '{"api_url": "https://api.datadoghq-staging.com", "use_mock": true}'::jsonb, 
          'staging', 
          NOW(), 
          NOW()
        )
      ON CONFLICT (name) 
      DO UPDATE SET 
        config = EXCLUDED.config,
        updated_at = NOW()
    `);
    
    info('Third-party integrations configured successfully');
    return true;
  } catch (err) {
    error({
      event: 'configure_integrations_error',
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 'Failed to configure third-party integrations');
    return false;
  }
}

/**
 * Main function to run all seeders
 */
async function seedStagingDatabase(): Promise<void> {
  info({
    event: 'staging_db_seed_started',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }, '🌱 Starting staging database seed process');

  try {
    // Run seeders
    const userResult = await seedUsers();
    const apiKeyResult = await seedApiKeys();
    const integrationResult = await configureTestIntegrations();
    
    // Check results
    if (userResult && apiKeyResult && integrationResult) {
      info({
        event: 'staging_db_seed_completed',
        timestamp: new Date().toISOString(),
        success: true,
      }, '✅ Staging database seeded successfully');
    } else {
      warn({
        event: 'staging_db_seed_partial',
        timestamp: new Date().toISOString(),
        userSeedSuccess: userResult,
        apiKeySeedSuccess: apiKeyResult,
        integrationConfigSuccess: integrationResult,
      }, '⚠️ Staging database seed completed with some failures');
    }
  } catch (err) {
    error({
      event: 'staging_db_seed_failed',
      timestamp: new Date().toISOString(),
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, '❌ Staging database seed failed');
    process.exit(1);
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedStagingDatabase()
    .then(() => {
      info('Seed process completed');
      process.exit(0);
    })
    .catch((err) => {
      error('Seed process failed', {
        error: isError(err) ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      process.exit(1);
    });
}

// Export for testing and programmatic use
export {
  seedStagingDatabase,
  seedUsers,
  seedApiKeys,
  configureTestIntegrations,
};