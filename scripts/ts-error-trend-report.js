/**
 * Script to generate TypeScript error trend reports
 * 
 * This script tracks TypeScript errors over time and generates trend reports
 * for weekly/monthly review meetings.
 * 
 * Usage: node ts-error-trend-report.js [--weekly|--monthly]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const DATA_DIR = path.join(process.cwd(), 'ts-error-data');
const REPORT_DIR = path.join(process.cwd(), 'ts-error-reports');
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

// Run TypeScript error check and get current count
function getCurrentErrorCount() {
  try {
    // Run the existing track-ts-errors.sh script
    execSync('./track-ts-errors.sh', { stdio: 'inherit' });
    
    // Read the summary file
    const summary = fs.readFileSync('ts-errors-summary.md', 'utf8');
    const errorCountMatch = summary.match(/Total errors: (\d+)/);
    return errorCountMatch ? parseInt(errorCountMatch[1], 10) : 0;
  } catch (error) {
    console.error('Error getting current error count:', error);
    return 0;
  }
}

// Save error count for today
function saveErrorCount(count) {
  const today = new Date();
  const dateStr = DATE_FORMAT.format(today);
  const dataFile = path.join(DATA_DIR, 'error-counts.json');
  
  let data = {};
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  
  data[dateStr] = count;
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  
  return { date: dateStr, count };
}

// Get historical error counts
function getErrorHistory() {
  const dataFile = path.join(DATA_DIR, 'error-counts.json');
  
  if (!fs.existsSync(dataFile)) {
    return {};
  }
  
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

// Generate weekly report
function generateWeeklyReport() {
  const history = getErrorHistory();
  const dates = Object.keys(history).sort();
  
  if (dates.length === 0) {
    console.log('No historical data available for report');
    return;
  }
  
  const latestDate = dates[dates.length - 1];
  const latestCount = history[latestDate];
  
  // Get data from one week ago if available
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = DATE_FORMAT.format(oneWeekAgo);
  
  // Find the closest date to one week ago
  let weekAgoCount = null;
  let weekAgoDate = null;
  
  for (const date of dates) {
    if (date <= oneWeekAgoStr) {
      weekAgoDate = date;
      weekAgoCount = history[date];
    } else {
      break;
    }
  }
  
  // Generate the report
  const reportDate = new Date().toISOString().split('T')[0];
  const reportFile = path.join(REPORT_DIR, `weekly-report-${reportDate}.md`);
  
  let report = `# TypeScript Error Weekly Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `## Current Status\n`;
  report += `- Current error count: ${latestCount}\n`;
  
  if (weekAgoCount !== null) {
    const difference = latestCount - weekAgoCount;
    const percentChange = ((difference / weekAgoCount) * 100).toFixed(1);
    const trend = difference < 0 ? 'decrease' : difference > 0 ? 'increase' : 'no change';
    
    report += `- Error count on ${weekAgoDate}: ${weekAgoCount}\n`;
    report += `- Weekly change: ${difference} errors (${percentChange}% ${trend})\n\n`;
  } else {
    report += `- No data available from one week ago for comparison\n\n`;
  }
  
  // Include the latest error summary
  if (fs.existsSync('ts-errors-summary.md')) {
    const summary = fs.readFileSync('ts-errors-summary.md', 'utf8');
    report += `## Error Details\n\n${summary}\n`;
  }
  
  fs.writeFileSync(reportFile, report);
  console.log(`Weekly report generated: ${reportFile}`);
  
  return reportFile;
}

// Generate monthly report
function generateMonthlyReport() {
  const history = getErrorHistory();
  const dates = Object.keys(history).sort();
  
  if (dates.length === 0) {
    console.log('No historical data available for report');
    return;
  }
  
  const latestDate = dates[dates.length - 1];
  const latestCount = history[latestDate];
  
  // Get data from one month ago if available
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoStr = DATE_FORMAT.format(oneMonthAgo);
  
  // Find the closest date to one month ago
  let monthAgoCount = null;
  let monthAgoDate = null;
  
  for (const date of dates) {
    if (date <= oneMonthAgoStr) {
      monthAgoDate = date;
      monthAgoCount = history[date];
    } else {
      break;
    }
  }
  
  // Generate trend data for chart
  const trendData = [];
  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - 1);
  
  for (const date of dates) {
    const dateObj = new Date(date);
    if (dateObj >= startDate && dateObj <= today) {
      trendData.push({ date, count: history[date] });
    }
  }
  
  // Generate the report
  const reportDate = new Date().toISOString().split('T')[0];
  const reportFile = path.join(REPORT_DIR, `monthly-report-${reportDate}.md`);
  
  let report = `# TypeScript Error Monthly Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `## Current Status\n`;
  report += `- Current error count: ${latestCount}\n`;
  
  if (monthAgoCount !== null) {
    const difference = latestCount - monthAgoCount;
    const percentChange = ((difference / monthAgoCount) * 100).toFixed(1);
    const trend = difference < 0 ? 'decrease' : difference > 0 ? 'increase' : 'no change';
    
    report += `- Error count on ${monthAgoDate}: ${monthAgoCount}\n`;
    report += `- Monthly change: ${difference} errors (${percentChange}% ${trend})\n\n`;
  } else {
    report += `- No data available from one month ago for comparison\n\n`;
  }
  
  // Add trend data
  if (trendData.length > 0) {
    report += `## Error Trend (Last 30 Days)\n\n`;
    report += `| Date | Error Count | Change |\n`;
    report += `|------|-------------|--------|\n`;
    
    for (let i = 0; i < trendData.length; i++) {
      const { date, count } = trendData[i];
      let change = '';
      
      if (i > 0) {
        const diff = count - trendData[i-1].count;
        change = diff === 0 ? '-' : diff > 0 ? `+${diff}` : `${diff}`;
      }
      
      report += `| ${date} | ${count} | ${change} |\n`;
    }
    
    report += '\n';
  }
  
  // Include the latest error summary
  if (fs.existsSync('ts-errors-summary.md')) {
    const summary = fs.readFileSync('ts-errors-summary.md', 'utf8');
    report += `## Error Details\n\n${summary}\n`;
  }
  
  fs.writeFileSync(reportFile, report);
  console.log(`Monthly report generated: ${reportFile}`);
  
  return reportFile;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const isWeekly = args.includes('--weekly');
  const isMonthly = args.includes('--monthly');
  
  // Get current error count
  const currentCount = getCurrentErrorCount();
  console.log(`Current TypeScript error count: ${currentCount}`);
  
  // Save today's count
  const saved = saveErrorCount(currentCount);
  console.log(`Saved error count for ${saved.date}: ${saved.count}`);
  
  // Generate reports based on flags
  if (isWeekly || (!isWeekly && !isMonthly)) {
    generateWeeklyReport();
  }
  
  if (isMonthly) {
    generateMonthlyReport();
  }
}

main();