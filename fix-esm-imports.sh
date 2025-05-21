#!/bin/bash
set -e

echo "Fixing ESM imports by adding .js extensions to local imports..."

# Find all TypeScript files
find src -type f -name "*.ts" | while read -r file; do
  # Skip test files and declaration files
  if [[ "$file" == *".test.ts" || "$file" == *".d.ts" ]]; then
    continue
  fi
  
  # Add .js extension to local imports
  sed -i -E 's/from "\.\/([^"]*)"/from ".\/\1.js"/g' "$file"
  sed -i -E "s/from '\.\/(.*?)'/from '.\/\1.js'/g" "$file"
  sed -i -E 's/from "\.\.\/(.*?)"/from "\.\.\/$1.js"/g' "$file"
  sed -i -E "s/from '\.\.\/(.*?)'/from '\.\.\/$1.js'/g" "$file"
  
  # Fix dynamic imports
  sed -i -E 's/import\("\.\/([^"]*)"\)/import(".\/\1.js")/g' "$file"
  sed -i -E "s/import\('\.\/(.*?)'\)/import('.\/\1.js')/g" "$file"
  sed -i -E 's/import\("\.\.\/(.*?)"\)/import("\.\.\/$1.js")/g' "$file"
  sed -i -E "s/import\('\.\.\/(.*?)'\)/import('\.\.\/$1.js')/g" "$file"
  
  # Fix imports that already have .js.js
  sed -i -E 's/\.js\.js/\.js/g' "$file"
  
  # Fix empty imports like '../.js'
  sed -i -E 's/from "\.\.\/\.js"/from "..\/index.js"/g' "$file"
  sed -i -E "s/from '\.\.\/\.js'/from '..\/index.js'/g" "$file"
  sed -i -E 's/from "\.\/\.js"/from ".\/index.js"/g' "$file"
  sed -i -E "s/from '\.\/\.js'/from '.\/index.js'/g" "$file"
done

echo "Converting any remaining CommonJS requires to ESM imports..."
find src -type f -name "*.ts" | xargs grep -l "require(" | while read -r file; do
  # Skip test files and declaration files
  if [[ "$file" == *".test.ts" || "$file" == *".d.ts" ]]; then
    continue
  fi
  
  echo "Checking $file for require() statements..."
  # This is a simplified approach - complex requires might need manual conversion
  sed -i -E 's/const (.*) = require\("(.*)"\);/import \1 from "\2";/g' "$file"
  sed -i -E "s/const (.*) = require\('(.*)'\);/import \1 from '\2';/g" "$file"
done

echo "ESM import fixes completed!"