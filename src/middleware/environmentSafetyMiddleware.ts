/**
 * Environment Safety Middleware
 *
 * This middleware provides HTTP route protection based on environment,
 * preventing accidental production impact from test/staging environments.
 */
import { Request, Response, NextFunction } from 'express';
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';
import { getCurrentEnvironment, isProduction, isStaging } from '../services/environmentService.js';
import { sendNotification } from '../services/notificationService.js';
import { SafetyCheckOperation, performSafetyCheck } from '../services/environmentSafetyService.js';

// Interface for route protection options
interface ProtectRouteOptions {
  operation: SafetyCheckOperation;
  allowedEnvironments?: string[];
  requireConfirmation?: boolean;
}

/**
 * Middleware to protect routes based on environment
 * @param options Protection options
 * @returns Express middleware function
 */
export function protectRoute(options: ProtectRouteOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentEnv = getCurrentEnvironment();
      
      // Extract operation details from request
      const details = {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body ? { ...req.body } : {},
        ip: req.ip,
        userId: (req as any).user?.id,
      };
      
      // Remove sensitive information from details
      if (details.body.password) {
        details.body.password = '[REDACTED]';
      }
      if (details.body.token) {
        details.body.token = '[REDACTED]';
      }
      
      // Perform safety check
      await performSafetyCheck(
        options.operation,
        details,
        options.allowedEnvironments
      );
      
      // If confirmation is required and not provided
      if (options.requireConfirmation && req.headers['x-confirm-operation'] !== 'true') {
        return res.status(403).json({
          error: 'Confirmation required',
          message: `This operation requires explicit confirmation. Please add the X-Confirm-Operation: true header to confirm.`,
          operation: options.operation,
          environment: currentEnv,
        });
      }
      
      // Operation is allowed, proceed
      next();
    } catch (err) {
      const errorMessage = isError(err) ? err.message : String(err);
      
      // Log the error
      error({
        event: 'environment_safety_middleware_error',
        error: errorMessage,
        path: req.path,
        method: req.method,
      }, `Environment safety check failed: ${errorMessage}`);
      
      // Return error response
      res.status(403).json({
        error: 'Operation not allowed',
        message: errorMessage,
        environment: getCurrentEnvironment(),
      });
    }
  };
}

/**
 * Middleware to protect routes that could impact production
 * @returns Express middleware function
 */
export function preventProductionImpact() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentEnv = getCurrentEnvironment();
      
      // Skip check if we're already in production
      if (isProduction()) {
        return next();
      }
      
      // Check for production indicators in the request
      const targetEnv = req.headers['x-target-environment'] || '';
      const productionEndpoint = req.headers['x-production-endpoint'] === 'true';
      const productionDatabase = req.headers['x-production-database'] === 'true';
      
      // Check if this could impact production
      const couldImpactProduction = 
        targetEnv === 'production' ||
        productionEndpoint ||
        productionDatabase ||
        req.path.includes('/production/') ||
        req.path.includes('/prod/');
      
      if (couldImpactProduction) {
        const message = `Operation in ${currentEnv} environment could impact production`;
        
        // Send notification
        await sendNotification(
          message,
          'critical',
          {
            path: req.path,
            method: req.method,
            targetEnv,
            productionEndpoint,
            productionDatabase,
          }
        );
        
        // Return error response
        return res.status(403).json({
          error: 'Production impact prevented',
          message,
          environment: currentEnv,
        });
      }
      
      // Operation is safe, proceed
      next();
    } catch (err) {
      const errorMessage = isError(err) ? err.message : String(err);
      
      // Log the error
      error({
        event: 'production_impact_prevention_error',
        error: errorMessage,
        path: req.path,
        method: req.method,
      }, `Production impact prevention failed: ${errorMessage}`);
      
      // Return error response
      res.status(500).json({
        error: 'Production impact prevention error',
        message: errorMessage,
      });
    }
  };
}

/**
 * Middleware to add environment information to response headers
 * @returns Express middleware function
 */
export function addEnvironmentHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentEnv = getCurrentEnvironment();
    
    // Add environment headers
    res.setHeader('X-Environment', currentEnv);
    
    // Add warning header for non-production environments
    if (!isProduction()) {
      res.setHeader('X-Environment-Warning', `This is a ${currentEnv} environment`);
    }
    
    next();
  };
}

export default {
  protectRoute,
  preventProductionImpact,
  addEnvironmentHeaders,
};