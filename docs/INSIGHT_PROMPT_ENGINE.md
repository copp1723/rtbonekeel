# Automotive Insight Prompt Engine

The Automotive Insight Prompt Engine is a unified system for generating consistent, business-grade insights from automotive dealership data.

## Overview

This module provides:

1. A standardized approach to prompt generation for LLM-based insights
2. Schema validation for LLM outputs with auto-retry capabilities
3. Multiple prompt modes (business/informal) for different use cases
4. A clean interface for integrating with your insight pipeline

## Key Components

### PromptTemplate

The core class that defines a prompt template with:
- Description
- System prompt text
- Output schema for validation
- Retry prompt for invalid responses

```typescript
class PromptTemplate {
  constructor(
    public description: string,
    public systemPrompt: string,
    public outputSchema: Record<string, any> | null,
    public retryPrompt: string = "Please output valid JSON matching the schema."
  ) {}
}
```

### Predefined Templates

The module includes two predefined templates:

1. **BUSINESS_ANALYST_PROMPT**: For formal, business-grade insights with structured JSON output
2. **INFORMAL_PROMPT**: For internal use with less formal requirements

### Core Functions

- **buildInsightPrompt**: Constructs a prompt from a template, data summary, and question
- **validateLlmOutput**: Validates LLM output against the defined schema
- **generateInsightPrompt**: Orchestrates prompt building and schema validation

## Usage Examples

### Basic Usage

```typescript
import { generateInsightPrompt, validateLlmOutput } from '../prompts/index.js';

// Generate a prompt
const { prompt, schema } = generateInsightPrompt(
  dataSummary,
  "Which lead source drove the most gross?",
  "business" // or "informal"
);

// Send to LLM
const llmResponse = await sendToLlm(prompt);

// Validate response
const { valid, error } = validateLlmOutput(llmResponse, schema);
if (!valid) {
  // Handle invalid response (retry with template.retryPrompt)
}
```

### With Auto-Retry

```typescript
import { 
  generateInsightPrompt, 
  validateLlmOutput,
  BUSINESS_ANALYST_PROMPT 
} from '../prompts/index.js';

async function generateInsightWithRetry(dataSummary, question, maxRetries = 2) {
  const { prompt, schema } = generateInsightPrompt(dataSummary, question);
  
  let response = await sendToLlm(prompt);
  let validation = validateLlmOutput(response, schema);
  let retryCount = 0;
  
  while (!validation.valid && retryCount < maxRetries) {
    // Retry with the retry prompt
    response = await sendToLlm(
      `${BUSINESS_ANALYST_PROMPT.retryPrompt}\n\n${response}`
    );
    validation = validateLlmOutput(response, schema);
    retryCount++;
  }
  
  if (!validation.valid) {
    throw new Error(`Failed to generate valid insight: ${validation.error}`);
  }
  
  return JSON.parse(response);
}
```

## Output Schema

The business-grade output schema requires:

```json
{
  "summary": "A concise 1-2 sentence overview of the key finding",
  "value_insights": [
    "Specific insight point with relevant metrics and business impact",
    "Another specific insight with supporting data"
  ],
  "actionable_flags": [
    "Recommended action based on the analysis",
    "Another suggestion for business improvement"
  ],
  "confidence": "high/medium/low"
}
```

## Integration Points

The Insight Prompt Engine integrates with:

1. **Prompt Router**: The router now uses the unified automotive analyst prompt
2. **LLM Service**: Connect to your LLM service to process the generated prompts
3. **Insight Pipeline**: Use in your data processing pipeline for consistent insights

## Best Practices

1. Always validate LLM outputs against the schema
2. Implement retry logic for invalid responses
3. Use business mode for customer-facing insights
4. Use informal mode for internal/development purposes
5. Store and version prompt templates for consistency