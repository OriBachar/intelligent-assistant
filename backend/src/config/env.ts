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
    nfl: {
        balldontlie: {
            apiKey: getEnv('BALLDONTLIE_API_KEY', true)
        },
        apiSports: {
            apiKey: getEnv('API_SPORTS_KEY', true),
            baseUrl: getEnv('API_SPORTS_BASE_URL') || 'https://v1.american-football.api-sports.io'
        }
    }
};