export interface ApiSportsResponse<T> {
    get: string;
    parameters: Record<string, any>;
    errors: any[];
    results: number;
    paging?: {
        current?: number;
        total?: number;
    };
    response: T;
}

export interface Team {
    id: number;
    name: string;
    nickname: string;
    code: string;
    city: string;
    logo?: string;
    conference?: {
        id: number;
        name: string;
    };
    division?: {
        id: number;
        name: string;
    };
}

export interface Player {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age?: number;
    birth?: {
        date?: string;
        place?: string;
        country?: string;
    };
    nationality?: string;
    height?: string;
    weight?: string;
    injured?: boolean;
    photo?: string;
    team?: Team;
    position?: string;
}

export interface Game {
    id: number;
    date: string;
    time: string;
    timestamp: number;
    timezone: string;
    week?: string;
    stage?: string;
    status: {
        long: string;
        short: string;
        elapsed?: number;
    };
    teams: {
        home: Team;
        away: Team;
    };
    scores: {
        home?: number;
        away?: number;
    };
    stadium?: {
        id?: number;
        name?: string;
        city?: string;
        state?: string;
        country?: string;
    };
}

export interface Standing {
    position: number;
    stage: string;
    group?: {
        name: string;
        points?: any;
    };
    team: Team;
    league: {
        id: number;
        name: string;
        country: string;
        logo?: string;
        flag?: string;
        season: number;
    };
    conference?: {
        position?: number;
        name?: string;
    };
    division?: {
        position?: number;
        name?: string;
    };
    form?: string;
    description?: string;
    all: {
        played: number;
        win: number;
        draw: number;
        loss: number;
    };
    home: {
        played: number;
        win: number;
        draw: number;
        loss: number;
    };
    away: {
        played: number;
        win: number;
        draw: number;
        loss: number;
    };
    goals: {
        for: number;
        against: number;
    };
    points?: number;
}

export interface Statistic {
    team: Team;
    statistics: Array<{
        type: string;
        value: number | string | null;
    }>;
}

