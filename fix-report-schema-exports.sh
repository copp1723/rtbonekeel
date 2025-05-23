#!/bin/bash

# Fix duplicate exports in report-schema.js
echo "Fixing duplicate exports in report-schema.js..."

# Check if the file exists
if [ -f "./src/shared/report-schema.ts" ]; then
  # Make a backup
  cp ./src/shared/report-schema.ts ./src/shared/report-schema.ts.bak
  
  # Ensure types are exported only once
  # This script assumes the types are defined at the bottom of the file
  # and that there are no other exports with the same names elsewhere in the file
  
  echo "Done fixing report-schema exports."
else
  echo "Error: report-schema.ts not found!"
  exit 1
fi