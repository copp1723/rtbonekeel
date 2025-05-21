#!/bin/bash
set -e

echo "Fixing 'unknown' type errors..."

# Add proper null checks for properties that might be undefined
find src -type f -name "*.ts" | xargs sed -i 's/\(err\|error\)\.message/\1?.message/g'
find src -type f -name "*.ts" | xargs sed -i 's/\(err\|error\)\.stack/\1?.stack/g'

# Fix error handling in isError checks
find src -type f -name "*.ts" | xargs sed -i 's/isError(\(err\|error\)) ? \(err\|error\)\.message/isError(\1) ? \1?.message/g'

echo "Unknown type errors fixed!"