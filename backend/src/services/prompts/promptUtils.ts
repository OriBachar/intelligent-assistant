import { formatGameData } from './formatters/gameFormatter';
import { formatDeveloperData } from './formatters/developerFormatter';
import { formatPlatformData } from './formatters/platformFormatter';
import { formatWikipediaData } from './formatters/wikipediaFormatter';

const escapeBraces = (text: string): string => {
    return text.replace(/\{/g, '{{').replace(/\}/g, '}}');
};

export const formatApiData = (apiData: unknown): string => {
    if (!apiData) {
        return '';
    }

    if (typeof apiData === 'string') {
        return escapeBraces(apiData);
    }

    if (typeof apiData !== 'object') {
        return String(apiData);
    }

    const wrapped = apiData as any;
    const data = wrapped.data !== undefined ? wrapped.data : wrapped;
    const source = wrapped.source;
    
    if (source === 'wikipedia' || data.source === 'wikipedia' || data.wikipedia) {
        return escapeBraces(formatWikipediaData(data));
    }

    if (data.companies || data.companyDetails) {
        try {
            const formatted = formatDeveloperData(data);
            return escapeBraces(formatted);
        } catch (error) {
            console.error('Error formatting developer data:', error);
            return escapeBraces(`DEVELOPER DATA (raw):\n${JSON.stringify(data, null, 2)}`);
        }
    }

    if (data.platforms || data.platformDetails) {
        return escapeBraces(formatPlatformData(data));
    }

    if (data.games || data.game || data.gameDetails || data.details) {
        return escapeBraces(formatGameData(data));
    }

    const formatted = JSON.stringify(data, null, 2);
    return escapeBraces(formatted);
};
