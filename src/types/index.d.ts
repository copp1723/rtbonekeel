/**
 * Global type declarations
 */

// Extend Express Request to include user property
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      claims?: {
        sub: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}