#!/bin/bash

# Script to fix common TypeScript errors
# Usage: ./scripts/fix-common-ts-errors.sh <module-path>
# Example: ./scripts/fix-common-ts-errors.sh src/api

MODULE_PATH=$1

if [ -z "$MODULE_PATH" ]; then
  echo "Error: Module path is required"
  echo "Usage: ./scripts/fix-common-ts-errors.sh <module-path>"
  exit 1
fi

if [ ! -d "$MODULE_PATH" ]; then
  echo "Error: Directory $MODULE_PATH does not exist"
  exit 1
fi

echo "Fixing common TypeScript errors in $MODULE_PATH"

# Fix missing file extensions in imports
find "$MODULE_PATH" -name "*.ts" -exec sed -i 's/from \(['"'"'"]\)\.\.\//from \1\.\.\/\.\.\/index.js/g' {} \;
find "$MODULE_PATH" -name "*.ts" -exec sed -i 's/from \(['"'"'"]\)\.\//from \1\.\/index.js/g' {} \;

# Fix import type declarations
find "$MODULE_PATH" -name "*.ts" -exec sed -i 's/import \([a-zA-Z]*\) from/import type \1 from/g' {} \;

# Fix verbatimModuleSyntax issues
find "$MODULE_PATH" -name "*.ts" -exec sed -i 's/export \([a-zA-Z]*\) /export type \1 /g' {} \;

# Fix exactOptionalPropertyTypes issues
find "$MODULE_PATH" -name "*.ts" -exec sed -i 's/\([a-zA-Z]*\): \([a-zA-Z]*\) | undefined/\1?: \2/g' {} \;

echo "Common TypeScript errors fixed in $MODULE_PATH"