import { getLightweightModel } from '../llm/groqService';
import { getFactCheckPrompt } from '../prompts/safetyPrompts';

export interface FactCheckResult {
    isValid: boolean;
    confidence: 'high' | 'medium' | 'low';
    issues: string[];
    verifiedFacts: string[];
    unverifiedClaims: string[];
}

const extractNumbers = (text: string, pattern: RegExp): number[] => {
    const matches = text.matchAll(pattern);
    const numbers: number[] = [];
    for (const match of matches) {
        const num = parseFloat(match[0].replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) {
            numbers.push(num);
        }
    }
    return numbers;
};

const validatePrice = (price: number, apiData: any): boolean => {
    if (!apiData?.data) return false;

    const data = apiData.data;
    
    if (data.price) {
        const apiPrice = typeof data.price === 'object' ? data.price.final : data.price;
        return Math.abs(apiPrice - price) < 0.01;
    }

    if (data.gameDetails?.price_overview) {
        const apiPrice = data.gameDetails.price_overview.final / 100;
        return Math.abs(apiPrice - price) < 0.01;
    }

    return false;
};

const validateRating = (rating: number, apiData: any): boolean => {
    if (!apiData?.data) return false;

    const data = apiData.data;
    
    if (data.rating !== undefined) {
        return Math.abs(data.rating - rating) < 0.1;
    }

    if (data.gameDetails?.rating) {
        return Math.abs(data.gameDetails.rating - rating) < 0.1;
    }

    if (data.game?.rating) {
        return Math.abs(data.game.rating - rating) < 0.1;
    }

    return false;
};

const validateGameData = (response: string, apiData: any): { verified: string[]; unverified: string[] } => {
    const verified: string[] = [];
    const unverified: string[] = [];

    if (!apiData?.data) {
        return { verified, unverified };
    }

    const pricePattern = /\$(\d+\.?\d*)|(\d+\.?\d*)\s*dollars?/gi;
    const prices = extractNumbers(response, pricePattern);
    for (const price of prices) {
        if (validatePrice(price, apiData)) {
            verified.push(`Price: $${price}`);
        } else {
            unverified.push(`Price: $${price}`);
        }
    }

    const ratingPattern = /(\d+\.?\d*)\/10|rating[:\s]+(\d+\.?\d*)/gi;
    const ratings = extractNumbers(response, ratingPattern);
    for (const rating of ratings) {
        if (rating >= 0 && rating <= 10) {
            if (validateRating(rating, apiData)) {
                verified.push(`Rating: ${rating}/10`);
            } else {
                unverified.push(`Rating: ${rating}/10`);
            }
        }
    }

    return { verified, unverified };
};

export const checkFacts = async (
    response: string,
    apiData?: any
): Promise<FactCheckResult> => {
    try {
        const verifiedFacts: string[] = [];
        const unverifiedClaims: string[] = [];
        const issues: string[] = [];

        const isWikipediaData = apiData && apiData.source === 'wikipedia';

        if (response.length > 0) {
            if (apiData && !isWikipediaData) {
                const { verified, unverified } = validateGameData(response, apiData);
                verifiedFacts.push(...verified);
                unverifiedClaims.push(...unverified);
                
                if (verified.length > 0) {
                    verifiedFacts.push('Information sourced from API data');
                }
            }

            if (isWikipediaData) {
                verifiedFacts.push('Information sourced from Wikipedia');
            }

            let llmConfidence: 'high' | 'medium' | 'low' = 'medium';
            let hasWarnings = false;

            if (unverifiedClaims.length > 0 || !apiData) {
                const factCheckPrompt = getFactCheckPrompt(response, apiData);
                const model = getLightweightModel();
                const llmResponse = await model.invoke(factCheckPrompt);
                const llmContent = llmResponse.content as string;
                
                const confidenceMatch = llmContent.match(/confidence[:\s]+(high|medium|low)/i);
                llmConfidence = confidenceMatch 
                    ? (confidenceMatch[1].toLowerCase() as 'high' | 'medium' | 'low')
                    : 'medium';
                
                hasWarnings = llmContent.toLowerCase().includes('cannot verify') || 
                               llmContent.toLowerCase().includes('not in data') ||
                               llmContent.toLowerCase().includes('unsupported') ||
                               llmContent.toLowerCase().includes('not found');
                
                if (hasWarnings && !isWikipediaData) {
                    issues.push('LLM flagged potential unverifiable claims');
                }
            }

            const hasUnverifiedData = unverifiedClaims.length > 0 || hasWarnings;
            
            const confidence: 'high' | 'medium' | 'low' = 
                isWikipediaData && !hasUnverifiedData ? 'medium' :
                unverifiedClaims.length === 0 && !hasUnverifiedData && llmConfidence === 'high' ? 'high' :
                unverifiedClaims.length === 0 && !hasUnverifiedData ? 'medium' : 'low';

            const isValid = isWikipediaData || !hasUnverifiedData;

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
