import { getDefaultModel } from '../llm/groqService';
import { getQueryParsingPrompt } from '../prompts/queryParsing';
import type { ParsedQuery } from '../../types/queryParser';

export const parseQuery = async (userInput: string, classifiedIntent: 'game' | 'player' | 'team' | 'general'): Promise<ParsedQuery> => {
    if (classifiedIntent === 'general') {
        return { intent: 'general' };
    }

    const parsePrompt = getQueryParsingPrompt(userInput, classifiedIntent);

    try {
        const model = getDefaultModel();
        const response = await model.invoke(parsePrompt);
        const content = response.content as string;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                intent: classifiedIntent,
                entities: {
                    teamNames: parsed.teamNames || [],
                    playerNames: parsed.playerNames || [],
                    dates: parsed.dates || [],
                    seasons: parsed.seasons || [],
                },
                filters: parsed.filters || {},
            };
        }
    } catch (error) {
        console.error('Error parsing query:', error);
    }

    return {
        intent: classifiedIntent,
        entities: {},
        filters: {},
    };
};
