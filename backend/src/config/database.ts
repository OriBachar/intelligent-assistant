import mongoose from 'mongoose';
import { config } from './env';
import { AppError } from '../types/error';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

export const connectDB = async (attempt = 1): Promise<void> => {
    try {
        const uri = config.mongodb.uri.endsWith(config.mongodb.dbName) 
            ? config.mongodb.uri 
            : `${config.mongodb.uri}/${config.mongodb.dbName}`;
            
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error(`MongoDB connection error attempt ${attempt}/${MAX_RETRIES}:`, error);
        
        if(attempt < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
            setTimeout(() => connectDB(attempt + 1), RETRY_INTERVAL);
        } else {
            console.error('Max retries reached. Exiting...');
            const dbError = new AppError(
                'Failed to connect to MongoDB after maximum retry attempts',
                500
            );
            dbError.stack = error instanceof Error ? error.stack : undefined;
            throw dbError;
        }
    }
};