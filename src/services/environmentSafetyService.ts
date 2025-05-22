/**
 * Environment Safety Service
 *
 * This service provides safeguards to prevent accidental production impact
 * from test or staging environments. It implements checks and validations
 * to ensure that operations are only performed in the appropriate environment.
 */
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';
import { getCurrentEnvironment, isProduction, isStaging, isDevelopment } from './environmentService.js';
import { sendNotification } from './notificationService.js';

// Define operation types that require environment safety checks
export type SafetyCheckOperation = 
  | 'database_migration'
  | 'data_deletion'
  | 'mass_email'
  | 'api_key_rotation'
  | 'config_update'
  | 'service_restart'
  | 'external_api_call'
  | 'scheduled_job'
  | 'user_import'
  | 'data_export'
  | 'custom';

// Environment restrictions for operations
interface OperationRestriction {
  allowedEnvironments: string[];
  requiresConfirmation: boolean;
  requiresAudit: boolean;
  description: string;
}

// Define restrictions for each operation type
const operationRestrictions: Record<SafetyCheckOperation, OperationRestriction> = {
  database_migration: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'Database schema migration',
  },
  data_deletion: {
    allowedEnvironments: ['development', 'staging'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'Bulk data deletion',
  },
  mass_email: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'Mass email sending',
  },
  api_key_rotation: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'API key rotation',
  },
  config_update: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'System configuration update',
  },
  service_restart: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'Service restart',
  },
  external_api_call: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: false,
    requiresAudit: true,
    description: 'External API call',
  },
  scheduled_job: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: false,
    requiresAudit: true,
    description: 'Scheduled job execution',
  },
  user_import: {
    allowedEnvironments: ['development', 'staging'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'User data import',
  },
  data_export: {
    allowedEnvironments: ['development', 'staging', 'production'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'Data export',
  },
  custom: {
    allowedEnvironments: ['development'],
    requiresConfirmation: true,
    requiresAudit: true,
    description: 'Custom operation',
  },
};

// Track operations for auditing
const operationLog: Array<{
  operation: SafetyCheckOperation;
  environment: string;
  timestamp: Date;
  allowed: boolean;
  details?: Record<string, any>;
}> = [];

/**
 * Check if an operation is allowed in the current environment
 * @param operation The operation to check
 * @param customAllowedEnvironments Optional override for allowed environments
 * @returns true if the operation is allowed
 */
export function isOperationAllowed(
  operation: SafetyCheckOperation,
  customAllowedEnvironments?: string[]
): boolean {
  const currentEnv = getCurrentEnvironment();
  const restriction = operationRestrictions[operation];
  
  // Use custom allowed environments if provided
  const allowedEnvironments = customAllowedEnvironments || restriction.allowedEnvironments;
  
  return allowedEnvironments.includes(currentEnv);
}

/**
 * Check if an operation requires confirmation
 * @param operation The operation to check
 * @returns true if confirmation is required
 */
export function requiresConfirmation(operation: SafetyCheckOperation): boolean {
  return operationRestrictions[operation].requiresConfirmation;
}

/**
 * Perform a safety check for an operation
 * @param operation The operation to check
 * @param details Additional details about the operation
 * @param customAllowedEnvironments Optional override for allowed environments
 * @returns true if the operation is allowed
 * @throws Error if the operation is not allowed
 */
export async function performSafetyCheck(
  operation: SafetyCheckOperation,
  details: Record<string, any> = {},
  customAllowedEnvironments?: string[]
): Promise<boolean> {
  const currentEnv = getCurrentEnvironment();
  const allowed = isOperationAllowed(operation, customAllowedEnvironments);
  const restriction = operationRestrictions[operation];
  
  // Log the operation attempt
  operationLog.push({
    operation,
    environment: currentEnv,
    timestamp: new Date(),
    allowed,
    details,
  });
  
  // If not allowed, send notification and throw error
  if (!allowed) {
    const message = `Operation "${restriction.description}" is not allowed in ${currentEnv} environment`;
    
    // Send notification
    await sendNotification(
      message,
      'error',
      {
        operation,
        environment: currentEnv,
        allowedEnvironments: customAllowedEnvironments || restriction.allowedEnvironments,
        details,
      }
    );
    
    throw new Error(message);
  }
  
  // If allowed but requires audit, log it
  if (restriction.requiresAudit) {
    info({
      event: 'environment_safety_check',
      operation,
      environment: currentEnv,
      allowed: true,
      details,
    }, `Operation "${restriction.description}" allowed in ${currentEnv} environment`);
  }
  
  return true;
}

/**
 * Verify that a cross-environment operation is safe
 * @param sourceEnv The source environment
 * @param targetEnv The target environment
 * @param operation The operation to check
 * @param details Additional details about the operation
 * @returns true if the operation is safe
 * @throws Error if the operation is not safe
 */
export async function verifyCrossEnvironmentSafety(
  sourceEnv: string,
  targetEnv: string,
  operation: SafetyCheckOperation,
  details: Record<string, any> = {}
): Promise<boolean> {
  const currentEnv = getCurrentEnvironment();
  
  // Verify that we're running in the source environment
  if (currentEnv !== sourceEnv) {
    const message = `Cross-environment operation must be initiated from ${sourceEnv} environment, but current environment is ${currentEnv}`;
    
    await sendNotification(
      message,
      'error',
      {
        operation,
        sourceEnv,
        targetEnv,
        currentEnv,
        details,
      }
    );
    
    throw new Error(message);
  }
  
  // Check for dangerous operations
  if (targetEnv === 'production' && sourceEnv !== 'staging') {
    const message = `Production operations can only be initiated from staging environment`;
    
    await sendNotification(
      message,
      'error',
      {
        operation,
        sourceEnv,
        targetEnv,
        details,
      }
    );
    
    throw new Error(message);
  }
  
  // Log the cross-environment operation
  info({
    event: 'cross_environment_operation',
    operation,
    sourceEnv,
    targetEnv,
    details,
  }, `Cross-environment operation "${operationRestrictions[operation].description}" from ${sourceEnv} to ${targetEnv}`);
  
  return true;
}

/**
 * Prevent accidental production impact from test/staging
 * @param operation The operation to check
 * @param details Additional details about the operation
 * @returns true if the operation is safe
 * @throws Error if the operation could impact production
 */
export async function preventProductionImpact(
  operation: SafetyCheckOperation,
  details: Record<string, any> = {}
): Promise<boolean> {
  const currentEnv = getCurrentEnvironment();
  
  // If we're in production, no need for this check
  if (isProduction()) {
    return true;
  }
  
  // Check if the operation could impact production
  const couldImpactProduction = details.targetEnvironment === 'production' ||
    details.affectsProduction === true ||
    details.productionEndpoint ||
    details.productionDatabase ||
    details.productionResources;
  
  if (couldImpactProduction) {
    const message = `Operation "${operationRestrictions[operation].description}" in ${currentEnv} environment could impact production`;
    
    await sendNotification(
      message,
      'critical',
      {
        operation,
        environment: currentEnv,
        details,
      }
    );
    
    throw new Error(message);
  }
  
  return true;
}

/**
 * Get the operation log for auditing
 * @returns The operation log
 */
export function getOperationLog(): typeof operationLog {
  return [...operationLog];
}

/**
 * Clear the operation log
 */
export function clearOperationLog(): void {
  operationLog.length = 0;
}

export default {
  isOperationAllowed,
  requiresConfirmation,
  performSafetyCheck,
  verifyCrossEnvironmentSafety,
  preventProductionImpact,
  getOperationLog,
  clearOperationLog,
};