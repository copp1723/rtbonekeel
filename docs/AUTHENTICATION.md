# Authentication Implementation

This document outlines the authentication implementation in the Row The Boat application, including both frontend and backend authentication flows.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Authentication](#frontend-authentication)
3. [Backend Authentication](#backend-authentication)
4. [Authentication Flow](#authentication-flow)
5. [Token Format](#token-format)
6. [Token Storage](#token-storage)
7. [Token Renewal](#token-renewal)
8. [Security Considerations](#security-considerations)
9. [Best Practices](#best-practices)

## Overview

The Row The Boat application uses a dual authentication system:

1. **Frontend Authentication**: Implemented using NextAuth.js for the frontend application
2. **Backend Authentication**: Implemented using JWT-based authentication for the backend API

Both systems are designed to work together seamlessly, with the frontend authentication tokens being compatible with the backend authentication system.

## Frontend Authentication

### NextAuth.js Implementation

The frontend uses NextAuth.js, a complete authentication solution for Next.js applications. It supports multiple authentication providers:

- **Credentials Provider**: Email/password authentication
- **Google Provider**: OAuth authentication with Google
- **GitHub Provider**: OAuth authentication with GitHub

### Configuration

The NextAuth.js configuration is defined in `frontend/src/lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({...}),
    GoogleProvider({...}),
    GithubProvider({...}),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({...}) {...},
    async jwt({...}) {...}
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Authentication Pages

Custom authentication pages are implemented in the frontend:

- Sign In: `/auth/signin`
- Sign Out: `/auth/signout`
- Error: `/auth/error`
- Verify Request: `/auth/verify-request`
- New User: `/auth/new-user`

## Backend Authentication

### JWT-Based Implementation

The backend uses JWT (JSON Web Token) based authentication, implemented in `src/server/auth.js`. Key features include:

- Token verification middleware
- Role-based access control
- Token generation and validation utilities
- Session management

### Middleware

The authentication middleware extracts and verifies JWT tokens from:

1. Authorization header (`Bearer` token)
2. Cookies (`token` or `next-auth.session-token`)
3. Query parameters (for development only)

### Authentication Routes

The backend provides several authentication-related routes:

- `GET /api/auth/user`: Get the current user's information
- `POST /api/auth/login`: Log in with username and password
- `POST /api/auth/refresh`: Refresh an expired token
- `POST /api/auth/logout`: Log out and invalidate the token

## Authentication Flow

### Sign In Flow

1. User submits credentials on the frontend sign-in page
2. NextAuth.js validates the credentials
3. If valid, NextAuth.js generates a JWT token
4. The token is stored in a cookie
5. The user is redirected to the protected page

### API Request Flow

1. Frontend makes a request to the backend API
2. The request includes the JWT token in the Authorization header or cookie
3. Backend middleware extracts and verifies the token
4. If valid, the user information is attached to the request
5. The API route handler processes the request
6. If invalid, the request is rejected with a 401 Unauthorized response

## Token Format

### JWT Structure

The JWT tokens have the following structure:

```json
{
  "sub": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "user",
  "iat": 1625097600,
  "exp": 1625184000
}
```

- `sub`: Subject (user ID)
- `name`: User's name
- `email`: User's email
- `role`: User's role (e.g., "user", "admin")
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Token Storage

### Frontend Storage

On the frontend, tokens are stored in:

- HTTP-only cookies (primary method)
- Local storage (as a fallback, with appropriate security measures)

### Backend Storage

On the backend, tokens are not stored. Instead, they are verified on each request.

## Token Renewal

### Automatic Renewal

NextAuth.js automatically handles token renewal when a token is about to expire. The process is:

1. When a token is close to expiration, a new token is requested
2. The new token is stored in the cookie
3. Subsequent requests use the new token

### Manual Renewal

For manual renewal, the frontend can call the `/api/auth/refresh` endpoint with the current token to get a new token.

## Security Considerations

### CORS Configuration

The backend API has CORS (Cross-Origin Resource Sharing) configured to only allow requests from trusted origins:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
```

### HTTPS

In production, all communication should be over HTTPS to prevent token interception.

### Token Expiration

Tokens have a limited lifetime (default: 1 day) to minimize the impact of token theft.

### HTTP-Only Cookies

Tokens are stored in HTTP-only cookies to prevent access by JavaScript, protecting against XSS attacks.

## Best Practices

1. **Always use HTTPS** in production to protect tokens in transit
2. **Set appropriate CORS headers** to prevent unauthorized cross-origin requests
3. **Use HTTP-only cookies** for token storage to prevent XSS attacks
4. **Implement token renewal** to maintain user sessions securely
5. **Validate tokens on every request** to ensure security
6. **Use short token lifetimes** to minimize the impact of token theft
7. **Implement proper error handling** for authentication failures
8. **Log authentication events** for security monitoring
9. **Use environment variables** for secrets and configuration
10. **Regularly rotate secrets** used for token signing
