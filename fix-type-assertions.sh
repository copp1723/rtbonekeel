#!/bin/bash

echo "Creating a summary of type issues to fix..."

# Create a directory for tracking type issues
mkdir -p type-issues

# Find files with 'any' type
grep -r "any" --include="*.ts" src/ | grep -v "// EXCEPTION" > type-issues/any-types.txt

# Find files with 'unknown' type assertions
grep -r "as unknown" --include="*.ts" src/ | grep -v "// EXCEPTION" > type-issues/unknown-assertions.txt

# Find files with 'any' type assertions
grep -r "as any" --include="*.ts" src/ | grep -v "// EXCEPTION" > type-issues/any-assertions.txt

echo "Type issues summary created in type-issues directory"
echo "Found $(wc -l < type-issues/any-types.txt) lines with 'any' type"
echo "Found $(wc -l < type-issues/unknown-assertions.txt) lines with 'as unknown' assertions"
echo "Found $(wc -l < type-issues/any-assertions.txt) lines with 'as any' assertions"

