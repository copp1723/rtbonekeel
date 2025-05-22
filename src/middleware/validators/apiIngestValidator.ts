/**
 * API Ingest Validator
 * 
 * This module provides validation middleware for API ingestion requests.
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Validate API ingestion request
 * @param req Express request
 * @param res Express response
 * @param next Next function
 */
export function validateApiIngestRequest(req: Request, res: Response, next: NextFunction) {
  const { apiKeyId } = req.body;
  
  if (!apiKeyId) {
    return res.status(400).json({
      success: false,
      error: 'API key ID is required'
    });
  }
  
  next();
}

export default validateApiIngestRequest;