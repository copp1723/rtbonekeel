/**
 * Automotive Insight Prompt Engine
 * 
 * This module provides a unified interface for generating insight prompts
 * with consistent output schema validation and retry capabilities.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Represents a prompt template with description, system prompt, and output schema
 */
export class PromptTemplate {
  constructor(
    public description: string,
    public systemPrompt: string,
    public outputSchema: Record<string, any> | null,
    public retryPrompt: string = "Please output valid JSON matching the schema."
  ) {}
}

// Load the automotive analyst system prompt from file
const AUTOMOTIVE_ANALYST_PROMPT_PATH = join(__dirname, 'templates', 'automotive', 'automotive_analyst_prompt.md');
export const AUTOMOTIVE_ANALYST_SYSTEM_PROMPT = readFileSync(AUTOMOTIVE_ANALYST_PROMPT_PATH, 'utf-8');

// Define the insight output schema
export const INSIGHT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    value_insights: { 
      type: "array", 
      items: { type: "string" } 
    },
    actionable_flags: { 
      type: "array", 
      items: { type: "string" } 
    },
    confidence: { 
      type: "string",
      enum: ["high", "medium", "low"]
    }
  },
  required: ["summary", "value_insights", "actionable_flags", "confidence"]
};

// Define the business analyst prompt template
export const BUSINESS_ANALYST_PROMPT = new PromptTemplate(
  "Dealership business insight generator for managers and execs.",
  AUTOMOTIVE_ANALYST_SYSTEM_PROMPT,
  INSIGHT_OUTPUT_SCHEMA,
  "Reformat your answer as valid JSON per the schema above."
);

// Define the informal prompt template for internal use
export const INFORMAL_PROMPT = new PromptTemplate(
  "Less formal, internal-use insight generation (for devs or data analysts).",
  "Summarize the uploaded automotive data in plain English. No need to use JSON or stick to a specific schema.",
  null
);

/**
 * Builds the system prompt for insight generation
 * 
 * @param dataSummary - The data to analyze
 * @param question - The specific question or analysis request
 * @param mode - The prompt mode to use (business or informal)
 * @returns The prompt text and output schema
 */
export function buildInsightPrompt(
  dataSummary: string, 
  question: string, 
  mode: "business" | "informal" = "business"
): { prompt: string; schema: Record<string, any> | null } {
  const template = mode === "business" ? BUSINESS_ANALYST_PROMPT : INFORMAL_PROMPT;
  
  const prompt = template.systemPrompt.replace(
    "{analytics_summary}", 
    dataSummary
  ).replace(
    "{query}", 
    question
  );
  
  return { 
    prompt, 
    schema: template.outputSchema 
  };
}

/**
 * Validates that LLM output matches the required schema
 * 
 * @param outputStr - The LLM output string to validate
 * @param schema - The schema to validate against
 * @returns Whether the output is valid and any error message
 */
export function validateLlmOutput(
  outputStr: string, 
  schema: Record<string, any> | null
): { valid: boolean; error?: string } {
  if (!schema) {
    return { valid: true };
  }
  
  try {
    const obj = JSON.parse(outputStr);
    
    // Check required fields
    for (const key of schema.required) {
      if (!(key in obj)) {
        return { valid: false, error: `Missing required key: ${key}` };
      }
    }
    
    // Check confidence enum values
    if (obj.confidence && !["high", "medium", "low"].includes(obj.confidence)) {
      return { valid: false, error: `Invalid confidence value: ${obj.confidence}. Must be "high", "medium", or "low".` };
    }
    
    // Check array fields
    if (obj.value_insights && !Array.isArray(obj.value_insights)) {
      return { valid: false, error: "value_insights must be an array" };
    }
    
    if (obj.actionable_flags && !Array.isArray(obj.actionable_flags)) {
      return { valid: false, error: "actionable_flags must be an array" };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Orchestrates prompt building and schema validation for LLM insight calls
 * 
 * @param dataSummary - The data to analyze
 * @param question - The specific question or analysis request
 * @param mode - The prompt mode to use (business or informal)
 * @returns The prompt and schema for LLM processing
 */
export function generateInsightPrompt(
  dataSummary: string, 
  question: string, 
  mode: "business" | "informal" = "business"
): { prompt: string; schema: Record<string, any> | null } {
  return buildInsightPrompt(dataSummary, question, mode);
}