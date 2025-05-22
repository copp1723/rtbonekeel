/**
 * Environment Utilities
 *
 * This module provides utility functions for working with different environments
 * and ensuring proper separation between them.
 */
import { getCurrentEnvironment, isProduction, isStaging } from '../services/environmentService.js';
import { debug, info, warn, error } from '../index.js';

/**
 * Get a visual indicator for the current environment (for UI display)
 * @returns An object with color and label for the current environment
 */
export function getEnvironmentIndicator(): { color: string; label: string } {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return { color: '#ff3b30', label: 'PRODUCTION' };
    case 'staging':
      return { color: '#ff9500', label: 'STAGING' };
    case 'test':
      return { color: '#5856d6', label: 'TEST' };
    case 'development':
    default:
      return { color: '#34c759', label: 'DEVELOPMENT' };
  }
}

/**
 * Generate an environment-specific resource name
 * @param baseName The base resource name
 * @param includeEnv Whether to include the environment in the name
 * @returns The environment-specific resource name
 */
export function getResourceName(baseName: string, includeEnv: boolean = true): string {
  const env = getCurrentEnvironment();
  
  // For production, don't add a suffix unless explicitly requested
  if (env === 'production' && !includeEnv) {
    return baseName;
  }
  
  // For non-production environments, add the environment as a suffix
  const suffix = env === 'production' ? '' : `-${env}`;
  return `${baseName}${suffix}`;
}

/**
 * Get environment-specific connection string
 * @param baseConnectionString The base connection string
 * @returns The environment-specific connection string
 */
export function getConnectionString(baseConnectionString: string): string {
  const env = getCurrentEnvironment();
  
  // If the connection string already contains the environment, return as is
  if (baseConnectionString.includes(`-${env}`)) {
    return baseConnectionString;
  }
  
  // For production, use the base connection string
  if (env === 'production') {
    return baseConnectionString;
  }
  
  // For non-production, add the environment to the database name
  // This assumes a connection string format like: protocol://user:pass@host/dbname
  const parts = baseConnectionString.split('/');
  if (parts.length < 4) {
    // If the connection string doesn't match the expected format, return as is
    return baseConnectionString;
  }
  
  // Add environment to the database name
  const dbName = parts[parts.length - 1];
  parts[parts.length - 1] = `${dbName}-${env}`;
  
  return parts.join('/');
}

/**
 * Check if a resource name is for the current environment
 * @param resourceName The resource name to check
 * @returns true if the resource is for the current environment
 */
export function isResourceForCurrentEnv(resourceName: string): boolean {
  const env = getCurrentEnvironment();
  
  // Production resources don't have a suffix
  if (env === 'production') {
    return !resourceName.match(/-(?:staging|development|test)$/);
  }
  
  // Non-production resources should have the environment as a suffix
  return resourceName.endsWith(`-${env}`);
}

/**
 * Get a log prefix for the current environment
 * @returns A prefix string for log messages
 */
export function getLogPrefix(): string {
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

/**
 * Check if a URL is for the production environment
 * @param url The URL to check
 * @returns true if the URL is for production
 */
export function isProductionUrl(url: string): boolean {
  // Check for common production indicators in the URL
  return (
    url.includes('api.example.com') ||
    url.includes('production') ||
    url.includes('prod.') ||
    url.includes('.prod.') ||
    !url.includes('-staging.') &&
    !url.includes('-dev.') &&
    !url.includes('-test.')
  );
}

/**
 * Get the appropriate API endpoint for the current environment
 * @param productionUrl The production API endpoint
 * @param stagingUrl Optional staging API endpoint (defaults to production with -staging suffix)
 * @param devUrl Optional development API endpoint (defaults to production with -dev suffix)
 * @returns The appropriate API endpoint for the current environment
 */
export function getApiEndpoint(
  productionUrl: string,
  stagingUrl?: string,
  devUrl?: string
): string {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'production':
      return productionUrl;
    case 'staging':
      return stagingUrl || productionUrl.replace(/\/\/([^.]+)/, '//$1-staging');
    case 'development':
      return devUrl || productionUrl.replace(/\/\/([^.]+)/, '//$1-dev');
    case 'test':
      return productionUrl.replace(/\/\/([^.]+)/, '//$1-test');
    default:
      return productionUrl;
  }
}

export default {
  getEnvironmentIndicator,
  getResourceName,
  getConnectionString,
  isResourceForCurrentEnv,
  getLogPrefix,
  isProductionUrl,
  getApiEndpoint,
};