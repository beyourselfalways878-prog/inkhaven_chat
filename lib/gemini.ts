import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from './logger/Logger';

const logger = createLogger('GeminiManager');

// Keys loaded from environment variables
const key1 = process.env.GOOGLE_AI_API_KEY || '';
const key2 = process.env.GEMINI_API_KEY || '';

const keys = [key1, key2].filter(k => k.trim() !== '');

if (keys.length === 0) {
    logger.warn('No Gemini API keys found in the environment variables. AI features may not work.');
}

let currentKeyIndex = 0;

/**
 * Get an initialized Google Generative AI client using the round-robin key selection to balance API usage.
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
    if (keys.length === 0) {
        return null;
    }

    const key = keys[currentKeyIndex];

    // Rotate key index
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;

    return new GoogleGenerativeAI(key);
}

/**
 * Helper to get the active key for explicit API calls if needed.
 */
export function getActiveGeminiKey(): string | null {
    if (keys.length === 0) {
        return null;
    }
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return key;
}
