/**
 * Notification Configuration
 *
 * This module provides configuration for notification channels and alert levels
 * with different settings for development, staging, and production environments.
 */
import { z } from 'zod';
import { debug, info, warn, error } from '../index.js';
import { getCurrentEnvironment } from '../services/environmentService.js';

// Notification channel configuration schema
export const NotificationChannelSchema = z.object({
  email: z.boolean().default(false),
  slack: z.boolean().default(false),
  sentry: z.boolean().default(true),
  datadog: z.boolean().default(true),
  console: z.boolean().default(true),
});
export type NotificationChannelConfig = z.infer<typeof NotificationChannelSchema>;

// Alert threshold configuration schema
export const AlertThresholdSchema = z.object({
  debug: z.number().min(0).default(0),
  info: z.number().min(0).default(0),
  warning: z.number().min(0).default(0),
  error: z.number().min(0).default(0),
  critical: z.number().min(0).default(0),
});
export type AlertThresholdConfig = z.infer<typeof AlertThresholdSchema>;

// Notification recipients configuration schema
export const NotificationRecipientsSchema = z.object({
  email: z.array(z.string().email()).default([]),
  slack: z.array(z.string()).default([]),
});
export type NotificationRecipientsConfig = z.infer<typeof NotificationRecipientsSchema>;

// Complete notification configuration schema
export const NotificationConfigSchema = z.object({
  channels: NotificationChannelSchema.default({}),
  thresholds: AlertThresholdSchema.default({}),
  recipients: NotificationRecipientsSchema.default({}),
});
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;

// Environment-specific notification configurations
const developmentConfig: NotificationConfig = {
  channels: {
    email: false,      // No emails in development
    slack: false,      // No Slack in development
    sentry: true,      // Sentry enabled for tracking errors
    datadog: true,     // DataDog enabled for metrics
    console: true,     // Console logging always enabled
  },
  thresholds: {
    debug: 0,          // Log everything in development
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  },
  recipients: {
    email: ['dev-team@example.com'],
    slack: ['#dev-alerts'],
  },
};

const stagingConfig: NotificationConfig = {
  channels: {
    email: true,       // Email enabled but limited
    slack: true,       // Slack enabled
    sentry: true,      // Sentry enabled
    datadog: true,     // DataDog enabled
    console: true,     // Console logging enabled
  },
  thresholds: {
    debug: 100,        // Higher thresholds to reduce noise
    info: 50,
    warning: 10,
    error: 1,          // Still alert on errors
    critical: 0,       // Always alert on critical issues
  },
  recipients: {
    email: ['staging-alerts@example.com', 'dev-team@example.com'],
    slack: ['#staging-alerts'],
  },
};

const productionConfig: NotificationConfig = {
  channels: {
    email: true,       // Email fully enabled
    slack: true,       // Slack fully enabled
    sentry: true,      // Sentry enabled
    datadog: true,     // DataDog enabled
    console: true,     // Console logging enabled
  },
  thresholds: {
    debug: 1000,       // Very high threshold to avoid noise
    info: 500,
    warning: 50,
    error: 1,          // Alert on all errors
    critical: 0,       // Always alert on critical issues
  },
  recipients: {
    email: ['prod-alerts@example.com', 'oncall@example.com'],
    slack: ['#prod-alerts', '#oncall'],
  },
};

const testConfig: NotificationConfig = {
  channels: {
    email: false,      // No emails in test
    slack: false,      // No Slack in test
    sentry: false,     // No Sentry in test
    datadog: false,    // No DataDog in test
    console: true,     // Console logging enabled
  },
  thresholds: {
    debug: 0,          // Log everything in test
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  },
  recipients: {
    email: [],
    slack: [],
  },
};

// Map of environment-specific configurations
const environmentConfigs: Record<string, NotificationConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
  test: testConfig,
};

/**
 * Load notification configuration from environment variables
 * @returns The notification configuration for the current environment
 */
export function loadNotificationConfig(): NotificationConfig {
  try {
    const env = getCurrentEnvironment();
    const baseConfig = environmentConfigs[env] || developmentConfig;
    
    // Override with environment variables if provided
    const channels = { ...baseConfig.channels };
    const thresholds = { ...baseConfig.thresholds };
    const recipients = { ...baseConfig.recipients };
    
    // Override channels from environment variables
    if (process.env.NOTIFICATION_EMAIL_ENABLED) {
      channels.email = process.env.NOTIFICATION_EMAIL_ENABLED === 'true';
    }
    
    if (process.env.NOTIFICATION_SLACK_ENABLED) {
      channels.slack = process.env.NOTIFICATION_SLACK_ENABLED === 'true';
    }
    
    if (process.env.NOTIFICATION_SENTRY_ENABLED) {
      channels.sentry = process.env.NOTIFICATION_SENTRY_ENABLED === 'true';
    }
    
    if (process.env.NOTIFICATION_DATADOG_ENABLED) {
      channels.datadog = process.env.NOTIFICATION_DATADOG_ENABLED === 'true';
    }
    
    // Override thresholds from environment variables
    if (process.env.NOTIFICATION_THRESHOLD_DEBUG) {
      thresholds.debug = parseInt(process.env.NOTIFICATION_THRESHOLD_DEBUG, 10);
    }
    
    if (process.env.NOTIFICATION_THRESHOLD_INFO) {
      thresholds.info = parseInt(process.env.NOTIFICATION_THRESHOLD_INFO, 10);
    }
    
    if (process.env.NOTIFICATION_THRESHOLD_WARNING) {
      thresholds.warning = parseInt(process.env.NOTIFICATION_THRESHOLD_WARNING, 10);
    }
    
    if (process.env.NOTIFICATION_THRESHOLD_ERROR) {
      thresholds.error = parseInt(process.env.NOTIFICATION_THRESHOLD_ERROR, 10);
    }
    
    if (process.env.NOTIFICATION_THRESHOLD_CRITICAL) {
      thresholds.critical = parseInt(process.env.NOTIFICATION_THRESHOLD_CRITICAL, 10);
    }
    
    // Override recipients from environment variables
    if (process.env.NOTIFICATION_EMAIL_RECIPIENTS) {
      recipients.email = process.env.NOTIFICATION_EMAIL_RECIPIENTS.split(',').map(email => email.trim());
    }
    
    if (process.env.NOTIFICATION_SLACK_CHANNELS) {
      recipients.slack = process.env.NOTIFICATION_SLACK_CHANNELS.split(',').map(channel => channel.trim());
    }
    
    // Validate and return the configuration
    return NotificationConfigSchema.parse({
      channels,
      thresholds,
      recipients,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      error('Notification configuration validation failed:', {
        issues: err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    } else {
      error('Failed to load notification configuration:', err);
    }
    
    // Return default configuration for the current environment
    const env = getCurrentEnvironment();
    return environmentConfigs[env] || developmentConfig;
  }
}

// Export the notification configuration
const notificationConfig = loadNotificationConfig();
export default notificationConfig;