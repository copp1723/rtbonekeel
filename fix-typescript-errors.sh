#!/bin/bash

# Script to fix common TypeScript errors

echo "Fixing TypeScript errors..."

# 1. Fix duplicate .js extensions in import paths
echo "1. Fixing duplicate .js extensions in import paths..."
find ./src -type f -name "*.ts" -o -name "*.js" | xargs sed -i '' -E 's/\.js\.js\.js/\.js/g'
find ./src -type f -name "*.ts" -o -name "*.js" | xargs sed -i '' -E 's/\.js\.js/\.js/g'

# 2. Fix missing db export in index.js
echo "2. Ensuring db is exported from index.js..."
if ! grep -q "export { db } from './shared/db.js';" ./src/index.ts; then
  echo "export { db } from './shared/db.js';" >> ./src/index.ts
fi

# 3. Fix type errors with unknown values
echo "3. Fixing type errors with unknown values..."
# This is handled by the new typeGuards.ts file

echo "TypeScript errors fixed!"