/**
 * Environment Service
 *
 * This service provides utilities for environment detection and configuration.
 * It helps determine the current environment (development, staging, production)
 * and provides environment-specific configuration options.
 */
import { debug, info, warn, error } from '../index.js';

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Get the current environment
 * @returns The current environment (development, staging, production, test)
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NODE_ENV?.toLowerCase() || 'development';
  
  // Map NODE_ENV to our environment types
  if (env === 'production') {
    return 'production';
  } else if (env === 'staging' || env === 'preprod') {
    return 'staging';
  } else if (env === 'test') {
    return 'test';
  } else {
    return 'development';
  }
}

/**
 * Check if the current environment is production
 * @returns true if the current environment is production
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === 'production';
}

/**
 * Check if the current environment is staging
 * @returns true if the current environment is staging
 */
export function isStaging(): boolean {
  return getCurrentEnvironment() === 'staging';
}

/**
 * Check if the current environment is development
 * @returns true if the current environment is development
 */
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === 'development';
}

/**
 * Check if the current environment is test
 * @returns true if the current environment is test
 */
export function isTest(): boolean {
  return getCurrentEnvironment() === 'test';
}

/**
 * Get environment-specific configuration
 * @param devValue Value for development environment
 * @param stagingValue Value for staging environment
 * @param prodValue Value for production environment
 * @param testValue Value for test environment (defaults to development value if not provided)
 * @returns The appropriate value for the current environment
 */
export function getEnvConfig<T>(
  devValue: T,
  stagingValue: T,
  prodValue: T,
  testValue: T = devValue
): T {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return prodValue;
    case 'staging':
      return stagingValue;
    case 'test':
      return testValue;
    case 'development':
    default:
      return devValue;
  }
}

/**
 * Get the environment name with a prefix for logging and display
 * @returns Environment name with prefix (e.g., "[PROD]", "[STAGING]", etc.)
 */
export function getEnvironmentPrefix(): string {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return '[PROD]';
    case 'staging':
      return '[STAGING]';
    case 'test':
      return '[TEST]';
    case 'development':
    default:
      return '[DEV]';
  }
}

export default {
  getCurrentEnvironment,
  isProduction,
  isStaging,
  isDevelopment,
  isTest,
  getEnvConfig,
  getEnvironmentPrefix,
};