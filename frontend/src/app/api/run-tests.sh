#!/bin/bash

# Run API tests
echo "Running API tests..."
cd ../../../..
npm test -- src/app/api/api-keys/api-keys.test.ts src/app/api/auth/register/register.test.ts
