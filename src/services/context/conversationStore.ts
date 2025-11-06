import { Types } from 'mongoose';
import { Conversation, IConversation } from '../../models/Conversation';
import { Message, IMessage } from '../../models/Message';
import { AppError } from '../../types/error';

export interface CreateConversationData {
    title?: string;
    summary?: string;
}

export interface CreateMessageData {
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    intent?: 'game' | 'player' | 'team' | 'general';
    metadata?: {
        apiDataUsed?: boolean;
        [key: string]: any;
    };
}

export const createConversation = async (
    data?: CreateConversationData
): Promise<IConversation> => {
    try {
        const conversation = new Conversation({
            title: data?.title,
            summary: data?.summary,
            messageCount: 0,
        });
        return await conversation.save();
    } catch (error) {
        throw new AppError('Failed to create conversation', 500, true, { error });
    }
};

export const getConversationById = async (id: string): Promise<IConversation | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return await Conversation.findById(id);
    } catch (error) {
        throw new AppError('Failed to get conversation', 500, true, { error });
    }
};

export const getAllConversations = async (
    limit: number = 50,
    skip: number = 0
): Promise<IConversation[]> => {
    try {
        return await Conversation.find()
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(skip);
    } catch (error) {
        throw new AppError('Failed to get conversations', 500, true, { error });
    }
};

export const updateConversation = async (
    id: string,
    updates: Partial<Pick<IConversation, 'title' | 'summary'>>
): Promise<IConversation | null> => {
    try {
        return await Conversation.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
        throw new AppError('Failed to update conversation', 500, true, { error });
    }
};

export const deleteConversation = async (id: string): Promise<boolean> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            return false;
        }

        await Message.deleteMany({ conversationId: id });

        const result = await Conversation.findByIdAndDelete(id);
        return result !== null;
    } catch (error) {
        throw new AppError('Failed to delete conversation', 500, true, { error });
    }
};

export const addMessage = async (data: CreateMessageData): Promise<IMessage> => {
    try {
        if (!Types.ObjectId.isValid(data.conversationId)) {
            throw new AppError('Invalid conversation ID', 400);
        }

        const conversation = await Conversation.findById(data.conversationId);
        if (!conversation) {
            throw new AppError('Conversation not found', 404);
        }

        const message = new Message({
            conversationId: data.conversationId,
            role: data.role,
            content: data.content,
            intent: data.intent,
            metadata: data.metadata || {},
        });
        const savedMessage = await message.save();

        conversation.messageCount += 1;
        conversation.updatedAt = new Date();
        await conversation.save();

        return savedMessage;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to add message', 500, true, { error });
    }
};

export const getMessagesByConversationId = async (
    conversationId: string,
    limit?: number
): Promise<IMessage[]> => {
    try {
        if (!Types.ObjectId.isValid(conversationId)) {
            return [];
        }

        const query = Message.find({ conversationId }).sort({ createdAt: 1 });
        
        if (limit) {
            query.limit(limit);
        }

        return await query;
    } catch (error) {
        throw new AppError('Failed to get messages', 500, true, { error });
    }
};

export const getRecentMessages = async (
    conversationId: string,
    count: number = 10
): Promise<IMessage[]> => {
    try {
        if (!Types.ObjectId.isValid(conversationId)) {
            return [];
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(count);
        
        return messages.reverse();
    } catch (error) {
        throw new AppError('Failed to get recent messages', 500, true, { error });
    }
};
