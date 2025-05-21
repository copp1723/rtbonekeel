/**
 * Encryption Utilities Tests
 *
 * Tests for the encryption utility functions
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeEncryption,
  encryptData,
  decryptData,
  isEncryptionConfigured,
  generateSecureKey,
  testEncryption,
  rotateEncryptionKeys,
  KeyRotationOptions
} from '../../../src/utils/encryption.js';

describe('Encryption Utilities', () => {
  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    process.env.ENCRYPTION_KEY = 'test-encryption-key-that-is-at-least-32-chars';
    process.env.ENCRYPTION_KEY_VERSION = '1';
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('initializeEncryption', () => {
    it('should initialize encryption with environment variables', () => {
      const result = initializeEncryption();
      expect(result).toBe(true);
    });

    it('should use default key in development when no key is provided', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.ENCRYPTION_KEY;

      const result = initializeEncryption();

      expect(result).toBe(false);
    });

    it('should throw an error in production when no key is provided', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ENCRYPTION_KEY;

      expect(() => initializeEncryption()).toThrow();
    });

    it('should validate key length in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENCRYPTION_KEY = 'short-key';

      expect(() => initializeEncryption()).toThrow();
    });
  });

  describe('encryptData and decryptData', () => {
    beforeEach(() => {
      // Initialize encryption before each test
      initializeEncryption();
    });

    it('should encrypt and decrypt string data', () => {
      const testData = 'test-string-data';

      const { encryptedData, iv, authTag, salt, keyVersion } = encryptData(testData);

      expect(encryptedData).toBeDefined();
      expect(iv).toBeDefined();
      expect(authTag).toBeDefined();
      expect(salt).toBeDefined();
      expect(keyVersion).toBe(1);

      const decrypted = decryptData(encryptedData, iv, authTag, undefined, salt, keyVersion);

      expect(decrypted).toBe(testData);
    });

    it('should encrypt and decrypt object data', () => {
      const testData = {
        username: 'test@example.com',
        password: 'password123',
        apiKey: 'sk_test_12345',
      };

      const { encryptedData, iv, authTag, salt, keyVersion } = encryptData(testData);

      expect(encryptedData).toBeDefined();
      expect(iv).toBeDefined();
      expect(authTag).toBeDefined();
      expect(salt).toBeDefined();
      expect(keyVersion).toBe(1);

      const decrypted = decryptData(encryptedData, iv, authTag, undefined, salt, keyVersion);

      expect(decrypted).toEqual(testData);
    });

    it('should throw an error when decrypting with invalid data', () => {
      const { encryptedData, iv, authTag, salt } = encryptData('test-data');

      // Modify the encrypted data to make it invalid
      const invalidEncryptedData = encryptedData + 'invalid';

      expect(() => decryptData(invalidEncryptedData, iv, authTag, undefined, salt)).toThrow();
    });

    it('should throw an error when decrypting with invalid auth tag', () => {
      const { encryptedData, iv, salt } = encryptData('test-data');

      // Create an invalid auth tag
      const invalidAuthTag = 'invalid-auth-tag';

      expect(() => decryptData(encryptedData, iv, invalidAuthTag, undefined, salt)).toThrow();
    });
  });

  describe('isEncryptionConfigured', () => {
    it('should return true when encryption is properly configured', () => {
      process.env.ENCRYPTION_KEY = 'test-encryption-key-that-is-at-least-32-chars';
      initializeEncryption();

      const result = isEncryptionConfigured();

      expect(result).toBe(true);
    });

    it('should return false in production when using default key', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ENCRYPTION_KEY;

      // This would normally throw, but we're mocking it to return false
      vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        initializeEncryption();
      } catch (err) {
        // Ignore the error
      }

      const result = isEncryptionConfigured();

      expect(result).toBe(false);
    });
  });

  describe('generateSecureKey', () => {
    it('should generate a secure key with correct formats', () => {
      const key = generateSecureKey();

      expect(key.base64).toBeDefined();
      expect(key.hex).toBeDefined();
      expect(key.raw).toBeDefined();

      // Check lengths
      expect(key.base64.length).toBeGreaterThanOrEqual(32);
      expect(key.hex.length).toBe(64); // 32 bytes = 64 hex characters
      expect(key.raw.length).toBe(32); // 32 bytes
    });
  });

  describe('testEncryption', () => {
    it('should successfully test encryption and decryption', () => {
      const result = testEncryption();

      expect(result).toBe(true);
    });
  });

  describe('rotateEncryptionKeys', () => {
    // Mock database
    const mockDb = {
      execute: vi.fn()
    };

    beforeEach(() => {
      // Setup environment for key rotation
      process.env.ENCRYPTION_KEY = 'new-encryption-key-that-is-at-least-32-chars';
      process.env.ENCRYPTION_KEY_VERSION = '2';
      process.env.ENCRYPTION_KEY_V1 = 'old-encryption-key-that-is-at-least-32-chars';
      process.env.ENCRYPTION_SALT = 'new-encryption-salt';
      process.env.ENCRYPTION_SALT_V1 = 'old-encryption-salt';

      // Initialize encryption
      initializeEncryption();

      // Mock database responses
      vi.mock('../../../src/shared/db.js', () => ({
        db: {
          execute: vi.fn().mockImplementation((query) => {
            if (query.sql && query.sql.includes('COUNT(*)')) {
              return Promise.resolve({ rows: [{ count: '5' }] });
            }

            // Mock record retrieval
            if (query.includes && query.includes('SELECT')) {
              return Promise.resolve({
                rows: [
                  {
                    id: '1',
                    encryptedData: 'encrypted1',
                    iv: 'iv1',
                    authTag: 'authTag1',
                    salt: 'salt1'
                  },
                  {
                    id: '2',
                    encryptedData: 'encrypted2',
                    iv: 'iv2',
                    authTag: 'authTag2',
                    salt: 'salt2'
                  }
                ]
              });
            }

            // Mock update
            return Promise.resolve({ rowCount: 2 });
          })
        }
      }), { virtual: true });
    });

    it('should rotate encryption keys for a table', async () => {
      // Setup rotation options
      const options: KeyRotationOptions = {
        oldKeyVersion: 1,
        newKeyVersion: 2,
        batchSize: 10
      };

      // Define encrypted fields mapping
      const encryptedFields = {
        data: 'encryptedData',
        iv: 'iv',
        authTag: 'authTag',
        salt: 'salt',
        keyVersion: 'keyVersion'
      };

      // Mock decryption and encryption functions
      const originalDecryptDataWithKey = global.decryptDataWithKey;
      const originalEncryptDataWithKey = global.encryptDataWithKey;

      // @ts-ignore - these are internal functions we're mocking
      global.decryptDataWithKey = vi.fn().mockReturnValue({ test: 'decrypted-data' });
      // @ts-ignore
      global.encryptDataWithKey = vi.fn().mockReturnValue({
        encryptedData: 'new-encrypted-data',
        iv: 'new-iv',
        authTag: 'new-auth-tag',
        salt: 'new-salt'
      });

      // Execute key rotation
      const result = await rotateEncryptionKeys(options, 'test_table', encryptedFields);

      // Verify results
      expect(result).toBeGreaterThan(0);

      // Restore original functions
      // @ts-ignore
      global.decryptDataWithKey = originalDecryptDataWithKey;
      // @ts-ignore
      global.encryptDataWithKey = originalEncryptDataWithKey;
    });

    it('should throw an error when old and new key versions are the same', async () => {
      const options: KeyRotationOptions = {
        oldKeyVersion: 1,
        newKeyVersion: 1
      };

      await expect(rotateEncryptionKeys(
        options,
        'test_table',
        { data: 'data', iv: 'iv', authTag: 'authTag' }
      )).rejects.toThrow('Old and new key versions must be different');
    });

    it('should throw an error when keys are missing', async () => {
      delete process.env.ENCRYPTION_KEY_V1;

      const options: KeyRotationOptions = {
        oldKeyVersion: 1,
        newKeyVersion: 2
      };

      await expect(rotateEncryptionKeys(
        options,
        'test_table',
        { data: 'data', iv: 'iv', authTag: 'authTag' }
      )).rejects.toThrow('Both old');
    });
  });
});
