# Environment Separation and Testing Access

This document outlines the environment separation strategy for the Row The Boat application and provides detailed information about testing access procedures and restrictions.

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Environment Separation](#environment-separation)
   - [Development Environment](#development-environment)
   - [Staging Environment](#staging-environment)
   - [Production Environment](#production-environment)
3. [Environment Configuration](#environment-configuration)
4. [Testing Access Procedures](#testing-access-procedures)
5. [Access Restrictions](#access-restrictions)
6. [Data Handling Across Environments](#data-handling-across-environments)
7. [Deployment Workflow](#deployment-workflow)
8. [Monitoring and Logging](#monitoring-and-logging)

## Environment Overview

Row The Boat uses a three-environment architecture to ensure proper separation of concerns:

| Environment | Purpose | Data | Access | URL |
|-------------|---------|------|--------|-----|
| Development | Feature development, unit testing | Synthetic | Developers | dev.rowtheboat.internal |
| Staging | Integration testing, QA, UAT | Anonymized | Developers, QA, Product | staging.rowtheboat.com |
| Production | Live application | Real | Limited operations team | app.rowtheboat.com |

## Environment Separation

### Development Environment

The development environment is used for active development work and initial testing.

**Characteristics:**
- Isolated from production and staging
- Uses synthetic or anonymized test data
- May be unstable due to ongoing development
- Frequent deployments and updates
- Relaxed security for development convenience
- Debugging tools and verbose logging enabled

**Infrastructure:**
- Hosted on development AWS account
- Smaller instance sizes than production
- Shared database instance with separate schemas
- Local development also available for developers

**Access:**
- Available to all developers
- No customer access
- No external access outside VPN

### Staging Environment

The staging environment mirrors the production environment as closely as possible and is used for final testing before production deployment.

**Characteristics:**
- Configuration matches production
- Uses anonymized copies of production data
- Stable between planned deployments
- Full test suite runs before and after deployments
- Security settings match production
- Standard logging level

**Infrastructure:**
- Hosted on production AWS account but in separate VPC
- Similar instance sizes to production but fewer instances
- Dedicated database instance
- Complete replica of production services

**Access:**
- Available to developers, QA team, and product managers
- No customer access
- Limited external access with authentication

### Production Environment

The production environment hosts the live application used by customers.

**Characteristics:**
- Optimized for reliability and performance
- Contains real customer data
- Changes only through approved deployment process
- Full security measures enforced
- Minimal logging to reduce overhead

**Infrastructure:**
- Hosted on production AWS account
- Scaled for customer load
- High availability configuration
- Regular backups
- Enhanced monitoring

**Access:**
- Limited to operations team
- Customer access to application
- Admin access strictly controlled

## Environment Configuration

Environment-specific configuration is managed through:

1. **Environment Variables**: Different values for each environment stored in AWS Parameter Store
2. **Feature Flags**: Control feature availability in different environments
3. **Configuration Files**: Environment-specific settings for services
4. **Infrastructure as Code**: Separate Terraform modules for each environment

### Configuration Management

- All configuration changes are version controlled
- Configuration changes require code review
- Sensitive values are encrypted at rest
- Configuration is validated during deployment

## Testing Access Procedures

### Requesting Access

1. Submit access request through the internal ticketing system
2. Include:
   - Environment(s) requiring access
   - Justification for access
   - Duration of access needed
   - Specific permissions required
3. Request must be approved by:
   - Team lead for development environment
   - Engineering manager for staging environment
   - CTO or Security Officer for production environment

### Access Provisioning

1. Upon approval, access is provisioned by the DevOps team
2. Credentials are provided through secure channel
3. Access is granted with least privilege principle
4. Temporary access expires automatically after the specified duration

### Testing Credentials

For testing purposes, the following credential sets are available:

| Environment | User Type | Username | How to Request |
|-------------|-----------|----------|---------------|
| Development | Admin | `dev-admin` | Available to all developers |
| Development | Standard User | `dev-user` | Available to all developers |
| Staging | Admin | `staging-admin` | Request via ticketing system |
| Staging | Standard User | `staging-user` | Request via ticketing system |
| Production | Test Account | `test-account` | Request via ticketing system with manager approval |

## Access Restrictions

### Development Environment

**Allowed Activities:**
- Code deployment
- Database schema changes
- Full debugging
- Performance testing
- Feature testing

**Restricted Activities:**
- None, but be mindful of shared resources

### Staging Environment

**Allowed Activities:**
- Integration testing
- User acceptance testing
- Performance testing
- Security testing
- Data migration testing

**Restricted Activities:**
- Direct database modifications without approval
- Disabling security features
- Exporting anonymized data
- Infrastructure changes without approval

### Production Environment

**Allowed Activities:**
- Monitoring
- Approved deployments
- Emergency fixes with approval
- Authorized data exports

**Restricted Activities:**
- Direct database access (except for approved operations)
- Debugging that impacts performance
- Testing new features
- Any activity not explicitly approved

## Data Handling Across Environments

### Data Classification

| Classification | Development | Staging | Production |
|---------------|-------------|---------|------------|
| Public | Allowed | Allowed | Allowed |
| Internal | Allowed | Allowed | Allowed |
| Confidential | Synthetic Only | Anonymized | Full Access |
| Restricted | Synthetic Only | Prohibited | Full Access |

### Data Anonymization

When copying data from production to staging:

1. All personally identifiable information (PII) is anonymized:
   - Names replaced with generated values
   - Emails replaced with pattern `user_[hash]@example.com`
   - Phone numbers replaced with pattern `555-[hash]`
   - Addresses replaced with fictional addresses
   - Social security numbers and other sensitive IDs replaced with generated values

2. Financial data is modified:
   - Account numbers replaced with generated values
   - Transaction amounts multiplied by random factor
   - Credit card numbers replaced with test card numbers

3. The anonymization process is automated and runs as part of the data copy procedure

### Data Refresh Procedures

1. Staging data is refreshed from production:
   - Monthly full refresh
   - On-demand for specific testing needs
   - Always with anonymization

2. Development data:
   - Uses generated test data
   - Refreshed as needed
   - Never contains actual production data

## Deployment Workflow

The deployment workflow enforces environment separation:

1. **Development**:
   - Developers deploy to development environment via CI/CD
   - Automated tests run on deployment
   - Successful builds are candidates for staging

2. **Staging**:
   - Deployments triggered by release manager
   - Full test suite runs automatically
   - QA team performs manual testing
   - User acceptance testing conducted
   - Successful deployments are candidates for production

3. **Production**:
   - Deployments scheduled during maintenance windows
   - Require approval from engineering manager
   - Include rollback plan
   - Monitored by operations team

## Monitoring and Logging

Each environment has separate monitoring and logging:

### Development
- Debug level logging
- Basic monitoring
- Alerts sent to development team

### Staging
- Info level logging
- Full monitoring
- Alerts sent to QA and development teams

### Production
- Warning/Error level logging
- Comprehensive monitoring
- Alerts sent to operations team and on-call engineer

### Log Separation

- Each environment has separate log storage
- Log retention periods:
  - Development: 7 days
  - Staging: 30 days
  - Production: 90 days
- Access to logs follows the same permission model as environment access