#!/usr/bin/env node

/**
 * ESM Import Extension Audit & Migration Script
 *
 * This script scans TypeScript files for relative imports missing .js extensions,
 * which are required when using ESM with TypeScript ("module": "NodeNext").
 *
 * It can:
 * 1. Audit files and report issues (default)
 * 2. Automatically fix issues (when AUTO_FIX = true)
 * 3. Check for other ESM pitfalls
 *
 * Usage:
 *   node esm-import-audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const CONFIG = {
  // Set to true to automatically fix imports
  AUTO_FIX: true,

  // Root directories to scan
  ROOT_DIRS: ['src', 'frontend/src'],

  // File extensions to scan
  FILE_EXTENSIONS: ['.ts', '.tsx'],

  // Directories to exclude
  EXCLUDE_DIRS: ['node_modules', 'dist', 'build', '.next', 'coverage'],

  // Node.js built-in modules (don't add .js to these)
  NODE_BUILTIN_MODULES: [
    'fs', 'path', 'os', 'http', 'https', 'crypto', 'stream', 'events',
    'util', 'url', 'querystring', 'zlib', 'buffer', 'assert', 'child_process',
    'cluster', 'dgram', 'dns', 'domain', 'net', 'readline', 'repl', 'tls',
    'tty', 'v8', 'vm', 'worker_threads'
  ],

  // Common third-party packages (don't add .js to these)
  COMMON_PACKAGES: [
    'react', 'react-dom', 'express', 'axios', 'lodash', 'uuid', 'zod',
    'drizzle-orm', 'bullmq', 'ioredis', 'openai', 'next', 'pino',
    'dotenv', 'jsonwebtoken', 'pg', 'postgres', 'date-fns'
  ]
};

// Statistics
const stats = {
  filesScanned: 0,
  filesWithIssues: 0,
  totalIssuesFound: 0,
  totalIssuesFixed: 0,
  issuesByFile: {},
  commonJSUsage: [],
  duplicateModules: [],
  missingTypePackages: []
};

// Get the directory name for the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Check if a path is a relative import
 */
function isRelativeImport(importPath) {
  return importPath.startsWith('./') || importPath.startsWith('../');
}

/**
 * Check if an import path is for a Node.js built-in module
 */
function isNodeBuiltinModule(importPath) {
  return CONFIG.NODE_BUILTIN_MODULES.includes(importPath);
}

/**
 * Check if an import path is for a common third-party package
 */
function isCommonPackage(importPath) {
  // Extract the package name (everything before the first slash)
  const packageName = importPath.split('/')[0];
  return CONFIG.COMMON_PACKAGES.includes(packageName);
}

/**
 * Check if an import path already has a file extension
 */
function hasFileExtension(importPath) {
  const extensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.css', '.scss', '.svg', '.png', '.jpg', '.jpeg', '.gif'];
  return extensions.some(ext => importPath.endsWith(ext));
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    // Read the file
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    let fileChanged = false;
    let fileIssues = [];

    // Regular expressions for imports
    const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/g;
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const moduleExportsRegex = /module\.exports/g;

    // Check each line for imports
    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;

      // Check for CommonJS usage
      if (requireRegex.test(line)) {
        stats.commonJSUsage.push({
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          issue: 'CommonJS require() usage detected'
        });
      }

      if (moduleExportsRegex.test(line)) {
        stats.commonJSUsage.push({
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          issue: 'CommonJS module.exports usage detected'
        });
      }

      // Reset regex lastIndex
      importRegex.lastIndex = 0;
      dynamicImportRegex.lastIndex = 0;

      // Process static imports
      let importMatch;
      while ((importMatch = importRegex.exec(line)) !== null) {
        const importPath = importMatch[1];

        // Only process relative imports without extensions
        if (isRelativeImport(importPath) && !hasFileExtension(importPath) &&
            !isNodeBuiltinModule(importPath) && !isCommonPackage(importPath)) {

          // Create the fixed line with .js extension
          const fixedLine = line.replace(
            new RegExp(`(['"])${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g'),
            `$1${importPath}.js$2`
          );

          fileIssues.push({
            line: lineNumber,
            original: line.trim(),
            fixed: fixedLine.trim(),
            importPath
          });

          // Update the line if auto-fix is enabled
          if (CONFIG.AUTO_FIX) {
            lines[lineIndex] = fixedLine;
            fileChanged = true;
            stats.totalIssuesFixed++;
          }

          stats.totalIssuesFound++;
        }
      }

      // Process dynamic imports
      let dynamicImportMatch;
      while ((dynamicImportMatch = dynamicImportRegex.exec(line)) !== null) {
        const importPath = dynamicImportMatch[1];

        // Only process relative imports without extensions
        if (isRelativeImport(importPath) && !hasFileExtension(importPath) &&
            !isNodeBuiltinModule(importPath) && !isCommonPackage(importPath)) {

          // Create the fixed line with .js extension
          const fixedLine = line.replace(
            new RegExp(`import\\s*\\(\\s*(['"])${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])\\s*\\)`, 'g'),
            `import($1${importPath}.js$2)`
          );

          fileIssues.push({
            line: lineNumber,
            original: line.trim(),
            fixed: fixedLine.trim(),
            importPath
          });

          // Update the line if auto-fix is enabled
          if (CONFIG.AUTO_FIX) {
            lines[lineIndex] = fixedLine;
            fileChanged = true;
            stats.totalIssuesFixed++;
          }

          stats.totalIssuesFound++;
        }
      }
    });

    // Save the file if it was changed
    if (fileChanged) {
      await fs.promises.writeFile(filePath, lines.join('\n'), 'utf8');
    }

    // Update statistics
    if (fileIssues.length > 0) {
      stats.filesWithIssues++;
      stats.issuesByFile[filePath] = fileIssues;
    }

    stats.filesScanned++;

    return fileIssues.length > 0;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Walk a directory and process all TypeScript files
 */
async function walkDirectory(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip excluded directories
      if (entry.isDirectory() && !CONFIG.EXCLUDE_DIRS.includes(entry.name)) {
        await walkDirectory(fullPath);
      } else if (entry.isFile() && CONFIG.FILE_EXTENSIONS.includes(path.extname(entry.name))) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
  }
}

/**
 * Check for duplicate or misnamed modules
 */
async function checkDuplicateModules() {
  try {
    // This is a simplified check - in a real implementation, you would
    // need to check for case sensitivity issues across different platforms
    const nodeModulesDir = path.join(__dirname, 'node_modules');

    if (!fs.existsSync(nodeModulesDir)) {
      return;
    }

    const entries = await fs.promises.readdir(nodeModulesDir, { withFileTypes: true });
    const moduleNames = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name.toLowerCase());

    // Check for duplicates (case-insensitive)
    const uniqueModules = new Set(moduleNames);

    if (uniqueModules.size !== moduleNames.length) {
      // Find duplicates
      const counts = {};
      for (const name of moduleNames) {
        counts[name] = (counts[name] || 0) + 1;
      }

      for (const [name, count] of Object.entries(counts)) {
        if (count > 1) {
          stats.duplicateModules.push(name);
        }
      }
    }
  } catch (error) {
    console.error('Error checking for duplicate modules:', error);
  }
}

/**
 * Check for missing type packages
 */
async function checkMissingTypePackages() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies || {}, ...packageJson.devDependencies || {} };

    // Common packages that might need @types
    const packagesNeedingTypes = [
      'express', 'node', 'react', 'jest', 'mocha', 'chai', 'sinon',
      'lodash', 'moment', 'axios', 'uuid', 'pg', 'mongodb'
    ];

    for (const pkg of packagesNeedingTypes) {
      if (dependencies[pkg] && !dependencies[`@types/${pkg}`]) {
        stats.missingTypePackages.push(pkg);
      }
    }
  } catch (error) {
    console.error('Error checking for missing type packages:', error);
  }
}

/**
 * Generate a report of the audit results
 */
function generateReport() {
  console.log('\n=== ESM Import Extension Audit Report ===\n');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files with issues: ${stats.filesWithIssues}`);
  console.log(`Total issues found: ${stats.totalIssuesFound}`);

  if (CONFIG.AUTO_FIX) {
    console.log(`Total issues fixed: ${stats.totalIssuesFixed}`);
  }

  // Report files with issues
  if (stats.filesWithIssues > 0) {
    console.log('\n--- Files with Missing .js Extensions ---\n');

    for (const [file, issues] of Object.entries(stats.issuesByFile)) {
      console.log(`${file} (${issues.length} issues):`);

      for (const issue of issues) {
        console.log(`  Line ${issue.line}:`);
        console.log(`    Original: ${issue.original}`);
        console.log(`    Fixed:    ${issue.fixed}`);
        console.log('');
      }
    }
  }

  // Report CommonJS usage
  if (stats.commonJSUsage.length > 0) {
    console.log('\n--- CommonJS Usage Detected ---\n');

    for (const issue of stats.commonJSUsage) {
      console.log(`${issue.file} (Line ${issue.line}):`);
      console.log(`  ${issue.code}`);
      console.log(`  Issue: ${issue.issue}`);
      console.log('');
    }
  }

  // Report duplicate modules
  if (stats.duplicateModules.length > 0) {
    console.log('\n--- Duplicate Modules Detected ---\n');
    console.log('The following modules have case sensitivity issues:');

    for (const module of stats.duplicateModules) {
      console.log(`  - ${module}`);
    }

    console.log('\nThis can cause issues on case-sensitive file systems (Linux).');
  }

  // Report missing type packages
  if (stats.missingTypePackages.length > 0) {
    console.log('\n--- Missing Type Packages ---\n');
    console.log('Consider installing the following type packages:');

    for (const pkg of stats.missingTypePackages) {
      console.log(`  npm install --save-dev @types/${pkg}`);
    }
  }

  console.log('\n=== End of Report ===\n');

  if (!CONFIG.AUTO_FIX && stats.totalIssuesFound > 0) {
    console.log('To automatically fix these issues, set AUTO_FIX = true in the script and run it again.');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('ESM Import Extension Audit & Migration Script');
  console.log('--------------------------------------------');
  console.log(`Mode: ${CONFIG.AUTO_FIX ? 'Auto-fix' : 'Audit only'}`);
  console.log('Scanning directories:', CONFIG.ROOT_DIRS.join(', '));
  console.log('');

  // Process all directories
  for (const dir of CONFIG.ROOT_DIRS) {
    const fullPath = path.join(__dirname, dir);

    if (fs.existsSync(fullPath)) {
      await walkDirectory(fullPath);
    } else {
      console.warn(`Warning: Directory not found: ${fullPath}`);
    }
  }

  // Check for other ESM pitfalls
  await checkDuplicateModules();
  await checkMissingTypePackages();

  // Generate the report
  generateReport();
}

// Run the script
main().catch(error => {
  console.error('Error running the script:', error);
  process.exit(1);
});
