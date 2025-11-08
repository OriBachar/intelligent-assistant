import { getLightweightModel } from '../llm/groqService';
import { getCombinedIntentParsingPrompt } from '../prompts/combinedIntentParsing';
import type { ParsedGameQuery } from '../../types/gameQueryParser';

export interface CombinedIntentResult {
    intent: 'game' | 'developer' | 'platform' | 'general';
    needsApiData: boolean;
    isGamingRelated: boolean;
    parsedQuery: ParsedGameQuery;
}

const isGamingRelatedQuery = (userInput: string, intent: string, parsed: any): boolean => {
    // If intent is game, developer, or platform, it's definitely gaming-related
    if (intent !== 'general') {
        return true;
    }
    
    // Check if there are any gaming entities mentioned
    const hasGamingEntities = 
        (parsed.gameNames && parsed.gameNames.length > 0) ||
        (parsed.developerNames && parsed.developerNames.length > 0) ||
        (parsed.platformNames && parsed.platformNames.length > 0) ||
        (parsed.genres && parsed.genres.length > 0);
    
    if (hasGamingEntities) {
        return true;
    }
    
    const lowerInput = userInput.toLowerCase();
    const gamingKeywords = [
        'game', 'gaming', 'gamer', 'video game', 'videogame',
        'playstation', 'xbox', 'nintendo', 'steam', 'pc gaming',
        'rpg', 'fps', 'strategy', 'action', 'adventure', 'puzzle',
        'developer', 'publisher', 'console', 'platform',
        'esports', 'multiplayer', 'singleplayer', 'co-op',
        'gameplay', 'walkthrough', 'review', 'rating', 'score'
    ];
    
    const hasGamingKeywords = gamingKeywords.some(keyword => lowerInput.includes(keyword));
    
    const nonGamingKeywords = [
        'recipe', 'cooking', 'baking', 'ingredients', 'how to cook',
        'movie', 'film', 'actor', 'director', 'cinema',
        'sports', 'football', 'basketball', 'soccer', 'baseball',
        'weather', 'forecast', 'temperature',
        'news', 'politics', 'election',
        'medical', 'health', 'doctor', 'medicine',
        'math', 'equation', 'calculate', 'physics', 'chemistry'
    ];
    
    const hasNonGamingKeywords = nonGamingKeywords.some(keyword => lowerInput.includes(keyword));
    
    if (hasNonGamingKeywords && !hasGamingKeywords && !hasGamingEntities) {
        return false;
    }
    
    return hasGamingKeywords || !hasNonGamingKeywords;
};

export const classifyIntentAndParseQuery = async (
    userInput: string
): Promise<CombinedIntentResult> => {
    const prompt = getCombinedIntentParsingPrompt(userInput);
    const model = getLightweightModel();
    
    try {
        const response = await model.invoke(prompt);
        const content = response.content as string;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            const intent = ['game', 'developer', 'platform', 'general'].includes(parsed.intent)
                ? parsed.intent as 'game' | 'developer' | 'platform' | 'general'
                : 'general';
            
            const isGamingRelated = isGamingRelatedQuery(userInput, intent, parsed);
            
            return {
                intent,
                needsApiData: intent !== 'general' && isGamingRelated,
                isGamingRelated,
                parsedQuery: {
                    intent,
                    entities: {
                        gameNames: parsed.gameNames || [],
                        developerNames: parsed.developerNames || [],
                        publisherNames: parsed.publisherNames || [],
                        platformNames: parsed.platformNames || [],
                        genres: parsed.genres || [],
                        years: parsed.years || [],
                    },
                    filters: parsed.filters || {},
                },
            };
        }
    } catch (error) {
        console.error('Error in combined intent parsing:', error);
    }
    
    return {
        intent: 'general',
        needsApiData: false,
        isGamingRelated: false,
        parsedQuery: {
            intent: 'general',
            entities: {},
            filters: {},
        },
    };
};

