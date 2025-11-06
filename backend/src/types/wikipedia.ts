export interface WikipediaSearchResult {
    pageid: number;
    ns: number;
    title: string;
    size: number;
    wordcount: number;
    snippet: string;
    timestamp: string;
}

export interface WikipediaSearchResponse {
    batchcomplete?: string;
    continue?: {
        sroffset: number;
        continue: string;
    };
    query: {
        searchinfo: {
            totalhits: number;
        };
        search: WikipediaSearchResult[];
    };
}

export interface WikipediaPage {
    pageid: number;
    ns: number;
    title: string;
    extract: string;
    fullurl: string;
}

export interface WikipediaPageResponse {
    batchcomplete?: string;
    query: {
        pages: Record<string, WikipediaPage>;
    };
}
