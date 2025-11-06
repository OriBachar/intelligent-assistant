export interface BalldontlieApiResponse<T> {
    data: T;
    meta?: {
        total_pages?: number;
        current_page?: number;
        next_page?: number;
        per_page?: number;
        total_count?: number;
    };
}

export interface Team {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
}

export interface Player {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    height_feet?: number;
    height_inches?: number;
    weight_pounds?: number;
    team?: Team;
}

export interface Game {
    id: number;
    date: string;
    season: number;
    status: string;
    period?: number;
    time?: string;
    postseason: boolean;
    home_team: Team;
    home_team_score?: number;
    visitor_team: Team;
    visitor_team_score?: number;
}

export interface Stat {
    id: number;
    ast?: number;
    blk?: number;
    dreb?: number;
    fg3_pct?: number;
    fg3a?: number;
    fg3m?: number;
    fg_pct?: number;
    fga?: number;
    fgm?: number;
    ft_pct?: number;
    fta?: number;
    ftm?: number;
    game: Game;
    min?: string;
    oreb?: number;
    pf?: number;
    player: Player;
    pts?: number;
    reb?: number;
    stl?: number;
    team: Team;
    turnover?: number;
}

