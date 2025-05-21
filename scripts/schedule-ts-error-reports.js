/**
 * Script to schedule regular TypeScript error trend reports
 * 
 * This script sets up a cron job to run the ts-error-trend-report.js script
 * on a regular schedule (weekly and monthly).
 * 
 * Usage: node schedule-ts-error-reports.js
 */

import cron from 'node-cron';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const REPORT_DIR = path.join(process.cwd(), 'ts-error-reports');

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Function to run the weekly report
function runWeeklyReport() {
  console.log('Running weekly TypeScript error report...');
  try {
    // Generate the report
    execSync('node scripts/ts-error-trend-report.js --weekly', { stdio: 'inherit' });
    
    // Send notification if webhook URL is configured
    if (SLACK_WEBHOOK_URL) {
      const reportFiles = fs.readdirSync(REPORT_DIR)
        .filter(file => file.startsWith('weekly-report-'))
        .sort()
        .reverse();
      
      if (reportFiles.length > 0) {
        const latestReport = path.join(REPORT_DIR, reportFiles[0]);
        execSync(`node scripts/notify-ts-errors.js ${SLACK_WEBHOOK_URL}`, { stdio: 'inherit' });
        console.log(`Weekly report notification sent: ${latestReport}`);
      }
    }
  } catch (error) {
    console.error('Error running weekly report:', error);
  }
}

// Function to run the monthly report
function runMonthlyReport() {
  console.log('Running monthly TypeScript error report...');
  try {
    // Generate the report
    execSync('node scripts/ts-error-trend-report.js --monthly', { stdio: 'inherit' });
    
    // Send notification if webhook URL is configured
    if (SLACK_WEBHOOK_URL) {
      const reportFiles = fs.readdirSync(REPORT_DIR)
        .filter(file => file.startsWith('monthly-report-'))
        .sort()
        .reverse();
      
      if (reportFiles.length > 0) {
        const latestReport = path.join(REPORT_DIR, reportFiles[0]);
        execSync(`node scripts/notify-ts-errors.js ${SLACK_WEBHOOK_URL}`, { stdio: 'inherit' });
        console.log(`Monthly report notification sent: ${latestReport}`);
      }
    }
  } catch (error) {
    console.error('Error running monthly report:', error);
  }
}

// Schedule weekly report (every Monday at 9:00 AM)
cron.schedule('0 9 * * 1', () => {
  runWeeklyReport();
});

// Schedule monthly report (1st day of each month at 9:00 AM)
cron.schedule('0 9 1 * *', () => {
  runMonthlyReport();
});

console.log('TypeScript error reports scheduled:');
console.log('- Weekly: Every Monday at 9:00 AM');
console.log('- Monthly: 1st day of each month at 9:00 AM');

// Run initial reports
if (process.argv.includes('--run-now')) {
  console.log('Running initial reports...');
  runWeeklyReport();
  runMonthlyReport();
}

// Keep the process running
console.log('Scheduler is running. Press Ctrl+C to exit.');