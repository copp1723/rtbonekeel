#!/bin/bash
set -e

echo "Running security hardening script..."

# Install security-focused dependencies
echo "Installing security dependencies..."
npm install --save helmet express-rate-limit csurf hpp express-validator

# Install audit tools
echo "Installing security audit tools..."
npm install --save-dev audit-ci snyk

# Run security audit
echo "Running npm audit..."
npm audit --audit-level=high

# Run Snyk security test if available
if command -v snyk &> /dev/null; then
  echo "Running Snyk security test..."
  snyk test || true
else
  echo "Snyk not found, skipping Snyk security test"
fi

# Create security middleware file if it doesn't exist
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
  
  // Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  }));
  
  // No Sniff
  app.use(helmet.noSniff());
  
  // XSS Protection
  app.use(helmet.xssFilter());
  
  // Referrer Policy
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  
  // Disable X-Powered-By header
  app.disable('x-powered-by');
}
EOL
fi

# Update server initialization to use security middleware
if grep -q "setupSecurityMiddleware" "src/server/index.ts"; then
  echo "Security middleware already imported in server/index.ts"
else
  echo "Adding security middleware to server initialization..."
  # This is a simplified approach - might need manual adjustment
  sed -i '/import express/a import { setupSecurityMiddleware } from "../middleware/security.js";' src/server/index.ts
  sed -i '/const app = express/a setupSecurityMiddleware(app);' src/server/index.ts
fi

echo "Security hardening completed!"