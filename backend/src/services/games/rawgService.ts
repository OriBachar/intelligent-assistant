import { AxiosInstance } from 'axios';
import { config } from '../../config/env';
import type {
    RawgApiResponse,
    Game,
    Screenshot,
    Trailer,
    SearchGamesParams,
} from '../../types/rawg';
import { createApiInstance, handleApiError } from './baseApiService';

const BASE_URL = 'https://api.rawg.io/api';
const DEFAULT_TIMEOUT = 10000;

let apiInstance: AxiosInstance | null = null;

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        apiInstance = createApiInstance(
            {
                baseURL: BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: DEFAULT_TIMEOUT,
            },
            'RAWG'
        );
    }

    return apiInstance;
};

const addApiKeyToParams = (
    params?: Record<string, unknown>
): Record<string, unknown> => {
    const requestParams = { ...params };
    if (config.games.rawg.apiKey) {
        return { ...requestParams, key: config.games.rawg.apiKey };
    }
    return requestParams;
};

const makeRequest = async <T>(
    endpoint: string,
    params?: SearchGamesParams | Record<string, unknown>,
    operation: string = 'fetch data'
): Promise<T> => {
    const api = getApiInstance();
    const paramsRecord = params as Record<string, unknown> | undefined;
    const requestParams = addApiKeyToParams(paramsRecord);
    
    try {
        const response = await api.get<T>(endpoint, { params: requestParams });
        return response.data;
    } catch (error) {
        handleApiError(error, operation);
        throw error;
    }
};

export const searchGames = async (
    params?: SearchGamesParams
): Promise<RawgApiResponse<Game>> => {
    return makeRequest<RawgApiResponse<Game>>('/games', params, 'search games');
};

export const getGameById = async (id: number): Promise<Game> => {
    if (!id || id <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }
    return makeRequest<Game>(`/games/${id}`, {}, `get game by id ${id}`);
};

export const getGameScreenshots = async (
    gameId: number
): Promise<RawgApiResponse<Screenshot>> => {
    if (!gameId || gameId <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }
    return makeRequest<RawgApiResponse<Screenshot>>(
        `/games/${gameId}/screenshots`,
        {},
        `get screenshots for game ${gameId}`
    );
};

export const getGameTrailers = async (
    gameId: number
): Promise<RawgApiResponse<Trailer>> => {
    if (!gameId || gameId <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }
    return makeRequest<RawgApiResponse<Trailer>>(
        `/games/${gameId}/movies`,
        {},
        `get trailers for game ${gameId}`
    );
};

export const searchGamesByName = async (
    gameName: string,
    pageSize: number = 10
): Promise<RawgApiResponse<Game>> => {
    if (!gameName || gameName.trim().length === 0) {
        throw new Error('Game name cannot be empty');
    }
    if (pageSize < 1 || pageSize > 40) {
        throw new Error('Page size must be between 1 and 40');
    }
    return searchGames({
        search: gameName.trim(),
        page_size: pageSize,
    });
};

export const getGameBySlug = async (slug: string): Promise<Game> => {
    if (!slug || slug.trim().length === 0) {
        throw new Error('Game slug cannot be empty');
    }
    return makeRequest<Game>(`/games/${slug.trim()}`, {}, `get game by slug ${slug}`);
};
