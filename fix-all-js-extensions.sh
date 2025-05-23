#!/bin/bash

# Fix all .js.js and .js.js.js patterns in the codebase
echo "Fixing .js.js.js patterns in imports and exports..."
find ./src -type f -name "*.ts" -o -name "*.js" | xargs sed -i '' -E 's/\.js\.js\.js/\.js/g'

echo "Fixing .js.js patterns in imports and exports..."
find ./src -type f -name "*.ts" -o -name "*.js" | xargs sed -i '' -E 's/\.js\.js/\.js/g'

echo "Done fixing import/export paths."
