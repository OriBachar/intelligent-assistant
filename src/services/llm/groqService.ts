import { ChatGroq } from '@langchain/groq';
import { config } from '../../config/env';
import { BaseMessage } from '@langchain/core/messages';

if (!config.groq.apiKey) {
    throw new Error('GROQ_API_KEY is required');
}

const defaultModel = new ChatGroq({
    apiKey: config.groq.apiKey,
    model: 'llama-3.1-70b-versatile',
    temperature: 0.5,
    maxTokens: 2048,
});

export const getDefaultModel = (): ChatGroq => defaultModel;

const createModel = (options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}): ChatGroq => {
    if (!options || (!options.model && !options.temperature && !options.maxTokens)) {
        return defaultModel;
    }

    return new ChatGroq({
        apiKey: config.groq.apiKey,
        model: options.model || 'llama-3.1-70b-versatile',
        temperature: options.temperature ?? 0.5,
        maxTokens: options.maxTokens ?? 2048,
    });
};

export const invokeGroq = async (message: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}): Promise<string> => {
    try {
        const model = createModel(options);
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
        const model = createModel(options);
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
        const model = createModel(options);
        const stream = await model.stream(message);
        for await (const chunk of stream) {
            yield chunk.content as string;
        }
    } catch (error) {
        throw new Error(`Groq API streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
