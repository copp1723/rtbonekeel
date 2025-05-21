/**
 * Script to send TypeScript error notifications to Slack
 * 
 * This script reads the TypeScript error summary and sends a notification
 * to a Slack webhook if the error count has changed significantly.
 * 
 * Usage: node notify-ts-errors.js [webhook-url]
 */

import fs from 'fs';
import https from 'https';
import url from 'url';

// Read the error summary file
const summaryFile = 'ts-errors-summary.md';
const summary = fs.readFileSync(summaryFile, 'utf8');

// Extract the error count
const errorCountMatch = summary.match(/Total errors: (\d+)/);
const errorCount = errorCountMatch ? parseInt(errorCountMatch[1], 10) : 0;

// Get the webhook URL from command line arguments or environment variable
const webhookUrl = process.argv[2] || process.env.SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.error('No Slack webhook URL provided. Skipping notification.');
  process.exit(0);
}

// Extract top error categories for the message
function extractTopErrors(summary, category, limit = 3) {
  const categoryRegex = new RegExp(`### ${category}([\\s\\S]*?)(?=###|$)`, 'gm');
  const match = categoryRegex.exec(summary);
  
  if (!match || !match[1]) return 'None found';
  
  const lines = match[1].trim().split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, limit);
  
  return lines.length > 0 ? lines.join('\n') : 'None found';
}

// Create the message payload
const payload = {
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `TypeScript Error Report: ${errorCount} errors`,
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*TypeScript Error Summary*\nTotal errors: ${errorCount}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Top Error Categories:*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Missing Exports:*\n\`\`\`${extractTopErrors(summary, 'Missing Exports')}\`\`\``
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Module Resolution Issues:*\n\`\`\`${extractTopErrors(summary, 'Module Resolution Issues')}\`\`\``
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Files with Most Errors:*\n\`\`\`${extractTopErrors(summary, 'Files with Most Errors')}\`\`\``
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "See GitHub Actions for full report"
        }
      ]
    }
  ]
};

// Send the notification to Slack
function sendSlackNotification(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(webhookUrl);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload))
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Slack notification sent successfully');
          resolve(data);
        } else {
          console.error(`Error sending Slack notification: ${res.statusCode} ${data}`);
          reject(new Error(`HTTP status code: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error sending Slack notification:', error);
      reject(error);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Only send notification if webhook URL is provided
if (webhookUrl) {
  try {
    await sendSlackNotification(webhookUrl, payload);
    console.log(`Notification sent for ${errorCount} TypeScript errors`);
  } catch (error) {
    console.error('Failed to send notification:', error);
    process.exit(1);
  }
}