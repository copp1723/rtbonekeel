#!/bin/bash
set -e

echo "Running Canonical Pattern Enforcement..."

# Step 1: Fix missing .js extensions in imports
echo "Step 1: Fixing missing .js extensions in imports..."
chmod +x ./fix-missing-js-extensions.sh
./fix-missing-js-extensions.sh

# Step 2: Replace default exports with named exports
echo "Step 2: Replacing default exports with named exports..."
chmod +x ./replace-default-exports.sh
./replace-default-exports.sh

# Step 3: Add barrel exports to all appropriate directories
echo "Step 3: Adding barrel exports to all appropriate directories..."
chmod +x ./add-barrel-exports.sh
./add-barrel-exports.sh

# Step 4: Update ESLint config to enforce the canonical pattern
echo "Step 4: Updating ESLint config to enforce the canonical pattern..."
chmod +x ./update-eslint-config.sh
./update-eslint-config.sh

# Step 5: Integrate enforce-canonical-exports.sh in CI/CD
echo "Step 5: Integrating enforce-canonical-exports.sh in CI/CD..."
chmod +x ./integrate-canonical-exports-ci.sh
./integrate-canonical-exports-ci.sh

echo "Canonical Pattern Enforcement completed successfully!"
echo ""
echo "Summary of changes:"
echo "1. Fixed missing .js extensions in imports throughout the codebase"
echo "2. Replaced default exports with named exports"
echo "3. Added barrel exports to all appropriate directories"
echo "4. Updated ESLint config to enforce the canonical pattern"
echo "5. Integrated enforce-canonical-exports.sh in CI/CD"
echo ""
echo "Next steps:"
echo "1. Run 'npm run lint' to verify ESLint rules are working correctly"
echo "2. Run tests to ensure all functionality is working as expected"
echo "3. Commit the changes with message 'Implement canonical pattern enforcement'"