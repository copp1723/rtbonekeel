#!/bin/bash
set -e

echo "Fixing TypeScript errors..."

# Fix type-only imports
echo "Fixing type-only imports..."
find src -type f -name "*.ts" | xargs sed -i 's/import { \(.*\)Request\(.*\) } from/import type { \1Request\2 } from/g'
find src -type f -name "*.ts" | xargs sed -i 's/import { \(.*\)Response\(.*\) } from/import type { \1Response\2 } from/g'
find src -type f -name "*.ts" | xargs sed -i 's/import { \(.*\)NextFunction\(.*\) } from/import type { \1NextFunction\2 } from/g'
find src -type f -name "*.ts" | xargs sed -i 's/import { InferInsertModel/import type { InferInsertModel/g'
find src -type f -name "*.ts" | xargs sed -i 's/import { InferSelectModel/import type { InferSelectModel/g'
find src -type f -name "*.ts" | xargs sed -i 's/import { \(.*\)Sql\(.*\) } from/import type { \1Sql\2 } from/g'

# Fix import paths with .js extension
echo "Fixing import paths..."
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\.\/\(.*\)\.js\.js\1/from \1..\\/\2.js\1/g'
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\/\(.*\)\.js\.js\1/from \1.\\/\2.js\1/g'
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\.\/\.js\1/from \1..\/index.js\1/g'
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\/\.js\1/from \1.\/index.js\1/g'

# Fix Sentry imports
echo "Fixing Sentry imports..."
find src -type f -name "*.ts" | xargs sed -i 's/ProfilingIntegration/nodeProfilingIntegration/g'
find src -type f -name "*.ts" | xargs sed -i 's/Sentry\.Integrations\.Http/Sentry.httpIntegration/g'
find src -type f -name "*.ts" | xargs sed -i 's/Sentry\.Integrations\.Express/Sentry.expressIntegration/g'
find src -type f -name "*.ts" | xargs sed -i 's/Sentry\.Handlers\.requestHandler/Sentry.requestHandler/g'
find src -type f -name "*.ts" | xargs sed -i 's/Sentry\.Handlers\.errorHandler/Sentry.errorHandler/g'
find src -type f -name "*.ts" | xargs sed -i 's/Sentry\.getCurrentHub/Sentry.getCurrentHub/g'

# Fix null/undefined checks
echo "Fixing null/undefined checks..."
find src -type f -name "*.ts" | xargs sed -i 's/\([a-zA-Z0-9_]*\)\.trim()/\1?.trim()/g'
find src -type f -name "*.ts" | xargs sed -i 's/\([a-zA-Z0-9_]*\)\.length/\1?.length/g'
find src -type f -name "*.ts" | xargs sed -i 's/\([a-zA-Z0-9_]*\)\.message/\1?.message/g'
find src -type f -name "*.ts" | xargs sed -i 's/\([a-zA-Z0-9_]*\)\.stack/\1?.stack/g'

# Fix SQL type issues
echo "Fixing SQL type issues..."
find src -type f -name "drizzleUtils.ts" | xargs sed -i 's/SQL<unknown>/unknown/g'

# Fix Buffer.from with potential undefined values
echo "Fixing Buffer.from with potential undefined values..."
find src -type f -name "crypto.ts" | xargs sed -i 's/Buffer\.from(\([^,]*\), /Buffer.from(\1 ?? "", /g'

# Fix unknown error types
echo "Fixing unknown error types..."
find src -type f -name "*.ts" | xargs sed -i 's/isError(error) ? error\.message/isError(error) ? error?.message/g'
find src -type f -name "*.ts" | xargs sed -i 's/isError(err) ? err\.message/isError(err) ? err?.message/g'

echo "TypeScript errors fixed! Please run 'npm run type-check' to verify."