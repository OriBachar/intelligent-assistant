export const formatWikipediaData = (data: any): string => {
    const wikiContent = data.wikipedia || data.data || data;
    
    if (typeof wikiContent === 'string') {
        return `═══════════════════════════════════════════════════════════
WIKIPEDIA INFORMATION
═══════════════════════════════════════════════════════════

${wikiContent}

Source: Wikipedia`;
    }
    
    return `═══════════════════════════════════════════════════════════
WIKIPEDIA INFORMATION
═══════════════════════════════════════════════════════════

${JSON.stringify(wikiContent, null, 2)}

Source: Wikipedia`;
};

