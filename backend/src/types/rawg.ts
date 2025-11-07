export interface RawgApiResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface Game {
    id: number;
    slug: string;
    name: string;
    name_original?: string;
    description?: string;
    metacritic?: number;
    metacritic_platforms?: GamePlatformMetacritic[];
    released?: string;
    tba?: boolean;
    updated?: string;
    background_image?: string;
    background_image_additional?: string;
    website?: string;
    rating: number;
    rating_top?: number;
    ratings?: Ratings;
    reactions?: Reactions;
    added?: number;
    added_by_status?: AddedByStatus;
    ratings_count?: number;
    reviews_text_count?: string;
    playtime?: number;
    suggestions_count?: number;
    esrb_rating?: EsrbRating;
    platforms?: GamePlatform[];
    genres?: Genre[];
    stores?: GameStore[];
    tags?: Tag[];
    developers?: Developer[];
    publishers?: Publisher[];
    parent_platforms?: ParentPlatform[];
}

export interface GamePlatformMetacritic {
    metascore: number;
    url: string;
    platform: Platform;
}

export interface GamePlatform {
    platform: Platform;
    released_at?: string;
    requirements?: Requirements;
}

export interface Platform {
    id: number;
    slug: string;
    name: string;
}

export interface Requirements {
    minimum?: string;
    recommended?: string;
}

export interface Ratings {
    [key: number]: number;
}

export interface Reactions {
    [key: number]: number;
}

export interface AddedByStatus {
    yet?: number;
    owned?: number;
    beaten?: number;
    toplay?: number;
    dropped?: number;
    playing?: number;
}

export interface EsrbRating {
    id: number;
    slug: string;
    name: string;
}

export interface Genre {
    id: number;
    slug: string;
    name: string;
    games_count?: number;
    image_background?: string;
}

export interface Tag {
    id: number;
    slug: string;
    name: string;
    games_count?: number;
    image_background?: string;
}

export interface Developer {
    id: number;
    slug: string;
    name: string;
    games_count?: number;
    image_background?: string;
}

export interface Publisher {
    id: number;
    slug: string;
    name: string;
    games_count?: number;
    image_background?: string;
}

export interface ParentPlatform {
    platform: Platform;
}

export interface GameStore {
    id: number;
    store: Store;
    url: string;
}

export interface Store {
    id: number;
    slug: string;
    name: string;
    domain?: string;
    games_count?: number;
    image_background?: string;
}

export interface Screenshot {
    id: number;
    image: string;
    width: number;
    height: number;
    is_deleted: boolean;
}

export interface Trailer {
    id: number;
    name: string;
    preview: string;
    data: {
        480: string;
        max: string;
    };
}

export interface Review {
    id: number;
    title: string;
    text: string;
    rating: number;
    user: ReviewUser;
    date: string;
}

export interface ReviewUser {
    username: string;
    id: number;
}

export interface SearchGamesParams {
    search?: string;
    search_precise?: boolean;
    search_exact?: boolean;
    parent_platforms?: number;
    platforms?: number;
    stores?: number;
    developers?: number;
    publishers?: number;
    genres?: number;
    tags?: number;
    creators?: number;
    dates?: string;
    updated?: string;
    platforms_count?: number;
    metacritic?: string;
    exclude_collection?: number;
    exclude_additions?: boolean;
    exclude_parents?: boolean;
    exclude_game_series?: boolean;
    exclude_stores?: number;
    ordering?: string;
    page?: number;
    page_size?: number;
}
