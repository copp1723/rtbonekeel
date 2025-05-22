/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Provides RBAC functionality for protecting routes based on user roles
 */
import { Request, Response, NextFunction } from 'express';
import { debug, error } from '../shared/logger.js';

// Define custom Request interface with user property
interface AuthRequest extends Request {
  user?: {
    claims?: {
      sub: string;
      role?: string;
      permissions?: string[];
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// Define role hierarchy
const roleHierarchy: Record<string, string[]> = {
  'admin': ['admin', 'developer', 'qa', 'tester', 'user'],
  'developer': ['developer', 'qa', 'tester', 'user'],
  'qa': ['qa', 'tester', 'user'],
  'tester': ['tester', 'user'],
  'user': ['user']
};

// Define permission sets for different resources
const resourcePermissions: Record<string, Record<string, string[]>> = {
  'dashboards': {
    'admin': ['view', 'edit', 'create', 'delete'],
    'developer': ['view', 'edit', 'create'],
    'qa': ['view', 'create'],
    'tester': ['view'],
    'user': []
  },
  'logs': {
    'admin': ['view', 'download', 'delete'],
    'developer': ['view', 'download'],
    'qa': ['view', 'download'],
    'tester': ['view'],
    'user': []
  },
  'monitoring': {
    'admin': ['view', 'configure', 'manage-alerts'],
    'developer': ['view', 'configure'],
    'qa': ['view'],
    'tester': ['view'],
    'user': []
  },
  'health': {
    'admin': ['view', 'run-checks', 'configure'],
    'developer': ['view', 'run-checks'],
    'qa': ['view', 'run-checks'],
    'tester': ['view'],
    'user': []
  }
};

/**
 * Check if a role has access to a specific resource and action
 * 
 * @param role - User role
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns boolean indicating if access is allowed
 */
function hasAccess(role: string, resource: string, action: string): boolean {
  // Default to no access
  if (!role || !resource || !action) {
    return false;
  }

  // Get applicable roles based on hierarchy
  const applicableRoles = roleHierarchy[role] || [role];
  
  // Check each role for access
  for (const currentRole of applicableRoles) {
    const permissions = resourcePermissions[resource]?.[currentRole] || [];
    if (permissions.includes(action)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Middleware to check if a user has access to a resource
 * 
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns Express middleware function
 */
export function requireAccess(resource: string, action: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.claims || !req.user.claims.sub) {
        return res.status(401).json({
          status: 'error',
          code: 'unauthorized',
          message: 'Authentication required'
        });
      }
      
      // Get user role
      const role = req.user.claims.role || 'user';
      
      // Check if user has access
      if (!hasAccess(role, resource, action)) {
        debug(`Access denied: ${role} cannot ${action} ${resource}`);
        return res.status(403).json({
          status: 'error',
          code: 'forbidden',
          message: `You don't have permission to ${action} ${resource}`
        });
      }
      
      // User has access, continue
      next();
    } catch (err) {
      error('RBAC error:', err instanceof Error ? err.message : String(err));
      return res.status(500).json({
        status: 'error',
        code: 'internal_error',
        message: 'An error occurred while checking permissions'
      });
    }
  };
}

/**
 * Middleware to check if a user has QA/Tester role
 * 
 * @returns Express middleware function
 */
export function requireQAorTester(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.claims || !req.user.claims.sub) {
      return res.status(401).json({
        status: 'error',
        code: 'unauthorized',
        message: 'Authentication required'
      });
    }
    
    // Get user role
    const role = req.user.claims.role || 'user';
    
    // Check if user has QA or Tester role
    if (role !== 'qa' && role !== 'tester' && role !== 'admin' && role !== 'developer') {
      debug(`Access denied: ${role} is not a QA or Tester role`);
      return res.status(403).json({
        status: 'error',
        code: 'forbidden',
        message: 'QA or Tester role required'
      });
    }
    
    // User has access, continue
    next();
  } catch (err) {
    error('RBAC error:', err instanceof Error ? err.message : String(err));
    return res.status(500).json({
      status: 'error',
      code: 'internal_error',
      message: 'An error occurred while checking permissions'
    });
  }
}

export default {
  requireAccess,
  requireQAorTester,
  hasAccess
};