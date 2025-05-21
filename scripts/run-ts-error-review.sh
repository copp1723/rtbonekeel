#!/bin/bash

# Script to run TypeScript error review meeting preparation
# This script generates the latest error reports and opens them for review

# Set variables
REPORT_DIR="ts-error-reports"
MEETING_TYPE=$1  # "weekly" or "monthly"

# Validate input
if [ "$MEETING_TYPE" != "weekly" ] && [ "$MEETING_TYPE" != "monthly" ]; then
  echo "Usage: ./run-ts-error-review.sh [weekly|monthly]"
  echo "Please specify either 'weekly' or 'monthly' as the meeting type."
  exit 1
fi

# Ensure report directory exists
mkdir -p "$REPORT_DIR"

# Generate the latest error report
echo "Generating latest TypeScript error report..."
node scripts/ts-error-trend-report.js "--$MEETING_TYPE"

# Find the latest report file
if [ "$MEETING_TYPE" == "weekly" ]; then
  LATEST_REPORT=$(ls -t "$REPORT_DIR"/weekly-report-*.md 2>/dev/null | head -1)
else
  LATEST_REPORT=$(ls -t "$REPORT_DIR"/monthly-report-*.md 2>/dev/null | head -1)
fi

# Check if report exists
if [ -z "$LATEST_REPORT" ]; then
  echo "No $MEETING_TYPE report found. Please run the report generation script first."
  exit 1
fi

# Create meeting agenda
MEETING_DATE=$(date +"%Y-%m-%d")
AGENDA_FILE="$REPORT_DIR/${MEETING_TYPE}-meeting-agenda-${MEETING_DATE}.md"

cat > "$AGENDA_FILE" << EOL
# TypeScript Error Burn-Down Review Meeting - ${MEETING_DATE}

## Agenda

1. Review current TypeScript error count and trends
2. Discuss progress since last meeting
3. Identify top error categories to focus on
4. Assign action items for error reduction
5. Set goals for next meeting

## Current Status

$(grep -A 5 "## Current Status" "$LATEST_REPORT")

## Error Categories

$(grep -A 10 "## Error Categories" ts-errors-summary.md)

## Files with Most Errors

$(grep -A 10 "### Files with Most Errors" ts-errors-summary.md)

## Action Items from Previous Meeting

- [ ] (Add previous action items here)

## Goals for Next Meeting

- [ ] Reduce total error count by ___%
- [ ] Fix all errors in ___ module
- [ ] Implement ___ TypeScript improvement

## Notes

(Meeting notes will be added here)
EOL

echo "Meeting agenda created: $AGENDA_FILE"

# Open the files for review (if available)
if command -v xdg-open &> /dev/null; then
  xdg-open "$LATEST_REPORT" &> /dev/null
  xdg-open "$AGENDA_FILE" &> /dev/null
  echo "Opened report and agenda for review"
elif command -v open &> /dev/null; then
  open "$LATEST_REPORT"
  open "$AGENDA_FILE"
  echo "Opened report and agenda for review"
else
  echo "Report: $LATEST_REPORT"
  echo "Agenda: $AGENDA_FILE"
fi

echo "TypeScript error review preparation complete!"