import type { FactCheckResult } from './factChecker';

export interface ConfidenceScore {
    overall: 'high' | 'medium' | 'low';
    score: number;
    reasoning: string;
}

const calculateConfidence = (
    response: string,
    apiData?: any,
    factCheckResult?: FactCheckResult
): ConfidenceScore => {
    if (!response || response.trim().length === 0) {
        return {
            overall: 'low',
            score: 0,
            reasoning: 'Empty response',
        };
    }

    const hasApiData = apiData !== null && apiData !== undefined;
    const responseLower = response.toLowerCase();
    
    const hasUncertaintyMarkers = 
        responseLower.includes('uncertain') ||
        responseLower.includes('not sure') ||
        responseLower.includes('may not be') ||
        responseLower.includes('general knowledge') ||
        responseLower.includes('i don\'t have') ||
        responseLower.includes('i don\'t have current data') ||
        responseLower.includes('not available');
    
    const hasHighConfidenceMarkers = 
        responseLower.includes('according to the data') ||
        responseLower.includes('based on the api data') ||
        responseLower.includes('from the data provided') ||
        (hasApiData && !hasUncertaintyMarkers);
    
    let score = 50;
    let overall: 'high' | 'medium' | 'low' = 'medium';
    const reasons: string[] = [];

    if (factCheckResult) {
        if (factCheckResult.isValid && factCheckResult.confidence === 'high') {
            score = 90;
            overall = 'high';
            reasons.push('All facts verified against API data');
        } else if (factCheckResult.isValid && factCheckResult.confidence === 'medium') {
            score = 65;
            overall = 'medium';
            reasons.push('Facts verified but with medium confidence');
        } else if (!factCheckResult.isValid) {
            score = 25;
            overall = 'low';
            reasons.push(`Unverified claims detected: ${factCheckResult.unverifiedClaims.length}`);
            if (factCheckResult.issues.length > 0) {
                reasons.push(`Issues: ${factCheckResult.issues.join(', ')}`);
            }
        } else {
            score = 30;
            overall = 'low';
            reasons.push('Fact check returned low confidence');
        }
    } else if (hasApiData) {
        if (hasHighConfidenceMarkers && !hasUncertaintyMarkers) {
            score = 75;
            overall = 'high';
            reasons.push('Response references API data and shows no uncertainty');
        } else if (hasUncertaintyMarkers) {
            score = 35;
            overall = 'low';
            reasons.push('Response contains uncertainty markers despite having API data');
        } else {
            score = 60;
            overall = 'medium';
            reasons.push('API data available but response doesn\'t explicitly reference it');
        }
    } else {
        if (hasUncertaintyMarkers) {
            score = 40;
            overall = 'medium';
            reasons.push('No API data but response acknowledges uncertainty');
        } else {
            score = 45;
            overall = 'medium';
            reasons.push('No API data available - relying on general knowledge');
        }
    }

    return {
        overall,
        score,
        reasoning: reasons.join('. ') || 'Confidence calculated from heuristics',
    };
};

export const scoreConfidence = (
    response: string,
    apiData?: any,
    factCheckResult?: FactCheckResult
): ConfidenceScore => {
    try {
        return calculateConfidence(response, apiData, factCheckResult);
    } catch (error) {
        console.error('Error scoring confidence:', error);
        return {
            overall: 'low',
            score: 0,
            reasoning: `Error during confidence scoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
};
