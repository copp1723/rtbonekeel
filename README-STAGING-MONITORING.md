# Staging Monitoring and Error Reporting Setup

This document outlines the monitoring and error reporting configuration for the staging environment.

## Overview

The staging environment has been configured with comprehensive monitoring and error reporting using:

1. **Sentry** - For error tracking and performance monitoring
2. **DataDog** - For metrics, APM, and system monitoring
3. **Health Checks** - For service availability monitoring
4. **Monitoring Dashboards** - For visualizing system health and performance

## Configuration

### Environment Variables

The staging environment uses the `.env.staging` file with the following monitoring-specific variables:

```
# Monitoring Configuration
MONITORING_ENABLED="true"

# Sentry Configuration
SENTRY_DSN="https://your-staging-sentry-dsn"
SENTRY_ENVIRONMENT="staging"
SENTRY_TRACES_SAMPLE_RATE="0.5"
SENTRY_PROFILES_SAMPLE_RATE="0.2"

# DataDog Configuration
DD_API_KEY="your-datadog-api-key"
DD_APP_KEY="your-datadog-app-key"
DD_SERVICE="agentflow"
DD_ENV="staging"
DD_AGENT_HOST="localhost"
DD_METRIC_INTERVAL="10"
DD_LOGS_INJECTION="true"
DD_RUNTIME_METRICS_ENABLED="true"

# Alert Thresholds
ERROR_RATE_THRESHOLD="0.1"
DB_QUERY_DURATION_THRESHOLD="1500"
API_RESPONSE_TIME_THRESHOLD="3000"
MEMORY_USAGE_THRESHOLD="800"
CPU_USAGE_THRESHOLD="80"

# Admin Emails for Alerts
ADMIN_EMAILS="staging-alerts@example.com,dev-team@example.com"
```

### Health Check Configuration

Health checks are configured to run every minute in the staging environment:

```
# Health Check Configuration
HEALTH_CHECK_ENABLED="true"
HEALTH_CHECK_INTERVAL="60000"
HEALTH_CHECK_TIMEOUT="5000"
HEALTH_CHECK_LOG_RESULTS="true"
```

## Endpoints

### Health Endpoints

- **Main Health Check**: `/api/health`
- **All Health Checks**: `/api/health/checks`
- **Specific Health Check**: `/api/health/checks/:id`
- **Run Specific Health Check**: `/api/health/checks/:id/run` (POST)
- **Health Check Logs**: `/api/health/logs/:id`
- **Run All Health Checks**: `/api/health/run-all` (POST)

### Monitoring Dashboards

- **Summary Dashboard**: `/api/monitoring/dashboard/summary`
- **Error Rates Dashboard**: `/api/monitoring/dashboard/error-rates`
- **Performance Dashboard**: `/api/monitoring/dashboard/performance`
- **Database Dashboard**: `/api/monitoring/dashboard/database`
- **Health Summary**: `/api/monitoring/health/summary`

## Services Monitored

The following services are monitored with health checks:

1. **Database** - Checks PostgreSQL connectivity and query performance
2. **Redis** - Checks Redis connectivity and performance
3. **Email Service** - Checks if the email service is configured
4. **AI Service** - Checks if the OpenAI service is configured
5. **Scheduler Service** - Checks if the task scheduler is operational

## Deployment Verification

The `deploy-staging.sh` script includes verification steps to ensure that health and monitoring endpoints are accessible after deployment.

## Alert Notifications

Alerts are configured to be sent to the following channels:

- **Email**: `staging-alerts@example.com`, `dev-team@example.com`
- **Slack**: `#staging-alerts`
- **Sentry**: Critical errors are automatically reported
- **DataDog**: Metrics exceeding thresholds trigger alerts

## Thresholds

The following thresholds are configured for the staging environment:

- **Error Rate**: 10% (0.1)
- **Database Query Duration**: 1500ms
- **API Response Time**: 3000ms
- **Memory Usage**: 800MB
- **CPU Usage**: 80%

## Notification Thresholds

Notification thresholds determine how many events accumulate before sending a notification:

```
NOTIFICATION_THRESHOLD_DEBUG="100"
NOTIFICATION_THRESHOLD_INFO="50"
NOTIFICATION_THRESHOLD_WARNING="10"
NOTIFICATION_THRESHOLD_ERROR="1"
NOTIFICATION_THRESHOLD_CRITICAL="0"  # Always send immediately
```

## Accessing Dashboards

1. **Sentry Dashboard**: Access via the Sentry web interface
2. **DataDog Dashboard**: Access via the DataDog web interface
3. **Application Dashboards**: Access via the application monitoring endpoints

## Troubleshooting

If monitoring or error reporting is not working as expected:

1. Check that the environment variables are correctly set in `.env.staging`
2. Verify that Sentry and DataDog are properly initialized in the application logs
3. Check that health checks are running by accessing the `/api/health` endpoint
4. Verify that the monitoring services are accessible from the application server

## Next Steps

1. Set up proper alert routing and on-call schedules
2. Create custom DataDog dashboards for key metrics
3. Configure log aggregation for centralized logging
4. Set up automated remediation for common issues