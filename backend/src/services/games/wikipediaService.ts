import { AxiosInstance } from 'axios';
import type {
    WikipediaSearchResponse,
    WikipediaPageResponse,
} from '../../types/wikipedia';
import { createApiInstance, handleApiError } from './baseApiService';

const BASE_URL = 'https://en.wikipedia.org/w/api.php';
const DEFAULT_TIMEOUT = 10000;
const USER_AGENT = 'Video-Games-Intelligent-Assistant/1.0 (https://github.com/yourusername/intelligent-assistant; contact@example.com)';

let apiInstance: AxiosInstance | null = null;

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        apiInstance = createApiInstance(
            {
                baseURL: BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT,
                },
                timeout: DEFAULT_TIMEOUT,
            },
            'Wikipedia'
        );
    }
    return apiInstance;
};

export const searchWikipedia = async (
    query: string,
    limit: number = 5
): Promise<WikipediaSearchResponse> => {
    if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
    }

    const api = getApiInstance();
    try {
        const response = await api.get<WikipediaSearchResponse>('', {
            params: {
                action: 'query',
                list: 'search',
                srsearch: query.trim(),
                srlimit: Math.min(Math.max(1, limit), 50),
                format: 'json',
            },
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'search Wikipedia');
    }
};

export const getWikipediaPage = async (
    pageTitle: string,
    extractLength: number = 500
): Promise<WikipediaPageResponse> => {
    if (!pageTitle || pageTitle.trim().length === 0) {
        throw new Error('Page title cannot be empty');
    }

    const api = getApiInstance();
    try {
        const response = await api.get<WikipediaPageResponse>('', {
            params: {
                action: 'query',
                prop: 'extracts',
                titles: pageTitle.trim(),
                exintro: true,
                explaintext: true,
                exchars: Math.min(Math.max(50, extractLength), 2000),
                format: 'json',
            },
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'get Wikipedia page');
    }
};

export const searchGameTopic = async (userQuery: string): Promise<string | null> => {
    try {
        const searchQuery = userQuery.toLowerCase().includes('game') || 
                           userQuery.toLowerCase().includes('video game') ||
                           userQuery.toLowerCase().includes('gaming')
            ? userQuery 
            : `video game ${userQuery}`;
        
        const searchResults = await searchWikipedia(searchQuery, 3);
        
        if (searchResults.query?.search && searchResults.query.search.length > 0) {
            for (const result of searchResults.query.search) {
                const pageData = await getWikipediaPage(result.title, 1500);
                
                const pages = pageData.query?.pages;
                if (pages) {
                    const pageId = Object.keys(pages)[0];
                    const page = pages[pageId];
                    if (page && page.pageid !== -1 && page.extract && page.extract.length > 50) {
                        return page.extract;
                    }
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error searching game topic on Wikipedia:', error);
        return null;
    }
};

export const searchDeveloperTopic = async (developerName: string): Promise<string | null> => {
    try {
        const searchQuery = `${developerName} (video game developer)`;
        const searchResults = await searchWikipedia(searchQuery, 3);
        
        if (searchResults.query?.search && searchResults.query.search.length > 0) {
            for (const result of searchResults.query.search) {
                if (result.title.toLowerCase().includes(developerName.toLowerCase())) {
                    const pageData = await getWikipediaPage(result.title, 2000);
                    
                    const pages = pageData.query?.pages;
                    if (pages) {
                        const pageId = Object.keys(pages)[0];
                        const page = pages[pageId];
                        if (page && page.pageid !== -1 && page.extract && page.extract.length > 50) {
                            return page.extract;
                        }
                    }
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error searching developer topic on Wikipedia:', error);
        return null;
    }
};

export const searchGeneralGamingTopic = async (topic: string): Promise<string | null> => {
    try {
        const searchQuery = topic.toLowerCase().includes('game') || 
                           topic.toLowerCase().includes('gaming')
            ? topic 
            : `${topic} (video game)`;
        
        const searchResults = await searchWikipedia(searchQuery, 5);
        
        if (searchResults.query?.search && searchResults.query.search.length > 0) {
            for (const result of searchResults.query.search) {
                const pageData = await getWikipediaPage(result.title, 1500);
                
                const pages = pageData.query?.pages;
                if (pages) {
                    const pageId = Object.keys(pages)[0];
                    const page = pages[pageId];
                    if (page && page.pageid !== -1 && page.extract && page.extract.length > 50) {
                        return page.extract;
                    }
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error searching general gaming topic on Wikipedia:', error);
        return null;
    }
};

