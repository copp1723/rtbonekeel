/**
 * Summarize Text Tool
 * 
 * A tool that uses LLM to create concise summaries of provided text content.
 */
import OpenAI from 'openai';
import type { EkoTool } from './extractCleanContent.js';

// Define the interface for the tool's arguments
export interface SummarizeTextArgs {
  text: string;
  maxLength?: number;
}

/**
 * Creates a summarizeText tool that uses LLM to create concise summaries
 * @param apiKey - The API key for OpenAI (not used if environment variable is set)
 * @returns A tool object that can be registered with Eko
 */
export function summarizeText(apiKey?: string): EkoTool {
  return {
    name: 'summarizeText',
    description: 'Creates a concise summary of provided text content',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text content to summarize',
        },
        maxLength: {
          type: 'number',
          description: 'Maximum length of the summary in words (approximate)',
        },
      },
      required: ['text'],
    },
    handler: async (args: SummarizeTextArgs) => {
      try {
        const { text, maxLength = 200 } = args;
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text provided to summarize');
        }
        
        console.log(`Summarizing text (length: ${text.length} characters)`);
        
        // Using direct OpenAI integration for more reliable summarization
        const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;
        
        if (!openaiApiKey) {
          console.error('❌ OpenAI API key not found in environment variables');
          throw new Error(
            'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.'
          );
        }
        
        // Initialize OpenAI client with proper API key
        const openai = new OpenAI({ apiKey: openaiApiKey });
        
        // Call OpenAI API directly for summarization
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: [
            {
              role: 'system',
              content: `You are a summarization expert. Create a concise summary of about ${maxLength} words 
                        that captures the key points of the provided text.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.5,
          max_tokens: 350,
        });
        
        const summary = response.choices[0].message?.content?.trim() || 'No summary available';
        
        return {
          summary: summary,
          originalLength: text.length,
          summaryLength: summary.length,
          compressionRatio: `${Math.round((summary.length / text.length) * 100)}%`,
        };
      } catch (error: any) {
        console.error(
          '❌ Error summarizing text:',
          error instanceof Error ? error.message : String(error)
        );
        
        // Provide a more descriptive error for debugging
        if ('response' in error) {
          console.error('OpenAI API error details:', {
            status: error.response?.status,
            data: error.response?.data,
          });
        }
        
        throw new Error(
          `Failed to summarize text: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
  };
}

// Export all functions and types using the canonical export pattern
export {
  summarizeText,
};

export type {
  SummarizeTextArgs,
};