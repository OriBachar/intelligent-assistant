import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    intent?: 'game' | 'developer' | 'platform' | 'general';
    metadata?: {
        apiDataUsed?: boolean;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        intent: {
            type: String,
            enum: ['game', 'developer', 'platform', 'general'],
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

