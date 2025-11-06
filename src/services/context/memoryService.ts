import { BaseMessage } from '@langchain/core/messages';
import { addMessage, getMessagesByConversationId } from './conversationStore';
import { convertMessagesToLangChain } from './contextManager';

export const saveMessageToMemory = async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    intent?: 'game' | 'player' | 'team' | 'general',
    metadata?: { apiDataUsed?: boolean; [key: string]: any }
): Promise<void> => {
    try {
        await addMessage({
            conversationId,
            role,
            content,
            intent,
            metadata,
        });
    } catch (error) {
        console.error('Error saving message to memory:', error);
        throw error;
    }
};

export const getMemoryMessages = async (
    conversationId: string
): Promise<BaseMessage[]> => {
    try {
        const messages = await getMessagesByConversationId(conversationId);
        return convertMessagesToLangChain(messages);
    } catch (error) {
        console.error('Error getting memory messages:', error);
        return [];
    }
};
