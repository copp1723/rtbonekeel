import { OpenAI } from 'openai';
import { createCircuitBreaker } from '../../../../utils/circuitBreaker.js';
import { logger } from '../../../../utils/logger.js';
import { db } from '../../../../shared/db.js';
import { insightLogs } from '../../../../shared/schema.js';
import { isError } from '../../../../utils/errorUtils.js';
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