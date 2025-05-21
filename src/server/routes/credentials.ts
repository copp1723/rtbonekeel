/**
 * Credentials API Routes
 *
 * Handles secure storage and retrieval of user credentials
 * with proper validation and encryption
 */
import type { Router, Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../index.js';
import { debug, info, warn, error } from '../index.js';
import { isError } from '../index.js';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../index.js';
import {
  getCredentialById,
  getCredentials,
  addCredential,
  updateCredential,
  deleteCredential
} from '../index.js';

const router = Router();

// Apply authentication middleware to all credential routes
router.use(isAuthenticated);

// Define validation schemas
const credentialDataSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  tokenType: z.string().optional(),
  accessToken: z.string().optional(),
  dealerId: z.string().optional(),
}).refine(data => {
  // At least one credential field must be provided
  return Object.values(data).some(value => value !== undefined);
}, {
  message: "At least one credential field must be provided"
});

const addCredentialSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  label: z.string().optional(),
  data: credentialDataSchema,
  refreshToken: z.string().optional(),
  refreshTokenExpiry: z.string().datetime().optional(),
});

const updateCredentialSchema = z.object({
  label: z.string().optional(),
  data: credentialDataSchema.optional(),
  refreshToken: z.string().optional(),
  refreshTokenExpiry: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

const credentialIdSchema = z.object({
  id: z.string().uuid("Invalid credential ID format"),
});

const platformQuerySchema = z.object({
  platform: z.string().optional(),
});

/**
 * Get all credentials for the authenticated user
 * Optional platform filter
 */
router.get(
  '/',
  validateQuery(platformQuerySchema),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.query;

      const results = await getCredentials(userId, platform);

      // Return credentials with masked sensitive data
      const maskedResults = results.map(({ credential, data }) => ({
        credential: {
          id: credential.id,
          platform: credential.platform,
          label: credential.label,
          active: credential.active,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        },
        // Mask sensitive data
        data: maskSensitiveData(data),
      }));

      res.json(maskedResults);
    } catch (err) {
      handleError(err, res, 'Failed to retrieve credentials');
    }
  }
);

/**
 * Get a specific credential by ID
 */
router.get(
  '/:id',
  validateParams(credentialIdSchema),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const result = await getCredentialById(id, userId);

      if (!result) {
        return res.status(404).json({
          status: 'error',
          code: 'credential_not_found',
          message: 'Credential not found',
        });
      }

      // Return credential with masked sensitive data
      const { credential, data } = result;
      const maskedResult = {
        credential: {
          id: credential.id,
          platform: credential.platform,
          label: credential.label,
          active: credential.active,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        },
        // Mask sensitive data
        data: maskSensitiveData(data),
      };

      res.json(maskedResult);
    } catch (err) {
      handleError(err, res, 'Failed to retrieve credential');
    }
  }
);

/**
 * Add a new credential
 */
router.post(
  '/',
  validateBody(addCredentialSchema),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { platform, label, data, refreshToken, refreshTokenExpiry } = req.body;

      // Log credential creation (without sensitive data)
      info(`Creating credential for user ${userId} on platform ${platform}`, {
        userId,
        platform,
        hasLabel: !!label,
      });

      const credential = await addCredential(
        userId,
        platform,
        data,
        {
          label,
          refreshToken,
          refreshTokenExpiry: refreshTokenExpiry ? new Date(refreshTokenExpiry) : undefined,
        }
      );

      if (!credential) {
        return res.status(500).json({
          status: 'error',
          code: 'credential_creation_failed',
          message: 'Failed to create credential',
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Credential created successfully',
        credential: {
          id: credential.id,
          platform: credential.platform,
          label: credential.label,
          active: credential.active,
          createdAt: credential.createdAt,
        },
      });
    } catch (err) {
      handleError(err, res, 'Failed to create credential');
    }
  }
);

/**
 * Update an existing credential
 */
router.put(
  '/:id',
  validateParams(credentialIdSchema),
  validateBody(updateCredentialSchema),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { label, data, refreshToken, refreshTokenExpiry, active } = req.body;

      // Check if credential exists and belongs to user
      const existingCredential = await getCredentialById(id, userId);

      if (!existingCredential) {
        return res.status(404).json({
          status: 'error',
          code: 'credential_not_found',
          message: 'Credential not found',
        });
      }

      // Update the credential
      const updatedCredential = await updateCredential(
        id,
        userId,
        {
          label,
          data,
          refreshToken,
          refreshTokenExpiry: refreshTokenExpiry ? new Date(refreshTokenExpiry) : undefined,
          active,
        }
      );

      if (!updatedCredential) {
        return res.status(500).json({
          status: 'error',
          code: 'credential_update_failed',
          message: 'Failed to update credential',
        });
      }

      res.json({
        status: 'success',
        message: 'Credential updated successfully',
        credential: {
          id: updatedCredential.id,
          platform: updatedCredential.platform,
          label: updatedCredential.label,
          active: updatedCredential.active,
          updatedAt: updatedCredential.updatedAt,
        },
      });
    } catch (err) {
      handleError(err, res, 'Failed to update credential');
    }
  }
);

/**
 * Delete a credential (or mark as inactive)
 */
router.delete(
  '/:id',
  validateParams(credentialIdSchema),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      // Check if credential exists and belongs to user
      const existingCredential = await getCredentialById(id, userId);

      if (!existingCredential) {
        return res.status(404).json({
          status: 'error',
          code: 'credential_not_found',
          message: 'Credential not found',
        });
      }

      // Delete the credential (mark as inactive)
      const result = await deleteCredential(id, userId);

      if (!result) {
        return res.status(500).json({
          status: 'error',
          code: 'credential_deletion_failed',
          message: 'Failed to delete credential',
        });
      }

      res.json({
        status: 'success',
        message: 'Credential deleted successfully',
      });
    } catch (err) {
      handleError(err, res, 'Failed to delete credential');
    }
  }
);

/**
 * Mask sensitive data in credential data
 */
function maskSensitiveData(data: any): any {
  const maskedData = { ...data };

  // Mask password if present
  if (maskedData.password) {
    maskedData.password = '********';
  }

  // Mask API key if present (show first 4 and last 4 characters)
  if (maskedData.apiKey && maskedData.apiKey.length > 8) {
    maskedData.apiKey = `${maskedData.apiKey.substring(0, 4)}...${maskedData.apiKey.substring(maskedData.apiKey.length - 4)}`;
  }

  // Mask API secret if present
  if (maskedData.apiSecret) {
    maskedData.apiSecret = '********';
  }

  // Mask access token if present
  if (maskedData.accessToken) {
    maskedData.accessToken = '********';
  }

  return maskedData;
}

/**
 * Handle errors in a consistent way
 */
function handleError(err: unknown, res: Response, defaultMessage: string): void {
  const errorMessage = isError(err) ? err.message : String(err);

  error(`${defaultMessage}: ${errorMessage}`);

  res.status(500).json({
    status: 'error',
    code: 'internal_server_error',
    message: defaultMessage,
  });
}

export default router;
