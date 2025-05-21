#!/bin/bash

# Script to apply strict TypeScript settings to remaining modules
# This script implements the TypeScript Error Reduction Plan (Phase 3 & 4)

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get list of modules that need strictness applied
# Excluding modules that already have strict mode applied
echo -e "${YELLOW}Identifying modules that need strict mode applied...${NC}"

# Define target directories to process
TARGET_DIRS=(
  "src/services"
  "src/server"
  "src/features"
  "src/middleware"
  "src/utils"
  "src/shared"
  "src/parsers"
  "src/prompts"
)

# Track progress
TOTAL_MODULES=0
PROCESSED_MODULES=0
FIXED_MODULES=0
MODULES_WITH_ERRORS=0

# Process each target directory
for dir in "${TARGET_DIRS[@]}"; do
  echo -e "${YELLOW}Processing directory: ${dir}${NC}"
  
  # Find TypeScript files in the directory
  FILES=$(find "$dir" -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -name "*.d.ts" -not -name "*.test.ts")
  
  # Process each file's directory only once
  PROCESSED_DIRS=()
  
  for file in $FILES; do
    # Get the directory of the file
    FILE_DIR=$(dirname "$file")
    
    # Check if we've already processed this directory
    if [[ " ${PROCESSED_DIRS[@]} " =~ " ${FILE_DIR} " ]]; then
      continue
    fi
    
    # Add to processed directories
    PROCESSED_DIRS+=("$FILE_DIR")
    
    # Count total modules
    ((TOTAL_MODULES++))
    
    echo -e "${GREEN}Applying strict mode to: ${FILE_DIR}${NC}"
    
    # Apply strict mode
    ./scripts/apply-strict-mode.sh "$FILE_DIR"
    
    # Check if there are errors
    ERROR_COUNT=$(grep -c "error TS" "$FILE_DIR/ts-errors.log" 2>/dev/null || echo "0")
    
    if [ "$ERROR_COUNT" -gt "0" ]; then
      echo -e "${YELLOW}Found $ERROR_COUNT TypeScript errors in $FILE_DIR${NC}"
      ((MODULES_WITH_ERRORS++))
      
      # Try to fix common errors
      echo -e "${YELLOW}Attempting to fix common errors...${NC}"
      ./scripts/fix-common-ts-errors.sh "$FILE_DIR"
      
      # Check if errors were fixed
      ./scripts/apply-strict-mode.sh "$FILE_DIR" > /dev/null 2>&1
      REMAINING_ERRORS=$(grep -c "error TS" "$FILE_DIR/ts-errors.log" 2>/dev/null || echo "0")
      
      if [ "$REMAINING_ERRORS" -lt "$ERROR_COUNT" ]; then
        echo -e "${GREEN}Fixed $(($ERROR_COUNT - $REMAINING_ERRORS)) errors automatically!${NC}"
        if [ "$REMAINING_ERRORS" -eq "0" ]; then
          ((FIXED_MODULES++))
          echo -e "${GREEN}All errors fixed in $FILE_DIR!${NC}"
        else
          echo -e "${YELLOW}$REMAINING_ERRORS errors remain in $FILE_DIR${NC}"
        fi
      else
        echo -e "${RED}Could not automatically fix errors in $FILE_DIR${NC}"
      fi
    else
      echo -e "${GREEN}No TypeScript errors in $FILE_DIR!${NC}"
      ((FIXED_MODULES++))
    fi
    
    ((PROCESSED_MODULES++))
    echo -e "${GREEN}Progress: $PROCESSED_MODULES/$TOTAL_MODULES modules processed${NC}"
    echo ""
  done
done

# Generate summary
echo -e "${GREEN}=== TypeScript Strictness Rollout Summary ===${NC}"
echo -e "${GREEN}Total modules processed: $TOTAL_MODULES${NC}"
echo -e "${GREEN}Modules with no errors: $((TOTAL_MODULES - MODULES_WITH_ERRORS))${NC}"
echo -e "${YELLOW}Modules with errors: $MODULES_WITH_ERRORS${NC}"
echo -e "${GREEN}Modules fixed: $FIXED_MODULES${NC}"
echo -e "${RED}Modules with remaining errors: $((MODULES_WITH_ERRORS - (FIXED_MODULES - (TOTAL_MODULES - MODULES_WITH_ERRORS))))${NC}"

# Update the ts-error-reduction-summary.md file
echo "# TypeScript Error Reduction Summary" > ./scripts/ts-error-reduction-summary.md
echo "" >> ./scripts/ts-error-reduction-summary.md
echo "## Progress" >> ./scripts/ts-error-reduction-summary.md
echo "" >> ./scripts/ts-error-reduction-summary.md
echo "| Metric | Count |" >> ./scripts/ts-error-reduction-summary.md
echo "|--------|-------|" >> ./scripts/ts-error-reduction-summary.md
echo "| Total modules processed | $TOTAL_MODULES |" >> ./scripts/ts-error-reduction-summary.md
echo "| Modules with no errors | $((TOTAL_MODULES - MODULES_WITH_ERRORS)) |" >> ./scripts/ts-error-reduction-summary.md
echo "| Modules with errors | $MODULES_WITH_ERRORS |" >> ./scripts/ts-error-reduction-summary.md
echo "| Modules fixed | $FIXED_MODULES |" >> ./scripts/ts-error-reduction-summary.md
echo "| Modules with remaining errors | $((MODULES_WITH_ERRORS - (FIXED_MODULES - (TOTAL_MODULES - MODULES_WITH_ERRORS)))) |" >> ./scripts/ts-error-reduction-summary.md
echo "" >> ./scripts/ts-error-reduction-summary.md
echo "## Next Steps" >> ./scripts/ts-error-reduction-summary.md
echo "" >> ./scripts/ts-error-reduction-summary.md
echo "1. Manually fix remaining errors in modules with errors" >> ./scripts/ts-error-reduction-summary.md
echo "2. Enable additional strict TypeScript settings as outlined in Phase 4 of the plan" >> ./scripts/ts-error-reduction-summary.md
echo "3. Continue monitoring TypeScript errors in CI/CD pipeline" >> ./scripts/ts-error-reduction-summary.md

echo -e "${GREEN}Summary saved to ./scripts/ts-error-reduction-summary.md${NC}"