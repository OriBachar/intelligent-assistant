import { ChatGroq } from '@langchain/groq';
import { BaseMessage } from '@langchain/core/messages';
import { config } from '../../config/env';

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

if (!config.groq?.apiKey) {
    throw new Error('GROQ_API_KEY is required. Please set it in your .env file.');
}

const defaultModel = new ChatGroq({
    apiKey: config.groq.apiKey,
    model: DEFAULT_MODEL,
    temperature: 0.5,
    maxTokens: 2048,
});

export const getDefaultModel = (): ChatGroq => {
    if (!config.groq?.apiKey) {
        throw new Error('Groq API key is not configured. Please set GROQ_API_KEY in your .env file.');
    }
    return defaultModel;
};

export const getLightweightModel = (): ChatGroq => {
    if (!config.groq?.apiKey) {
        throw new Error('Groq API key is not configured. Please set GROQ_API_KEY in your .env file.');
    }

    const lightweightModel = process.env.GROQ_LIGHTWEIGHT_MODEL || 'llama-3.1-8b-instant';
    return new ChatGroq({
        apiKey: config.groq.apiKey,
        model: lightweightModel,
        temperature: 0.3,
        maxTokens: 512,
    });
};

const createModel = (options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}): ChatGroq => {
    if (!config.groq?.apiKey) {
        throw new Error('Groq API key is not configured');
    }

    return new ChatGroq({
        apiKey: config.groq.apiKey,
        model: options?.model || DEFAULT_MODEL,
        temperature: options?.temperature ?? 0.5,
        maxTokens: options?.maxTokens ?? 2048,
    });
};

export const invokeGroq = async (message: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}): Promise<string> => {
    try {
        const model = createModel(options || {});
        const response = await model.invoke(message);
        return response.content as string;
    } catch (error) {
        throw new Error(`Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const invokeGroqWithMessages = async (
    messages: BaseMessage[],
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
): Promise<string> => {
    try {
        const model = createModel(options || {});
        const response = await model.invoke(messages);
        return response.content as string;
    } catch (error) {
        throw new Error(`Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const streamGroq = async function* (
    message: string,
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }
): AsyncGenerator<string, void, unknown> {
    try {
        const model = createModel(options || {});
        const stream = await model.stream(message);
        for await (const chunk of stream) {
            yield chunk.content as string;
        }
    } catch (error) {
        throw new Error(`Groq API streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

