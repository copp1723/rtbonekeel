#!/bin/bash
set -e

echo "Fixing route handlers that return Response objects..."

# Find files with route handlers
find src -type f -name "*.ts" -exec grep -l "return response" {} \; | while read -r file; do
  # Replace 'return response' with 'response.end(); return'
  sed -i 's/return response;/response.end(); return;/g' "$file"
  echo "Fixed route handler in $file"
done

echo "Route handlers fixed!"