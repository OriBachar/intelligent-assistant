import { AxiosInstance } from 'axios';
import { config } from '../../config/env';
import type {
    ApiSportsResponse,
    Team,
    Player,
    Game,
    Standing,
    Statistic,
} from '../../types/apiSports';
import { createApiInstance, handleApiError } from './baseApiService';

let apiInstance: AxiosInstance | null = null;

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        if (!config.nfl.apiSports.apiKey) {
            throw new Error('API_SPORTS_KEY is required');
        }

        apiInstance = createApiInstance(
            {
                baseURL: config.nfl.apiSports.baseUrl,
                headers: {
                    'x-rapidapi-key': config.nfl.apiSports.apiKey,
                    'x-rapidapi-host': 'v1.american-football.api-sports.io',
                },
            },
            'API-Sports.io'
        );
    }

    return apiInstance;
};

export const getTeams = async (params?: {
    league?: number;
    season?: number;
    search?: string;
}): Promise<ApiSportsResponse<Team[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/teams', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch teams');
    }
};

export const getTeamById = async (id: number): Promise<ApiSportsResponse<Team>> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/teams`, { params: { id } });
        return response.data;
    } catch (error) {
        return handleApiError(error, `fetch team ${id}`);
    }
};

export const getPlayers = async (params?: {
    team?: number;
    league?: number;
    season?: number;
    search?: string;
}): Promise<ApiSportsResponse<Player[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/players', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch players');
    }
};

export const getPlayerById = async (id: number): Promise<ApiSportsResponse<Player>> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/players`, { params: { id } });
        return response.data;
    } catch (error) {
        return handleApiError(error, `fetch player ${id}`);
    }
};

export const getGames = async (params?: {
    league?: number;
    season?: number;
    team?: number;
    date?: string;
    live?: string;
}): Promise<ApiSportsResponse<Game[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/games', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch games');
    }
};

export const getGameById = async (id: number): Promise<ApiSportsResponse<Game>> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/games`, { params: { id } });
        return response.data;
    } catch (error) {
        return handleApiError(error, `fetch game ${id}`);
    }
};

export const getStandings = async (params?: {
    league?: number;
    season?: number;
    team?: number;
}): Promise<ApiSportsResponse<Standing[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/standings', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch standings');
    }
};

export const getStatistics = async (params?: {
    league?: number;
    season?: number;
    team?: number;
    game?: number;
    player?: number;
}): Promise<ApiSportsResponse<Statistic[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/statistics', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch statistics');
    }
};
