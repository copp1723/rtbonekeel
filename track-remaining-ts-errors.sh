#!/bin/bash

echo "Tracking remaining TypeScript errors..."

# Run TypeScript compiler and save errors to a file
npx tsc --noEmit > ts-errors-remaining.log 2>&1

# Count the number of errors
ERROR_COUNT=$(grep -c "error TS" ts-errors-remaining.log)

echo "Found $ERROR_COUNT TypeScript errors"
echo "Errors have been saved to ts-errors-remaining.log"

# Create a summary of error types
echo "Creating error summary..."
grep "error TS" ts-errors-remaining.log | cut -d ":" -f 5 | sort | uniq -c | sort -nr > ts-error-summary.txt

echo "Error summary created in ts-error-summary.txt"

