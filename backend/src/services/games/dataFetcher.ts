import type { ParsedGameQuery } from '../../types/gameQueryParser';
import { selectApi, type SelectedApi } from './apiSelector';
import * as rawgService from './rawgService';
import * as igdbService from './igdbService';
import * as steamService from './steamService';
import * as wikipediaService from './wikipediaService';

export interface FetchedGameData {
    source: SelectedApi;
    data: unknown;
}

const hasItems = (array?: string[]): boolean => {
    return array !== undefined && array.length > 0;
};

const fetchGameDataFromRawg = async (
    parsedQuery: ParsedGameQuery,
    userInput: string
): Promise<unknown> => {
    const { entities, filters } = parsedQuery;

    if (hasItems(entities?.gameNames)) {
        const gameName = entities!.gameNames![0];
        
        if (filters?.screenshots) {
            const games = await rawgService.searchGamesByName(gameName, 1);
            if (games.results && games.results.length > 0) {
                const screenshots = await rawgService.getGameScreenshots(games.results[0].id);
                return { game: games.results[0], screenshots };
            }
        }

        if (filters?.trailers) {
            const games = await rawgService.searchGamesByName(gameName, 1);
            if (games.results && games.results.length > 0) {
                const trailers = await rawgService.getGameTrailers(games.results[0].id);
                return { game: games.results[0], trailers };
            }
        }

        const games = await rawgService.searchGamesByName(gameName, 5);
        if (games.results && games.results.length > 0) {
            const gameDetails = await rawgService.getGameById(games.results[0].id);
            return { games: games.results, gameDetails };
        }
    }

    if (hasItems(entities?.genres)) {
        const genre = entities!.genres![0];
        const games = await rawgService.searchGames({
            search: genre,
            page_size: 10,
        });
        return games;
    }

    const games = await rawgService.searchGames({
        search: userInput,
        page_size: 10,
    });
    return games;
};

const fetchGameDataFromIgdb = async (
    parsedQuery: ParsedGameQuery,
    userInput: string
): Promise<unknown> => {
    const { entities } = parsedQuery;

    if (hasItems(entities?.gameNames)) {
        const gameName = entities!.gameNames![0];
        const games = await igdbService.searchGames(gameName, { limit: 10 });
        if (games.length > 0) {
            const gameDetails = await igdbService.getGameById(games[0].id);
            return { games, gameDetails };
        }
    }

    const games = await igdbService.searchGames(userInput, { limit: 10 });
    return { games };
};

const fetchGameDataFromSteam = async (
    parsedQuery: ParsedGameQuery,
    userInput: string
): Promise<unknown> => {
    const { entities, filters } = parsedQuery;

    if (hasItems(entities?.gameNames)) {
        const gameName = entities!.gameNames![0];
        const steamApps = await steamService.searchGamesByName(gameName);
        
        if (steamApps.length > 0) {
            const appId = steamApps[0].appid;
            const result: Record<string, unknown> = {
                game: steamApps[0],
            };

            if (filters?.price) {
                const price = await steamService.getAppPrice(appId);
                result.price = price;
            }

            if (filters?.playerCount) {
                const playerCount = await steamService.getPlayerCount(appId);
                result.playerCount = playerCount;
            }

            if (filters?.reviews) {
                const reviews = await steamService.getGameReviews(appId, {
                    num_per_page: 5,
                });
                result.reviews = reviews;
            }

            if (!filters?.price && !filters?.playerCount && !filters?.reviews) {
                const appDetails = await steamService.getAppDetails(appId);
                result.details = appDetails;
            }

            return result;
        }
    }

    const steamApps = await steamService.searchGames(userInput);
    return { games: steamApps };
};

const fetchDeveloperData = async (
    parsedQuery: ParsedGameQuery,
    userInput: string
): Promise<unknown> => {
    const { entities } = parsedQuery;

    let companyId: number | null = null;
    let companies: any[] = [];

    if (hasItems(entities?.developerNames)) {
        const developerName = entities!.developerNames![0];
        companies = await igdbService.getDevelopers(developerName);
        if (companies.length > 0) {
            companyId = companies[0].id;
        }
    } else {
        companies = await igdbService.getDevelopers(userInput);
        if (companies.length > 0) {
            companyId = companies[0].id;
        }
    }

    if (!companyId) {
        return { companies };
    }

    const companyDetails = await igdbService.getCompanyById(companyId);
    const result: Record<string, unknown> = { companies, companyDetails };

    try {
        const developedGames = await igdbService.getGamesByDeveloper(companyId, { limit: 20 });
        
        if (developedGames.length > 0) {
            result.games = developedGames;
        }
    } catch (error) {
        console.warn('Error fetching games for developer:', error);
        if (companyDetails?.developed && companyDetails.developed.length > 0) {
            try {
                const developedGames = await igdbService.getGamesByIds(
                    companyDetails.developed.slice(0, 20)
                );
                if (developedGames.length > 0) {
                    result.games = developedGames;
                }
            } catch (fallbackError) {
                console.warn('Error fetching games by IDs:', fallbackError);
            }
        }
    }

    return result;
};

const fetchPlatformData = async (
    parsedQuery: ParsedGameQuery,
    userInput: string
): Promise<unknown> => {
    const { entities } = parsedQuery;

    if (hasItems(entities?.platformNames)) {
        const platformName = entities!.platformNames![0];
        const platforms = await igdbService.getPlatforms({
            search: platformName,
            limit: 10,
        });
        
        if (platforms.length > 0) {
            const platformDetails = await igdbService.getPlatformById(platforms[0].id);
            const games = await igdbService.getGamesByPlatform(platforms[0].id, { limit: 10 });
            return { platforms, platformDetails, games };
        }
    }

    const platforms = await igdbService.getPlatforms({
        search: userInput,
        limit: 10,
    });
    return { platforms };
};

const fetchGeneralData = async (userInput: string): Promise<unknown> => {
    const result = await wikipediaService.searchGeneralGamingTopic(userInput);
    return { wikipedia: result };
};

export const fetchGameData = async (
    parsedQuery: ParsedGameQuery,
    userInput: string
): Promise<FetchedGameData | null> => {
    if (parsedQuery.intent === 'general' && !parsedQuery.entities) {
        const data = await fetchGeneralData(userInput);
        return { source: 'wikipedia', data };
    }

    if (parsedQuery.intent === 'game' && parsedQuery.filters?.price && hasItems(parsedQuery.entities?.gameNames)) {
        const gameName = parsedQuery.entities!.gameNames![0];
        
        try {
            const rawgGames = await rawgService.searchGamesByName(gameName, 5);
            if (rawgGames.results && rawgGames.results.length > 0) {
                try {
                    const steamApps = await steamService.searchGamesByName(gameName);
                    if (steamApps.length > 0) {
                        const appId = steamApps[0].appid;
                        const price = await steamService.getAppPrice(appId);
                        return {
                            source: 'steam',
                            data: {
                                game: rawgGames.results[0],
                                price,
                                steamApp: steamApps[0],
                            },
                        };
                    }
                } catch (steamError) {
                    console.warn('Steam price lookup failed, returning RAWG data:', steamError);
                }
                
                return {
                    source: 'rawg',
                    data: {
                        games: rawgGames.results,
                        gameDetails: await rawgService.getGameById(rawgGames.results[0].id),
                    },
                };
            }
        } catch (rawgError) {
            console.warn('RAWG search failed, falling back to Steam:', rawgError);
        }
        
        const data = await fetchGameDataFromSteam(parsedQuery, userInput);
        return { source: 'steam', data };
    }

    const primaryApi = selectApi(parsedQuery);
    let data: unknown;

    switch (primaryApi) {
        case 'rawg':
            data = await fetchGameDataFromRawg(parsedQuery, userInput);
            break;
        case 'igdb':
            if (parsedQuery.intent === 'developer') {
                data = await fetchDeveloperData(parsedQuery, userInput);
            } else if (parsedQuery.intent === 'platform') {
                data = await fetchPlatformData(parsedQuery, userInput);
            } else {
                data = await fetchGameDataFromIgdb(parsedQuery, userInput);
            }
            break;
        case 'steam':
            data = await fetchGameDataFromSteam(parsedQuery, userInput);
            break;
        case 'wikipedia':
            data = await fetchGeneralData(userInput);
            break;
    }

    return { source: primaryApi, data };
};

