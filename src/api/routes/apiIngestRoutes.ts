/**
 * API Ingestion Routes
 * 
 * Routes for handling API-based data ingestion
 */
import type express from 'express';
import type { Request, Response } from 'express';
import { routeHandler } from '../../middleware/routeHandler.js';
import { ingestFromGoogleAdsApi, ingestFromApi } from '../../features/api/services/apiIngestService.js';
import { isError } from '../../utils/errorUtils.js';
import { rateLimiters } from '../../shared/middleware/rateLimiter.js';
import { validateApiIngestRequest } from '../../middleware/validators/apiIngestValidator.js';

const router = express.Router();

/**
 * Route to ingest data from Google Ads API
 */
router.post(
  '/google-ads',
  rateLimiters.apiIngestion,
  validateApiIngestRequest,
  routeHandler(async (req: Request, res: Response) => {
    const { apiKeyId, options } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!apiKeyId) {
      return res.status(400).json({
        success: false,
        error: 'API key ID is required',
      });
    }

    try {
      const result = await ingestFromGoogleAdsApi(userId, apiKeyId, options || {});
      
      return res.status(result.success ? 200 : 400).json(result);
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
  })
);

/**
 * Route to ingest data from any API
 */
router.post(
  '/generic',
  rateLimiters.apiIngestion,
  validateApiIngestRequest,
  routeHandler(async (req: Request, res: Response) => {
    const { apiKeyId, platform, options } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!apiKeyId) {
      return res.status(400).json({
        success: false,
        error: 'API key ID is required',
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform name is required',
      });
    }

    try {
      const result = await ingestFromApi(userId, apiKeyId, platform, options || {});
      
      return res.status(result.success ? 200 : 400).json(result);
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
  })
);

export default router;