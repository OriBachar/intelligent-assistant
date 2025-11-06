import { AxiosInstance } from 'axios';
import { createApiInstance, handleApiError } from './baseApiService';
import type { WikipediaSearchResponse, WikipediaPageResponse } from '../../types/wikipedia';

let apiInstance: AxiosInstance | null = null;

const getApiInstance = (): AxiosInstance => {
    if (!apiInstance) {
        apiInstance = createApiInstance(
            {
                baseURL: 'https://en.wikipedia.org/w/api.php',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    try {
        const api = getApiInstance();
        const response = await api.get('', {
            params: {
                action: 'query',
                list: 'search',
                srsearch: query,
                srlimit: limit,
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
    try {
        const api = getApiInstance();
        const response = await api.get('', {
            params: {
                action: 'query',
                prop: 'extracts',
                titles: pageTitle,
                exintro: true,
                explaintext: true,
                exchars: extractLength,
                format: 'json',
            },
        });
        return response.data;
    } catch (error) {
        return handleApiError(error, 'get Wikipedia page');
    }
};

export const searchNflTopic = async (userQuery: string): Promise<string | null> => {
    try {
        const searchQuery = userQuery.toLowerCase().includes('nfl') 
            ? userQuery 
            : `NFL ${userQuery}`;
        
        const searchResults = await searchWikipedia(searchQuery, 3);
        
        if (searchResults.query?.search && searchResults.query.search.length > 0) {
            for (const result of searchResults.query.search) {
                const pageData = await getWikipediaPage(result.title, 800);
                
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
        console.error('Error searching NFL topic on Wikipedia:', error);
        return null;
    }
};
