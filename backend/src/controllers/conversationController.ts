import { Request, Response } from 'express';
import {
    getAllConversations,
    getConversationById,
    updateConversation,
    deleteConversation,
    getMessagesByConversationId,
} from '../services/context/conversationStore';
import { AppError } from '../types/error';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllConversationsHandler = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', 400);
    }

    if (skip < 0) {
        throw new AppError('Skip must be non-negative', 400);
    }

    const conversations = await getAllConversations(limit, skip);

    res.status(200).json({
        conversations,
        count: conversations.length,
        limit,
        skip,
    });
});

export const getConversationByIdHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError('Conversation ID is required', 400);
    }

    const conversation = await getConversationById(id);

    if (!conversation) {
        throw new AppError('Conversation not found', 404);
    }

    res.status(200).json(conversation);
});

export const getConversationMessagesHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    if (!id) {
        throw new AppError('Conversation ID is required', 400);
    }

    const conversation = await getConversationById(id);
    if (!conversation) {
        throw new AppError('Conversation not found', 404);
    }

    const messages = await getMessagesByConversationId(id, limit);

    res.status(200).json({
        conversationId: id,
        messages,
        count: messages.length,
    });
});

export const updateConversationHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, summary } = req.body;

    if (!id) {
        throw new AppError('Conversation ID is required', 400);
    }

    const updates: { title?: string; summary?: string } = {};

    if (title !== undefined) {
        if (typeof title !== 'string') {
            throw new AppError('Title must be a string', 400);
        }
        if (title.length > 200) {
            throw new AppError('Title must be 200 characters or less', 400);
        }
        updates.title = title.trim() || undefined;
    }

    if (summary !== undefined) {
        if (typeof summary !== 'string') {
            throw new AppError('Summary must be a string', 400);
        }
        if (summary.length > 500) {
            throw new AppError('Summary must be 500 characters or less', 400);
        }
        updates.summary = summary.trim() || undefined;
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError('At least one field (title or summary) must be provided', 400);
    }

    const conversation = await updateConversation(id, updates);

    if (!conversation) {
        throw new AppError('Conversation not found', 404);
    }

    res.status(200).json(conversation);
});

export const deleteConversationHandler = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError('Conversation ID is required', 400);
    }

    const deleted = await deleteConversation(id);

    if (!deleted) {
        throw new AppError('Conversation not found', 404);
    }

    res.status(200).json({
        message: 'Conversation deleted successfully',
        conversationId: id,
    });
});
