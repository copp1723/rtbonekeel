#!/bin/bash

# This script fixes incorrect logger imports in TypeScript files for ESM compatibility
# It replaces 'import { logger } from '../shared/logger.js';' with
# 'import { debug, info, warn, error } from '../shared/logger.js';'

# Function to fix a single file
fix_file() {
  local file=$1
  echo "Fixing $file..."

  # Check if the file imports logger from shared/logger.js
  if grep -q "import { logger } from .*shared/logger.js" "$file"; then
    # Replace the import statement
    sed -i '' -E "s/import \{ logger \} from '(.*)\/logger.js';/import { debug, info, warn, error } from '\1\/logger.js';/" "$file"

    # Replace logger.info with info
    sed -i '' -E "s/logger\.info\(/info\(/g" "$file"

    # Replace logger.warn with warn
    sed -i '' -E "s/logger\.warn\(/warn\(/g" "$file"

    # Replace logger.error with error
    sed -i '' -E "s/logger\.error\(/error\(/g" "$file"

    # Replace logger.debug with debug
    sed -i '' -E "s/logger\.debug\(/debug\(/g" "$file"

    echo "Fixed shared logger import in $file"
  fi

  # Check if the file imports logger from utils/logger.js
  if grep -q "import logger from .*utils/logger.js" "$file"; then
    # Replace the import statement
    sed -i '' -E "s/import logger from '(.*)utils\/logger.js';/import { debug, info, warn, error } from '\1shared\/logger.js';/" "$file"

    # Replace logger.info with info
    sed -i '' -E "s/logger\.info\(/info\(/g" "$file"

    # Replace logger.warn with warn
    sed -i '' -E "s/logger\.warn\(/warn\(/g" "$file"

    # Replace logger.error with error
    sed -i '' -E "s/logger\.error\(/error\(/g" "$file"

    # Replace logger.debug with debug
    sed -i '' -E "s/logger\.debug\(/debug\(/g" "$file"

    echo "Fixed utils logger import in $file"
  fi

  # Check if the file imports logger from shared/logger (without .js)
  if grep -q "import { logger } from .*shared/logger';" "$file" || grep -q "import { logger } from .*shared/logger\";" "$file"; then
    # Replace the import statement
    sed -i '' -E "s/import \{ logger \} from '(.*)\/logger';/import { debug, info, warn, error } from '\1\/logger.js';/" "$file"
    sed -i '' -E "s/import \{ logger \} from \"(.*)\/logger\";/import { debug, info, warn, error } from \"\1\/logger.js\";/" "$file"

    # Replace logger.info with info
    sed -i '' -E "s/logger\.info\(/info\(/g" "$file"

    # Replace logger.warn with warn
    sed -i '' -E "s/logger\.warn\(/warn\(/g" "$file"

    # Replace logger.error with error
    sed -i '' -E "s/logger\.error\(/error\(/g" "$file"

    # Replace logger.debug with debug
    sed -i '' -E "s/logger\.debug\(/debug\(/g" "$file"

    echo "Fixed shared logger import (without .js) in $file"
  fi

  # Check if the file imports logger from utils/logger (without .js)
  if grep -q "import logger from .*utils/logger';" "$file" || grep -q "import logger from .*utils/logger\";" "$file"; then
    # Replace the import statement
    sed -i '' -E "s/import logger from '(.*)utils\/logger';/import { debug, info, warn, error } from '\1shared\/logger.js';/" "$file"
    sed -i '' -E "s/import logger from \"(.*)utils\/logger\";/import { debug, info, warn, error } from \"\1shared\/logger.js\";/" "$file"

    # Replace logger.info with info
    sed -i '' -E "s/logger\.info\(/info\(/g" "$file"

    # Replace logger.warn with warn
    sed -i '' -E "s/logger\.warn\(/warn\(/g" "$file"

    # Replace logger.error with error
    sed -i '' -E "s/logger\.error\(/error\(/g" "$file"

    # Replace logger.debug with debug
    sed -i '' -E "s/logger\.debug\(/debug\(/g" "$file"

    echo "Fixed utils logger import (without .js) in $file"
  fi

  # Check if the file imports individual functions from shared/logger (without .js)
  if grep -q "import { debug, info, warn, error } from .*shared/logger';" "$file" || grep -q "import { debug, info, warn, error } from .*shared/logger\";" "$file"; then
    # Replace the import statement
    sed -i '' -E "s/import \{ debug, info, warn, error \} from '(.*)\/logger';/import { debug, info, warn, error } from '\1\/logger.js';/" "$file"
    sed -i '' -E "s/import \{ debug, info, warn, error \} from \"(.*)\/logger\";/import { debug, info, warn, error } from \"\1\/logger.js\";/" "$file"

    echo "Fixed individual logger functions import (without .js) in $file"
  fi
}

# Process all TypeScript files
find src -name "*.ts" | while read -r file; do
  fix_file "$file"
done

echo "All files processed"
