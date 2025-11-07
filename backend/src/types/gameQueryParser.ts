export interface ParsedGameQuery {
    intent: 'game' | 'developer' | 'platform' | 'general';
    entities?: {
        gameNames?: string[];
        developerNames?: string[];
        publisherNames?: string[];
        platformNames?: string[];
        genres?: string[];
        years?: number[];
    };
    filters?: {
        price?: boolean;
        reviews?: boolean;
        ratings?: boolean;
        playerCount?: boolean;
        screenshots?: boolean;
        trailers?: boolean;
        requirements?: boolean;
    };
}

