import type { IgdbQueryOptions } from '../../types/igdb';

export const buildQueryString = (options?: IgdbQueryOptions): string => {
    if (!options) {
        return '';
    }

    const parts: string[] = [];

    if (options.fields) {
        parts.push(`fields ${options.fields}`);
    }

    if (options.limit !== undefined) {
        const limit = Math.min(Math.max(1, options.limit), 500);
        parts.push(`limit ${limit}`);
    }

    if (options.offset !== undefined && options.offset >= 0) {
        parts.push(`offset ${options.offset}`);
    }

    if (options.search) {
        parts.push(`search "${options.search}"`);
    }

    if (options.where) {
        parts.push(`where ${options.where}`);
    }

    if (options.sort) {
        parts.push(`sort ${options.sort}`);
    }

    const queryString = parts.join(';');
    return queryString ? `${queryString};` : '';
};

