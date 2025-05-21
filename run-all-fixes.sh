#!/bin/bash
set -e

echo "Running all TypeScript fixes..."

# Run each fix script
./fix-type-imports.sh
./fix-route-handlers.sh
./fix-unknown-types.sh
./fix-sql-types.sh

# Run TypeScript check to see remaining errors
echo "Checking remaining TypeScript errors..."
npx tsc --noEmit > ts-errors.log || true

# Count remaining errors
ERROR_COUNT=$(grep -c "error TS" ts-errors.log || echo 0)
echo "Remaining TypeScript errors: $ERROR_COUNT"

echo "All fixes completed!"