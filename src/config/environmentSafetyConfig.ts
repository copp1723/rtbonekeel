/**
 * Environment Safety Configuration
 *
 * This module provides configuration for environment safety checks
 * to prevent accidental production impact from test/staging environments.
 */
import { z } from 'zod';
import { debug, info, warn, error } from '../index.js';
import { getCurrentEnvironment } from '../services/environmentService.js';
import { SafetyCheckOperation } from '../services/environmentSafetyService.js';

// Environment safety configuration schema
export const EnvironmentSafetyConfigSchema = z.object({
  enabled: z.boolean().default(true),
  allowCrossEnvironmentOperations: z.boolean().default(false),
  operationRestrictions: z.record(z.object({
    allowedEnvironments: z.array(z.string()).default(['development', 'staging', 'production']),
    requiresConfirmation: z.boolean().default(true),
    requiresAudit: z.boolean().default(true),
    description: z.string(),
  })),
  auditLogRetentionDays: z.number().min(1).default(90),
});
export type EnvironmentSafetyConfig = z.infer<typeof EnvironmentSafetyConfigSchema>;

// Default operation restrictions
const defaultOperationRestrictions: Record<SafetyCheckOperation, {
  allowedEnvironments: string[];
  requiresConfirmation: boolean;
  requiresAudit: boolean;
  description: string;
}> = {
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

/**
 * Load environment safety configuration from environment variables
 * @returns The environment safety configuration
 */
export function loadEnvironmentSafetyConfig(): EnvironmentSafetyConfig {
  try {
    // Start with default operation restrictions
    const operationRestrictions = { ...defaultOperationRestrictions };
    
    // Override with environment variables
    const enabled = process.env.SAFETY_CHECKS_ENABLED !== 'false';
    const allowCrossEnvironmentOperations = process.env.ALLOW_CROSS_ENV_OPERATIONS === 'true';
    const auditLogRetentionDays = process.env.AUDIT_LOG_RETENTION_DAYS
      ? parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10)
      : 90;
    
    // Validate and return the configuration
    return EnvironmentSafetyConfigSchema.parse({
      enabled,
      allowCrossEnvironmentOperations,
      operationRestrictions,
      auditLogRetentionDays,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      error('Environment safety configuration validation failed:', {
        issues: err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    } else {
      error('Failed to load environment safety configuration:', err);
    }
    
    // Return default configuration
    return EnvironmentSafetyConfigSchema.parse({
      enabled: true,
      allowCrossEnvironmentOperations: false,
      operationRestrictions: defaultOperationRestrictions,
      auditLogRetentionDays: 90,
    });
  }
}

// Export the environment safety configuration
const environmentSafetyConfig = loadEnvironmentSafetyConfig();
export default environmentSafetyConfig;