# Tools Module

This directory contains utility tools that can be used across the application.

## Available Tools

### Extract Clean Content

The `extractCleanContent` tool uses Python's trafilatura library to extract clean text from webpages by removing ads, navigation, and other non-content elements.

```typescript
import { extractCleanContent } from '../tools/extractCleanContent.js';

const tool = extractCleanContent();
const result = await tool.handler({ url: 'https://example.com' });
```

### Summarize Text

The `summarizeText` tool uses OpenAI's API to create concise summaries of provided text content.

```typescript
import { summarizeText } from '../tools/summarizeText.js';

const tool = summarizeText();
const result = await tool.handler({ 
  text: 'Long text to summarize...', 
  maxLength: 200 
});
```

## Usage

All tools follow the EkoTool interface pattern:

```typescript
interface EkoTool {
  name: string;
  description: string;
  parameters: any;
  handler: (args: any) => Promise<any>;
}
```

To use a tool:

1. Import the tool factory function
2. Call the function to create a tool instance
3. Call the `handler` method with the appropriate arguments

## Canonical Export Pattern

All tools in this directory follow the canonical export pattern as defined in `src/utils/canonicalExports.js` and documented in `docs/CANONICAL_EXPORTS.md`.

This includes:
- Named exports instead of default exports
- Explicit type exports
- Barrel exports via index.ts
- Explicit .js extensions in imports