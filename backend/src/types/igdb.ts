export interface IgdbImage {
    id: number;
    image_id: string;
    url?: string;
}

export interface Game {
    id: number;
    name: string;
    slug?: string;
    summary?: string;
    storyline?: string;
    rating?: number;
    rating_count?: number;
    aggregated_rating?: number;
    aggregated_rating_count?: number;
    total_rating?: number;
    total_rating_count?: number;
    category?: GameCategory;
    first_release_date?: number;
    platforms?: number[];
    platform_names?: string[];
    genres?: number[];
    genre_names?: string[];
    themes?: number[];
    game_modes?: number[];
    player_perspectives?: number[];
    cover?: number;
    cover_data?: Cover;
    screenshots?: number[];
    screenshot_data?: Screenshot[];
    videos?: number[];
    artworks?: number[];
    websites?: Website[];
    involved_companies?: number[];
    involved_companies_data?: InvolvedCompany[];
    similar_games?: number[];
    franchises?: number[];
    collections?: number[];
    release_dates?: number[];
    release_dates_data?: ReleaseDate[];
    age_ratings?: number[];
    game_engines?: number[];
    keywords?: number[];
    tags?: number[];
    status?: GameStatus;
    version_parent?: number;
    version_title?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export enum GameCategory {
    MainGame = 0,
    DlcAddon = 1,
    Expansion = 2,
    Bundle = 3,
    StandaloneExpansion = 4,
    Mod = 5,
    Episode = 6,
    Season = 7,
    Remake = 8,
    Remaster = 9,
    ExpandedGame = 10,
    Port = 11,
    Fork = 12,
    Pack = 13,
    Update = 14,
}

export enum GameStatus {
    Released = 0,
    Alpha = 2,
    Beta = 3,
    EarlyAccess = 4,
    Offline = 5,
    Cancelled = 6,
    Rumored = 7,
    Delisted = 8,
}

export interface Company {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    developed?: number[];
    published?: number[];
    logo?: number;
    logo_data?: IgdbImage;
    country?: number;
    website?: string;
    start_date?: number;
    changed_company_id?: number;
    change_date?: number;
    parent?: number;
    parent_data?: Company;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface InvolvedCompany {
    id: number;
    company?: number;
    company_data?: Company;
    game?: number;
    developer?: boolean;
    publisher?: boolean;
    porting?: boolean;
    supporting?: boolean;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface Platform {
    id: number;
    name: string;
    slug?: string;
    abbreviation?: string;
    category?: PlatformCategory;
    generation?: number;
    platform_logo?: number;
    platform_logo_data?: IgdbImage;
    platform_family?: number;
    summary?: string;
    versions?: number[];
    websites?: Website[];
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export enum PlatformCategory {
    Console = 1,
    Arcade = 2,
    Computer = 3,
    Handheld = 4,
    Mobile = 5,
    Other = 6,
}

export interface Cover extends IgdbImage {
    game?: number;
    game_data?: Game;
    width?: number;
    height?: number;
}

export interface Screenshot extends IgdbImage {
    game?: number;
    game_data?: Game;
    width?: number;
    height?: number;
}

export interface Artwork extends IgdbImage {
    game?: number;
    game_data?: Game;
    width?: number;
    height?: number;
}

export interface Genre {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface Theme {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface GameMode {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface PlayerPerspective {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface ReleaseDate {
    id: number;
    category?: ReleaseDateCategory;
    date?: number;
    human?: string;
    m?: number;
    y?: number;
    region?: number;
    platform?: number;
    platform_data?: Platform;
    game?: number;
    game_data?: Game;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export enum ReleaseDateCategory {
    YYYYMMMMDD = 0,
    YYYYMMMM = 1,
    YYYY = 2,
    YYYYQ1 = 3,
    YYYYQ2 = 4,
    YYYYQ3 = 5,
    YYYYQ4 = 6,
    TBD = 7,
}

export interface AgeRating {
    id: number;
    category?: AgeRatingCategory;
    rating?: AgeRatingValue;
    rating_cover_url?: string;
    synopsis?: string;
    game?: number;
    game_data?: Game;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export enum AgeRatingCategory {
    ESRB = 1,
    PEGI = 2,
    CERO = 3,
    USK = 4,
    GRAC = 5,
    CLASS_IND = 6,
    ACB = 7,
}

export enum AgeRatingValue {
    Three = 1,
    Seven = 2,
    Twelve = 3,
    Sixteen = 4,
    Eighteen = 5,
    RP = 6,
    EC = 7,
    E = 8,
    E10 = 9,
    T = 10,
    M = 11,
    AO = 12,
}

export interface Website {
    id: number;
    category?: WebsiteCategory;
    trusted?: boolean;
    url?: string;
    game?: number;
    game_data?: Game;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export enum WebsiteCategory {
    Official = 1,
    Wikia = 2,
    Wikipedia = 3,
    Facebook = 4,
    Twitter = 5,
    Twitch = 6,
    Instagram = 8,
    YouTube = 9,
    iPhone = 10,
    iPad = 11,
    Android = 12,
    Steam = 13,
    Reddit = 14,
    Itch = 15,
    EpicGames = 16,
    GOG = 17,
    Discord = 18,
}

export interface GameEngine {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    logo?: number;
    logo_data?: IgdbImage;
    platforms?: number[];
    companies?: number[];
    games?: number[];
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface Keyword {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface Franchise {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface Collection {
    id: number;
    name: string;
    slug?: string;
    url?: string;
    created_at?: number;
    updated_at?: number;
    checksum?: string;
}

export interface IgdbApiResponse<T> extends Array<T> {
}

export interface IgdbQueryOptions {
    fields?: string;
    limit?: number;
    offset?: number;
    search?: string;
    where?: string;
    sort?: string;
    expand?: string;
}

export interface IgdbTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}
