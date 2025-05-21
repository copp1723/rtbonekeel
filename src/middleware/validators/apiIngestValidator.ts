/**
 * API Ingestion Request Validator
 * 
 * Validates requests to the API ingestion endpoints
 */
import { Request, Response, NextFunction } from 'express';
import { isError } from '../../utils/errorUtils.js';

/**
 * Validates API ingestion requests
 */
export function validateApiIngestRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { apiKeyId, platform, options } = req.body;
    const errors = [];

    // Check required fields
    if (!apiKeyId) {
      errors.push('API key ID is required');
    }

    // For generic API endpoint, platform is required
    if (req.path === '/generic' && !platform) {
      errors.push('Platform name is required');
    }

    // Validate options if provided
    if (options) {
      // Validate date formats if provided
      if (options.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) {
        errors.push('startDate must be in YYYY-MM-DD format');
      }

      if (options.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(options.endDate)) {
        errors.push('endDate must be in YYYY-MM-DD format');
      }

      // Validate format if provided
      if (options.format && !['csv', 'xlsx', 'json'].includes(options.format)) {
        errors.push('format must be one of: csv, xlsx, json');
      }

      // For generic API, endpoint is required
      if (req.path === '/generic' && options.endpoint) {
        try {
          new URL(options.endpoint);
        } catch (err) {
          errors.push('endpoint must be a valid URL');
        }
      }
    }

    // Return errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Continue to the route handler
    next();
  } catch (err) {
    const errorMessage = isError(err)
      ? err instanceof Error
        ? err.message
        : String(err)
      : String(err);
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}