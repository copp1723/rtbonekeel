/**
 * Key Rotation Service Tests
 * 
 * Tests for the key rotation service functionality
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  initializeKeyRotation,
  rotateKeys,
  getActiveKeyId
} from '../../../src/services/keyRotationService.js';
import { 
  rotateEncryptionKeys,
  encryptData,
  decryptData,
  initializeEncryption
} from '../../../src/utils/encryption.js';

// Mock dependencies
vi.mock('../../../src/shared/db.js', () => ({
  db: {
    execute: vi.fn(),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({})
    })
  }
}));

vi.mock('../../../src/shared/logger.js', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}));

vi.mock('../../../src/utils/encryption.js', () => ({
  rotateEncryptionKeys: vi.fn().mockResolvedValue(5),
  encryptData: vi.fn(),
  decryptData: vi.fn(),
  initializeEncryption: vi.fn(),
  generateSecureKey: vi.fn().mockReturnValue({
    base64: 'new-secure-key-base64',
    hex: 'new-secure-key-hex',
    raw: Buffer.from('new-secure-key')
  })
}));

vi.mock('node-cron', () => ({
  schedule: vi.fn(),
  validate: vi.fn().mockReturnValue(true)
}));

describe('Key Rotation Service', () => {
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Setup test environment
    process.env.ENCRYPTION_KEY = 'test-encryption-key';
    process.env.ENCRYPTION_KEY_VERSION = '1';
    process.env.ENCRYPTION_SALT = 'test-encryption-salt';
    process.env.ENCRYPTION_KEY_V1 = 'test-encryption-key-v1';
    process.env.ENCRYPTION_SALT_V1 = 'test-encryption-salt-v1';
    
    // Clear mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore environment
    process.env = { ...originalEnv };
  });
  
  describe('initializeKeyRotation', () => {
    it('should initialize with default options when none provided', async () => {
      const result = await initializeKeyRotation();
      
      expect(result).toBe(true);
    });
    
    it('should initialize with provided options', async () => {
      const options = {
        enabled: true,
        schedule: '0 0 * * *',
        autoRotationDays: 30
      };
      
      const result = await initializeKeyRotation(options);
      
      expect(result).toBe(true);
    });
    
    it('should handle initialization errors', async () => {
      // Mock a failure
      vi.mock('node-cron', () => ({
        schedule: vi.fn().mockImplementation(() => {
          throw new Error('Cron error');
        }),
        validate: vi.fn().mockReturnValue(true)
      }), { virtual: true });
      
      const result = await initializeKeyRotation({ enabled: true });
      
      expect(result).toBe(false);
    });
  });
  
  describe('rotateKeys', () => {
    it('should rotate keys for all tables with encrypted data', async () => {
      const result = await rotateKeys();
      
      // Should call rotateEncryptionKeys for each table
      expect(rotateEncryptionKeys).toHaveBeenCalled();
      
      // Should log the rotation events
      expect(vi.mocked(require('../../../src/shared/db.js').db.insert)).toHaveBeenCalledTimes(2);
    });
    
    it('should respect minimum key age when provided', async () => {
      // Set up a recent last rotation
      await rotateKeys(); // This sets lastRotation to now
      
      // Try to rotate again with a minimum age requirement
      await rotateKeys({ minKeyAgeDays: 30 });
      
      // Should not have rotated keys again
      expect(rotateEncryptionKeys).toHaveBeenCalledTimes(1);
    });
    
    it('should handle rotation errors', async () => {
      // Mock a failure in rotateEncryptionKeys
      vi.mocked(rotateEncryptionKeys).mockRejectedValueOnce(new Error('Rotation error'));
      
      await expect(rotateKeys()).rejects.toThrow('Key rotation failed');
      
      // Should log the failure
      expect(vi.mocked(require('../../../src/shared/db.js').db.insert)).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getActiveKeyId', () => {
    it('should return the current key version', async () => {
      process.env.ENCRYPTION_KEY_VERSION = '2';
      
      const keyId = await getActiveKeyId();
      
      expect(keyId).toBe('2');
    });
    
    it('should return default version if not set', async () => {
      delete process.env.ENCRYPTION_KEY_VERSION;
      
      const keyId = await getActiveKeyId();
      
      expect(keyId).toBe('1');
    });
  });
});
