import type { ParsedGameQuery } from '../../types/gameQueryParser';

export type SelectedApi = 'rawg' | 'igdb' | 'steam' | 'wikipedia';

const hasItems = (array?: string[]): boolean => {
    return array !== undefined && array.length > 0;
};

export const selectApi = (parsedQuery: ParsedGameQuery): SelectedApi => {
    const { intent, entities, filters } = parsedQuery;

    switch (intent) {
        case 'general':
            return 'wikipedia';

        case 'game': {
            if (filters?.price || filters?.playerCount) {
                return 'steam';
            }
            if (filters?.reviews || hasItems(entities?.gameNames) || hasItems(entities?.genres)) {
                return 'rawg';
            }
            return 'rawg';
        }

        case 'developer':
            return 'igdb';

        case 'platform':
            return 'igdb';

        default:
            return 'rawg';
    }
};
