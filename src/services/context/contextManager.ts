import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { getDefaultModel } from '../llm/groqService';
import { getContextSummaryPrompt } from '../prompts/contextPrompts';
import { getMessagesByConversationId, getRecentMessages } from './conversationStore';
import type { IMessage } from '../../models/Message';

const DEFAULT_MAX_MESSAGES = 20;
const CONTEXT_SUMMARY_THRESHOLD = 30;

export const convertMessagesToLangChain = (messages: IMessage[]): BaseMessage[] => {
    return messages.map((msg) => {
        if (msg.role === 'user') {
            return new HumanMessage(msg.content);
        } else {
            return new AIMessage(msg.content);
        }
    });
};

export const loadConversationContext = async (
    conversationId: string,
    maxMessages: number = DEFAULT_MAX_MESSAGES
): Promise<BaseMessage[]> => {
    try {
        const messages = await getRecentMessages(conversationId, maxMessages);
        return convertMessagesToLangChain(messages);
    } catch (error) {
        console.error('Error loading conversation context:', error);
        return [];
    }
};

export const shouldSummarizeContext = (messageCount: number): boolean => {
    return messageCount > CONTEXT_SUMMARY_THRESHOLD;
};

export const summarizeConversation = async (
    messages: BaseMessage[]
): Promise<string> => {
    try {
        const conversationHistory = messages
            .map((msg, idx) => {
                const role = msg instanceof HumanMessage ? 'User' : 'Assistant';
                return `${role}: ${msg.content}`;
            })
            .join('\n\n');

        const summaryPrompt = getContextSummaryPrompt(conversationHistory);
        const model = getDefaultModel();
        const response = await model.invoke(summaryPrompt);
        
        return response.content as string;
    } catch (error) {
        console.error('Error summarizing conversation:', error);
        return '';
    }
};

export const getContextWindowMessages = (
    messages: BaseMessage[],
    maxMessages: number = DEFAULT_MAX_MESSAGES
): BaseMessage[] => {
    if (messages.length <= maxMessages) {
        return messages;
    }

    return messages.slice(-maxMessages);
};

export const buildContextualHistory = async (
    conversationId: string,
    options: {
        maxMessages?: number;
        useSummary?: boolean;
    } = {}
): Promise<{
    messages: BaseMessage[];
    summary?: string;
}> => {
    const maxMessages = options.maxMessages || DEFAULT_MAX_MESSAGES;
    const useSummary = options.useSummary ?? true;

    const allMessages = await getMessagesByConversationId(conversationId);
    
    if (allMessages.length === 0) {
        return { messages: [] };
    }

    const langChainMessages = convertMessagesToLangChain(allMessages);

    if (shouldSummarizeContext(allMessages.length) && useSummary) {
        const olderMessages = langChainMessages.slice(0, -maxMessages);
        const recentMessages = langChainMessages.slice(-maxMessages);

        if (olderMessages.length > 0) {
            const summary = await summarizeConversation(olderMessages);
            return {
                messages: recentMessages,
                summary,
            };
        }
    }

    const contextMessages = getContextWindowMessages(langChainMessages, maxMessages);
    return { messages: contextMessages };
};

export const formatContextForPrompt = (
    messages: BaseMessage[],
    summary?: string
): string => {
    const messageHistory = messages
        .map((msg, idx) => {
            const role = msg instanceof HumanMessage ? 'User' : 'Assistant';
            return `${role}: ${msg.content}`;
        })
        .join('\n\n');

    if (summary) {
        return `CONVERSATION SUMMARY (earlier messages):
${summary}

RECENT CONVERSATION:
${messageHistory}`;
    }

    return messageHistory;
};
