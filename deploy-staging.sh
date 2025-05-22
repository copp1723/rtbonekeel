#!/bin/bash

# Deploy script for staging environment
# This script deploys the application to the staging environment

# Exit on error
set -e

echo "Starting deployment to staging environment..."

# Load environment variables
if [ -f .env.staging ]; then
  echo "Loading staging environment variables..."
  export $(grep -v '^#' .env.staging | xargs)
else
  echo "Error: .env.staging file not found!"
  exit 1
fi

# Ensure we're deploying to staging
if [ "$NODE_ENV" != "staging" ]; then
  echo "Error: NODE_ENV is not set to 'staging' in .env.staging!"
  exit 1
fi

# Build the application
echo "Building application for staging..."
npm run build

# Run database migrations
echo "Running database migrations..."
node dist/migrations/migrationRunner.js

# Seed the staging database with test data
echo "Seeding staging database with test data..."
node dist/scripts/seed-staging-db.js

# Deploy to staging server
# This is a placeholder - replace with your actual deployment method
echo "Deploying to staging server..."

# Verify deployment
echo "Verifying deployment..."

# Check if the health endpoint is accessible
echo "Checking health endpoint..."
curl -s http://localhost:3000/api/health || {
  echo "Error: Health endpoint is not accessible!"
  exit 1
}

# Check if monitoring endpoints are accessible
echo "Checking monitoring endpoints..."
curl -s http://localhost:3000/api/monitoring/health/summary || {
  echo "Error: Monitoring health summary endpoint is not accessible!"
  exit 1
}

echo "Deployment to staging completed successfully!"
exit 0