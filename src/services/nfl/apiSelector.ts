import * as balldontlie from './balldontlieService';
import * as apiSports from './apiSportsService';
import type { ParsedQuery } from '../../types/queryParser';

const isRealTimeQuery = (intent: string, entities?: any, filters?: any): boolean => {
    if (intent === 'game') {
        const today = new Date().toISOString().split('T')[0];
        if (entities.dates?.includes(today) || entities.dates?.includes('today')) {
            return true;
        }
        if (!entities.dates || entities.dates.length === 0) {
            return true;
        }
    }

    if (intent === 'team' && filters.standings) {
        return true;
    }

    return false;
};

const isHistoricalQuery = (intent: string, entities?: any): boolean => {
    if (entities.seasons && entities.seasons.length > 0) {
        const currentYear = new Date().getFullYear();
        const hasPastSeasons = entities.seasons.some((season: number) => season < currentYear);
        if (hasPastSeasons) {
            return true;
        }
    }

    if (intent === 'game' && entities.dates) {
        const today = new Date().toISOString().split('T')[0];
        const hasPastDates = entities.dates.some((date: string) => date < today);
        if (hasPastDates) {
            return true;
        }
    }

    if (intent === 'player' && entities.seasons) {
        const currentYear = new Date().getFullYear();
        const hasPastSeasons = entities.seasons.some((season: number) => season < currentYear);
        if (hasPastSeasons) {
            return true;
        }
    }

    return false;
};

export const selectApi = (parsedQuery: ParsedQuery): 'balldontlie' | 'apisports' | 'both' => {
    const { intent, entities, filters } = parsedQuery;

    const isRealTime = isRealTimeQuery(intent, entities, filters);
    const isHistorical = isHistoricalQuery(intent, entities);

    if (isRealTime && !isHistorical) {
        return 'apisports';
    }

    if (isHistorical && !isRealTime) {
        return 'balldontlie';
    }

    if (isRealTime && isHistorical) {
        return 'both';
    }

    return 'balldontlie';
};
