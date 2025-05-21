# Troubleshooting Guide

This document provides solutions for common issues you might encounter when setting up, developing, or running the Row The Boat application.

## Table of Contents

1. [Environment Setup Issues](#environment-setup-issues)
2. [Database Connection Issues](#database-connection-issues)
3. [Redis Connection Issues](#redis-connection-issues)
4. [Build and Compilation Errors](#build-and-compilation-errors)
5. [Runtime Errors](#runtime-errors)
6. [Testing Issues](#testing-issues)
7. [Authentication Issues](#authentication-issues)
8. [Email Service Issues](#email-service-issues)
9. [Performance Issues](#performance-issues)
10. [Common Installation Issues](#common-installation-issues)
11. [Common Build Issues (npm run build)](#common-build-issues-npm-run-build)
12. [Common Test Issues (npm test)](#common-test-issues-npm-test)

## Environment Setup Issues

### Missing Environment Variables

**Problem:** Application fails to start with errors about missing environment variables.

**Solution:**
1. Check that you've copied `.env.example` to `.env`
2. Verify all required variables are set in your `.env` file
3. Check the [Environment Variables Documentation](ENVIRONMENT_VARIABLES.md) for required variables

```bash
# Example error
Error: Missing required environment variable: DATABASE_URL
```

### Node.js Version Mismatch

**Problem:** Errors related to unsupported JavaScript features.

**Solution:**
1. Verify you're using Node.js v16 or higher
2. Check your Node.js version with `node --version`
3. Consider using nvm to manage Node.js versions:

```bash
nvm install 16
nvm use 16
```

## Database Connection Issues

### Connection Refused

**Problem:** Application fails to connect to the database with "connection refused" errors.

**Solution:**
1. Verify PostgreSQL is running
2. Check your database connection string in `.env`
3. Ensure the database exists and the user has proper permissions

```bash
# Example error
Error: connect ECONNREFUSED 127.0.0.1:5432
```

### Authentication Failed

**Problem:** Database connection fails with authentication errors.

**Solution:**
1. Verify username and password in your connection string
2. Check that the database user exists and has the correct password
3. Ensure the user has appropriate permissions

```bash
# Example error
Error: password authentication failed for user "postgres"
```

### Missing Tables

**Problem:** Application fails with errors about missing tables.

**Solution:**
1. Run database migrations:
   ```bash
   npm run migrate
   ```
2. Check migration logs for errors
3. Verify the database schema matches the expected schema

## Redis Connection Issues

### Redis Connection Refused

**Problem:** Application fails to connect to Redis.

**Solution:**
1. Verify Redis is running
2. Check your Redis connection string in `.env`
3. Try connecting to Redis using the redis-cli:
   ```bash
   redis-cli ping
   ```

```bash
# Example error
Error: Redis connection to 127.0.0.1:6379 failed - connect ECONNREFUSED 127.0.0.1:6379
```

### Redis Authentication Failed

**Problem:** Redis connection fails with authentication errors.

**Solution:**
1. Verify the Redis password in your connection string
2. Check if Redis is configured to require authentication
3. Try connecting with the password using redis-cli:
   ```bash
   redis-cli -a your_password ping
   ```

## Build and Compilation Errors

### TypeScript Compilation Errors

**Problem:** Build fails with TypeScript errors.

**Solution:**
1. Fix the TypeScript errors reported in the console
2. Run `npm run type-check` to see all type errors
3. Check for missing type definitions or incorrect imports

```bash
# Example error
TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

### Missing Dependencies

**Problem:** Build fails with errors about missing modules.

**Solution:**
1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```
2. Check for outdated dependencies:
   ```bash
   npm outdated
   ```
3. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

## Runtime Errors

### Unhandled Promise Rejections

**Problem:** Application crashes with "Unhandled Promise Rejection" errors.

**Solution:**
1. Add proper error handling to async functions
2. Check the error message for specific issues
3. Add try/catch blocks around problematic code

```bash
# Example error
UnhandledPromiseRejectionWarning: Error: Request failed with status code 404
```

### Memory Leaks

**Problem:** Application memory usage grows over time.

**Solution:**
1. Check for event listeners that aren't being removed
2. Look for large objects being cached indefinitely
3. Use tools like `node --inspect` and Chrome DevTools to profile memory usage

## Testing Issues

### Tests Failing Due to Timeouts

**Problem:** Tests fail with timeout errors.

**Solution:**
1. Increase the test timeout in `vitest.config.ts`
2. Check for asynchronous operations that aren't properly awaited
3. Verify that external services used in tests are available

```bash
# Example error
Error: Test timed out in 5000ms
```

### Database Tests Failing

**Problem:** Database-related tests are failing.

**Solution:**
1. Ensure the test database is set up correctly
2. Check that migrations have been run on the test database
3. Verify that test data is being properly cleaned up between tests

### Mock/Stub Issues

**Problem:** Tests fail because mocks or stubs aren't working as expected.

**Solution:**
1. Check that you're importing the correct module to mock
2. Verify that the mock implementation matches the expected interface
3. Ensure mocks are reset between tests

## Authentication Issues

### JWT Token Issues

**Problem:** Authentication fails with JWT-related errors.

**Solution:**
1. Check that `JWT_SECRET` is set in your environment variables
2. Verify that tokens haven't expired
3. Ensure the token is being sent in the correct format (e.g., `Bearer <token>`)

```bash
# Example error
Error: jwt malformed
```

### Session Expiration

**Problem:** Users are logged out unexpectedly.

**Solution:**
1. Check the session duration in your configuration
2. Verify that Redis (if used for session storage) is working correctly
3. Check for issues with the session middleware

## Email Service Issues

### Email Sending Failures

**Problem:** Application fails to send emails.

**Solution:**
1. Verify your email service credentials in `.env`
2. Check that the email service is available
3. Look for specific error messages from the email provider

```bash
# Example error
Error: Invalid API key provided
```

<!-- OTP verification section removed -->

## Performance Issues

### Slow API Responses

**Problem:** API endpoints are responding slowly.

**Solution:**
1. Check database query performance with `EXPLAIN ANALYZE`
2. Look for N+1 query problems
3. Consider adding caching for frequently accessed data
4. Monitor CPU and memory usage during high load

### High Memory Usage

**Problem:** Application uses more memory than expected.

**Solution:**
1. Check for memory leaks using profiling tools
2. Review large object caching strategies
3. Consider implementing pagination for large data sets
4. Monitor memory usage patterns over time

## Common Installation Issues

### Docker Not Found or Not Running

**Problem:** `docker-compose up -d` fails with an error indicating Docker is not found or the Docker daemon is not running.

**Solution:**
1.  **Install Docker:** Download and install Docker Desktop from the [official Docker website](https://www.docker.com/products/docker-desktop).
2.  **Start Docker:** Ensure the Docker Desktop application is running.
3.  **Permissions (Linux):** If you are on Linux, you might need to add your user to the `docker` group: `sudo usermod -aG docker $USER` and then log out and log back in.

### Port Conflicts (PostgreSQL/Redis)

**Problem:** `docker-compose up -d` fails because port `5432` (PostgreSQL) or `6379` (Redis) is already in use.

**Solution:**
1.  **Identify Conflicting Process:** Use a command like `sudo lsof -i :5432` (for port 5432) or `sudo lsof -i :6379` (for port 6379) to find the process using the port.
2.  **Stop Conflicting Process:** Stop the identified process. If it's another PostgreSQL or Redis instance you don't need, stop it. If it's essential, you'll need to change the ports in `docker-compose.yml`.
3.  **Change Docker Compose Ports (if necessary):**
    Open `docker-compose.yml` and change the port mapping. For example, for PostgreSQL:
    ```yaml
    services:
      postgres:
        # ... other settings
        ports:
          - "5433:5432" # Host port 5433 maps to container port 5432
    ```
    Then update your `.env` file (`DB_PORT=5433`). Do similarly for Redis if needed.

### `npm install` Fails (Backend or Frontend)

**Problem:** `npm install` fails with errors related to package downloads, native module builds (e.g., `node-gyp`), or permissions.

**Solution:**
1.  **Check Network Connection:** Ensure you have a stable internet connection.
2.  **Node.js and npm Versions:** Verify you are using the prerequisite versions (Node.js v16+, npm v7+). Use `node -v` and `npm -v`.
3.  **Clear npm Cache:** `npm cache clean --force`
4.  **Remove `node_modules` and `package-lock.json`:**
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
    (Do this in both the root directory and the `frontend` directory if applicable).
5.  **Build Tools (for native modules):** If errors mention `node-gyp` or C++ compilation, you might be missing build tools. Refer to the `node-gyp` documentation for your OS to install them (e.g., `xcode-select --install` on macOS, `sudo apt-get install -y build-essential` on Debian/Ubuntu, or install Windows Build Tools via `npm install --global --production windows-build-tools`).
6.  **Permissions:** If you see permission errors (EACCES), avoid using `sudo npm install`. Fix your npm permissions instead. Refer to the [npm documentation on fixing permissions](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

## Common Build Issues (`npm run build`)

### TypeScript Errors

**Problem:** `npm run build` (for the backend) or `npm run build` in `frontend/` fails with TypeScript compilation errors (e.g., `TS2322: Type 'X' is not assignable to type 'Y'`).

**Solution:**
1.  **Review Error Messages:** The TypeScript compiler usually provides detailed error messages and line numbers. Carefully examine these.
2.  **Check Type Definitions:** Ensure all types are correctly defined and imported.
3.  **`tsconfig.json`:** Verify your `tsconfig.json` settings are appropriate for the project.
4.  **Run Type Checker:** Use `npm run type-check` (in the root for backend, or in `frontend/` for frontend) to get a list of all type errors without running a full build.

### Frontend Build Fails (e.g., Next.js errors)

**Problem:** `cd frontend && npm run build` fails with errors specific to Next.js or frontend dependencies.

**Solution:**
1.  **Check Next.js Version:** Ensure it's compatible with your Node.js version.
2.  **Environment Variables:** Some frontend build processes might require specific `NEXT_PUBLIC_` environment variables to be set. Check your `.env` file in the `frontend` directory or the root `.env` if it's configured to be shared.
3.  **Dependency Issues:** Ensure all frontend dependencies are correctly installed and compatible. Try reinstalling them as described in the `npm install` troubleshooting section.

## Common Test Issues (`npm test`)

### Tests Fail Due to Database Connection

**Problem:** Integration tests or tests requiring a database connection fail.

**Solution:**
1.  **Database Running:** Ensure your PostgreSQL Docker container is running (`docker ps` should show it).
2.  **Test Environment Variables:** Verify your `.env.test` (if used) or `.env` file has the correct database connection details for the test environment.
3.  **Migrations for Test DB:** Ensure migrations have been run on your test database. Some testing setups create a separate test database; ensure it's properly initialized.
    ```bash
    # Example: If using a separate test DB defined in .env.test
    NODE_ENV=test npm run migrate
    ```

### Tests Fail Due to Redis Connection

**Problem:** Tests requiring Redis fail to connect.

**Solution:**
1.  **Redis Running:** Ensure your Redis Docker container is running (`docker ps` should show it).
2.  **Test Environment Variables:** Verify your `.env.test` (if used) or `.env` file has the correct Redis connection details.

### Jest/Vitest Configuration Issues

**Problem:** Tests fail with errors related to Jest or Vitest configuration, module resolution, or transformers.

**Solution:**
1.  **Check `jest.config.js` or `vitest.config.ts`:** Review the configuration files for any misconfigurations.
2.  **Module Mocks:** If you're mocking modules, ensure the mocks are correctly set up in the `__mocks__` directory or via `jest.mock()` / `vi.mock()`.
3.  **Transform Issues:** If using TypeScript or other non-standard JavaScript features, ensure your transformers (e.g., `ts-jest`, Babel) are correctly configured.

### Asynchronous Test Timeouts

**Problem:** Tests involving asynchronous operations time out.

**Solution:**
1.  **`async/await`:** Ensure you are correctly using `async/await` and returning promises from your test functions if they perform asynchronous operations.
2.  **Increase Timeout:** If an operation genuinely takes longer, you can increase the timeout for specific tests or globally in the test runner configuration (e.g., `jest.setTimeout(10000);` in Jest).

If you encounter an issue not covered in this guide, please check the application logs for more details and consider opening an issue on the project repository.
