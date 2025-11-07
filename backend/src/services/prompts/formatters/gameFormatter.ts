const formatSingleGame = (game: any, index?: number): string => {
    const parts: string[] = [];
    
    const gameName = game.name || game.title || 'Unknown Game';
    if (index !== undefined) {
        parts.push(`${index + 1}. ${gameName}`);
    } else {
        parts.push(`GAME: ${gameName}`);
    }
    
    if (game.summary) {
        const summary = game.summary.length > 200 ? game.summary.substring(0, 200) + '...' : game.summary;
        parts.push(`   Summary: ${summary}`);
    } else if (game.description) {
        const desc = game.description.length > 200 ? game.description.substring(0, 200) + '...' : game.description;
        parts.push(`   Description: ${desc}`);
    }
    
    if (game.first_release_date) {
        const date = new Date(game.first_release_date * 1000);
        parts.push(`   Release Date: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    } else if (game.released) {
        parts.push(`   Release Date: ${game.released}`);
    }
    
    const rating = game.rating || game.aggregated_rating || game.total_rating;
    const metacritic = game.metacritic;
    if (rating !== undefined && rating !== null) {
        parts.push(`   Rating: ${Math.round(rating)}/100`);
    }
    if (metacritic !== undefined && metacritic !== null) {
        parts.push(`   Metacritic Score: ${metacritic}/100`);
    }
    
    if (game.platforms && Array.isArray(game.platforms)) {
        const platformNames = game.platforms
            .map((p: any) => {
                if (typeof p === 'object' && p.name) return p.name;
                if (typeof p === 'string') return p;
                return null;
            })
            .filter((name: string | null) => name !== null);
        if (platformNames.length > 0) {
            parts.push(`   Platforms: ${platformNames.join(', ')}`);
        }
    } else if (game.platform_names && Array.isArray(game.platform_names)) {
        parts.push(`   Platforms: ${game.platform_names.join(', ')}`);
    } else if (game.parent_platforms && Array.isArray(game.parent_platforms)) {
        const platformNames = game.parent_platforms
            .map((p: any) => p.platform?.name)
            .filter((name: string | undefined) => name)
            .join(', ');
        if (platformNames) {
            parts.push(`   Platforms: ${platformNames}`);
        }
    }
    
    if (game.genres && Array.isArray(game.genres)) {
        const genreNames = game.genres
            .map((g: any) => {
                if (typeof g === 'object' && g.name) return g.name;
                if (typeof g === 'string') return g;
                return null;
            })
            .filter((name: string | null) => name !== null);
        if (genreNames.length > 0) {
            parts.push(`   Genres: ${genreNames.join(', ')}`);
        }
    } else if (game.genre_names && Array.isArray(game.genre_names)) {
        parts.push(`   Genres: ${game.genre_names.join(', ')}`);
    }
    
    if (game.developers && Array.isArray(game.developers)) {
        const devNames = game.developers
            .map((d: any) => d.name || d)
            .filter((name: string | undefined) => name)
            .join(', ');
        if (devNames) {
            parts.push(`   Developers: ${devNames}`);
        }
    }
    
    if (game.publishers && Array.isArray(game.publishers)) {
        const pubNames = game.publishers
            .map((p: any) => p.name || p)
            .filter((name: string | undefined) => name)
            .join(', ');
        if (pubNames) {
            parts.push(`   Publishers: ${pubNames}`);
        }
    }
    
    if (game.price) {
        if (typeof game.price === 'object' && game.price.final !== undefined) {
            parts.push(`   Price: $${(game.price.final / 100).toFixed(2)} ${game.price.currency || 'USD'}`);
            if (game.price.discount > 0) {
                parts.push(`   Discount: ${game.price.discount}% off`);
            }
        } else {
            parts.push(`   Price: $${game.price}`);
        }
    }
    
    if (game.playerCount !== undefined && game.playerCount !== null) {
        parts.push(`   Current Players: ${game.playerCount.toLocaleString()}`);
    }
    
    if (game.esrb_rating) {
        const esrb = typeof game.esrb_rating === 'object' ? game.esrb_rating.name : game.esrb_rating;
        if (esrb) {
            parts.push(`   ESRB Rating: ${esrb}`);
        }
    }
    
    return parts.join('\n');
};

export const formatGameData = (data: any): string => {
    if (!data || typeof data !== 'object') {
        return JSON.stringify(data, null, 2);
    }

    const parts: string[] = [];
    
    if (data.games && Array.isArray(data.games)) {
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`GAMES FOUND (${data.games.length} games)`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        
        data.games.forEach((game: any, index: number) => {
            parts.push(formatSingleGame(game, index + 1));
            if (index < data.games.length - 1) {
                parts.push('');
            }
        });
        
        return parts.join('\n');
    }

    if (data.gameDetails || data.game || data.details) {
        const game = data.gameDetails || data.game || data.details;
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(`GAME DETAILS`);
        parts.push(`═══════════════════════════════════════════════════════════`);
        parts.push(formatSingleGame(game));
        
        if (data.price) {
            parts.push(`\nPRICING INFORMATION:`);
            if (typeof data.price === 'object') {
                if (data.price.isFree) {
                    parts.push(`   Price: FREE`);
                } else {
                    parts.push(`   Price: $${data.price.price.toFixed(2)} ${data.price.currency || 'USD'}`);
                    if (data.price.discount > 0) {
                        parts.push(`   Discount: ${data.price.discount}% off`);
                    }
                }
            }
        }
        
        if (data.playerCount !== undefined && data.playerCount !== null) {
            parts.push(`\nPLAYER STATISTICS:`);
            parts.push(`   Current Players: ${data.playerCount.toLocaleString()}`);
        }
        
        if (data.screenshots && Array.isArray(data.screenshots)) {
            parts.push(`\nSCREENSHOTS:`);
            parts.push(`   ${data.screenshots.length} screenshots available`);
            if (data.screenshots.length > 0 && data.screenshots[0].image) {
                parts.push(`   Sample: ${data.screenshots[0].image}`);
            }
        }
        
        if (data.trailers && Array.isArray(data.trailers)) {
            parts.push(`\nTRAILERS:`);
            parts.push(`   ${data.trailers.length} trailers available`);
            if (data.trailers.length > 0 && data.trailers[0].data) {
                const trailer = data.trailers[0].data;
                if (trailer.max) {
                    parts.push(`   Sample: ${trailer.max}`);
                }
            }
        }
        
        if (data.reviews && data.reviews.reviews && Array.isArray(data.reviews.reviews)) {
            parts.push(`\nREVIEWS:`);
            parts.push(`   Total Reviews: ${data.reviews.query_summary?.total_reviews || data.reviews.reviews.length}`);
            const positive = data.reviews.query_summary?.total_positive;
            const negative = data.reviews.query_summary?.total_negative;
            if (positive !== undefined && negative !== undefined) {
                const total = positive + negative;
                const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
                parts.push(`   Positive: ${positive} (${positivePercent}%)`);
                parts.push(`   Negative: ${negative} (${100 - positivePercent}%)`);
            }
        }
        
        if (data.news && data.news.appnews && data.news.appnews.newsitems) {
            parts.push(`\nLATEST NEWS:`);
            const newsItems = data.news.appnews.newsitems.slice(0, 3);
            newsItems.forEach((item: any, idx: number) => {
                parts.push(`   ${idx + 1}. ${item.title}`);
                if (item.feedlabel) {
                    parts.push(`      Source: ${item.feedlabel}`);
                }
            });
        }
        
        return parts.join('\n');
    }

    return JSON.stringify(data, null, 2);
};

