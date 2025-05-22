import { OpenAI } from 'openai';
import { createCircuitBreaker } from '../index.js.js.js';
import { logger } from '../index.js.js.js';
import { db } from '../index.js.js.js';
import { insightLogs } from '../index.js.js.js';
import { isError } from '../index.js.js.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Initialize OpenAI client with validation
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not configured');
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Circuit breaker configuration
const insightBreaker = createCircuitBreaker('insight-generation', {
  failureThreshold: 5,
  recoveryTimeout: 5 * 60 * 1000,
});