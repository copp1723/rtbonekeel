// Script to update Playwright config to include coverage reporting
const fs = require('fs');
const path = require('path');

// Path to the Playwright config file
const configPath = path.join(process.cwd(), 'playwright.config.ts');

// Read the current config
let configContent = fs.readFileSync(configPath, 'utf8');

// Check if coverage is already configured
if (!configContent.includes('coverage')) {
  console.log('Adding coverage configuration to Playwright config...');
  
  // Add coverage configuration
  configContent = configContent.replace(
    'use: {',
    `use: {
    // Enable coverage collection
    launchOptions: {
      args: ['--enable-precise-memory-info']
    },
    // Enable coverage collection
    contextOptions: {
      recordHar: {
        path: 'playwright-report/recording.har',
        mode: 'minimal'
      }
    },`
  );
  
  // Add reporter configuration if not already present
  if (!configContent.includes('reporter:')) {
    configContent = configContent.replace(
      'projects: [',
      `reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/report.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }]
  ],
  projects: [`
    );
  }
  
  // Write the updated config back to the file
  fs.writeFileSync(configPath, configContent);
  console.log('Playwright config updated successfully!');
} else {
  console.log('Coverage configuration already exists in Playwright config.');
}

// Create a directory for Playwright coverage if it doesn't exist
const coverageDir = path.join(process.cwd(), 'playwright-coverage');
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
  console.log('Created playwright-coverage directory.');
}

console.log('Playwright coverage configuration complete!');