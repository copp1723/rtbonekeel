/**
 * Example usage of the Insight Prompt Engine
 * 
 * This file demonstrates how to use the Insight Prompt Engine to generate
 * prompts for LLM-based insight generation and validate the responses.
 */

import {
  generateInsightPrompt,
  validateLlmOutput,
  BUSINESS_ANALYST_PROMPT,
} from '../index.js';

// Example data summary (would typically come from your data pipeline)
const exampleDataSummary = `
Sales Data Summary:
- Total Sales: 125 units
- Total Gross: $375,000
- Average Front Gross: $1,200
- Top Lead Source: Website (45 units, $67,500 gross)
- Second Lead Source: Phone (35 units, $42,000 gross)
- Third Lead Source: Walk-in (25 units, $30,000 gross)
- Fourth Lead Source: Referral (20 units, $35,500 gross)
`;

// Example question
const question = "Which lead source is most profitable and why?";

// Example of generating a business-grade prompt
async function generateBusinessInsight() {
  console.log("Generating business-grade insight prompt...");
  
  // Generate the prompt and schema
  const { prompt, schema } = generateInsightPrompt(
    exampleDataSummary,
    question,
    "business"
  );
  
  console.log("Generated Prompt:");
  console.log("----------------");
  console.log(prompt);
  console.log("----------------");
  
  // In a real application, you would send this prompt to an LLM
  // const llmResponse = await sendToLlm(prompt);
  
  // Example LLM response (for demonstration)
  const exampleValidResponse = `{
    "summary": "Referral leads generate the highest profit per unit at $1,775 gross per vehicle, 48% higher than the overall average of $1,200.",
    "value_insights": [
      "Referral leads account for only 16% of total sales volume but generate 19% of total gross profit.",
      "Website leads drive the highest total gross at $67,500 (36% of total) but have an average gross of $1,500 per unit.",
      "Phone leads have the lowest average gross at $1,200 per unit, matching the overall average."
    ],
    "actionable_flags": [
      "Implement a structured referral program to increase this high-value lead source.",
      "Analyze the sales process for referral customers to identify why they yield higher gross.",
      "Consider reallocating marketing budget to increase referral lead generation."
    ],
    "confidence": "high"
  }`;
  
  // Example of an invalid response
  const exampleInvalidResponse = `{
    "summary": "Referral leads are the most profitable per unit.",
    "insights": ["Referrals generate 48% higher gross than average"],
    "actions": ["Implement a referral program"],
    "confidence_level": "high"
  }`;
  
  // Validate the responses
  const validResult = validateLlmOutput(exampleValidResponse, schema);
  const invalidResult = validateLlmOutput(exampleInvalidResponse, schema);
  
  console.log("\nValidation Results:");
  console.log("Valid Response:", validResult.valid ? "✅ Valid" : `❌ Invalid: ${validResult.error}`);
  console.log("Invalid Response:", invalidResult.valid ? "✅ Valid" : `❌ Invalid: ${invalidResult.error}`);
  
  // In a real application, if the response is invalid, you would retry with the retry prompt
  if (!invalidResult.valid) {
    console.log("\nRetry Prompt:");
    console.log(BUSINESS_ANALYST_PROMPT.retryPrompt);
  }
}

// Example of generating an informal prompt for internal use
function generateInformalInsight() {
  console.log("\nGenerating informal insight prompt...");
  
  // Generate the prompt and schema
  const { prompt, schema } = generateInsightPrompt(
    exampleDataSummary,
    question,
    "informal"
  );
  
  console.log("Generated Prompt:");
  console.log("----------------");
  console.log(prompt);
  console.log("----------------");
  
  // Note that informal prompts don't have a schema to validate against
  console.log("Schema validation required:", schema !== null);
}

// Run the examples
async function runExamples() {
  await generateBusinessInsight();
  generateInformalInsight();
}

// This would be called in a real application
// runExamples().catch(console.error);

// Export for testing or demonstration
export { generateBusinessInsight, generateInformalInsight, runExamples };