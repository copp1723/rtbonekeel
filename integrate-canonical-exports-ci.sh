#!/bin/bash
set -e

echo "Integrating enforce-canonical-exports.sh in CI/CD pipeline..."

# Create GitHub workflow directory if it doesn't exist
mkdir -p .github/workflows

# Create GitHub workflow file for canonical export enforcement
cat > .github/workflows/canonical-exports.yml << 'EOF'
name: Enforce Canonical Exports

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  check-canonical-exports:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check for canonical export/import patterns
      run: |
        chmod +x ./enforce-canonical-exports.sh
        ./enforce-canonical-exports.sh
        
        # Check if any issues were found
        if grep -q "Files with missing .js extensions in imports:" enforce-canonical-exports.log || \
           grep -q "Files with default exports" enforce-canonical-exports.log || \
           grep -q "Directories without barrel exports" enforce-canonical-exports.log; then
          echo "::error::Canonical export/import pattern violations found. See enforce-canonical-exports.log for details."
          exit 1
        fi
EOF

# Update the enforce-canonical-exports.sh script to output to a log file
cat > enforce-canonical-exports.sh << 'EOF'
#!/bin/bash

# Script to enforce canonical export/import patterns in TypeScript files
# This script checks for missing .js extensions in imports and warns about default exports

echo "Checking for non-canonical export/import patterns..." | tee enforce-canonical-exports.log

# Find all TypeScript files
TS_FILES=$(find ./src -type f -name "*.ts" | grep -v "node_modules" | grep -v ".d.ts")

# Check for missing .js extensions in imports
echo "Checking for missing .js extensions in imports..." | tee -a enforce-canonical-exports.log
MISSING_JS_EXTENSIONS=$(grep -l "import .* from '\\.\\/.*[^\\.js]'" $TS_FILES || true)
if [ -n "$MISSING_JS_EXTENSIONS" ]; then
  echo "Files with missing .js extensions in imports:" | tee -a enforce-canonical-exports.log
  echo "$MISSING_JS_EXTENSIONS" | tee -a enforce-canonical-exports.log
  echo "" | tee -a enforce-canonical-exports.log
fi

# Check for default exports
echo "Checking for default exports..." | tee -a enforce-canonical-exports.log
DEFAULT_EXPORTS=$(grep -l "export default" $TS_FILES || true)
if [ -n "$DEFAULT_EXPORTS" ]; then
  echo "Files with default exports (should use named exports instead):" | tee -a enforce-canonical-exports.log
  echo "$DEFAULT_EXPORTS" | tee -a enforce-canonical-exports.log
  echo "" | tee -a enforce-canonical-exports.log
fi

# Check for missing barrel exports (index.ts files)
echo "Checking for directories without barrel exports..." | tee -a enforce-canonical-exports.log
DIRS_WITHOUT_BARREL=$(find ./src -type d -not -path "*/node_modules/*" -not -path "*/\\.*" | while read dir; do
  if [ -n "$(find "$dir" -maxdepth 1 -name "*.ts" -not -name "index.ts")" ] && [ ! -f "$dir/index.ts" ]; then
    echo "$dir"
  fi
done)

if [ -n "$DIRS_WITHOUT_BARREL" ]; then
  echo "Directories without barrel exports (index.ts):" | tee -a enforce-canonical-exports.log
  echo "$DIRS_WITHOUT_BARREL" | tee -a enforce-canonical-exports.log
  echo "" | tee -a enforce-canonical-exports.log
fi

echo "Canonical export/import pattern check complete." | tee -a enforce-canonical-exports.log

# Return exit code based on whether issues were found
if grep -q "Files with missing .js extensions in imports:" enforce-canonical-exports.log || \
   grep -q "Files with default exports" enforce-canonical-exports.log || \
   grep -q "Directories without barrel exports" enforce-canonical-exports.log; then
  exit 1
else
  exit 0
fi
EOF

# Make the script executable
chmod +x enforce-canonical-exports.sh

echo "CI/CD integration for canonical exports enforcement is complete."