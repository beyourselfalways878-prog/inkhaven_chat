import { getGeminiClient } from './gemini';
import { createLogger } from './logger/Logger';

const logger = createLogger('Embeddings');

/**
 * Compute the text embedding using Gemini's latest embedding model
 */
export async function computeEmbedding(input: string): Promise<number[] | null> {
    const ai = getGeminiClient();

    if (!ai) {
        logger.warn('Gemini client not initialized, skipping embedding generation.');
        return null;
    }

    try {
        const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(input);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        logger.error('Failed to compute embedding via Gemini', { error });
        return null;
    }
}
