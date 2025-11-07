export const formatPlatformData = (data: any): string => {
    if (!data || typeof data !== 'object') {
        return JSON.stringify(data, null, 2);
    }

    const parts: string[] = [];
    
    if (data.platformDetails) {
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`PLATFORM INFORMATION`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`Name: ${data.platformDetails.name || 'Unknown'}`);
        if (data.platformDetails.summary) {
            parts.push(`Description: ${data.platformDetails.summary}`);
        }
        if (data.platformDetails.platform_logo) {
            parts.push(`Logo: ${data.platformDetails.platform_logo.url || 'Available'}`);
        }
    }
    
    if (data.platforms && Array.isArray(data.platforms)) {
        if (!data.platformDetails) {
            parts.push(`═══════════════════════════════════════════════════════════`);
            parts.push(`PLATFORMS FOUND (${data.platforms.length} platforms)`);
            parts.push(`═══════════════════════════════════════════════════════════`);
        }
        data.platforms.forEach((platform: any, index: number) => {
            if (!data.platformDetails || index > 0) {
                parts.push(`\n${index + 1}. ${platform.name || 'Unknown Platform'}`);
                if (platform.summary) {
                    parts.push(`   ${platform.summary.substring(0, 150)}...`);
                }
            }
        });
    }
    
    if (data.games && Array.isArray(data.games)) {
        parts.push(`\n═══════════════════════════════════════════════════════════`);
        parts.push(`GAMES ON THIS PLATFORM (${data.games.length} games)`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        data.games.slice(0, 10).forEach((game: any, index: number) => {
            parts.push(`${index + 1}. ${game.name || 'Unknown Game'}`);
        });
        if (data.games.length > 10) {
            parts.push(`... and ${data.games.length - 10} more games`);
        }
    }
    
    return parts.join('\n\n');
};

