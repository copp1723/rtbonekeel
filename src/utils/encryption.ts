/**
 * Enhanced Encryption Utilities
 *
 * Provides secure encryption/decryption using AES-256-GCM with proper authentication
 * and environment validation for production security.
 */
import crypto from 'crypto';
import { isError } from '../utils/errorUtils.js';
import { db } from '../shared/db.js';
import { securityAuditLogs } from '../shared/schema.js';
import { debug, info, warn, error } from '../shared/logger.js';
// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM mode
const KEY_LENGTH = 32; // 32 bytes (256 bits) for AES-256
const SALT_LENGTH = 16; // 16 bytes for salt
const MIN_KEY_LENGTH = 32; // Minimum key length in characters
// Environment variable for encryption key
// In production, this should be a secure, randomly generated key
const DEFAULT_KEY = 'default-dev-key-do-not-use-in-production-environment';
// Derive a proper length key from the environment variable or use a default (for development only)
let encryptionKey: Buffer;
// Store the current key version for rotation purposes
let currentKeyVersion = 1;
/**
 * Check if a key has sufficient entropy
 *
 * @param key - The key to check
 * @returns true if the key has sufficient entropy
 */
function hasEnoughEntropy(key: string): boolean {
  // Check for at least 3 of the following character classes:
  // - Lowercase letters
  // - Uppercase letters
  // - Numbers
  // - Special characters
  let characterClasses = 0;
  if (/[a-z]/.test(key)) characterClasses++;
  if (/[A-Z]/.test(key)) characterClasses++;
  if (/[0-9]/.test(key)) characterClasses++;
  if (/[^a-zA-Z0-9]/.test(key)) characterClasses++;

  return characterClasses >= 3;
}

/**
 * Initialize the encryption module
 * This should be called at application startup
 *
 * @param env - Optional environment object for testing
 * @returns true if initialization was successful
 */
export function initializeEncryption(env = process.env): boolean {
  try {
    const keyString = env.ENCRYPTION_KEY;
    const keyVersion = env.ENCRYPTION_KEY_VERSION ? parseInt(env.ENCRYPTION_KEY_VERSION, 10) : 1;
    const saltString = env.ENCRYPTION_SALT;

    // Update the current key version
    currentKeyVersion = keyVersion;

    if (!keyString) {
      if (env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY environment variable is required in production');
      }
      // For development, derive a key from the default
      // This is NOT secure for production use
      warn('Using default encryption key. This is NOT secure for production.');
      encryptionKey = crypto.scryptSync(DEFAULT_KEY, saltString || 'dev-salt', KEY_LENGTH);
      return false;
    }

    // Validate key length in production
    if (env.NODE_ENV === 'production' && keyString.length < MIN_KEY_LENGTH) {
      throw new Error(`ENCRYPTION_KEY must be at least ${MIN_KEY_LENGTH} characters in production`);
    }

    // Validate key entropy in production
    if (env.NODE_ENV === 'production' && !hasEnoughEntropy(keyString)) {
      throw new Error('ENCRYPTION_KEY has insufficient entropy. Use a mix of character types.');
    }

    // If key is provided as hex string
    if (/^[0-9a-f]{64}$/i.test(keyString)) {
      encryptionKey = Buffer.from(keyString, 'hex');
    }
    // If key is provided as base64 string
    else if (/^[A-Za-z0-9+/=]{44}$/.test(keyString)) {
      encryptionKey = Buffer.from(keyString, 'base64');
    }
    // Otherwise, derive a key from the provided string
    else {
      // Use provided salt or generate a secure one
      const salt = saltString || 'secure-salt-' + keyVersion;
      encryptionKey = crypto.scryptSync(keyString, salt, KEY_LENGTH);
    }

    info('Encryption initialized successfully with key version:', keyVersion);
    return true;
  } catch (err: unknown) {
    error('Failed to initialize encryption:', String(err));
    // In development, fall back to default key
    if (env.NODE_ENV !== 'production') {
      encryptionKey = crypto.scryptSync(DEFAULT_KEY, 'dev-salt', KEY_LENGTH);
      return false;
    }
    throw err;
  }
}
/**
 * Checks if encryption is properly configured for production use
 * @returns true if a proper encryption key is configured
 */
export function isEncryptionConfigured(): boolean {
  if (!encryptionKey) {
    initializeEncryption();
  }
  // In production, we should never use the default key
  if (process.env.NODE_ENV === 'production') {
    return (
      encryptionKey.toString('hex') !==
      crypto.scryptSync(DEFAULT_KEY, 'salt', KEY_LENGTH).toString('hex')
    );
  }
  return true;
}
/**
 * Encrypt data using AES-256-GCM with a unique salt
 *
 * @param data - Data to encrypt (object or string)
 * @param userId - Optional user ID for audit logging
 * @returns Object containing encrypted data, IV, authentication tag, salt, and key version
 */
export function encryptData(
  data: Record<string, any> | string,
  userId?: string
): {
  encryptedData: string;
  iv: string;
  authTag: string;
  salt: string;
  keyVersion: number;
} {
  try {
    if (!encryptionKey) {
      initializeEncryption();
    }

    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);

    // Generate a random initialization vector and salt
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Create cipher with key and IV
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    // Add salt as associated authenticated data (AAD)
    cipher.setAAD(salt);

    // Encrypt the data
    let encrypted = cipher.update(dataString, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    // Log security event if userId is provided
    if (userId) {
      logSecurityEvent(
        'data_encrypted',
        userId,
        { keyVersion: currentKeyVersion },
        'info'
      ).catch(err => {
        warn('Failed to log encryption event:', String(err));
      });
    }

    return {
      encryptedData: encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      salt: salt.toString('base64'),
      keyVersion: currentKeyVersion,
    };
  } catch (err: unknown) {
    // Unified error message handling
    const errorMessage = isError(err)
      ? err.message
      : String(err);

    error(`Encryption error: ${errorMessage}`);
    throw new Error(`Encryption failed: ${errorMessage}`);
  }
}
/**
 * Decrypt data that was encrypted with AES-256-GCM
 *
 * @param encryptedData - The encrypted data string (base64)
 * @param iv - The initialization vector (base64)
 * @param authTag - The authentication tag (base64)
 * @param userId - Optional user ID for audit logging
 * @param salt - Optional salt used during encryption (base64)
 * @param keyVersion - Optional key version used for encryption
 * @returns Decrypted data (parsed as JSON if it's valid JSON)
 */
export function decryptData(
  encryptedData: string,
  iv: string,
  authTag: string,
  userId?: string,
  salt?: string,
  keyVersion?: number
): any {
  try {
    if (!encryptionKey) {
      initializeEncryption();
    }

    // Convert base64 strings to buffers
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, ivBuffer);

    // Set auth tag
    decipher.setAuthTag(authTagBuffer);

    // If salt is provided, set it as AAD
    if (salt) {
      const saltBuffer = Buffer.from(salt, 'base64');
      decipher.setAAD(saltBuffer);
    }

    // Decrypt
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // Log security event if userId is provided
    if (userId) {
      logSecurityEvent(
        'data_decrypted',
        userId,
        { keyVersion: keyVersion || currentKeyVersion },
        'info'
      ).catch(err => {
        warn('Failed to log decryption event:', String(err));
      });
    }

    // Try to parse as JSON if possible
    try {
      return JSON.parse(decrypted);
    } catch {
      // If not valid JSON, return as string
      return decrypted;
    }
  } catch (err: unknown) {
    // Unified error message handling
    const errorMessage = isError(err)
      ? err.message
      : String(err);

    error(`Decryption error: ${errorMessage}`);
    throw new Error(`Decryption failed: ${errorMessage}`);
  }
}
/**
 * Legacy decrypt function for backward compatibility
 * This handles data encrypted with the old CBC mode
 *
 * @param encryptedData - The encrypted data string
 * @param iv - The initialization vector
 * @returns Decrypted data as an object
 * @deprecated Use the GCM version instead
 */
export function legacyDecryptData(encryptedData: string, iv: string): Record<string, any> {
  try {
    // For backward compatibility, derive key the same way
    const legacyKey = process.env.ENCRYPTION_KEY || DEFAULT_KEY;
    // Use the crypto-js library for backward compatibility
    const CryptoJS = require('crypto-js');
    // Convert IV from string to WordArray
    const ivParams = CryptoJS.enc.Hex.parse(iv);
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedData, legacyKey, {
      iv: ivParams,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    // Convert to string and parse as JSON
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error('Legacy decryption failed - invalid key or corrupted data');
    }
    return JSON.parse(decryptedString);
  } catch (err: unknown) {
    error('Failed to decrypt legacy data:', String(err));
    throw new Error(
      'Legacy decryption failed - data may be corrupted or encryption key is invalid'
    );
  }
}
/**
 * Unified credential payload structure
 * This ensures consistent structure for all credential data
 */
export interface CredentialPayload {
  // Core credential fields
  username?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  // Additional fields
  tokenType?: string;
  expiresAt?: string;
  scopes?: string[];
  // Service-specific fields
  [key: string]: any;
}
/**
 * Log a security-related event to the audit log
 *
 * @param eventType - Type of security event
 * @param userId - User ID associated with the event (if applicable)
 * @param eventData - Additional data about the event (no sensitive data)
 * @param severity - Severity level of the event
 */
export async function logSecurityEvent(
  eventType: string,
  userId?: string,
  eventData: Record<string, any> = {},
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): Promise<void> {
  try {
    await db.insert(securityAuditLogs).values({
      userId,
      eventType,
      eventData,
      severity,
      timestamp: new Date(),
    });
  } catch (error) {
    // Unified error message handling
    const errorMessage = isError(error)
      ? error instanceof Error
        ? error.message
        : String(error)
      : String(error);

    error(`Security event logging error: ${errorMessage}`);
  }
}
/**
 * Interface for key rotation options
 */
export interface KeyRotationOptions {
  oldKeyVersion: number;
  newKeyVersion: number;
  oldKey?: string;
  newKey?: string;
  batchSize?: number;
}

/**
 * Rotate encryption keys for stored data
 * This function should be called when changing encryption keys
 *
 * @param options - Key rotation options
 * @param tableName - Name of the table containing encrypted data
 * @param encryptedFields - Names of the encrypted fields
 * @returns Number of records updated
 */
export async function rotateEncryptionKeys(
  options: KeyRotationOptions,
  tableName: string,
  encryptedFields: {
    data: string;
    iv: string;
    authTag: string | null;
    salt?: string | null;
    keyVersion?: string | null;
  }
): Promise<number> {
  try {
    // Validate options
    if (options.oldKeyVersion === options.newKeyVersion) {
      throw new Error('Old and new key versions must be different');
    }

    // Set up keys
    const oldKeyEnvVar = `ENCRYPTION_KEY_V${options.oldKeyVersion}`;
    const oldKeyString = options.oldKey || process.env[oldKeyEnvVar];
    const newKeyString = options.newKey || process.env.ENCRYPTION_KEY;

    if (!oldKeyString || !newKeyString) {
      throw new Error(`Both old (${oldKeyEnvVar}) and new encryption keys are required`);
    }

    // Derive keys
    const oldSaltEnvVar = `ENCRYPTION_SALT_V${options.oldKeyVersion}`;
    const oldSalt = process.env[oldSaltEnvVar] || 'salt-v' + options.oldKeyVersion;
    const oldKey = crypto.scryptSync(oldKeyString, oldSalt, KEY_LENGTH);

    // Use current key for new encryption
    const currentKey = encryptionKey;
    const batchSize = options.batchSize || 100;

    // Log start of key rotation
    info(`Starting key rotation from version ${options.oldKeyVersion} to ${options.newKeyVersion} for table ${tableName}`);

    // Construct the field names for the query
    const dataField = encryptedFields.data;
    const ivField = encryptedFields.iv;
    const authTagField = encryptedFields.authTag;
    const saltField = encryptedFields.salt;
    const keyVersionField = encryptedFields.keyVersion;

    // Get total count of records to update
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`
    );
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    info(`Found ${totalRecords} records to process in ${tableName}`);

    let processedRecords = 0;
    let updatedRecords = 0;
    let offset = 0;

    // Process records in batches
    while (processedRecords < totalRecords) {
      // Fetch a batch of records
      let query = `
        SELECT id, ${dataField}, ${ivField}
        ${authTagField ? `, ${authTagField}` : ''}
        ${saltField ? `, ${saltField}` : ''}
        ${keyVersionField ? `, ${keyVersionField}` : ''}
        FROM ${tableName}
      `;

      // Add version filter if keyVersionField exists
      if (keyVersionField) {
        query += ` WHERE ${keyVersionField} = $1 OR ${keyVersionField} IS NULL`;
      }

      query += ` LIMIT ${batchSize} OFFSET ${offset}`;

      const records = await db.execute(
        sql.raw(query, keyVersionField ? [options.oldKeyVersion.toString()] : [])
      );

      if (records.rows.length === 0) {
        break;
      }

      // Process each record in the batch
      for (const record of records.rows) {
        try {
          // Extract encrypted data
          const encryptedData = record[dataField];
          const iv = record[ivField];
          const authTag = authTagField ? record[authTagField] : null;
          const salt = saltField ? record[saltField] : null;

          // Skip if any required field is missing
          if (!encryptedData || !iv) {
            debug(`Skipping record ${record.id} due to missing required fields`);
            processedRecords++;
            continue;
          }

          // Decrypt with old key
          let decryptedData;
          try {
            // If we have authTag and salt, use them
            if (authTag && salt) {
              decryptedData = decryptDataWithKey(
                encryptedData,
                iv,
                authTag,
                oldKey,
                salt
              );
            } else if (authTag) {
              // If we have authTag but no salt
              decryptedData = decryptDataWithKey(
                encryptedData,
                iv,
                authTag,
                oldKey
              );
            } else {
              // Legacy decryption without authTag
              // This is a simplified approach - in a real implementation,
              // you might need different decryption methods based on the encryption type
              decryptedData = legacyDecryptData(encryptedData, iv);
            }
          } catch (decryptErr) {
            warn(`Failed to decrypt record ${record.id}: ${String(decryptErr)}`);
            processedRecords++;
            continue;
          }

          // Re-encrypt with new key
          let newEncryptedData;
          try {
            // Generate a new salt for each record
            const newSalt = crypto.randomBytes(SALT_LENGTH).toString('base64');

            // Encrypt with current key
            newEncryptedData = encryptDataWithKey(
              decryptedData,
              currentKey,
              newSalt
            );
          } catch (encryptErr) {
            warn(`Failed to re-encrypt record ${record.id}: ${String(encryptErr)}`);
            processedRecords++;
            continue;
          }

          // Update record with new encrypted data
          let updateQuery = `
            UPDATE ${tableName}
            SET ${dataField} = $1, ${ivField} = $2
          `;

          const params = [
            newEncryptedData.encryptedData,
            newEncryptedData.iv
          ];

          let paramIndex = 3;

          if (authTagField) {
            updateQuery += `, ${authTagField} = $${paramIndex}`;
            params.push(newEncryptedData.authTag);
            paramIndex++;
          }

          if (saltField) {
            updateQuery += `, ${saltField} = $${paramIndex}`;
            params.push(newEncryptedData.salt);
            paramIndex++;
          }

          if (keyVersionField) {
            updateQuery += `, ${keyVersionField} = $${paramIndex}`;
            params.push(options.newKeyVersion.toString());
            paramIndex++;
          }

          updateQuery += ` WHERE id = $${paramIndex}`;
          params.push(record.id);

          await db.execute(sql.raw(updateQuery, params));
          updatedRecords++;
        } catch (recordErr) {
          error(`Error processing record ${record.id}: ${String(recordErr)}`);
        }

        processedRecords++;
      }

      // Move to next batch
      offset += records.rows.length;

      // Log progress
      info(`Processed ${processedRecords}/${totalRecords} records in ${tableName}, updated ${updatedRecords}`);
    }

    info(`Key rotation completed for table ${tableName}. Updated ${updatedRecords}/${totalRecords} records.`);
    return updatedRecords;
  } catch (err: unknown) {
    const errorMessage = isError(err) ? err.message : String(err);
    error(`Key rotation failed: ${errorMessage}`);
    throw new Error(`Key rotation failed: ${errorMessage}`);
  }
}

/**
 * Decrypt data with a specific key
 * Internal helper function for key rotation
 */
function decryptDataWithKey(
  encryptedData: string,
  iv: string,
  authTag: string,
  key: Buffer,
  salt?: string
): any {
  // Convert base64 strings to buffers
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);

  // Set auth tag
  decipher.setAuthTag(authTagBuffer);

  // If salt is provided, set it as AAD
  if (salt) {
    const saltBuffer = Buffer.from(salt, 'base64');
    decipher.setAAD(saltBuffer);
  }

  // Decrypt
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  // Try to parse as JSON if possible
  try {
    return JSON.parse(decrypted);
  } catch {
    // If not valid JSON, return as string
    return decrypted;
  }
}

/**
 * Encrypt data with a specific key
 * Internal helper function for key rotation
 */
function encryptDataWithKey(
  data: Record<string, any> | string,
  key: Buffer,
  salt?: string
): {
  encryptedData: string;
  iv: string;
  authTag: string;
  salt: string;
} {
  // Convert data to string if it's an object
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  // Generate a random initialization vector and salt
  const iv = crypto.randomBytes(IV_LENGTH);
  const saltBuffer = salt ? Buffer.from(salt, 'base64') : crypto.randomBytes(SALT_LENGTH);

  // Create cipher with key and IV
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Add salt as associated authenticated data (AAD)
  cipher.setAAD(saltBuffer);

  // Encrypt the data
  let encrypted = cipher.update(dataString, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: saltBuffer.toString('base64'),
  };
}

/**
 * Generate a secure encryption key
 *
 * @returns Object containing key in different formats
 */
export function generateSecureKey(): {
  base64: string;
  hex: string;
  raw: Buffer;
} {
  // Generate a secure random key
  const keyBuffer = crypto.randomBytes(KEY_LENGTH);

  return {
    base64: keyBuffer.toString('base64'),
    hex: keyBuffer.toString('hex'),
    raw: keyBuffer,
  };
}

/**
 * Test the encryption functionality
 * @returns true if encryption and decryption work correctly
 */
export function testEncryption(): boolean {
  try {
    // Test data
    const testData = {
      username: 'test@example.com',
      password: 'password123',
      apiKey: 'sk_test_12345',
      timestamp: new Date().toISOString(),
    };

    // Encrypt with salt
    const { encryptedData, iv, authTag, salt, keyVersion } = encryptData(testData);

    // Decrypt with salt
    const decrypted = decryptData(encryptedData, iv, authTag, undefined, salt, keyVersion);

    // Verify all fields match
    return (
      decrypted.username === testData.username &&
      decrypted.password === testData.password &&
      decrypted.apiKey === testData.apiKey &&
      decrypted.timestamp === testData.timestamp
    );
  } catch (err: unknown) {
    error('Encryption test failed:', String(err));
    return false;
  }
}

// Initialize encryption on module load
initializeEncryption();
