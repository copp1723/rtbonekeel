#!/bin/bash

echo "Fixing 'unknown' type assertions..."

# Find files with 'as unknown' type assertions
find src -type f -name "*.ts" -exec grep -l "as unknown" {} \; > unknown-assertions.txt

# Find files with 'as any' type assertions
find src -type f -name "*.ts" -exec grep -l "as any" {} \; >> unknown-assertions.txt

echo "Found $(wc -l < unknown-assertions.txt) files with 'unknown' or 'any' type assertions"
echo "Files with type assertions are listed in unknown-assertions.txt"

