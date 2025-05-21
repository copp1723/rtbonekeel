#!/bin/bash
set -e

echo "Fixing missing .js extensions in imports throughout the codebase..."

# Find all TypeScript files
find src -type f -name "*.ts" | grep -v "node_modules" | grep -v ".d.ts" | while read -r file; do
  echo "Processing $file"
  
  # Add .js extension to local imports that don't already have it
  # Match imports from relative paths without .js extension
  sed -i -E 's/from (["\'])(\\.\\.\\/|\\.\\/)([^"\']*[^\\.js]["\'])/from \\1\\2\\3.js\\1/g' "$file"
  
  # Fix double extensions (.js.js)
  sed -i -E 's/\\.js\\.js/\\.js/g' "$file"
  
  # Fix imports that end with a directory to point to index.js
  sed -i -E 's/from (["\'])(\\.\\.\\/.+|\\.\\/.*)\\/(["\'])/from \\1\\2\\/index.js\\3/g' "$file"
done

echo "Fixed missing .js extensions in imports."