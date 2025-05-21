# TypeScript Error Burn-Down Review System

This directory contains scripts for tracking and reviewing TypeScript errors in the project.

## Overview

The TypeScript Error Burn-Down Review System helps track progress in reducing TypeScript errors over time and provides accountability for the team. It includes:

1. Error tracking and reporting
2. Trend analysis
3. Regular review meeting preparation
4. Automated notifications

## Scripts

### Error Tracking

- `track-ts-errors.sh` - Runs the TypeScript compiler and saves errors to a log file
- `ts-error-trend-report.js` - Generates weekly/monthly error trend reports

### Review Meeting

- `run-ts-error-review.sh` - Prepares for TypeScript error review meetings
- `schedule-ts-error-reports.js` - Sets up scheduled error reports using cron

### Notifications

- `notify-ts-errors.js` - Sends TypeScript error notifications to Slack

## Usage

### Generate Error Reports

```bash
# Generate weekly report
npm run ts-error-report:weekly

# Generate monthly report
npm run ts-error-report:monthly
```

### Prepare for Review Meetings

```bash
# Prepare for weekly review meeting
npm run ts-error-review:weekly

# Prepare for monthly review meeting
npm run ts-error-review:monthly
```

### Schedule Automated Reports

```bash
# Start the scheduler (runs in background)
npm run ts-error-scheduler:start
```

## Review Meeting Process

1. Run the appropriate review script before the meeting
2. Open the generated agenda and report
3. During the meeting:
   - Review current error count and trends
   - Discuss progress since last meeting
   - Identify top error categories to focus on
   - Assign action items for error reduction
   - Set goals for next meeting
4. Update the agenda with notes and action items
5. Save the agenda for reference in the next meeting

## Directory Structure

- `ts-error-data/` - Contains historical error count data
- `ts-error-reports/` - Contains generated reports and meeting agendas

## Configuration

To enable Slack notifications, set the `SLACK_WEBHOOK_URL` environment variable:

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/your/webhook/url"
```