import { Request, Response } from 'express';
import { BaseMessage } from '@langchain/core/messages';
import { runConversation } from '../services/llm/conversationGraph';
import { createConversation, getConversationById } from '../services/context/conversationStore';
import { getMemoryMessages, saveMessageToMemory } from '../services/context/memoryService';
import { AppError } from '../types/error';
import { asyncHandler } from '../utils/asyncHandler';

interface ChatRequest {
    message: string;
    conversationId?: string;
}

interface ChatResponse {
    response: string;
    conversationId: string;
    intent?: 'game' | 'developer' | 'platform' | 'general';
    validation?: {
        isValid: boolean;
        confidence: 'high' | 'medium' | 'low';
        summary: string;
    };
    metadata?: {
        apiDataUsed: boolean;
        [key: string]: any;
    };
}

export const handleChat = asyncHandler(async (req: Request, res: Response) => {
    const { message, conversationId }: ChatRequest = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new AppError('Message is required and must be a non-empty string', 400);
    }

    let currentConversationId: string;
    let conversationHistory: BaseMessage[] = [];

    if (conversationId) {
        const conversation = await getConversationById(conversationId);
        if (!conversation) {
            throw new AppError('Conversation not found', 404);
        }
        currentConversationId = conversationId;
        conversationHistory = await getMemoryMessages(conversationId);
    } else {
        const newConversation = await createConversation();
        currentConversationId = String(newConversation._id);
    }

    try {
        const { response, state } = await runConversation(message, conversationHistory);

        const apiDataUsed = state.needsApiData === true || state.apiData !== null;

        await saveMessageToMemory(
            currentConversationId,
            'user',
            message,
            state.intent,
            {
                apiDataUsed: false,
            }
        );

        await saveMessageToMemory(
            currentConversationId,
            'assistant',
            response,
            state.intent,
            {
                apiDataUsed,
                validation: state.validation ? {
                    isValid: state.validation.isValid,
                    confidence: state.validation.confidence.overall,
                    summary: state.validation.summary,
                } : undefined,
                mitigation: state.mitigation ? {
                    action: state.mitigation.action,
                    shouldRetry: state.mitigation.shouldRetry,
                } : undefined,
            }
        );

        const chatResponse: ChatResponse = {
            response,
            conversationId: currentConversationId,
            intent: state.intent,
            validation: state.validation ? {
                isValid: state.validation.isValid,
                confidence: state.validation.confidence.overall,
                summary: state.validation.summary,
            } : undefined,
            metadata: {
                apiDataUsed,
            },
        };

        res.status(200).json(chatResponse);
    } catch (error) {
        console.error('Error in chat controller:', error);
        
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            'Failed to process chat message',
            500,
            true,
            { error: error instanceof Error ? error.message : 'Unknown error' }
        );
    }
});
