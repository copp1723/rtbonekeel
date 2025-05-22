# Access Procedures for Staging and Testing Environments

This document outlines the access procedures for staging and testing environments, specifically designed for QA and testing teams.

## Table of Contents

1. [Overview](#overview)
2. [Role-Based Access Control](#role-based-access-control)
3. [Environment Access](#environment-access)
4. [Monitoring and Dashboard Access](#monitoring-and-dashboard-access)
5. [Log Access](#log-access)
6. [Health Check Access](#health-check-access)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Overview

The Row The Boat application implements Role-Based Access Control (RBAC) to manage access to different resources and functionalities. This document focuses on access procedures for QA and testing teams in staging and testing environments.

## Role-Based Access Control

### Available Roles

The system defines the following roles with different access levels:

1. **Admin**: Full access to all resources and functionalities
2. **Developer**: Access to most resources with some limitations on destructive actions
3. **QA**: Access focused on testing and quality assurance activities
4. **Tester**: Limited access for basic testing activities
5. **User**: Standard user access with minimal privileges

### Role Hierarchy

Roles follow a hierarchical structure where higher roles inherit permissions from lower roles:

- Admin → Developer → QA → Tester → User

### QA Role Permissions

QA role has the following permissions:

- **Dashboards**: View and create dashboards
- **Logs**: View and download logs
- **Monitoring**: View monitoring data
- **Health Checks**: View health status and run health checks

### Tester Role Permissions

Tester role has the following permissions:

- **Dashboards**: View dashboards
- **Logs**: View logs
- **Monitoring**: View monitoring data
- **Health Checks**: View health status

## Environment Access

### Staging Environment

#### Access Request Process

1. Submit an access request through the internal ticketing system with the following information:
   - Full name
   - Email address
   - Required role (QA or Tester)
   - Justification for access
   - Project or team name
   - Duration of access needed

2. The request will be reviewed by the DevOps team and approved by the project manager.

3. Once approved, you will receive an email with:
   - Access credentials
   - Environment URL
   - Initial password (to be changed on first login)
   - Access expiration date

#### Connection Details

- **Staging URL**: https://staging.rowtheboat.example.com
- **VPN Required**: Yes, connect to the company VPN before accessing
- **IP Restrictions**: Access limited to company network or VPN

### Testing Environment

#### Access Request Process

1. Testing environment access is automatically granted to all QA and Tester roles.

2. No separate request is needed if you already have a QA or Tester account.

3. If you don't have an account, follow the same process as for staging environment access.

#### Connection Details

- **Testing URL**: https://testing.rowtheboat.example.com
- **VPN Required**: Yes, connect to the company VPN before accessing
- **IP Restrictions**: Access limited to company network or VPN

### Authentication

1. Navigate to the environment URL
2. Click "Sign In" in the top-right corner
3. Enter your email and password
4. For first-time login, you will be prompted to:
   - Change your password
   - Set up two-factor authentication (optional for testing environment, required for staging)
   - Accept the terms of use

## Monitoring and Dashboard Access

### Accessing Dashboards

1. Log in to the environment
2. Navigate to `/dashboards` or click on "Dashboards" in the main navigation
3. Available dashboards for QA/Tester roles:
   - System Overview
   - Performance Metrics
   - Error Tracking

### Creating Custom Dashboards (QA Only)

1. Navigate to the Dashboards page
2. Click "Create New Dashboard"
3. Provide a name and description
4. Add widgets from the available options
5. Configure each widget as needed
6. Click "Save Dashboard"

### Dashboard Limitations

- QA role can create and view dashboards but cannot edit or delete dashboards created by others
- Tester role can only view existing dashboards
- Custom dashboards created by QA are visible to all users with dashboard access

## Log Access

### Viewing Logs

1. Log in to the environment
2. Navigate to `/logs` or click on "Logs" in the main navigation
3. Use filters to narrow down logs:
   - Level (info, warn, error)
   - Service
   - Date range
   - Search term

### Downloading Logs (QA Only)

1. Navigate to the Logs page
2. Apply filters as needed
3. Click "Download Logs"
4. Select format (JSON or CSV)
5. Click "Download"

### Log Limitations

- QA role can view and download logs but cannot delete them
- Tester role can only view logs
- Log access is limited to the past 30 days

## Health Check Access

### Viewing Health Status

1. Log in to the environment
2. Navigate to `/health` or click on "Health" in the main navigation
3. View the overall health summary and individual service status

### Running Health Checks (QA Only)

1. Navigate to the Health page
2. Click "Run Health Checks" to run all checks, or
3. Find a specific service and click "Run Check" next to it

### Health Check Limitations

- QA role can view health status and run health checks
- Tester role can only view health status
- Neither role can configure health check settings

## Troubleshooting

### Common Access Issues

1. **Cannot Log In**
   - Verify your credentials
   - Ensure your account has not expired
   - Check that you are connected to the VPN
   - Contact support if issues persist

2. **Missing Permissions**
   - Verify your assigned role
   - Check if your role has the necessary permissions
   - Request role adjustment if needed

3. **Cannot Access Specific Feature**
   - Ensure the feature is available in the current environment
   - Check if your role has permission to access the feature
   - Verify that the feature is not under maintenance

### Support Contacts

- **Access Issues**: access-support@rowtheboat.example.com
- **Technical Issues**: tech-support@rowtheboat.example.com
- **Urgent Issues**: Call the support hotline at +1-555-123-4567

## Best Practices

1. **Security**
   - Never share your credentials with others
   - Log out when you're done with your session
   - Use a strong, unique password
   - Enable two-factor authentication when available

2. **Resource Usage**
   - Limit large log downloads to off-peak hours
   - Don't run health checks repeatedly in short periods
   - Close unused dashboard tabs

3. **Testing**
   - Document any issues found with clear reproduction steps
   - Include environment details in bug reports
   - Use the appropriate test data sets
   - Clean up after testing when possible

4. **Communication**
   - Report any access issues promptly
   - Notify the team when performing resource-intensive operations
   - Share useful dashboard configurations with the team