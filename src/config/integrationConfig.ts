/**
 * Integration Configuration
 * 
 * This module provides configuration for third-party integrations,
 * with environment-specific settings (production, staging, development).
 * For staging, it uses test/mock endpoints instead of production ones.
 */
import { db } from '../index.js';
import { sql } from 'drizzle-orm';
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';

// Integration configuration interface
export interface IntegrationConfig {
  apiUrl: string;
  useMock: boolean;
  timeout?: number;
  retries?: number;
  [key: string]: any;
}

// Integration types
export type IntegrationType = 'openai' | 'sendgrid' | 'datadog';

// Cache for integration configs
const configCache: Record<string, IntegrationConfig> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let lastCacheRefresh = 0;

/**
 * Get configuration for a specific integration
 * @param name Integration name
 * @returns Integration configuration
 */
export async function getIntegrationConfig(name: IntegrationType): Promise<IntegrationConfig> {
  const environment = process.env.NODE_ENV || 'development';
  const cacheKey = `${name}:${environment}`;
  
  // Check if we need to refresh the cache
  const now = Date.now();
  if (now - lastCacheRefresh > CACHE_TTL || !configCache[cacheKey]) {
    await refreshConfigCache();
  }
  
  // Return from cache if available
  if (configCache[cacheKey]) {
    return configCache[cacheKey];
  }
  
  // Return default config if not in cache
  return getDefaultConfig(name, environment);
}

/**
 * Refresh the configuration cache from the database
 */
async function refreshConfigCache(): Promise<void> {
  const environment = process.env.NODE_ENV || 'development';
  
  try {
    // Query the database for all integration configs for this environment
    const results = await db.execute(sql`
      SELECT name, config
      FROM integration_config
      WHERE environment = ${environment}
    `);
    
    // Update the cache
    for (const row of results) {
      const name = row.name as string;
      const config = row.config as Record<string, any>;
      const cacheKey = `${name}:${environment}`;
      
      configCache[cacheKey] = {
        apiUrl: config.api_url || '',
        useMock: config.use_mock || false,
        timeout: config.timeout || 30000,
        retries: config.retries || 3,
        ...config
      };
    }
    
    lastCacheRefresh = Date.now();
    debug(`Refreshed integration config cache for ${environment} environment`);
  } catch (err) {
    error({
      event: 'integration_config_refresh_error',
      error: isError(err) ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, 'Failed to refresh integration configuration cache');
    
    // Don't throw, just log the error
  }
}

/**
 * Get default configuration for an integration
 * @param name Integration name
 * @param environment Current environment
 * @returns Default integration configuration
 */
function getDefaultConfig(name: IntegrationType, environment: string): IntegrationConfig {
  // For staging environment, always use test/mock endpoints
  if (environment === 'staging') {
    switch (name) {
      case 'openai':
        return {
          apiUrl: 'https://api.openai-staging.com/v1',
          useMock: true,
          timeout: 10000,
          retries: 2
        };
      case 'sendgrid':
        return {
          apiUrl: 'https://api.sendgrid-staging.com/v3',
          useMock: true,
          timeout: 5000,
          retries: 2
        };
      case 'datadog':
        return {
          apiUrl: 'https://api.datadoghq-staging.com',
          useMock: true,
          timeout: 5000,
          retries: 1
        };
      default:
        return {
          apiUrl: '',
          useMock: true,
          timeout: 5000,
          retries: 2
        };
    }
  }
  
  // For production, use real endpoints
  if (environment === 'production') {
    switch (name) {
      case 'openai':
        return {
          apiUrl: 'https://api.openai.com/v1',
          useMock: false,
          timeout: 30000,
          retries: 3
        };
      case 'sendgrid':
        return {
          apiUrl: 'https://api.sendgrid.com/v3',
          useMock: false,
          timeout: 10000,
          retries: 3
        };
      case 'datadog':
        return {
          apiUrl: 'https://api.datadoghq.com',
          useMock: false,
          timeout: 10000,
          retries: 2
        };
      default:
        return {
          apiUrl: '',
          useMock: false,
          timeout: 10000,
          retries: 3
        };
    }
  }
  
  // For development, use test endpoints but with more lenient timeouts
  switch (name) {
    case 'openai':
      return {
        apiUrl: 'https://api.openai-dev.com/v1',
        useMock: true,
        timeout: 60000,
        retries: 5
      };
    case 'sendgrid':
      return {
        apiUrl: 'https://api.sendgrid-dev.com/v3',
        useMock: true,
        timeout: 30000,
        retries: 5
      };
    case 'datadog':
      return {
        apiUrl: 'https://api.datadoghq-dev.com',
        useMock: true,
        timeout: 30000,
        retries: 3
      };
    default:
      return {
        apiUrl: '',
        useMock: true,
        timeout: 30000,
        retries: 5
      };
  }
}

/**
 * Force refresh of the integration configuration cache
 */
export async function refreshIntegrationConfigs(): Promise<void> {
  lastCacheRefresh = 0;
  await refreshConfigCache();
}

export default {
  getIntegrationConfig,
  refreshIntegrationConfigs
};