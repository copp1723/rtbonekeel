# Encryption Standards and Best Practices

This document outlines the encryption standards, implementation details, and best practices used in the Row The Boat application.

## Table of Contents

1. [Overview](#overview)
2. [Encryption Algorithm](#encryption-algorithm)
3. [Key Management](#key-management)
4. [Salt Management](#salt-management)
5. [Key Rotation](#key-rotation)
6. [Implementation Details](#implementation-details)
7. [Security Considerations](#security-considerations)
8. [Best Practices](#best-practices)

## Overview

The Row The Boat application uses strong encryption to protect sensitive data, including:

- API keys and credentials
- User authentication tokens
- Sensitive business data

All encryption operations are implemented using industry-standard algorithms and practices to ensure data confidentiality, integrity, and authenticity.

## Encryption Algorithm

### AES-256-GCM

The application uses the AES-256-GCM (Advanced Encryption Standard with 256-bit key in Galois/Counter Mode) algorithm for all encryption operations. This provides:

- **Confidentiality**: Data is encrypted and cannot be read without the key
- **Integrity**: Any tampering with the encrypted data will be detected
- **Authenticity**: The data can be verified as coming from a trusted source

AES-256-GCM is a widely accepted, secure encryption algorithm recommended by security experts and organizations like NIST.

### Implementation Details

- **Key Length**: 256 bits (32 bytes)
- **IV Length**: 16 bytes (randomly generated for each encryption operation)
- **Authentication Tag Length**: 16 bytes
- **Salt Length**: 16 bytes (randomly generated for each encryption operation)

## Key Management

### Key Requirements

- **Minimum Length**: 32 characters
- **Entropy Requirements**: Must contain at least 3 of the following character classes:
  - Lowercase letters
  - Uppercase letters
  - Numbers
  - Special characters
- **Storage**: Keys must be stored in environment variables, never hardcoded in the application

### Key Generation

For generating secure encryption keys, use one of the following methods:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment Variables

The following environment variables are used for encryption:

- `ENCRYPTION_KEY`: The primary encryption key
- `ENCRYPTION_KEY_VERSION`: The current version of the encryption key (for rotation)
- `ENCRYPTION_SALT`: A global salt used for key derivation
- `ENCRYPTION_KEY_V{n}`: Previous versions of the encryption key (for rotation)
- `ENCRYPTION_SALT_V{n}`: Previous versions of the salt (for rotation)

## Salt Management

### Per-Operation Salt

Each encryption operation uses a unique, randomly generated salt to enhance security. This salt is:

1. Generated using a cryptographically secure random number generator
2. Stored alongside the encrypted data
3. Used during decryption to ensure data integrity

### Benefits of Per-Operation Salt

- Prevents rainbow table attacks
- Ensures that identical plaintext data encrypts to different ciphertext
- Adds an additional layer of security beyond the encryption key

## Key Rotation

### When to Rotate Keys

Keys should be rotated in the following scenarios:

- On a regular schedule (e.g., every 90 days)
- When a security incident is suspected
- When a team member with access to the keys leaves the organization
- When moving from development to production

### Key Rotation Process

1. Generate a new encryption key
2. Increment the `ENCRYPTION_KEY_VERSION` environment variable
3. Store the old key as `ENCRYPTION_KEY_V{previous-version}`
4. Update the `ENCRYPTION_KEY` environment variable with the new key
5. Run the key rotation utility to re-encrypt sensitive data

### Rotation Utility

The application provides a key rotation utility that:

1. Identifies all encrypted data in the database
2. Decrypts the data using the old key
3. Re-encrypts the data using the new key
4. Updates the database records with the new encrypted data

## Implementation Details

The encryption implementation is located in `src/utils/encryption.ts` and provides the following functions:

- `initializeEncryption()`: Sets up the encryption module with the appropriate keys
- `encryptData()`: Encrypts data using AES-256-GCM with a unique salt
- `decryptData()`: Decrypts data that was encrypted with AES-256-GCM
- `rotateEncryptionKeys()`: Rotates encryption keys for stored data
- `generateSecureKey()`: Generates a secure encryption key
- `testEncryption()`: Tests the encryption functionality

## Security Considerations

### Development vs. Production

- In development, a default key may be used for convenience
- In production, a secure, randomly generated key is required
- The application will refuse to start in production without a proper encryption key

### Key Storage

- Never store encryption keys in the codebase
- Use environment variables or a secure key management service
- Consider using a service like AWS KMS, Google Cloud KMS, or HashiCorp Vault for production

### Logging and Monitoring

- All encryption and decryption operations are logged (without sensitive data)
- Failed encryption or decryption attempts trigger security alerts
- Key rotation events are logged and monitored

## Best Practices

1. **Never hardcode encryption keys** in the application code or commit them to version control
2. **Rotate keys regularly** according to your organization's security policy
3. **Use unique salts** for each encryption operation
4. **Validate key entropy** to ensure keys are sufficiently secure
5. **Implement proper error handling** to prevent information leakage
6. **Monitor encryption operations** for suspicious activity
7. **Backup encryption keys** securely to prevent data loss
8. **Document key rotation procedures** for operational staff
9. **Train developers** on proper encryption practices
10. **Conduct regular security audits** of the encryption implementation
