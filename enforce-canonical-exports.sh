#!/bin/bash

# Script to enforce canonical export/import patterns in TypeScript files
# This script checks for missing .js extensions in imports and warns about default exports

echo "Checking for non-canonical export/import patterns..."

# Find all TypeScript files
TS_FILES=$(find ./src -type f -name "*.ts" | grep -v "node_modules" | grep -v ".d.ts")

# Check for missing .js extensions in imports
echo "Checking for missing .js extensions in imports..."
MISSING_JS_EXTENSIONS=$(grep -l "import .* from '\.\/.*[^\.js]'" $TS_FILES || true)
if [ -n "$MISSING_JS_EXTENSIONS" ]; then
  echo "Files with missing .js extensions in imports:"
  echo "$MISSING_JS_EXTENSIONS"
  echo ""
fi

# Check for default exports
echo "Checking for default exports..."
DEFAULT_EXPORTS=$(grep -l "export default" $TS_FILES || true)
if [ -n "$DEFAULT_EXPORTS" ]; then
  echo "Files with default exports (should use named exports instead):"
  echo "$DEFAULT_EXPORTS"
  echo ""
fi

# Check for missing barrel exports (index.ts files)
echo "Checking for directories without barrel exports..."
DIRS_WITHOUT_BARREL=$(find ./src -type d -not -path "*/node_modules/*" -not -path "*/\.*" | while read dir; do
  if [ -n "$(find "$dir" -maxdepth 1 -name "*.ts" -not -name "index.ts")" ] && [ ! -f "$dir/index.ts" ]; then
    echo "$dir"
  fi
done)

if [ -n "$DIRS_WITHOUT_BARREL" ]; then
  echo "Directories without barrel exports (index.ts):"
  echo "$DIRS_WITHOUT_BARREL"
  echo ""
fi

echo "Canonical export/import pattern check complete."
