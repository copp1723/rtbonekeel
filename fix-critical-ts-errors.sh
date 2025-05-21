#!/bin/bash
set -e

echo "Fixing critical TypeScript errors..."

# Fix import paths with .js extension
echo "Fixing import paths..."
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\.\/\.js\1/from \1..\/index.js\1/g'
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\/\.js\1/from \1.\/index.js\1/g'
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\.\/\(.*\)\.js\.js\1/from \1..\\/\2.js\1/g'
find src -type f -name "*.ts" | xargs sed -i 's/from \(["'"'"']\)\.\/\(.*\)\.js\.js\1/from \1.\\/\2.js\1/g'

# Fix type-only imports for verbatimModuleSyntax
echo "Fixing type-only imports..."
find src -type f -name "*.ts" | xargs sed -i 's/import { \(Request\|Response\|NextFunction\)/import type { \1/g'
find src -type f -name "*.ts" | xargs sed -i 's/import { \(InferInsertModel\|InferSelectModel\|Sql\)/import type { \1/g'

# Fix Sentry imports
echo "Fixing Sentry imports..."
find src -type f -name "sentryService.ts" -exec sed -i 's/ProfilingIntegration/nodeProfilingIntegration/g' {} \;
find src -type f -name "sentryService.ts" -exec sed -i 's/Sentry\.Handlers\.requestHandler/Sentry.requestHandler/g' {} \;
find src -type f -name "sentryService.ts" -exec sed -i 's/Sentry\.Handlers\.errorHandler/Sentry.errorHandler/g' {} \;
find src -type f -name "sentryService.ts" -exec sed -i 's/Sentry\.Integrations\.Http/Sentry.httpIntegration/g' {} \;
find src -type f -name "sentryService.ts" -exec sed -i 's/Sentry\.Integrations\.Express/Sentry.expressIntegration/g' {} \;

echo "Critical TypeScript errors fixed!"