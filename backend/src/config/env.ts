import dotenv from 'dotenv';
import path from 'path';
import { AppError } from '../types/error';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getEnv = (key: string, required = false): string => {
    const value = process.env[key];
    if (required && !value) {
        throw new AppError(`Environment variable ${key} is required`, 500);
    }
    return value || '';
}

export const config = {
    server: {
        port: getEnv('PORT') || '3000',
        env: getEnv('NODE_ENV') || 'development',
        whitelist: getEnv('CORS_WHITELIST') ? getEnv('CORS_WHITELIST').split(',') : []
    },
    mongodb: {
        uri: getEnv('MONGODB_URI', true),
        dbName: getEnv('DB_NAME', true)
    },
    groq: {
        apiKey: getEnv('GROQ_API_KEY', true)
    },
    games: {
        rawg: {
            apiKey: getEnv('RAWG_API_KEY')
        },
        igdb: {
            clientId: getEnv('IGDB_CLIENT_ID'),
            clientSecret: getEnv('IGDB_CLIENT_SECRET')
        },
        steam: {
            apiKey: getEnv('STEAM_API_KEY')
        }
    }
};