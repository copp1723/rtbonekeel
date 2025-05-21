#!/bin/bash

# Script to track TypeScript errors in the project
# This script runs the TypeScript compiler in noEmit mode and saves the errors to a file

echo "Running TypeScript compiler to check for errors..."
npx tsc --noEmit > ts-errors.log 2>&1

# Count the number of errors
ERROR_COUNT=$(grep -c "error TS" ts-errors.log)

echo "Found $ERROR_COUNT TypeScript errors."
echo "Errors have been saved to ts-errors.log"

# Create a summary file with categorized errors
echo "Creating error summary..."
echo "# TypeScript Error Summary" > ts-errors-summary.md
echo "Generated on: $(date)" >> ts-errors-summary.md
echo "" >> ts-errors-summary.md
echo "## Error Count" >> ts-errors-summary.md
echo "Total errors: $ERROR_COUNT" >> ts-errors-summary.md
echo "" >> ts-errors-summary.md

# Categorize common errors
echo "## Error Categories" >> ts-errors-summary.md
echo "### Missing Exports" >> ts-errors-summary.md
grep "has no exported member" ts-errors.log | sort | uniq -c | sort -nr >> ts-errors-summary.md
echo "" >> ts-errors-summary.md

echo "### Module Resolution Issues" >> ts-errors-summary.md
grep "Cannot find module" ts-errors.log | sort | uniq -c | sort -nr >> ts-errors-summary.md
echo "" >> ts-errors-summary.md

echo "### Type Errors" >> ts-errors-summary.md
grep "is not assignable to type" ts-errors.log | sort | uniq -c | sort -nr >> ts-errors-summary.md
echo "" >> ts-errors-summary.md

echo "### Unknown Types" >> ts-errors-summary.md
grep "is of type 'unknown'" ts-errors.log | sort | uniq -c | sort -nr >> ts-errors-summary.md
echo "" >> ts-errors-summary.md

echo "### Files with Most Errors" >> ts-errors-summary.md
grep -o "src/[^(]*" ts-errors.log | sort | uniq -c | sort -nr | head -10 >> ts-errors-summary.md

echo "Error summary created at ts-errors-summary.md"
