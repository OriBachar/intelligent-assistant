import * as balldontlie from './balldontlieService';
import * as apiSports from './apiSportsService';
import { selectApi } from './apiSelector';
import type { ParsedQuery } from '../../types/queryParser';

const fetchTeamData = async (teamName: string, includeRoster: boolean, useApiSports: boolean = false) => {
    if (useApiSports) {
        const teams = await apiSports.getTeams({ search: teamName });
        if (teams.response.length === 0) return null;
        const team = teams.response[0];
        if (includeRoster) {
            const players = await apiSports.getPlayers({ team: team.id });
            return { team, players: players.response };
        }
        return teams;
    }

    const teams = await balldontlie.getTeams({ search: teamName });
    if (teams.data.length === 0) return null;

    const team = teams.data[0];
    if (includeRoster) {
        const players = await balldontlie.getPlayers({ team_ids: [team.id] });
        return { team, players: players.data };
    }
    return teams;
};

const fetchPlayerData = async (playerName: string, seasons?: number[], useApiSports: boolean = false) => {
    if (useApiSports) {
        const players = await apiSports.getPlayers({ search: playerName });
        if (players.response.length === 0) return null;
        const player = players.response[0];
        const stats = await apiSports.getStatistics({
            player: player.id,
            ...(seasons && seasons.length > 0 && { season: seasons[0] }),
        });
        return { player, stats: stats.response };
    }

    const players = await balldontlie.getPlayers({ search: playerName });
    if (players.data.length === 0) return null;

    const player = players.data[0];
    const stats = await balldontlie.getStats({
        player_ids: [player.id],
        ...(seasons && seasons.length > 0 && { seasons }),
    });
    return { player, stats: stats.data };
};

const fetchGameData = async (entities: any, useApiSports: boolean = false) => {
    if (useApiSports) {
        const params: any = {};
        if (entities.dates?.length > 0) {
            params.date = entities.dates[0];
        }
        if (entities.teamNames?.length > 0) {
            const teams = await apiSports.getTeams({ search: entities.teamNames[0] });
            if (teams.response.length > 0) {
                params.team = teams.response[0].id;
            }
        }
        if (entities.seasons?.length > 0) {
            params.season = entities.seasons[0];
        }
        if (!entities.dates || entities.dates.length === 0) {
            params.live = 'all';
        }
        return await apiSports.getGames(params);
    }

    const params: any = {};
    if (entities.dates?.length > 0) {
        params.dates = entities.dates;
    }
    if (entities.teamNames?.length > 0) {
        const teams = await balldontlie.getTeams({ search: entities.teamNames[0] });
        if (teams.data.length > 0) {
            params.team_ids = [teams.data[0].id];
        }
    }
    if (entities.seasons?.length > 0) {
        params.seasons = entities.seasons;
    }

    return Object.keys(params).length > 0
        ? await balldontlie.getGames(params)
        : await balldontlie.getGames({ per_page: 10 });
};

export const fetchNflData = async (parsedQuery: ParsedQuery): Promise<any> => {
    if (!parsedQuery.entities) {
        return null;
    }

    try {
        const selectedApi = selectApi(parsedQuery);
        const useApiSports = selectedApi === 'apisports' || selectedApi === 'both';

        const { intent, entities, filters } = parsedQuery;

        switch (intent) {
            case 'team': {
                if (entities?.teamNames && entities.teamNames.length > 0) {
                    if (useApiSports && filters?.standings) {
                        const teams = await apiSports.getTeams({ search: entities.teamNames[0] });
                        if (teams.response.length > 0) {
                            const standings = await apiSports.getStandings({ team: teams.response[0].id });
                            return standings;
                        }
                    }
                    return await fetchTeamData(entities.teamNames[0], filters?.roster === true, useApiSports);
                }
                if (useApiSports) {
                    return await apiSports.getTeams();
                }
                return await balldontlie.getTeams();
            }

            case 'player': {
                if (entities?.playerNames && entities.playerNames.length > 0) {
                    return await fetchPlayerData(entities.playerNames[0], entities.seasons, useApiSports);
                }
                return null;
            }

            case 'game': {
                return await fetchGameData(entities, useApiSports);
            }

            default:
                return null;
        }
    } catch (error) {
        console.error('Error fetching NFL data:', error);
        return null;
    }
};
