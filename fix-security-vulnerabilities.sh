#!/bin/bash
set -e

echo "Running security vulnerability fixes..."

# Run npm audit to identify vulnerabilities
echo "Identifying vulnerabilities..."
npm audit --json > vulnerabilities.json

# Install security-focused middleware
echo "Installing security middleware..."
npm install --save helmet express-rate-limit hpp

# Update dependencies with known security issues
echo "Updating dependencies with known security issues..."

# Create backup of package.json
cp package.json package.json.bak

# Update crypto-related packages
npm install --save crypto-js@latest jsonwebtoken@latest

# Update authentication-related packages
npm install --save passport@latest express-session@latest

# Update HTTP-related packages
npm install --save express@latest axios@latest

# Update database-related packages
npm install --save pg@latest drizzle-orm@latest

# Create security middleware if it doesn't exist
if [ ! -f "src/middleware/security.ts" ]; then
  echo "Creating security middleware..."
  mkdir -p src/middleware
  cat > src/middleware/security.ts << 'EOL'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { Express } from 'express';

export function setupSecurityMiddleware(app: Express): void {
  // Set security-related HTTP headers
  app.use(helmet());
  
  // Prevent parameter pollution
  app.use(hpp());
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  
  // Apply rate limiting to all API routes
  app.use('/api/', apiLimiter);
}
EOL
fi

# Create a secure encryption service
if [ ! -f "src/services/encryptionService.ts" ]; then
  echo "Creating secure encryption service..."
  mkdir -p src/services
  cat > src/services/encryptionService.ts << 'EOL'
import CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';

export class EncryptionService {
  private readonly key: string;
  private readonly ivLength = 16;

  constructor(key?: string) {
    this.key = key || this.generateSecureKey();
  }

  private generateSecureKey(): string {
    return randomBytes(32).toString('hex');
  }

  encrypt(data: string): { ciphertext: string; iv: string; authTag: string } {
    const iv = CryptoJS.lib.WordArray.random(this.ivLength);
    
    const encrypted = CryptoJS.AES.encrypt(data, this.key, {
      iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const authTag = encrypted.toString().slice(-24);
    
    return {
      ciphertext,
      iv: iv.toString(CryptoJS.enc.Base64),
      authTag
    };
  }

  decrypt(ciphertext: string, iv: string, authTag: string): string {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
      iv: CryptoJS.enc.Base64.parse(iv)
    });
    
    const fullCiphertext = cipherParams.toString() + authTag;
    
    const decrypted = CryptoJS.AES.decrypt(fullCiphertext, this.key, {
      iv: CryptoJS.enc.Base64.parse(iv),
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export const encryptionService = new EncryptionService(process.env.ENCRYPTION_KEY);
EOL
fi

echo "Security vulnerability fixes completed!"