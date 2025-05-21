# Archived Experimental Tools

This directory contains archived versions of experimental tools that have been refactored and moved to the main tools directory.

These files are kept for reference purposes only and should not be used in production code.

## Original Files

- `extractCleanContent.ts`: Original implementation of the content extraction tool
- `summarizeText.ts`: Original implementation of the text summarization tool

## Refactored Versions

The refactored versions of these tools are available in the parent directory and follow the canonical export/import pattern.

To use the current implementations, import from the tools module:

```typescript
import { extractCleanContent, summarizeText } from '../tools/index.js';
```