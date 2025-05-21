#!/bin/bash

echo "Generating individual issues for remaining type errors..."

# Create directory for issues
mkdir -p type-issues/individual

# Group errors by file
grep "error TS" ts-errors-remaining.log | sed 's/(.*//' | sort | uniq -c | sort -nr > type-issues/files-with-errors.txt

# Take the top 10 files with most errors
head -n 10 type-issues/files-with-errors.txt > type-issues/top-10-files-with-errors.txt

# Create individual issue templates for the top 10 files
while read -r line; do
  count=$(echo "$line" | awk '{print $1}')
  file=$(echo "$line" | awk '{$1=""; print $0}' | sed 's/^ //')
  
  # Create a sanitized filename
  safe_file=$(echo "$file" | sed 's/\//_/g' | sed 's/\./_/g')
  
  # Create issue template
  cat > "type-issues/individual/issue_${safe_file}.md" << ISSUE
# TypeScript Strict Mode Issue: $file

## Summary
Fix TypeScript strict mode errors in \`$file\`

## Description
This file contains approximately $count TypeScript errors that need to be fixed to comply with strict mode.

## Acceptance Criteria
- [ ] All TypeScript errors in \`$file\` are resolved
- [ ] No \`any\` types are used unless absolutely necessary (and documented)
- [ ] No type assertions (\`as\`) are used unless absolutely necessary (and documented)
- [ ] All functions have explicit return types
- [ ] All parameters have explicit types

## Implementation Notes
- Use proper type definitions instead of \`any\`
- Add null/undefined checks where needed
- Use type guards to narrow types when necessary
- Consider refactoring complex functions into smaller, well-typed functions
ISSUE

done < type-issues/top-10-files-with-errors.txt

echo "Generated $(wc -l < type-issues/top-10-files-with-errors.txt) individual issue templates in type-issues/individual/"
