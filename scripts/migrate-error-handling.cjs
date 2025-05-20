#!/usr/bin/env node

/**
 * Error Handling Migration Script
 * 
 * This script helps migrate the codebase to use the new error handling system.
 * It scans the codebase for old error handling patterns and suggests replacements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_DIRS = ['node_modules', 'dist', 'build', 'coverage'];

// Patterns to look for
const patterns = [
  {
    name: 'Direct console.error calls',
    regex: /console\.error\(/g,
    replacement: 'error(',
    importStatement: "import { error } from '../shared/logger.js';"
  },
  {
    name: 'Direct console.warn calls',
    regex: /console\.warn\(/g,
    replacement: 'warn(',
    importStatement: "import { warn } from '../shared/logger.js';"
  },
  {
    name: 'Direct console.info calls',
    regex: /console\.info\(/g,
    replacement: 'info(',
    importStatement: "import { info } from '../shared/logger.js';"
  },
  {
    name: 'Direct console.log calls',
    regex: /console\.log\(/g,
    replacement: 'info(',
    importStatement: "import { info } from '../shared/logger.js';"
  },
  {
    name: 'Old error classes',
    regex: /new (AppError|CodedError)\(/g,
    replacement: 'new BaseError(',
    importStatement: "import { BaseError } from '../errors/index.js';"
  },
  {
    name: 'Old error utilities',
    regex: /(isAppError|toAppError)\(/g,
    replacement: (match) => match === 'isAppError(' ? 'isBaseError(' : 'toBaseError(',
    importStatement: "import { isBaseError, toBaseError } from '../errors/index.js';"
  },
  {
    name: 'Old error handling',
    regex: /logError\(/g,
    replacement: 'logFormattedError(',
    importStatement: "import { logFormattedError } from '../errors/index.js';"
  }
];

// Stats
const stats = {
  filesScanned: 0,
  filesWithMatches: 0,
  totalMatches: 0,
  matchesByPattern: {}
};

// Initialize stats
patterns.forEach(pattern => {
  stats.matchesByPattern[pattern.name] = 0;
});

/**
 * Scan a file for patterns
 * 
 * @param {string} filePath - Path to the file
 * @returns {Object} - Matches found in the file
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileMatches = {
    path: filePath,
    matches: []
  };
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      fileMatches.matches.push({
        pattern: pattern.name,
        count: matches.length,
        replacement: pattern.replacement,
        importStatement: pattern.importStatement
      });
      stats.matchesByPattern[pattern.name] += matches.length;
      stats.totalMatches += matches.length;
    }
  });
  
  return fileMatches;
}

/**
 * Scan a directory recursively
 * 
 * @param {string} dir - Directory to scan
 * @returns {Array} - Matches found in the directory
 */
function scanDirectory(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        results.push(...scanDirectory(filePath));
      }
    } else {
      const ext = path.extname(filePath);
      if (EXTENSIONS.includes(ext)) {
        stats.filesScanned++;
        const fileMatches = scanFile(filePath);
        if (fileMatches.matches.length > 0) {
          results.push(fileMatches);
          stats.filesWithMatches++;
        }
      }
    }
  }
  
  return results;
}

/**
 * Generate a report of matches
 * 
 * @param {Array} results - Scan results
 */
function generateReport(results) {
  console.log('\n=== Error Handling Migration Report ===\n');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files with matches: ${stats.filesWithMatches}`);
  console.log(`Total matches: ${stats.totalMatches}\n`);
  
  console.log('Matches by pattern:');
  for (const [pattern, count] of Object.entries(stats.matchesByPattern)) {
    if (count > 0) {
      console.log(`- ${pattern}: ${count}`);
    }
  }
  
  console.log('\nFiles with matches:');
  results.forEach(result => {
    if (result.matches.length > 0) {
      console.log(`\n${result.path}:`);
      result.matches.forEach(match => {
        console.log(`  - ${match.pattern}: ${match.count}`);
        console.log(`    Replace with: ${match.replacement}`);
        console.log(`    Add import: ${match.importStatement}`);
      });
    }
  });
  
  console.log('\n=== Migration Steps ===\n');
  console.log('1. Replace old error handling patterns with new ones');
  console.log('2. Add appropriate imports');
  console.log('3. Update error classes to use the new BaseError class');
  console.log('4. Update error utilities to use the new error utilities');
  console.log('5. Run tests to ensure everything works correctly');
}

// Main function
function main() {
  console.log('Scanning codebase for error handling patterns...');
  const results = scanDirectory(SRC_DIR);
  generateReport(results);
}

// Run the script
main();
