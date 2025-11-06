import { getDefaultModel } from '../llm/groqService';
import { getFactCheckPrompt } from '../prompts/safetyPrompts';
import type { Game as BalldontlieGame } from '../../types/balldontlie';
import type { Game as ApiSportsGame } from '../../types/apiSports';

export interface FactCheckResult {
    isValid: boolean;
    confidence: 'high' | 'medium' | 'low';
    issues: string[];
    verifiedFacts: string[];
    unverifiedClaims: string[];
}

const validateScoreAgainstData = (homeScore: number, awayScore: number, apiData: any): boolean => {
    if (!apiData) return false;

    if (apiData.data && Array.isArray(apiData.data)) {
        for (const game of apiData.data) {
            if ((game as BalldontlieGame).home_team_score === homeScore && 
                (game as BalldontlieGame).visitor_team_score === awayScore) {
                return true;
            }
        }
    }

    if (apiData.response && Array.isArray(apiData.response)) {
        for (const game of apiData.response) {
            if ((game as ApiSportsGame).scores?.home === homeScore && 
                (game as ApiSportsGame).scores?.away === awayScore) {
                return true;
            }
        }
    }

    if ((apiData as BalldontlieGame).home_team_score === homeScore && 
        (apiData as BalldontlieGame).visitor_team_score === awayScore) {
        return true;
    }

    if ((apiData as ApiSportsGame).scores?.home === homeScore && 
        (apiData as ApiSportsGame).scores?.away === awayScore) {
        return true;
    }

    return false;
};

const extractScores = (text: string): Array<{ home: number; away: number; text: string }> => {
    const scores: Array<{ home: number; away: number; text: string }> = [];
    
    const scorePattern = /\b(\d{1,2})[\s-]+to[\s-]+(\d{1,2})\b|\b(\d{1,2})[\s-]+(\d{1,2})\b/g;
    const matches = text.matchAll(scorePattern);
    
    for (const match of matches) {
        const num1 = parseInt(match[1] || match[3]);
        const num2 = parseInt(match[2] || match[4]);
        
        if (num1 >= 0 && num1 <= 100 && num2 >= 0 && num2 <= 100) {
            scores.push({
                home: num1,
                away: num2,
                text: match[0],
            });
        }
    }
    
    return scores;
};

export const checkFacts = async (
    response: string,
    apiData?: any
): Promise<FactCheckResult> => {
    try {
        const verifiedFacts: string[] = [];
        const unverifiedClaims: string[] = [];
        const issues: string[] = [];

        if (apiData) {
            const scores = extractScores(response);
            for (const score of scores) {
                const isValid = validateScoreAgainstData(score.home, score.away, apiData);
                if (isValid) {
                    verifiedFacts.push(`Score: ${score.text}`);
                } else {
                    unverifiedClaims.push(`Score: ${score.text}`);
                    issues.push(`Score "${score.text}" not found in API data`);
                }
            }
        }

        if (response.length > 0) {
            const factCheckPrompt = getFactCheckPrompt(response, apiData);
            const model = getDefaultModel();
            const llmResponse = await model.invoke(factCheckPrompt);
            const llmContent = llmResponse.content as string;
            
            const confidenceMatch = llmContent.match(/confidence[:\s]+(high|medium|low)/i);
            const llmConfidence = confidenceMatch 
                ? (confidenceMatch[1].toLowerCase() as 'high' | 'medium' | 'low')
                : 'medium';
            
            const hasWarnings = llmContent.toLowerCase().includes('cannot verify') || 
                               llmContent.toLowerCase().includes('not in data') ||
                               llmContent.toLowerCase().includes('unsupported') ||
                               llmContent.toLowerCase().includes('not found');
            
            if (hasWarnings) {
                issues.push('LLM flagged potential unverifiable claims');
            }

            const confidence: 'high' | 'medium' | 'low' = 
                unverifiedClaims.length === 0 && !hasWarnings && llmConfidence === 'high' ? 'high' :
                unverifiedClaims.length === 0 && !hasWarnings ? 'medium' : 'low';

            const isValid = unverifiedClaims.length === 0 && !hasWarnings;

            return {
                isValid,
                confidence,
                issues,
                verifiedFacts,
                unverifiedClaims,
            };
        }

        return {
            isValid: true,
            confidence: 'medium',
            issues: [],
            verifiedFacts: [],
            unverifiedClaims: [],
        };
    } catch (error) {
        console.error('Error checking facts:', error);
        return {
            isValid: false,
            confidence: 'low',
            issues: ['Error during fact checking'],
            verifiedFacts: [],
            unverifiedClaims: [],
        };
    }
};
