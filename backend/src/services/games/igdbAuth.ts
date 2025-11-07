import { AxiosInstance } from 'axios';
import { config } from '../../config/env';
import type { IgdbTokenResponse } from '../../types/igdb';
import { createApiInstance, handleApiError } from './baseApiService';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const DEFAULT_TIMEOUT = 10000;
const TOKEN_EXPIRY_BUFFER = 60;

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

const getTokenInstance = (): AxiosInstance => {
    return createApiInstance(
        {
            baseURL: TOKEN_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: DEFAULT_TIMEOUT,
        },
        'Twitch OAuth'
    );
};

const isTokenValid = (): boolean => {
    return accessToken !== null && Date.now() < tokenExpiresAt - TOKEN_EXPIRY_BUFFER * 1000;
};

export const getAccessToken = async (): Promise<string> => {
    if (isTokenValid() && accessToken) {
        return accessToken;
    }

    if (!config.games.igdb.clientId || !config.games.igdb.clientSecret) {
        throw new Error('IGDB Client ID and Client Secret are required');
    }

    try {
        const tokenApi = getTokenInstance();
        const params = new URLSearchParams({
            client_id: config.games.igdb.clientId,
            client_secret: config.games.igdb.clientSecret,
            grant_type: 'client_credentials',
        });

        const response = await tokenApi.post<IgdbTokenResponse>('', params.toString());
        const tokenData = response.data;

        accessToken = tokenData.access_token;
        tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

        return accessToken;
    } catch (error) {
        return handleApiError(error, 'get IGDB access token');
    }
};

export const getClientId = (): string => {
    if (!config.games.igdb.clientId) {
        throw new Error('IGDB Client ID is required');
    }
    return config.games.igdb.clientId;
};

