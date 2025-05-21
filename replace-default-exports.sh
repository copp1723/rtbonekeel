#!/bin/bash
set -e

echo "Replacing default exports with named exports throughout the codebase..."

# Find all TypeScript files with default exports
DEFAULT_EXPORT_FILES=$(grep -l "export default" $(find src -type f -name "*.ts" | grep -v "node_modules" | grep -v ".d.ts"))

for file in $DEFAULT_EXPORT_FILES; do
  echo "Processing $file"
  
  # Get the filename without extension and path
  filename=$(basename "$file" .ts)
  
  # Different replacement strategies based on export type
  
  # Case 1: export default function name() {...}
  # Replace with: export function name() {...}
  sed -i -E 's/export default function ([a-zA-Z0-9_]+)/export function \1/g' "$file"
  
  # Case 2: export default class Name {...}
  # Replace with: export class Name {...}
  sed -i -E 's/export default class ([a-zA-Z0-9_]+)/export class \1/g' "$file"
  
  # Case 3: export default {...}
  # Replace with: export const filename = {...}
  sed -i -E "s/export default (\{)/export const $filename = \1/g" "$file"
  
  # Case 4: export default variableName
  # Replace with: export { variableName }
  sed -i -E 's/export default ([a-zA-Z0-9_]+);?$/export { \1 };/g' "$file"
  
  # Case 5: export default anonymous function
  # Replace with: export function filename() {...}
  sed -i -E "s/export default function\(/export function $filename\(/g" "$file"
  
  echo "Converted default exports in $file"
done

echo "Default exports have been replaced with named exports."