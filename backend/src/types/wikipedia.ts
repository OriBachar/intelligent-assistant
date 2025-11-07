export interface WikipediaSearchResponse {
    batchcomplete?: string;
    query?: {
        searchinfo?: {
            totalhits: number;
            suggestion?: string;
            suggestionsnippet?: string;
        };
        search?: Array<{
            ns: number;
            title: string;
            pageid: number;
            size: number;
            wordcount: number;
            snippet: string;
            timestamp: string;
        }>;
    };
}

export interface WikipediaPageResponse {
    batchcomplete?: string;
    query?: {
        pages?: {
            [pageId: string]: {
                pageid: number;
                ns: number;
                title: string;
                extract?: string;
                thumbnail?: {
                    source: string;
                    width: number;
                    height: number;
                };
                original?: {
                    source: string;
                    width: number;
                    height: number;
                };
            };
        };
    };
}
