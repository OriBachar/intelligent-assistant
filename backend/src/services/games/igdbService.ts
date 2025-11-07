import { AxiosInstance } from 'axios';
import type {
    Game,
    Company,
    Platform,
    Cover,
    Screenshot,
    Genre,
    InvolvedCompany,
    IgdbQueryOptions,
} from '../../types/igdb';
import { createApiInstance, handleApiError } from './baseApiService';
import { getAccessToken, getClientId } from './igdbAuth';
import { buildQueryString } from './igdbQueryBuilder';

const BASE_URL = 'https://api.igdb.com/v4';
const DEFAULT_TIMEOUT = 10000;

let apiInstance: AxiosInstance | null = null;

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        apiInstance = createApiInstance(
            {
                baseURL: BASE_URL,
                headers: {
                    'Content-Type': 'text/plain',
                },
                timeout: DEFAULT_TIMEOUT,
            },
            'IGDB'
        );
    }
    return apiInstance;
};

const makeRequest = async <T>(
    endpoint: string,
    queryString: string = '',
    operation: string = 'fetch data'
): Promise<T[]> => {
    const api = getApiInstance();
    const token = await getAccessToken();
    const clientId = getClientId();

    try {
        const response = await api.post<T[]>(
            endpoint,
            queryString,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return handleApiError(error, operation);
    }
};

export const searchGames = async (
    query: string,
    options?: Omit<IgdbQueryOptions, 'search'>
): Promise<Game[]> => {
    if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
    }

    const queryOptions: IgdbQueryOptions = {
        ...options,
        search: query.trim(),
        fields: options?.fields || 'id,name,slug,summary,rating,first_release_date,platforms,genres,cover',
    };

    return makeRequest<Game>('/games', buildQueryString(queryOptions), 'search games');
};

export const getGameById = async (id: number): Promise<Game | null> => {
    if (!id || id <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }

    const queryString = buildQueryString({
        fields: 'id,name,slug,summary,storyline,rating,rating_count,aggregated_rating,first_release_date,platforms,genres,themes,cover,screenshots,websites,involved_companies,release_dates,age_ratings,status',
        where: `id = ${id}`,
        limit: 1,
    });

    const games = await makeRequest<Game>('/games', queryString, `get game by id ${id}`);
    return games.length > 0 ? games[0] : null;
};

export const getGamesByIds = async (ids: number[]): Promise<Game[]> => {
    if (!ids || ids.length === 0) {
        return [];
    }

    const validIds = ids.filter(id => id > 0);
    if (validIds.length === 0) {
        throw new Error('No valid game IDs provided');
    }

    const idsString = validIds.join(',');
    const queryString = buildQueryString({
        fields: 'id,name,slug,summary,rating,first_release_date,platforms,genres,cover',
        where: `id = (${idsString})`,
        limit: validIds.length,
    });

    return makeRequest<Game>('/games', queryString, 'get games by IDs');
};

export const getDevelopers = async (
    query?: string,
    options?: Omit<IgdbQueryOptions, 'search' | 'where'>
): Promise<Company[]> => {
    const queryOptions: IgdbQueryOptions = {
        ...options,
        fields: options?.fields || 'id,name,slug,description',
    };

    if (query) {

        const searchTerm = query.trim().replace(/"/g, '\\"');
        queryOptions.where = `name ~ *"${searchTerm}"*`;
        queryOptions.limit = options?.limit || 10;
    }

    return makeRequest<Company>('/companies', buildQueryString(queryOptions), 'search developers');
};

export const getPublishers = async (
    query?: string,
    options?: Omit<IgdbQueryOptions, 'search' | 'where'>
): Promise<Company[]> => {
    return getDevelopers(query, options);
};

export const getCompanyById = async (id: number): Promise<Company | null> => {
    if (!id || id <= 0) {
        throw new Error('Invalid company ID: must be a positive number');
    }

    const queryString = buildQueryString({
        fields: 'id,name,slug,description,developed,published',
        where: `id = ${id}`,
        limit: 1,
    });

    const companies = await makeRequest<Company>('/companies', queryString, `get company by id ${id}`);
    return companies.length > 0 ? companies[0] : null;
};

export const getPlatforms = async (options?: IgdbQueryOptions): Promise<Platform[]> => {
    const queryOptions: IgdbQueryOptions = {
        ...options,
        fields: options?.fields || 'id,name,slug,abbreviation,category,generation,platform_logo,summary',
    };

    return makeRequest<Platform>('/platforms', buildQueryString(queryOptions), 'get platforms');
};

export const getPlatformById = async (id: number): Promise<Platform | null> => {
    if (!id || id <= 0) {
        throw new Error('Invalid platform ID: must be a positive number');
    }

    const queryString = buildQueryString({
        fields: 'id,name,slug,abbreviation,category,generation,platform_logo,platform_family,summary',
        where: `id = ${id}`,
        limit: 1,
    });

    const platforms = await makeRequest<Platform>('/platforms', queryString, `get platform by id ${id}`);
    return platforms.length > 0 ? platforms[0] : null;
};

export const getGamesByPlatform = async (
    platformId: number,
    options?: Omit<IgdbQueryOptions, 'where'>
): Promise<Game[]> => {
    if (!platformId || platformId <= 0) {
        throw new Error('Invalid platform ID: must be a positive number');
    }

    const queryOptions: IgdbQueryOptions = {
        ...options,
        fields: options?.fields || 'id,name,slug,summary,rating,first_release_date,platforms,genres,cover',
        where: `platforms = (${platformId})`,
    };

    return makeRequest<Game>('/games', buildQueryString(queryOptions), `get games by platform ${platformId}`);
};

export const getGamesByDeveloper = async (
    companyId: number,
    options?: Omit<IgdbQueryOptions, 'where'>
): Promise<Game[]> => {
    if (!companyId || companyId <= 0) {
        throw new Error('Invalid company ID: must be a positive number');
    }

    const queryOptions: IgdbQueryOptions = {
        ...options,
        fields: options?.fields || 'id,name,slug,summary,rating,first_release_date,platforms,genres,cover',
        where: `involved_companies.company = ${companyId} & involved_companies.developer = true`,
        limit: options?.limit || 20,
    };

    return makeRequest<Game>('/games', buildQueryString(queryOptions), `get games by developer ${companyId}`);
};

export const getGameCovers = async (gameId: number): Promise<Cover[]> => {
    if (!gameId || gameId <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }

    const queryString = buildQueryString({
        fields: 'id,image_id,game,width,height',
        where: `game = ${gameId}`,
    });

    return makeRequest<Cover>('/covers', queryString, `get covers for game ${gameId}`);
};

export const getGameScreenshots = async (gameId: number): Promise<Screenshot[]> => {
    if (!gameId || gameId <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }

    const queryString = buildQueryString({
        fields: 'id,image_id,game,width,height',
        where: `game = ${gameId}`,
    });

    return makeRequest<Screenshot>('/screenshots', queryString, `get screenshots for game ${gameId}`);
};

export const getGenres = async (options?: IgdbQueryOptions): Promise<Genre[]> => {
    const queryOptions: IgdbQueryOptions = {
        ...options,
        fields: options?.fields || 'id,name,slug',
    };

    return makeRequest<Genre>('/genres', buildQueryString(queryOptions), 'get genres');
};

export const getInvolvedCompanies = async (gameId: number): Promise<InvolvedCompany[]> => {
    if (!gameId || gameId <= 0) {
        throw new Error('Invalid game ID: must be a positive number');
    }

    const queryString = buildQueryString({
        fields: 'id,company,game,developer,publisher,porting,supporting',
        where: `game = ${gameId}`,
    });

    return makeRequest<InvolvedCompany>('/involved_companies', queryString, `get involved companies for game ${gameId}`);
};

export const getImageUrl = (
    imageId: string,
    size: 'cover_small' | 'cover_big' | 'screenshot_med' | 'screenshot_big' | 'screenshot_huge' | 'thumb' | 'micro' | '720p' | '1080p' = 'cover_big'
): string => {
    if (!imageId) {
        return '';
    }
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
};
