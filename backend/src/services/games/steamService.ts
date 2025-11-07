import { AxiosInstance } from 'axios';
import { config } from '../../config/env';
import type {
    AppDetails,
    AppData,
    PlayerCountResponse,
    ReviewsResponse,
    AppListResponse,
    AppListItem,
    GameNewsResponse,
    GetAppDetailsParams,
} from '../../types/steam';
import { createApiInstance, handleApiError } from './baseApiService';

const STORE_BASE_URL = 'https://store.steampowered.com/api';
const API_BASE_URL = 'https://api.steampowered.com';
const DEFAULT_TIMEOUT = 10000;

let storeApiInstance: AxiosInstance | null = null;
let apiInstance: AxiosInstance | null = null;

const getStoreApiInstance = (): AxiosInstance => {
    if (!storeApiInstance) {
        storeApiInstance = createApiInstance(
            {
                baseURL: STORE_BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: DEFAULT_TIMEOUT,
            },
            'Steam Store'
        );
    }
    return storeApiInstance;
};

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        apiInstance = createApiInstance(
            {
                baseURL: API_BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: DEFAULT_TIMEOUT,
            },
            'Steam API'
        );
    }
    return apiInstance;
};

const makeStoreRequest = async <T>(
    endpoint: string,
    params?: Record<string, unknown>,
    operation: string = 'fetch data'
): Promise<T> => {
    const api = getStoreApiInstance();
    try {
        const response = await api.get<T>(endpoint, { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, operation);
    }
};

const makeApiRequest = async <T>(
    endpoint: string,
    params?: Record<string, unknown>,
    operation: string = 'fetch data'
): Promise<T> => {
    const api = getApiInstance();
    try {
        const response = await api.get<T>(endpoint, { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, operation);
    }
};

export const getAppDetails = async (
    appId: number,
    options?: { cc?: string; l?: string }
): Promise<AppData | null> => {
    if (!appId || appId <= 0) {
        throw new Error('Invalid app ID: must be a positive number');
    }

    const params: Record<string, unknown> = {
        appids: appId,
    };

    if (options?.cc) {
        params.cc = options.cc;
    }
    if (options?.l) {
        params.l = options.l;
    }

    const response = await makeStoreRequest<Record<string, AppDetails>>(
        '/appdetails',
        params,
        `get app details for ${appId}`
    );

    const appData = response[appId.toString()];
    if (!appData || !appData.success || !appData.data) {
        return null;
    }

    return appData.data;
};

export const getAppPrice = async (
    appId: number,
    currency: string = 'USD'
): Promise<{ price: number; currency: string; discount: number; isFree: boolean } | null> => {
    const appData = await getAppDetails(appId, { cc: currency });
    
    if (!appData) {
        return null;
    }

    if (appData.is_free) {
        return {
            price: 0,
            currency,
            discount: 0,
            isFree: true,
        };
    }

    if (!appData.price_overview) {
        return null;
    }

    return {
        price: appData.price_overview.final / 100, // Convert from cents
        currency: appData.price_overview.currency,
        discount: appData.price_overview.discount_percent,
        isFree: false,
    };
};

export const getPlayerCount = async (appId: number): Promise<number | null> => {
    if (!appId || appId <= 0) {
        throw new Error('Invalid app ID: must be a positive number');
    }

    const params: Record<string, unknown> = {
        appid: appId,
    };

    if (config.games.steam.apiKey) {
        params.key = config.games.steam.apiKey;
    }

    const response = await makeApiRequest<PlayerCountResponse>(
        '/ISteamUserStats/GetNumberOfCurrentPlayers/v1/',
        params,
        `get player count for ${appId}`
    );

    if (response.response?.result === 1 && response.response.player_count !== undefined) {
        return response.response.player_count;
    }

    return null;
};

export const getGameReviews = async (
    appId: number,
    options?: {
        filter?: 'all' | 'recent';
        language?: string;
        day_range?: number;
        start_offset?: number;
        review_type?: 'all' | 'positive' | 'negative';
        purchase_type?: 'all' | 'non_steam_purchase' | 'steam';
        num_per_page?: number;
    }
): Promise<ReviewsResponse | null> => {
    if (!appId || appId <= 0) {
        throw new Error('Invalid app ID: must be a positive number');
    }

    const params: Record<string, unknown> = {
        appid: appId,
        json: 1,
    };

    if (options?.filter) {
        params.filter = options.filter;
    }
    if (options?.language) {
        params.language = options.language;
    }
    if (options?.day_range) {
        params.day_range = options.day_range;
    }
    if (options?.start_offset) {
        params.start_offset = options.start_offset;
    }
    if (options?.review_type) {
        params.review_type = options.review_type;
    }
    if (options?.purchase_type) {
        params.purchase_type = options.purchase_type;
    }
    if (options?.num_per_page) {
        params.num_per_page = Math.min(Math.max(1, options.num_per_page), 100);
    }

    try {
        const response = await makeStoreRequest<ReviewsResponse>(
            '/appreviews',
            params,
            `get reviews for ${appId}`
        );

        return response.success === 1 ? response : null;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('access denied')) {
            console.warn(`Steam reviews API returned 403 Forbidden for app ${appId}. Reviews may not be available due to Steam API restrictions.`);
            return null;
        }
        throw error;
    }
};

const normalizeString = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

const calculateSimilarity = (str1: string, str2: string): number => {
    const normalized1 = normalizeString(str1);
    const normalized2 = normalizeString(str2);
    
    if (normalized1 === normalized2) {
        return 1.0;
    }
    
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        return 0.8;
    }
    
    const words1 = normalized1.split(/(?<=[a-z])(?=[0-9])|(?<=[0-9])(?=[a-z])/).filter(w => w.length > 0);
    const words2 = normalized2.split(/(?<=[a-z])(?=[0-9])|(?<=[0-9])(?=[a-z])/).filter(w => w.length > 0);
    
    const matchingWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2))).length;
    const totalWords = Math.max(words1.length, words2.length);
    
    if (totalWords === 0) return 0;
    return matchingWords / totalWords;
};

export const searchGames = async (query: string): Promise<AppListItem[]> => {
    if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
    }

    const appList = await getAllApps();
    const searchTerm = query.toLowerCase().trim();
    const normalizedSearch = normalizeString(query);

    const exactMatches = appList.filter(app => 
        app.name.toLowerCase().includes(searchTerm)
    );

    if (exactMatches.length >= 3) {
        return exactMatches.slice(0, 50);
    }

    const searchLimit = 10000;
    const limitedList = appList.slice(0, searchLimit);
    
    const matchesWithScores = limitedList
        .map(app => ({
            app,
            score: Math.max(
                calculateSimilarity(query, app.name),
                app.name.toLowerCase().includes(searchTerm) ? 0.7 : 0
            )
        }))
        .filter(item => item.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
        .map(item => item.app);

    const combined = [...exactMatches];
    for (const match of matchesWithScores) {
        if (!combined.some(exact => exact.appid === match.appid)) {
            combined.push(match);
        }
    }

    return combined.slice(0, 50);
};

let cachedAppList: AppListItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; 

export const getAllApps = async (forceRefresh: boolean = false): Promise<AppListItem[]> => {
    const now = Date.now();
    
    if (!forceRefresh && cachedAppList && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedAppList;
    }

    const response = await makeApiRequest<AppListResponse>(
        '/ISteamApps/GetAppList/v2/',
        {},
        'get all Steam apps'
    );

    const apps = response.applist?.apps || [];
    
    cachedAppList = apps;
    cacheTimestamp = now;
    
    return apps;
};

export const getGameNews = async (
    appId: number,
    options?: {
        count?: number;
        maxlength?: number;
    }
): Promise<GameNewsResponse | null> => {
    if (!appId || appId <= 0) {
        throw new Error('Invalid app ID: must be a positive number');
    }

    const params: Record<string, unknown> = {
        appid: appId,
    };

    if (options?.count) {
        params.count = Math.min(Math.max(1, options.count), 20);
    }
    if (options?.maxlength) {
        params.maxlength = Math.min(Math.max(1, options.maxlength), 500);
    }

    const response = await makeApiRequest<GameNewsResponse>(
        '/ISteamNews/GetNewsForApp/v2/',
        params,
        `get news for ${appId}`
    );

    return response.appnews ? response : null;
};

export const searchGamesByName = async (gameName: string): Promise<AppListItem[]> => {
    return searchGames(gameName);
};
