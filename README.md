# TypeScript Error Reduction and Strictness Enhancement

This project aims to reduce TypeScript errors and gradually strengthen TypeScript strictness in targeted modules.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the TypeScript compiler: `npx tsc --noEmit`

## Scripts

### Track TypeScript Errors

```bash
./track-ts-errors.sh
```

This script runs the TypeScript compiler in noEmit mode and saves the errors to a file. It also creates a summary file with categorized errors.

### Apply Strict Mode to a Module

```bash
./scripts/apply-strict-mode.sh <module-path>
```

This script applies strict TypeScript settings to a specific module and checks for errors.

### Fix Common TypeScript Errors

```bash
./scripts/fix-common-ts-errors.sh <module-path>
```

This script automatically fixes common TypeScript errors in a specific module.

## TypeScript Configuration

### Base Configuration

The base TypeScript configuration is defined in `tsconfig.json`.

### Strict Configuration

A stricter TypeScript configuration is defined in `tsconfig.strict.json`. This configuration extends the base configuration and applies more strict rules.

## Type Declarations

Global type declarations are defined in `src/types/index.d.ts`. This file provides type definitions for common modules and functions used throughout the project.

## Error Reduction Plan

See [ts-error-reduction-plan.md](scripts/ts-error-reduction-plan.md) for a comprehensive plan to reduce TypeScript errors and strengthen TypeScript strictness.

## Database Migrations and Seeding

### Migrations

Database migrations are handled using two systems:

1. **Drizzle ORM** for schema migrations:
   ```bash
   npm run migrate:drizzle
   ```

2. **Custom migration system** for data migrations and complex schema changes:
   ```bash
   npm run migrate
   ```

Migrations run automatically during deployment to all environments.

### Staging Environment

For the staging environment, we also seed the database with representative test data:

```bash
npm run seed:staging
```

This populates the staging database with non-production test data and configures all third-party integrations to use test/mock endpoints.

## Deployment

### Staging Deployment

Staging deployment happens automatically when code is pushed or merged to the `staging` branch via GitHub Actions.

To manually deploy to staging:

1. Switch to the staging branch: `git checkout staging`
2. Ensure you have the latest changes: `git pull origin staging`
3. Set up Vercel environment variables:
   ```
   export VERCEL_TOKEN=your_vercel_token
   export VERCEL_ORG_ID=your_org_id
   export VERCEL_PROJECT_ID=your_project_id
   export STAGING_URL=https://staging.rtbonekeel.com
   ```
4. Run the deployment script: `npm run deploy:staging`

The deployment process will:
1. Run tests and type checking
2. Build the application
3. Deploy the build artifact to Vercel
4. Run database migrations automatically
5. Seed the staging database with test data
6. Configure third-party integrations to use test endpoints
7. Verify the deployment with a health check