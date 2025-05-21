#!/bin/bash

# Script to gradually apply strict TypeScript settings to modules
# Usage: ./scripts/apply-strict-mode.sh <module-path>
# Example: ./scripts/apply-strict-mode.sh src/api

MODULE_PATH=$1

if [ -z "$MODULE_PATH" ]; then
  echo "Error: Module path is required"
  echo "Usage: ./scripts/apply-strict-mode.sh <module-path>"
  exit 1
fi

if [ ! -d "$MODULE_PATH" ]; then
  echo "Error: Directory $MODULE_PATH does not exist"
  exit 1
fi

echo "Applying strict TypeScript settings to $MODULE_PATH"

# Create a temporary tsconfig file for the module
cat > "$MODULE_PATH/tsconfig.json" << EOF
{
  "extends": "../../tsconfig.strict.json",
  "compilerOptions": {
    "baseUrl": "../..",
    "rootDir": "../.."
  },
  "include": ["./**/*.ts"]
}
EOF

# Run TypeScript compiler to check for errors
echo "Running TypeScript compiler to check for errors in $MODULE_PATH..."
npx tsc --project "$MODULE_PATH/tsconfig.json" --noEmit

# Count the number of errors
ERROR_COUNT=$(npx tsc --project "$MODULE_PATH/tsconfig.json" --noEmit 2>&1 | grep -c "error TS")

echo "Found $ERROR_COUNT TypeScript errors in $MODULE_PATH"

# Create a log file with the errors
npx tsc --project "$MODULE_PATH/tsconfig.json" --noEmit > "$MODULE_PATH/ts-errors.log" 2>&1

echo "Errors have been saved to $MODULE_PATH/ts-errors.log"

# Remove the temporary tsconfig file
rm "$MODULE_PATH/tsconfig.json"

echo "Done!"