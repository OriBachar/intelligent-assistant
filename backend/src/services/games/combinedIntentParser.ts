import { getLightweightModel } from '../llm/groqService';
import { getCombinedIntentParsingPrompt } from '../prompts/combinedIntentParsing';
import type { ParsedGameQuery } from '../../types/gameQueryParser';

export interface CombinedIntentResult {
    intent: 'game' | 'developer' | 'platform' | 'general';
    needsApiData: boolean;
    parsedQuery: ParsedGameQuery;
}

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
            
            return {
                intent,
                needsApiData: intent !== 'general',
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
        parsedQuery: {
            intent: 'general',
            entities: {},
            filters: {},
        },
    };
};

