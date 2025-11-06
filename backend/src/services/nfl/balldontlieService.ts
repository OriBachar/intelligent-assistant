import { AxiosInstance } from 'axios';
import { config } from '../../config/env';
import type {
    BalldontlieApiResponse,
    Team,
    Player,
    Game,
    Stat,
} from '../../types/balldontlie';
import { createApiInstance, handleApiError } from './baseApiService';

let apiInstance: AxiosInstance | null = null;

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        if (!config.nfl.balldontlie.apiKey) {
            throw new Error('BALLDONTLIE_API_KEY is required');
        }

        apiInstance = createApiInstance(
            {
                baseURL: 'https://api.balldontlie.io/v1',
                headers: {
                    'Authorization': `Bearer ${config.nfl.balldontlie.apiKey}`,
                    'Content-Type': 'application/json',
                },
            },
            'BALLDONTLIE'
        );
    }

    return apiInstance;
};

export const getTeams = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
}): Promise<BalldontlieApiResponse<Team[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/teams', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch teams');
    }
};

export const getTeamById = async (id: number): Promise<Team> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/teams/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, `fetch team ${id}`);
    }
};


export const getPlayers = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    team_ids?: number[];
}): Promise<BalldontlieApiResponse<Player[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/players', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch players');
    }
};

export const getPlayerById = async (id: number): Promise<Player> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/players/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, `fetch player ${id}`);
    }
};


export const getGames = async (params?: {
    page?: number;
    per_page?: number;
    seasons?: number[];
    team_ids?: number[];
    dates?: string[];
    postseason?: boolean;
}): Promise<BalldontlieApiResponse<Game[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/games', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch games');
    }
};

export const getGameById = async (id: number): Promise<Game> => {
    try {
        const api = getApiInstance();
        const response = await api.get(`/games/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error, `fetch game ${id}`);
    }
};


export const getStats = async (params?: {
    page?: number;
    per_page?: number;
    player_ids?: number[];
    game_ids?: number[];
    seasons?: number[];
    team_ids?: number[];
}): Promise<BalldontlieApiResponse<Stat[]>> => {
    try {
        const api = getApiInstance();
        const response = await api.get('/stats', { params });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'fetch stats');
    }
};
