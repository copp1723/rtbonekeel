/**
 * Key Rotation Service
 *
 * Provides functionality for rotating encryption keys and re-encrypting data
 * with new keys to maintain security best practices.
 */
import { db } from '../shared/db.js';
import { sql } from 'drizzle-orm';
import { 
  credentials, 
  dealerCredentials, 
  userCredentials, 
  apiKeys,
  securityAuditLogs
} from '../shared/schema.js';
import { debug, info, warn, error } from '../shared/logger.js';
import { isError } from '../utils/errorUtils.js';
import { rotateEncryptionKeys, generateSecureKey } from '../utils/encryption.js';
import cron from 'node-cron';

// Tables with encrypted data and their field mappings
const encryptedTables = [
  {
    table: 'credentials',
    schema: credentials,
    fields: {
      data: 'encryptedData',
      iv: 'iv',
      authTag: null,
      salt: null,
      keyVersion: null
    }
  },
  {
    table: 'dealer_credentials',
    schema: dealerCredentials,
    fields: {
      data: 'encryptedPassword',
      iv: 'iv',
      authTag: null,
      salt: null,
      keyVersion: null
    }
  },
  {
    table: 'user_credentials',
    schema: userCredentials,
    fields: {
      data: 'encryptedPayload',
      iv: 'iv',
      authTag: 'authTag',
      salt: null,
      keyVersion: null
    }
  },
  {
    table: 'api_keys',
    schema: apiKeys,
    fields: {
      data: 'keyValue',
      iv: 'iv',
      authTag: 'authTag',
      salt: null,
      keyVersion: 'keyVersion'
    }
  }
];

// Key rotation configuration
let keyRotationConfig = {
  enabled: false,
  schedule: '0 0 1 * *', // Default: Monthly on the 1st at midnight
  autoRotationDays: 90,
  lastRotation: null as Date | null,
  isRotating: false
};

/**
 * Initialize the key rotation service
 * 
 * @param options - Configuration options
 * @returns true if initialization was successful
 */
export async function initializeKeyRotation(options: {
  enabled?: boolean;
  schedule?: string;
  autoRotationDays?: number;
} = {}): Promise<boolean> {
  try {
    // Update configuration with provided options
    keyRotationConfig = {
      ...keyRotationConfig,
      enabled: options.enabled !== undefined ? options.enabled : keyRotationConfig.enabled,
      schedule: options.schedule || keyRotationConfig.schedule,
      autoRotationDays: options.autoRotationDays || keyRotationConfig.autoRotationDays
    };

    // Log initialization
    info('Key rotation service initialized', {
      enabled: keyRotationConfig.enabled,
      schedule: keyRotationConfig.schedule,
      autoRotationDays: keyRotationConfig.autoRotationDays
    });

    // If enabled, schedule automatic rotation
    if (keyRotationConfig.enabled && keyRotationConfig.schedule) {
      scheduleKeyRotation();
    }

    return true;
  } catch (err) {
    const errorMessage = isError(err) ? err.message : String(err);
    error(`Failed to initialize key rotation service: ${errorMessage}`);
    return false;
  }
}

/**
 * Schedule automatic key rotation using cron
 */
function scheduleKeyRotation(): void {
  try {
    // Validate cron expression
    if (!cron.validate(keyRotationConfig.schedule)) {
      throw new Error(`Invalid cron expression: ${keyRotationConfig.schedule}`);
    }

    // Schedule the task
    cron.schedule(keyRotationConfig.schedule, async () => {
      info('Running scheduled key rotation');
      try {
        await rotateKeys();
      } catch (err) {
        error('Scheduled key rotation failed:', isError(err) ? err.message : String(err));
      }
    });

    info('Key rotation scheduled with cron expression:', keyRotationConfig.schedule);
  } catch (err) {
    error('Failed to schedule key rotation:', isError(err) ? err.message : String(err));
  }
}

/**
 * Rotate encryption keys
 * 
 * @param options - Rotation options
 * @returns Promise that resolves when rotation is complete
 */
export async function rotateKeys(options?: {
  deleteOldKeys?: boolean;
  minKeyAgeDays?: number;
}): Promise<void> {
  // Prevent concurrent rotations
  if (keyRotationConfig.isRotating) {
    warn('Key rotation already in progress, skipping');
    return;
  }

  try {
    keyRotationConfig.isRotating = true;
    
    // Check if minimum key age has been reached
    if (options?.minKeyAgeDays && keyRotationConfig.lastRotation) {
      const daysSinceLastRotation = Math.floor(
        (Date.now() - keyRotationConfig.lastRotation.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastRotation < options.minKeyAgeDays) {
        info(`Skipping key rotation, minimum age not reached (${daysSinceLastRotation}/${options.minKeyAgeDays} days)`);
        keyRotationConfig.isRotating = false;
        return;
      }
    }

    // Get current key version
    const currentVersion = parseInt(process.env.ENCRYPTION_KEY_VERSION || '1', 10);
    const newVersion = currentVersion + 1;
    
    info(`Starting key rotation from version ${currentVersion} to ${newVersion}`);
    
    // Generate a new key
    const newKey = generateSecureKey();
    
    // Log the key rotation start (without the actual key)
    await db.insert(securityAuditLogs).values({
      eventType: 'key_rotation_started',
      eventData: { 
        oldVersion: currentVersion,
        newVersion: newVersion
      },
      severity: 'info',
      timestamp: new Date()
    });
    
    // Rotate keys for each table with encrypted data
    let totalRecordsUpdated = 0;
    
    for (const tableConfig of encryptedTables) {
      info(`Rotating keys for table: ${tableConfig.table}`);
      
      const recordsUpdated = await rotateEncryptionKeys(
        {
          oldKeyVersion: currentVersion,
          newKeyVersion: newVersion,
          batchSize: 100
        },
        tableConfig.table,
        {
          data: tableConfig.fields.data,
          iv: tableConfig.fields.iv,
          authTag: tableConfig.fields.authTag,
          salt: tableConfig.fields.salt,
          keyVersion: tableConfig.fields.keyVersion
        }
      );
      
      totalRecordsUpdated += recordsUpdated;
      info(`Updated ${recordsUpdated} records in ${tableConfig.table}`);
    }
    
    // Update the last rotation timestamp
    keyRotationConfig.lastRotation = new Date();
    
    // Log the key rotation completion
    await db.insert(securityAuditLogs).values({
      eventType: 'key_rotation_completed',
      eventData: { 
        oldVersion: currentVersion,
        newVersion: newVersion,
        recordsUpdated: totalRecordsUpdated
      },
      severity: 'info',
      timestamp: new Date()
    });
    
    info(`Key rotation completed successfully. Updated ${totalRecordsUpdated} records.`);
    
    // Return the new key information for updating environment variables
    return;
  } catch (err) {
    const errorMessage = isError(err) ? err.message : String(err);
    error(`Key rotation failed: ${errorMessage}`);
    
    // Log the failure
    await db.insert(securityAuditLogs).values({
      eventType: 'key_rotation_failed',
      eventData: { error: errorMessage },
      severity: 'error',
      timestamp: new Date()
    });
    
    throw new Error(`Key rotation failed: ${errorMessage}`);
  } finally {
    keyRotationConfig.isRotating = false;
  }
}

/**
 * Get the active encryption key ID/version
 * 
 * @returns Promise that resolves with the active key ID
 */
export async function getActiveKeyId(): Promise<string> {
  return process.env.ENCRYPTION_KEY_VERSION || '1';
}

export default {
  initializeKeyRotation,
  rotateKeys,
  getActiveKeyId
};
