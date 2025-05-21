/**
 * Authentication Module
 * 
 * Provides JWT-based authentication for the backend API
 * Compatible with NextAuth.js frontend authentication
 */
import jwt from 'jsonwebtoken';
import { debug, info, warn, error } from '../shared/logger.js';
import { db } from '../shared/db.js';
import { users, sessions } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { isError } from '../utils/errorUtils.js';

// Default JWT options
const DEFAULT_JWT_OPTIONS = {
  expiresIn: '1d', // 1 day
};

// Default cookie options
const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Set up authentication middleware and routes for Express
 * 
 * @param app - Express application
 */
export async function setupAuth(app) {
  // Get JWT secret from environment
  const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!jwtSecret) {
    warn('JWT_SECRET or NEXTAUTH_SECRET not set. Using a default secret for development.');
  }
  
  // Set up middleware to parse JWT tokens
  app.use(async (req, res, next) => {
    try {
      // Skip auth for public routes
      if (isPublicRoute(req.path)) {
        return next();
      }
      
      // Get token from Authorization header or cookie
      const token = extractToken(req);
      
      if (!token) {
        // No token, continue without authentication
        return next();
      }
      
      // Verify and decode the token
      const decoded = jwt.verify(token, jwtSecret || 'development-jwt-secret');
      
      // Set user information on the request
      req.user = {
        claims: {
          sub: decoded.sub || decoded.id,
          name: decoded.name,
          email: decoded.email,
          ...decoded,
        },
        token,
      };
      
      next();
    } catch (err) {
      // Token verification failed, continue without authentication
      debug('Auth token verification failed:', isError(err) ? err.message : String(err));
      next();
    }
  });
  
  // Log successful setup
  info('Authentication middleware set up successfully');
}

/**
 * Middleware to check if a user is authenticated
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function isAuthenticated(req, res, next) {
  if (!req.user || !req.user.claims || !req.user.claims.sub) {
    return res.status(401).json({
      status: 'error',
      code: 'unauthorized',
      message: 'Authentication required',
    });
  }
  
  next();
}

/**
 * Middleware to check if a user has admin role
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function isAdmin(req, res, next) {
  if (!req.user || !req.user.claims || !req.user.claims.sub) {
    return res.status(401).json({
      status: 'error',
      code: 'unauthorized',
      message: 'Authentication required',
    });
  }
  
  // Check if user has admin role
  const isUserAdmin = req.user.claims.role === 'admin';
  
  if (!isUserAdmin) {
    return res.status(403).json({
      status: 'error',
      code: 'forbidden',
      message: 'Admin access required',
    });
  }
  
  next();
}

/**
 * Generate a JWT token for a user
 * 
 * @param user - User object
 * @param options - JWT options
 * @returns JWT token
 */
export function generateToken(user, options = {}) {
  const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'development-jwt-secret';
  const jwtOptions = { ...DEFAULT_JWT_OPTIONS, ...options };
  
  // Create payload
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  
  // Sign token
  return jwt.sign(payload, jwtSecret, jwtOptions);
}

/**
 * Verify a JWT token
 * 
 * @param token - JWT token
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'development-jwt-secret';
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    debug('Token verification failed:', isError(err) ? err.message : String(err));
    return null;
  }
}

/**
 * Extract JWT token from request
 * 
 * @param req - Express request
 * @returns JWT token or null if not found
 */
function extractToken(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  if (req.cookies && (req.cookies.token || req.cookies['next-auth.session-token'])) {
    return req.cookies.token || req.cookies['next-auth.session-token'];
  }
  
  // Check query parameter (not recommended for production)
  if (req.query && req.query.token) {
    return req.query.token;
  }
  
  return null;
}

/**
 * Check if a route is public (no authentication required)
 * 
 * @param path - Request path
 * @returns true if the route is public
 */
function isPublicRoute(path) {
  const publicRoutes = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api-docs',
  ];
  
  // Check if the path matches any public route
  return publicRoutes.some(route => path.startsWith(route));
}

/**
 * Get user by ID
 * 
 * @param userId - User ID
 * @returns User object or null if not found
 */
export async function getUserById(userId) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    return user || null;
  } catch (err) {
    error('Failed to get user by ID:', isError(err) ? err.message : String(err));
    return null;
  }
}

/**
 * Get user by email
 * 
 * @param email - User email
 * @returns User object or null if not found
 */
export async function getUserByEmail(email) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user || null;
  } catch (err) {
    error('Failed to get user by email:', isError(err) ? err.message : String(err));
    return null;
  }
}

export default {
  setupAuth,
  isAuthenticated,
  isAdmin,
  generateToken,
  verifyToken,
  getUserById,
  getUserByEmail,
};
