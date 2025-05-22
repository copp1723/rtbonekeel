# Role-Based Access Control (RBAC) Implementation

This document outlines the implementation of Role-Based Access Control (RBAC) in the Row The Boat application, focusing on dashboards, logs, and monitoring endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Permission Structure](#permission-structure)
4. [Implementation Details](#implementation-details)
5. [Protected Resources](#protected-resources)
6. [QA and Tester Roles](#qa-and-tester-roles)
7. [Testing RBAC](#testing-rbac)
8. [Extending RBAC](#extending-rbac)

## Overview

Role-Based Access Control (RBAC) is implemented to restrict access to various resources based on user roles. The system defines roles with different permission levels and enforces these permissions through middleware.

## Role Hierarchy

The system implements a hierarchical role structure where higher roles inherit permissions from lower roles:

```
Admin → Developer → QA → Tester → User
```

This means:
- Admins have all permissions
- Developers have all permissions except those exclusive to admins
- QA has all permissions of testers plus additional QA-specific permissions
- Testers have all permissions of regular users plus testing-specific permissions
- Users have basic permissions only

## Permission Structure

Permissions are organized by resource and action:

- **Resources**: Distinct areas or features of the application (e.g., dashboards, logs, monitoring)
- **Actions**: Operations that can be performed on resources (e.g., view, create, edit, delete)

Each role is assigned specific permissions for each resource-action combination.

## Implementation Details

### RBAC Middleware

The RBAC system is implemented as middleware in `src/middleware/rbac.ts`. Key components include:

1. **Role Hierarchy Definition**:
   ```typescript
   const roleHierarchy: Record<string, string[]> = {
     'admin': ['admin', 'developer', 'qa', 'tester', 'user'],
     'developer': ['developer', 'qa', 'tester', 'user'],
     'qa': ['qa', 'tester', 'user'],
     'tester': ['tester', 'user'],
     'user': ['user']
   };
   ```

2. **Resource Permissions**:
   ```typescript
   const resourcePermissions: Record<string, Record<string, string[]>> = {
     'dashboards': {
       'admin': ['view', 'edit', 'create', 'delete'],
       'developer': ['view', 'edit', 'create'],
       'qa': ['view', 'create'],
       'tester': ['view'],
       'user': []
     },
     // Other resources...
   };
   ```

3. **Access Check Function**:
   ```typescript
   function hasAccess(role: string, resource: string, action: string): boolean {
     // Implementation details...
   }
   ```

4. **Middleware Factory**:
   ```typescript
   export function requireAccess(resource: string, action: string) {
     return (req: AuthRequest, res: Response, next: NextFunction) => {
       // Implementation details...
     };
   }
   ```

5. **QA/Tester Role Check**:
   ```typescript
   export function requireQAorTester(req: AuthRequest, res: Response, next: NextFunction) {
     // Implementation details...
   }
   ```

### Integration with Authentication

The RBAC system integrates with the existing authentication system:

1. User authentication is handled by the authentication middleware
2. The authenticated user's role is extracted from the JWT token
3. RBAC middleware checks if the user's role has permission for the requested resource and action

## Protected Resources

### Dashboards

Dashboards are protected with the following permissions:

| Role      | View | Create | Edit | Delete |
|-----------|------|--------|------|--------|
| Admin     | ✓    | ✓      | ✓    | ✓      |
| Developer | ✓    | ✓      | ✓    |        |
| QA        | ✓    | ✓      |      |        |
| Tester    | ✓    |        |      |        |
| User      |      |        |      |        |

Implementation in `src/server/routes/dashboards.ts`:

```typescript
router.get('/', 
  isAuthenticated,
  requireAccess('dashboards', 'view'),
  async (req: Request, res: Response) => {
    // Implementation...
  }
);
```

### Logs

Logs are protected with the following permissions:

| Role      | View | Download | Delete |
|-----------|------|----------|--------|
| Admin     | ✓    | ✓        | ✓      |
| Developer | ✓    | ✓        |        |
| QA        | ✓    | ✓        |        |
| Tester    | ✓    |          |        |
| User      |      |          |        |

Implementation in `src/server/routes/logs.ts`:

```typescript
router.get('/', 
  isAuthenticated,
  requireAccess('logs', 'view'),
  async (req: Request, res: Response) => {
    // Implementation...
  }
);
```

### Monitoring

Monitoring endpoints are protected with the following permissions:

| Role      | View | Configure | Manage Alerts |
|-----------|------|-----------|---------------|
| Admin     | ✓    | ✓         | ✓             |
| Developer | ✓    | ✓         |               |
| QA        | ✓    |           |               |
| Tester    | ✓    |           |               |
| User      |      |           |               |

Implementation in `src/server/routes/monitoring.ts`:

```typescript
router.get('/health/summary', 
  isAuthenticated,
  requireAccess('monitoring', 'view'),
  async (req: Request, res: Response) => {
    // Implementation...
  }
);
```

### Health Checks

Health check endpoints are protected with the following permissions:

| Role      | View | Run Checks | Configure |
|-----------|------|------------|-----------|
| Admin     | ✓    | ✓          | ✓         |
| Developer | ✓    | ✓          |           |
| QA        | ✓    | ✓          |           |
| Tester    | ✓    |            |           |
| User      |      |            |           |

Implementation in `src/server/routes/health.ts`:

```typescript
router.get('/summary', 
  isAuthenticated,
  requireAccess('health', 'view'),
  async (_req, res) => {
    // Implementation...
  }
);
```

## QA and Tester Roles

Special attention has been given to QA and Tester roles to ensure they have appropriate access for testing activities:

### QA Role

- Can view and create dashboards
- Can view and download logs
- Can view monitoring data
- Can view health status and run health checks

### Tester Role

- Can view dashboards
- Can view logs
- Can view monitoring data
- Can view health status

A special middleware function `requireQAorTester` is provided to restrict certain endpoints to QA and Tester roles only:

```typescript
router.get('/test-only-endpoint', 
  isAuthenticated,
  requireQAorTester,
  async (req: Request, res: Response) => {
    // Implementation...
  }
);
```

## Testing RBAC

To test the RBAC implementation:

1. Create test users with different roles:
   - Admin user
   - Developer user
   - QA user
   - Tester user
   - Regular user

2. Test access to protected endpoints with each user:
   - Verify that users can access endpoints they have permission for
   - Verify that users cannot access endpoints they don't have permission for
   - Verify that role hierarchy works correctly (e.g., admin can access everything)

3. Test edge cases:
   - User with no role specified (should default to 'user')
   - Invalid role (should be treated as 'user')
   - Missing authentication (should return 401 Unauthorized)

## Extending RBAC

To extend the RBAC system for new resources or actions:

1. Add the new resource to the `resourcePermissions` object in `src/middleware/rbac.ts`:
   ```typescript
   'newResource': {
     'admin': ['view', 'edit', 'create', 'delete'],
     'developer': ['view', 'edit', 'create'],
     'qa': ['view'],
     'tester': ['view'],
     'user': []
   }
   ```

2. Apply the middleware to the new routes:
   ```typescript
   router.get('/new-resource', 
     isAuthenticated,
     requireAccess('newResource', 'view'),
     async (req: Request, res: Response) => {
       // Implementation...
     }
   );
   ```

3. Update documentation to reflect the new permissions