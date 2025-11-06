import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    title?: string;
    summary?: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
}

const ConversationSchema = new Schema<IConversation>(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        summary: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        messageCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

ConversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

