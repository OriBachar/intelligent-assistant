export interface SteamApiResponse<T> {
    response: T;
}

export interface AppDetails {
    success: boolean;
    data?: AppData;
}

export interface AppData {
    type: string;
    name: string;
    steam_appid: number;
    required_age: number;
    is_free: boolean;
    controller_support?: string;
    detailed_description?: string;
    about_the_game?: string;
    short_description?: string;
    supported_languages?: string;
    header_image?: string;
    website?: string;
    pc_requirements?: Requirements;
    mac_requirements?: Requirements;
    linux_requirements?: Requirements;
    developers?: string[];
    publishers?: string[];
    price_overview?: PriceOverview;
    packages?: number[];
    package_groups?: PackageGroup[];
    platforms?: Platforms;
    categories?: Category[];
    genres?: Genre[];
    screenshots?: Screenshot[];
    movies?: Movie[];
    recommendations?: Recommendations;
    achievements?: Achievements;
    release_date?: ReleaseDate;
    support_info?: SupportInfo;
    background?: string;
    content_descriptors?: ContentDescriptors;
}

export interface Requirements {
    minimum?: string;
    recommended?: string;
}

export interface PriceOverview {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted?: string;
    final_formatted?: string;
}

export interface PackageGroup {
    name: string;
    title: string;
    description: string;
    selection_text: string;
    save_text: string;
    display_type: number;
    is_recurring_subscription: string;
    subs?: Subscription[];
}

export interface Subscription {
    packageid: number;
    percent_savings_text: string;
    percent_savings: number;
    option_text: string;
    option_description: string;
    can_get_free_license: string;
    is_free_license: boolean;
    price_in_cents_with_discount: number;
}

export interface Platforms {
    windows: boolean;
    mac: boolean;
    linux: boolean;
}

export interface Category {
    id: number;
    description: string;
}

export interface Genre {
    id: string;
    description: string;
}

export interface Screenshot {
    id: number;
    path_thumbnail: string;
    path_full: string;
}

export interface Movie {
    id: number;
    name: string;
    thumbnail: string;
    webm?: VideoFormat;
    mp4?: VideoFormat;
    highlight: boolean;
}

export interface VideoFormat {
    '480': string;
    max: string;
}

export interface Recommendations {
    total: number;
}

export interface Achievements {
    total: number;
    highlighted?: HighlightedAchievement[];
}

export interface HighlightedAchievement {
    name: string;
    path: string;
}

export interface ReleaseDate {
    coming_soon: boolean;
    date: string;
}

export interface SupportInfo {
    url: string;
    email: string;
}

export interface ContentDescriptors {
    ids: number[];
    notes?: string;
}

export interface PlayerCountResponse {
    response?: {
        result: number;
        resultcount: number;
        player_count?: number;
    };
}

export interface ReviewsResponse {
    success: number;
    query_summary?: QuerySummary;
    reviews?: Review[];
    cursor?: string;
}

export interface QuerySummary {
    num_reviews: number;
    review_score: number;
    review_score_desc: string;
    total_positive: number;
    total_negative: number;
    total_reviews: number;
}

export interface Review {
    recommendationid: string;
    author: ReviewAuthor;
    language: string;
    review: string;
    timestamp_created: number;
    timestamp_updated: number;
    voted_up: boolean;
    votes_up: number;
    votes_funny: number;
    weighted_vote_score: string;
    comment_count: number;
    steam_purchase: boolean;
    received_for_free: boolean;
    written_during_early_access: boolean;
    hidden_in_steam_china: boolean;
    steam_china_location: string;
    playtime_forever: number;
    playtime_at_review: number;
    playtime_last_two_weeks: number;
}

export interface ReviewAuthor {
    steamid: string;
    num_games_owned: number;
    num_reviews: number;
    playtime_forever: number;
    playtime_last_two_weeks: number;
    last_played: number;
}

export interface AppListResponse {
    applist: {
        apps: AppListItem[];
    };
}

export interface AppListItem {
    appid: number;
    name: string;
}

export interface SearchAppsParams {
    appids?: number[];
    max_results?: number;
}

export interface GetAppDetailsParams {
    appids: number[];
    cc?: string;
    l?: string;
}

export interface GameNewsResponse {
    appnews?: {
        appid: number;
        newsitems: NewsItem[];
        count: number;
    };
}

export interface NewsItem {
    gid: string;
    title: string;
    url: string;
    is_external_url: boolean;
    author: string;
    contents: string;
    feedlabel: string;
    date: number;
    feedname: string;
    feed_type: number;
    appid: number;
    tags?: string[];
}
