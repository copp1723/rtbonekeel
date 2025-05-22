#!/bin/bash

echo "Fixing missing .js extensions in import statements..."

# Find all TypeScript files
TS_FILES=$(find src -type f -name "*.ts" | grep -v "node_modules" | grep -v ".d.ts" | grep -v "tests/db-upgrade.test")

# Add .js extension to local imports without extension
for file in $TS_FILES; do
  if [ -f "$file" ]; then
    # Find import statements without .js extension
    sed -i -E "s/from ['\"](\\.\\.\\/|\\.\\/)([^'\"]+)['\"]/from '\\1\\2.js'/g" "$file"
    
    # Find dynamic imports without .js extension
    sed -i -E "s/import\\(['\"](\\.\\.\\/|\\.\\/)([^'\"]+)['\"]\\)/import('\\1\\2.js')/g" "$file"
  fi
done

echo "Fixed missing .js extensions in import statements"