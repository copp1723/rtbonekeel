/**
 * Notification Service
 *
 * This service provides functionality for sending notifications through various channels
 * with environment-specific configurations for staging and production environments.
 */
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';
import { sendAdminAlert, sendImmediateAdminAlert, AlertSeverity } from './alertMailer.js';
import * as sentryService from './sentryService.js';
import * as datadogService from './datadogService.js';
import { getCurrentEnvironment, isProduction, isStaging, getEnvConfig } from './environmentService.js';

// Notification channel types
export type NotificationChannel = 'email' | 'slack' | 'sentry' | 'datadog' | 'console';

// Alert level types
export type AlertLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// Notification configuration by environment
interface NotificationConfig {
  channels: {
    [channel in NotificationChannel]: boolean;
  };
  thresholds: {
    [level in AlertLevel]: number;
  };
  recipients: {
    email: string[];
    slack: string[];
  };
}

// Default notification configurations by environment
const notificationConfigs: Record<string, NotificationConfig> = {
  development: {
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
  },
  staging: {
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
  },
  production: {
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
  },
  test: {
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
  },
};

// Counter for alerts by level
const alertCounts: Record<AlertLevel, number> = {
  debug: 0,
  info: 0,
  warning: 0,
  error: 0,
  critical: 0,
};

// Initialize with environment variables
function loadNotificationConfig(): void {
  const env = getCurrentEnvironment();
  const config = notificationConfigs[env];
  
  // Override with environment variables if provided
  if (process.env.NOTIFICATION_EMAIL_ENABLED) {
    config.channels.email = process.env.NOTIFICATION_EMAIL_ENABLED === 'true';
  }
  
  if (process.env.NOTIFICATION_SLACK_ENABLED) {
    config.channels.slack = process.env.NOTIFICATION_SLACK_ENABLED === 'true';
  }
  
  if (process.env.NOTIFICATION_SENTRY_ENABLED) {
    config.channels.sentry = process.env.NOTIFICATION_SENTRY_ENABLED === 'true';
  }
  
  if (process.env.NOTIFICATION_DATADOG_ENABLED) {
    config.channels.datadog = process.env.NOTIFICATION_DATADOG_ENABLED === 'true';
  }
  
  // Load thresholds from environment variables
  if (process.env.NOTIFICATION_THRESHOLD_DEBUG) {
    config.thresholds.debug = parseInt(process.env.NOTIFICATION_THRESHOLD_DEBUG, 10);
  }
  
  if (process.env.NOTIFICATION_THRESHOLD_INFO) {
    config.thresholds.info = parseInt(process.env.NOTIFICATION_THRESHOLD_INFO, 10);
  }
  
  if (process.env.NOTIFICATION_THRESHOLD_WARNING) {
    config.thresholds.warning = parseInt(process.env.NOTIFICATION_THRESHOLD_WARNING, 10);
  }
  
  if (process.env.NOTIFICATION_THRESHOLD_ERROR) {
    config.thresholds.error = parseInt(process.env.NOTIFICATION_THRESHOLD_ERROR, 10);
  }
  
  if (process.env.NOTIFICATION_THRESHOLD_CRITICAL) {
    config.thresholds.critical = parseInt(process.env.NOTIFICATION_THRESHOLD_CRITICAL, 10);
  }
  
  // Load recipients from environment variables
  if (process.env.NOTIFICATION_EMAIL_RECIPIENTS) {
    config.recipients.email = process.env.NOTIFICATION_EMAIL_RECIPIENTS.split(',').map(email => email.trim());
  }
  
  if (process.env.NOTIFICATION_SLACK_CHANNELS) {
    config.recipients.slack = process.env.NOTIFICATION_SLACK_CHANNELS.split(',').map(channel => channel.trim());
  }
  
  info(`Notification service configured for ${env} environment`);
}

/**
 * Get the current notification configuration
 * @returns The notification configuration for the current environment
 */
export function getNotificationConfig(): NotificationConfig {
  const env = getCurrentEnvironment();
  return notificationConfigs[env];
}

/**
 * Check if a notification channel is enabled
 * @param channel The notification channel to check
 * @returns true if the channel is enabled
 */
export function isChannelEnabled(channel: NotificationChannel): boolean {
  const config = getNotificationConfig();
  return config.channels[channel];
}

/**
 * Check if an alert should be sent based on level and threshold
 * @param level The alert level
 * @returns true if the alert should be sent
 */
export function shouldSendAlert(level: AlertLevel): boolean {
  const config = getNotificationConfig();
  const count = alertCounts[level]++;
  
  // If count is below threshold, don't send
  if (count < config.thresholds[level]) {
    return false;
  }
  
  // Reset count after sending
  alertCounts[level] = 0;
  return true;
}

/**
 * Map alert level to Sentry severity
 * @param level The alert level
 * @returns The corresponding Sentry severity
 */
function mapToSentrySeverity(level: AlertLevel): sentryService.SeverityLevel {
  switch (level) {
    case 'debug':
      return 'debug';
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'critical':
      return 'fatal';
    default:
      return 'info';
  }
}

/**
 * Map alert level to alert mailer severity
 * @param level The alert level
 * @returns The corresponding alert mailer severity
 */
function mapToAlertMailerSeverity(level: AlertLevel): AlertSeverity {
  switch (level) {
    case 'debug':
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
    case 'critical':
      return 'critical';
    default:
      return 'info';
  }
}

/**
 * Send a notification
 * @param message The notification message
 * @param level The alert level
 * @param details Additional details
 * @param channels Override which channels to use (optional)
 */
export async function sendNotification(
  message: string,
  level: AlertLevel = 'info',
  details: Record<string, any> = {},
  channels?: NotificationChannel[]
): Promise<void> {
  try {
    // Check if we should send this alert based on thresholds
    if (!shouldSendAlert(level)) {
      return;
    }
    
    const config = getNotificationConfig();
    const env = getCurrentEnvironment();
    
    // Add environment to details
    const enrichedDetails = {
      ...details,
      environment: env,
    };
    
    // Determine which channels to use
    const useChannels = channels || Object.keys(config.channels).filter(
      channel => config.channels[channel as NotificationChannel]
    ) as NotificationChannel[];
    
    // Send to each enabled channel
    for (const channel of useChannels) {
      switch (channel) {
        case 'email':
          if (config.channels.email) {
            if (level === 'critical') {
              await sendImmediateAdminAlert(
                `[${env.toUpperCase()}] ${message}`,
                mapToAlertMailerSeverity(level),
                {
                  subject: `[${env.toUpperCase()}] Critical Alert: ${message}`,
                  details: enrichedDetails,
                }
              );
            } else {
              await sendAdminAlert(
                `[${env.toUpperCase()}] ${message}`,
                mapToAlertMailerSeverity(level),
                {
                  subject: `[${env.toUpperCase()}] ${level.toUpperCase()}: ${message}`,
                  details: enrichedDetails,
                }
              );
            }
          }
          break;
          
        case 'slack':
          // Slack integration would go here
          // This is a placeholder as the actual implementation depends on your Slack setup
          if (config.channels.slack) {
            debug(`Would send Slack notification to ${config.recipients.slack.join(', ')}: ${message}`);
          }
          break;
          
        case 'sentry':
          if (config.channels.sentry) {
            sentryService.captureMessage(message, mapToSentrySeverity(level), enrichedDetails);
          }
          break;
          
        case 'datadog':
          if (config.channels.datadog) {
            datadogService.incrementMetric('notifications', 1, [
              `level:${level}`,
              `environment:${env}`,
            ]);
          }
          break;
          
        case 'console':
          // Always log to console
          switch (level) {
            case 'debug':
              debug(enrichedDetails, message);
              break;
            case 'info':
              info(enrichedDetails, message);
              break;
            case 'warning':
              warn(enrichedDetails, message);
              break;
            case 'error':
            case 'critical':
              error(enrichedDetails, message);
              break;
          }
          break;
      }
    }
  } catch (err) {
    error(`Failed to send notification: ${isError(err) ? err.message : String(err)}`);
  }
}

/**
 * Initialize the notification service
 */
export function initialize(): void {
  loadNotificationConfig();
  
  const env = getCurrentEnvironment();
  const config = getNotificationConfig();
  
  info({
    environment: env,
    channels: config.channels,
    thresholds: config.thresholds,
  }, `Notification service initialized for ${env} environment`);
}

export default {
  initialize,
  sendNotification,
  isChannelEnabled,
  shouldSendAlert,
  getNotificationConfig,
};