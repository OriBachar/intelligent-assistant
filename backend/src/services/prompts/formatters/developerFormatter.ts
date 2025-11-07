const formatSingleGame = (game: any, index: number): string => {
    const parts: string[] = [];
    
    const gameName = game.name || game.title || 'Unknown Game';
    parts.push(`${index + 1}. ${gameName}`);
    
    if (game.summary) {
        const summary = game.summary.length > 150 ? game.summary.substring(0, 150) + '...' : game.summary;
        parts.push(`   Summary: ${summary}`);
    }
    
    const rating = game.rating || game.aggregated_rating || game.total_rating;
    if (rating !== undefined && rating !== null) {
        parts.push(`   Rating: ${Math.round(rating)}/100`);
    }
    
    if (game.first_release_date) {
        const releaseDate = new Date(game.first_release_date * 1000).getFullYear();
        parts.push(`   Release Year: ${releaseDate}`);
    }
    
    if (game.genres && Array.isArray(game.genres)) {
        const genreNames = game.genres
            .map((g: any) => {
                if (typeof g === 'object' && g.name) return g.name;
                if (typeof g === 'string') return g;
                return null;
            })
            .filter((name: string | null) => name !== null)
            .join(', ');
        if (genreNames) {
            parts.push(`   Genres: ${genreNames}`);
        }
    } else if (game.genre_names && Array.isArray(game.genre_names)) {
        parts.push(`   Genres: ${game.genre_names.join(', ')}`);
    }
    
    return parts.join('\n');
};

export const formatDeveloperData = (data: any): string => {
    if (!data || typeof data !== 'object') {
        return JSON.stringify(data, null, 2);
    }

    const parts: string[] = [];
    
    let companyName = 'Unknown Developer';
    if (data.companyDetails) {
        companyName = data.companyDetails.name || companyName;
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`DEVELOPER INFORMATION`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`Name: ${companyName}`);
        if (data.companyDetails.description) {
            parts.push(`Description: ${data.companyDetails.description}`);
        }
        if (data.companyDetails.website) {
            parts.push(`Website: ${data.companyDetails.website}`);
        }
    } else if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
        companyName = data.companies[0].name || companyName;
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`DEVELOPER INFORMATION`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`Name: ${companyName}`);
        if (data.companies[0].description) {
            parts.push(`Description: ${data.companies[0].description}`);
        }
        if (data.companies[0].website) {
            parts.push(`Website: ${data.companies[0].website}`);
        }
    }

    if (data.games && Array.isArray(data.games) && data.games.length > 0) {
        parts.push(`\n═══════════════════════════════════════════════════════════`);
        parts.push(`GAMES DEVELOPED BY ${companyName.toUpperCase()}`);
        parts.push(`Total: ${data.games.length} games`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        
        data.games.forEach((game: any, index: number) => {
            parts.push(formatSingleGame(game, index + 1));
        });
        
        parts.push(`\n═══════════════════════════════════════════════════════════`);
        parts.push(`IMPORTANT INSTRUCTIONS:`);
        parts.push(`- The above numbered list (1., 2., 3., etc.) contains ALL games developed by ${companyName}`);
        parts.push(`- When asked "What games did ${companyName} make?", you MUST list ALL games from the numbered list above`);
        parts.push(`- Copy game names EXACTLY as they appear (e.g., "1. The Witcher 3: Wild Hunt" → list "The Witcher 3: Wild Hunt")`);
        parts.push(`- Do NOT say "I don't have information" if you see a numbered list of games`);
        parts.push(`- Start your response with: "${companyName} has developed the following games:" then list each game`);
        parts.push(`═══════════════════════════════════════════════════════════`);
    } else if (data.companies && data.companies.length > 0 && !data.games) {
        parts.push(`\nNote: Games list not available in API response.`);
    }

    return parts.join('\n\n');
};

