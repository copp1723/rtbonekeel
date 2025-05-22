# Environment Safety: Preventing Production Impact

This document describes the safeguards implemented to prevent accidental production impact from test or staging environments.

## Overview

The environment safety system provides checks and validations to ensure that operations are only performed in the appropriate environment and that actions in test or staging environments cannot accidentally impact production.

## Key Features

### 1. Environment Detection

The system automatically detects the current environment (development, staging, production, test) based on the `NODE_ENV` environment variable.

### 2. Operation Restrictions

Different operations have different restrictions based on the environment:

- Some operations are allowed in all environments
- Some operations are restricted to specific environments
- Some operations require confirmation before execution
- All sensitive operations are audited

### 3. Cross-Environment Protection

The system prevents operations in one environment from affecting another environment, particularly protecting production from accidental impact from staging or development.

### 4. Audit Logging

All sensitive operations are logged for audit purposes, including:
- The operation type
- The environment where it was performed
- Whether it was allowed or denied
- Additional details about the operation

## Protected Operations

The following operations are protected by the environment safety system:

1. **Database Migrations**: Schema changes that could affect data integrity
2. **Data Deletion**: Bulk deletion of data
3. **Mass Email**: Sending emails to multiple recipients
4. **API Key Rotation**: Changing API keys that could affect integrations
5. **Config Updates**: Changing system configuration
6. **Service Restarts**: Restarting services that could cause downtime
7. **External API Calls**: Calls to external services that could have side effects
8. **Scheduled Jobs**: Background tasks that could modify data
9. **User Imports**: Importing user data
10. **Data Exports**: Exporting sensitive data

## Environment-Specific Restrictions

### Development Environment

- All operations are allowed
- Confirmation required for potentially destructive operations
- Cannot directly impact staging or production

### Staging Environment

- Most operations are allowed
- Confirmation required for potentially destructive operations
- Can initiate controlled operations in production with explicit confirmation
- Cannot directly modify production data

### Production Environment

- All operations are allowed but require confirmation
- All operations are audited
- Cannot be affected by operations in other environments

### Test Environment

- Limited set of operations allowed
- Cannot impact other environments
- Used primarily for automated testing

## Implementation

The environment safety system is implemented in the `environmentSafetyService.ts` file, which provides the following key functions:

### 1. `performSafetyCheck`

Checks if an operation is allowed in the current environment:

```typescript
import { performSafetyCheck } from '../services/environmentSafetyService';

// Check if a database migration is allowed
try {
  await performSafetyCheck('database_migration', { schema: 'users' });
  // Operation is allowed, proceed
} catch (error) {
  // Operation is not allowed, handle the error
}
```

### 2. `preventProductionImpact`

Specifically checks if an operation could accidentally impact production:

```typescript
import { preventProductionImpact } from '../services/environmentSafetyService';

// Check if an operation could impact production
try {
  await preventProductionImpact('external_api_call', { 
    endpoint: 'https://api.example.com/users',
    method: 'POST'
  });
  // Operation is safe, proceed
} catch (error) {
  // Operation could impact production, handle the error
}
```

### 3. `verifyCrossEnvironmentSafety`

Verifies that cross-environment operations are safe:

```typescript
import { verifyCrossEnvironmentSafety } from '../services/environmentSafetyService';

// Check if a cross-environment operation is safe
try {
  await verifyCrossEnvironmentSafety(
    'staging',
    'production',
    'config_update',
    { config: 'email_templates' }
  );
  // Operation is safe, proceed
} catch (error) {
  // Operation is not safe, handle the error
}
```

## Configuration

Environment safety can be configured through environment variables:

```
# Enable/disable safety checks
SAFETY_CHECKS_ENABLED="true"

# Allow cross-environment operations (use with caution)
ALLOW_CROSS_ENV_OPERATIONS="false"
```

## Best Practices

1. **Always use safety checks**: Wrap sensitive operations in safety checks
2. **Be explicit about environments**: Clearly specify which environments an operation should run in
3. **Use descriptive details**: Include relevant details in safety check calls
4. **Handle safety errors**: Properly handle and report safety check failures
5. **Review audit logs**: Regularly review operation logs to identify potential issues
6. **Test in isolation**: Use isolated test environments that cannot affect other environments

## Common Patterns

### Deployment Pipeline

```
Development → Staging → Production
```

- Changes are developed and tested in development
- Changes are deployed to staging for integration testing
- Changes are promoted to production only after validation in staging

### Database Operations

- Schema migrations are tested in development
- Migrations are applied to staging for validation
- Migrations are applied to production only after validation in staging
- Data migrations follow the same pattern

### Configuration Changes

- Configuration is updated and tested in development
- Configuration is applied to staging for validation
- Configuration is promoted to production only after validation in staging