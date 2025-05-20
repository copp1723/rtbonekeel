/**
 * BullMQ Migration Script
 * 
 * This script helps migrate from the old BullMQ implementation to the standardized one.
 * It scans the codebase for BullMQ usage and suggests changes.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { glob } from 'glob';

interface MigrationSuggestion {
  fileName: string;
  line: number;
  column: number;
  oldCode: string;
  newCode: string;
  description: string;
}

async function scanFiles(): Promise<string[]> {
  return glob('src/**/*.ts', {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/standardized.ts'
    ]
  });
}

function analyzeFile(filePath: string): MigrationSuggestion[] {
  const suggestions: MigrationSuggestion[] = [];
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node: ts.Node) {
    // Check for direct BullMQ imports
    if (ts.isImportDeclaration(node) && 
        ts.isStringLiteral(node.moduleSpecifier) && 
        node.moduleSpecifier.text === 'bullmq') {
      
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const oldCode = node.getText();
      
      // Check if it's a type import
      if (node.importClause?.isTypeOnly) {
        suggestions.push({
          fileName: filePath,
          line: line + 1,
          column: character + 1,
          oldCode,
          newCode: `import type { ${getImportedSymbols(node)} } from '../types/bullmq/index.standardized.js';`,
          description: 'Replace direct BullMQ type imports with standardized type imports'
        });
      } else {
        suggestions.push({
          fileName: filePath,
          line: line + 1,
          column: character + 1,
          oldCode,
          newCode: `import { ${getImportedSymbols(node)} } from 'bullmq';`,
          description: 'Standardize BullMQ imports'
        });
      }
    }
    
    // Check for dynamic BullMQ imports
    if (ts.isCallExpression(node) && 
        ts.isIdentifier(node.expression) && 
        node.expression.text === 'import' &&
        node.arguments.length > 0 &&
        ts.isStringLiteral(node.arguments[0]) &&
        node.arguments[0].text === 'bullmq') {
      
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const oldCode = node.getText();
      
      suggestions.push({
        fileName: filePath,
        line: line + 1,
        column: character + 1,
        oldCode,
        newCode: `import('bullmq')`,
        description: 'Standardize dynamic BullMQ imports'
      });
    }
    
    // Check for BullMQ class instantiations
    if (ts.isNewExpression(node) && 
        ts.isIdentifier(node.expression) && 
        ['Queue', 'Worker', 'QueueScheduler', 'QueueEvents'].includes(node.expression.text)) {
      
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const oldCode = node.getText();
      const className = node.expression.text;
      
      // Extract queue name and options
      let queueName = '';
      let options = '';
      
      if (node.arguments && node.arguments.length > 0) {
        queueName = node.arguments[0].getText();
        if (node.arguments.length > 1) {
          options = node.arguments[1].getText();
        }
      }
      
      if (className === 'Queue') {
        suggestions.push({
          fileName: filePath,
          line: line + 1,
          column: character + 1,
          oldCode,
          newCode: `bullmqService.createQueue(${queueName}, ${options})`,
          description: 'Use standardized service to create Queue'
        });
      } else if (className === 'Worker') {
        suggestions.push({
          fileName: filePath,
          line: line + 1,
          column: character + 1,
          oldCode,
          newCode: `bullmqService.createWorker(${queueName}, processor, ${options})`,
          description: 'Use standardized service to create Worker'
        });
      } else if (className === 'QueueScheduler') {
        suggestions.push({
          fileName: filePath,
          line: line + 1,
          column: character + 1,
          oldCode,
          newCode: `bullmqService.createScheduler(${queueName}, ${options})`,
          description: 'Use standardized service to create QueueScheduler'
        });
      } else if (className === 'QueueEvents') {
        suggestions.push({
          fileName: filePath,
          line: line + 1,
          column: character + 1,
          oldCode,
          newCode: `bullmqService.createQueueEvents(${queueName}, ${options})`,
          description: 'Use standardized service to create QueueEvents'
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return suggestions;
}

function getImportedSymbols(node: ts.ImportDeclaration): string {
  const importClause = node.importClause;
  if (!importClause) return '';
  
  const symbols: string[] = [];
  
  // Default import
  if (importClause.name) {
    symbols.push(importClause.name.text);
  }
  
  // Named imports
  const namedBindings = importClause.namedBindings;
  if (namedBindings) {
    if (ts.isNamedImports(namedBindings)) {
      namedBindings.elements.forEach(element => {
        symbols.push(element.name.text);
      });
    } else if (ts.isNamespaceImport(namedBindings)) {
      symbols.push(`* as ${namedBindings.name.text}`);
    }
  }
  
  return symbols.join(', ');
}

function generateMigrationReport(suggestions: MigrationSuggestion[]): void {
  const reportContent = `# BullMQ Migration Report

## Summary
- Total files with BullMQ usage: ${new Set(suggestions.map(s => s.fileName)).size}
- Total migration suggestions: ${suggestions.length}

## Migration Suggestions

${suggestions.map(suggestion => `
### ${suggestion.fileName}:${suggestion.line}:${suggestion.column}
**Description**: ${suggestion.description}

**Old Code**:
\`\`\`typescript
${suggestion.oldCode}
\`\`\`

**New Code**:
\`\`\`typescript
${suggestion.newCode}
\`\`\`
`).join('\n')}

## Migration Steps

1. Add the standardized BullMQ service import to files that need it:
\`\`\`typescript
import * as bullmqService from '../services/bullmqService.standardized.js';
\`\`\`

2. Replace direct BullMQ imports with standardized imports
3. Replace direct BullMQ class instantiations with standardized service calls
4. Update type imports to use the standardized types
5. Test thoroughly after each change

## Files to Review

${Array.from(new Set(suggestions.map(s => s.fileName))).map(file => `- ${file}`).join('\n')}
`;

  fs.writeFileSync('bullmq-migration-report.md', reportContent);
  console.log('Migration report generated: bullmq-migration-report.md');
}

async function main() {
  console.log('Scanning files for BullMQ usage...');
  const files = await scanFiles();
  console.log(`Found ${files.length} files to analyze`);
  
  let allSuggestions: MigrationSuggestion[] = [];
  
  for (const file of files) {
    const suggestions = analyzeFile(file);
    if (suggestions.length > 0) {
      console.log(`Found ${suggestions.length} migration suggestions in ${file}`);
      allSuggestions = [...allSuggestions, ...suggestions];
    }
  }
  
  console.log(`Total migration suggestions: ${allSuggestions.length}`);
  generateMigrationReport(allSuggestions);
}

main().catch(err => {
  console.error('Error running migration script:', err);
  process.exit(1);
});
