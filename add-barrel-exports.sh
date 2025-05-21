#!/bin/bash
set -e

echo "Adding barrel exports (index.ts) to all appropriate directories..."

# Find all directories with TypeScript files but no index.ts
find src -type d | while read -r dir; do
  # Skip node_modules and hidden directories
  if [[ "$dir" == *"node_modules"* || "$dir" == *"/."* ]]; then
    continue
  fi
  
  # Check if directory has TypeScript files
  if ls "$dir"/*.ts &> /dev/null; then
    # Check if index.ts doesn't exist
    if [ ! -f "$dir/index.ts" ]; then
      echo "Creating barrel export for $dir"
      
      # Create index.ts with exports for all TypeScript files in the directory
      echo "// Barrel export file - automatically generated" > "$dir/index.ts"
      echo "" >> "$dir/index.ts"
      
      # Add export statements for each TypeScript file
      for ts_file in "$dir"/*.ts; do
        # Skip the index.ts file itself
        if [[ "$(basename "$ts_file")" == "index.ts" ]]; then
          continue
        fi
        
        # Get the filename without extension
        filename=$(basename "$ts_file" .ts)
        
        # Add export statement
        echo "export * from './$filename.js';" >> "$dir/index.ts"
      done
      
      echo "Created barrel export in $dir/index.ts"
    fi
  fi
done

echo "Barrel exports have been added to all appropriate directories."