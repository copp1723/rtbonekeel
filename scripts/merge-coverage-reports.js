#!/usr/bin/env node

/**
 * Script to merge Vitest and Playwright coverage reports
 * Usage: node merge-coverage-reports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure required directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Main function to merge coverage reports
async function mergeCoverageReports() {
  console.log('Starting coverage report merge process...');
  
  // Define paths
  const vitestCoverageDir = path.join(process.cwd(), 'coverage');
  const playwrightCoverageDir = path.join(process.cwd(), 'playwright-coverage');
  const nycOutputDir = path.join(process.cwd(), '.nyc_output');
  const combinedCoverageDir = path.join(process.cwd(), 'combined-coverage');
  
  // Ensure directories exist
  ensureDirectoryExists(nycOutputDir);
  ensureDirectoryExists(combinedCoverageDir);
  
  try {
    // Check if Vitest coverage exists
    if (!fs.existsSync(path.join(vitestCoverageDir, 'coverage-final.json'))) {
      console.log('Vitest coverage data not found. Run tests with coverage first.');
      return;
    }
    
    // Copy Vitest coverage to .nyc_output
    console.log('Copying Vitest coverage data...');
    fs.copyFileSync(
      path.join(vitestCoverageDir, 'coverage-final.json'),
      path.join(nycOutputDir, 'vitest-coverage.json')
    );
    
    // Check if Playwright coverage exists
    let hasPlaywrightCoverage = false;
    if (fs.existsSync(playwrightCoverageDir)) {
      const files = fs.readdirSync(playwrightCoverageDir);
      if (files.length > 0) {
        console.log('Playwright coverage data found.');
        hasPlaywrightCoverage = true;
        
        // Merge all Playwright coverage files into one
        console.log('Merging Playwright coverage files...');
        execSync('npx nyc merge playwright-coverage .nyc_output/playwright-coverage.json', { stdio: 'inherit' });
      }
    }
    
    // Generate combined report
    console.log('Generating combined coverage report...');
    execSync(
      'npx nyc report --reporter=lcov --reporter=text --reporter=html --reporter=json-summary --report-dir=combined-coverage',
      { stdio: 'inherit' }
    );
    
    // Create a summary markdown file
    console.log('Creating coverage summary markdown...');
    const coverageSummary = JSON.parse(
      fs.readFileSync(path.join(combinedCoverageDir, 'coverage-summary.json'), 'utf8')
    );
    
    const total = coverageSummary.total;
    let markdown = '# Combined Test Coverage Report\n\n';
    markdown += `Generated on ${new Date().toISOString()}\n\n`;
    markdown += '## Overall Coverage\n\n';
    markdown += '| Category | Coverage |\n';
    markdown += '|----------|----------|\n';
    markdown += `| Statements | ${total.statements.pct}% |\n`;
    markdown += `| Branches | ${total.branches.pct}% |\n`;
    markdown += `| Functions | ${total.functions.pct}% |\n`;
    markdown += `| Lines | ${total.lines.pct}% |\n\n`;
    
    // Add information about coverage sources
    markdown += '## Coverage Sources\n\n';
    markdown += '- Vitest unit and integration tests\n';
    if (hasPlaywrightCoverage) {
      markdown += '- Playwright end-to-end tests\n';
    }
    
    fs.writeFileSync(path.join(combinedCoverageDir, 'coverage-summary.md'), markdown);
    
    console.log('Coverage reports successfully merged!');
    console.log(`Combined report available at: ${combinedCoverageDir}`);
    
  } catch (error) {
    console.error('Error merging coverage reports:', error);
    process.exit(1);
  }
}

// Run the main function
mergeCoverageReports().catch(console.error);