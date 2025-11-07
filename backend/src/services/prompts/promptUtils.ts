const formatDeveloperData = (data: any): string => {
    if (!data || typeof data !== 'object') {
        return JSON.stringify(data, null, 2);
    }

    const parts: string[] = [];
    
    let companyName = 'Unknown Developer';
    if (data.companyDetails) {
        companyName = data.companyDetails.name || companyName;
        parts.push(`DEVELOPER: ${companyName}`);
        if (data.companyDetails.description) {
            parts.push(`Description: ${data.companyDetails.description}`);
        }
        if (data.companyDetails.website) {
            parts.push(`Website: ${data.companyDetails.website}`);
        }
    } else if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
        companyName = data.companies[0].name || companyName;
        parts.push(`DEVELOPER: ${companyName}`);
        if (data.companies[0].description) {
            parts.push(`Description: ${data.companies[0].description}`);
        }
        if (data.companies[0].website) {
            parts.push(`Website: ${data.companies[0].website}`);
        }
    }

    if (data.games && Array.isArray(data.games) && data.games.length > 0) {
        parts.push(`\n═══════════════════════════════════════════════════════════`);
        parts.push(`GAMES DEVELOPED BY ${companyName.toUpperCase()} (${data.games.length} games found):`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        
        data.games.forEach((game: any, index: number) => {
            const gameInfo: string[] = [];
            
            const gameName = game.name || game.title || game.slug || `Game ${index + 1}`;
            gameInfo.push(`\n${index + 1}. ${gameName}`);
            
            if (game.summary) {
                const summary = game.summary.length > 150 ? game.summary.substring(0, 150) + '...' : game.summary;
                gameInfo.push(`   Summary: ${summary}`);
            }
            
            const rating = game.rating || game.aggregated_rating || game.total_rating;
            if (rating !== undefined && rating !== null) {
                gameInfo.push(`   Rating: ${Math.round(rating)}/100`);
            }
            
            if (game.first_release_date) {
                const releaseDate = new Date(game.first_release_date * 1000).getFullYear();
                gameInfo.push(`   Release Year: ${releaseDate}`);
            }
            
            if (game.genres && Array.isArray(game.genres) && game.genres.length > 0) {
                const genreNames = game.genres
                    .map((g: any) => {
                        if (typeof g === 'object' && g.name) return g.name;
                        if (typeof g === 'string') return g;
                        return null;
                    })
                    .filter((name: string | null) => name !== null)
                    .join(', ');
                if (genreNames) {
                    gameInfo.push(`   Genres: ${genreNames}`);
                }
            }
            
            parts.push(gameInfo.join('\n'));
        });
        
        parts.push(`\n═══════════════════════════════════════════════════════════`);
        parts.push(`IMPORTANT: The above list contains ALL games developed by ${companyName}.`);
        parts.push(`You MUST use this list when answering questions about games made by this developer.`);
        parts.push(`List each game by name from the numbered list above.`);
    } else if (data.companies && data.companies.length > 0 && !data.games) {
        parts.push('\n⚠️ Note: Games list not available in API response.');
    }

    return parts.join('\n\n');
};

const formatGameData = (data: any): string => {
    if (!data || typeof data !== 'object') {
        return JSON.stringify(data, null, 2);
    }

    if (data.games && Array.isArray(data.games)) {
        const parts: string[] = [];
        parts.push(`GAMES FOUND (${data.games.length} games):`);
        data.games.forEach((game: any, index: number) => {
            const gameInfo: string[] = [];
            gameInfo.push(`${index + 1}. ${game.name || 'Unknown Game'}`);
            if (game.summary || game.description) {
                gameInfo.push(`   ${game.summary || game.description || ''}`);
            }
            if (game.rating || game.metacritic) {
                gameInfo.push(`   Rating: ${game.rating || game.metacritic || 'N/A'}`);
            }
            if (game.released || game.first_release_date) {
                const date = game.released || (game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : null);
                if (date) {
                    gameInfo.push(`   Release Date: ${date}`);
                }
            }
            if (game.price) {
                gameInfo.push(`   Price: ${typeof game.price === 'object' ? `$${game.price.final}` : `$${game.price}`}`);
            }
            parts.push(gameInfo.join('\n'));
        });
        return parts.join('\n\n');
    }

    if (data.gameDetails || data.game) {
        const game = data.gameDetails || data.game;
        const parts: string[] = [];
        parts.push(`GAME: ${game.name || 'Unknown'}`);
        if (game.description || game.summary) {
            parts.push(`Description: ${game.description || game.summary || ''}`);
        }
        if (game.rating || game.metacritic) {
            parts.push(`Rating: ${game.rating || game.metacritic || 'N/A'}`);
        }
        if (game.price) {
            parts.push(`Price: ${typeof game.price === 'object' ? `$${game.price.final}` : `$${game.price}`}`);
        }
        return parts.join('\n');
    }

    return JSON.stringify(data, null, 2);
};

export const formatApiData = (apiData: unknown): string => {
    if (!apiData) {
        return '';
    }

    if (typeof apiData === 'string') {
        return apiData.replace(/\{/g, '{{').replace(/\}/g, '}}');
    }

    if (typeof apiData !== 'object') {
        return String(apiData);
    }

    const wrapped = apiData as any;
    
    const data = wrapped.data !== undefined ? wrapped.data : wrapped;
    const source = wrapped.source;
    
    if (source === 'wikipedia' || data.source === 'wikipedia' || data.wikipedia) {
        const wikiContent = data.wikipedia || data.data || data;
        if (typeof wikiContent === 'string') {
            return `WIKIPEDIA INFORMATION:\n${wikiContent}`.replace(/\{/g, '{{').replace(/\}/g, '}}');
        }
        return `WIKIPEDIA INFORMATION:\n${JSON.stringify(wikiContent, null, 2)}`.replace(/\{/g, '{{').replace(/\}/g, '}}');
    }

    if (data.companies || data.companyDetails) {
        try {
            const formatted = formatDeveloperData(data);
            if (formatted.includes('Unknown Developer') || (formatted.includes('Unknown Game') && data.games && data.games.length > 0)) {
                console.warn('Warning: Some game data may be missing. Games count:', data.games?.length, 'Company:', data.companyDetails?.name || data.companies?.[0]?.name);
            }
            return formatted.replace(/\{/g, '{{').replace(/\}/g, '}}');
        } catch (error) {
            console.error('Error formatting developer data:', error);
            return `DEVELOPER DATA (raw):\n${JSON.stringify(data, null, 2)}`.replace(/\{/g, '{{').replace(/\}/g, '}}');
        }
    }

    if (data.games || data.game || data.gameDetails) {
        return formatGameData(data).replace(/\{/g, '{{').replace(/\}/g, '}}');
    }

    const formatted = JSON.stringify(data, null, 2);
    return formatted.replace(/\{/g, '{{').replace(/\}/g, '}}');
};
