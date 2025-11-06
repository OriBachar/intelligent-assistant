export interface ParsedQuery {
    intent: 'game' | 'player' | 'team' | 'general';
    entities?: {
        teamNames?: string[];
        playerNames?: string[];
        dates?: string[];
        seasons?: number[];
    };
    filters?: {
        stats?: boolean;
        schedule?: boolean;
        standings?: boolean;
        roster?: boolean;
    };
}

