# Prompts Module

This module provides a centralized way to manage and access system prompts for the application.

## Key Components

### Automotive Insight Prompt Engine

The `insightPromptEngine.js` module provides a unified interface for generating insight prompts with consistent output schema validation and retry capabilities.

#### Features

- **Standardized Prompt Templates**: Consistent structure for all insight prompts
- **Schema Validation**: Validates LLM output against defined schemas
- **Multiple Modes**: Supports business (formal) and informal modes
- **Auto-retry Support**: Provides retry prompts when output doesn't match schema

#### Usage

```typescript
import { 
  generateInsightPrompt, 
  validateLlmOutput 
} from '../prompts/index.js';

// Generate a prompt for business insights
const { prompt, schema } = generateInsightPrompt(
  dataSummary,
  "Which lead source drove the most gross?",
  "business" // or "informal" for internal use
);

// Send to LLM and get response
const llmResponse = await sendToLlm(prompt);

// Validate the response
const { valid, error } = validateLlmOutput(llmResponse, schema);
if (!valid) {
  // Handle invalid response (retry with template.retryPrompt)
  console.error(`Invalid response: ${error}`);
}
```

### Prompt Router

The `promptRouter.js` module provides a way to select the appropriate system prompt based on the task intent.

#### Usage

```typescript
import { getPromptByIntent } from '../prompts/index.js';

const prompt = getPromptByIntent('automotive_analysis');
```

## File Structure

- `index.ts` - Main entry point exporting all prompt functionality
- `insightPromptEngine.ts` - Unified prompt engine for generating insights
- `promptRouter.ts` - Router for selecting appropriate prompts by intent
- `automotiveAnalystPrompt.ts` - Legacy automotive analyst prompt (for backward compatibility)
- `templates/` - Directory containing prompt template files
  - `automotive/` - Automotive-specific prompt templates
    - `automotive_analyst_prompt.md` - Main automotive analyst prompt template