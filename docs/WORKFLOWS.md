# CI/CD Workflows

This document describes the CI/CD workflows used in this project.

## GitHub Actions Workflows

### CI Workflow

The CI workflow runs on every push to the `main` branch and on pull requests targeting the `main` branch. It performs the following tasks:

1. **Lint**: Runs ESLint and TypeScript type checking
2. **Test**: Runs unit, integration, and end-to-end tests
3. **Build**: Builds the application
4. **Type Safety Audit**: Checks for unauthorized use of `any` types and `@ts-ignore` comments

### Staging Deployment Workflow

The staging deployment workflow runs on every push to the `staging` branch and can also be triggered manually. It performs the following tasks:

1. **Test and Build**:
   - Runs TypeScript type checking
   - Runs all tests
   - Builds the application
   - Uploads the build artifact

2. **Deploy to Staging**:
   - Downloads the build artifact
   - Deploys to Vercel using the same build artifact that was tested
   - Runs database migrations
   - Performs post-deployment verification
   - Sends a notification about the deployment status

## Manual Deployment

For manual deployment to staging, use the `deploy-staging.sh` script. This script:

1. Checks that you're on the staging branch
2. Pulls the latest changes
3. Installs dependencies
4. Runs type checking and tests
5. Builds the application
6. Runs database migrations
7. Deploys to Vercel
8. Performs post-deployment verification

### Required Environment Variables for Manual Deployment

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
STAGING_URL=https://staging.rtbonekeel.com
```

## Vercel Integration

The project uses Vercel for hosting the staging environment. The deployment process:

1. Authenticates with Vercel using the provided token
2. Deploys the build artifact to Vercel
3. Verifies the deployment with a health check

## Database Migrations

Database migrations are run as part of the deployment process using the `npm run migrate` command, which uses Drizzle Kit to generate and apply migrations.