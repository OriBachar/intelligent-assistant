import { checkFacts, type FactCheckResult } from './factChecker';
import { scoreConfidence, type ConfidenceScore } from './confidenceScorer';

export interface ValidationResult {
    isValid: boolean;
    shouldMitigate: boolean;
    factCheck: FactCheckResult;
    confidence: ConfidenceScore;
    summary: string;
    recommendations: string[];
}

const generateSummary = (
    factCheck: FactCheckResult,
    confidence: ConfidenceScore
): string => {
    const parts: string[] = [];

    if (factCheck.isValid && confidence.overall === 'high') {
        parts.push('Response validated successfully with high confidence');
    } else if (factCheck.isValid && confidence.overall === 'medium') {
        parts.push('Response is valid but has medium confidence');
    } else if (!factCheck.isValid) {
        parts.push('Response contains unverified claims');
    } else if (confidence.overall === 'low') {
        parts.push('Response has low confidence');
    }

    if (factCheck.verifiedFacts.length > 0) {
        parts.push(`${factCheck.verifiedFacts.length} fact(s) verified`);
    }

    if (factCheck.unverifiedClaims.length > 0) {
        parts.push(`${factCheck.unverifiedClaims.length} unverified claim(s) detected`);
    }

    if (factCheck.issues.length > 0) {
        parts.push(`${factCheck.issues.length} issue(s) found`);
    }

    return parts.join('. ') || 'Response validation completed';
};

const generateRecommendations = (
    factCheck: FactCheckResult,
    confidence: ConfidenceScore
): string[] => {
    const recommendations: string[] = [];

    if (!factCheck.isValid) {
        if (factCheck.unverifiedClaims.length > 0) {
            recommendations.push('Remove or correct unverified claims');
            recommendations.push('Re-query with more specific API parameters if needed');
        }
        if (factCheck.issues.length > 0) {
            recommendations.push('Address the detected issues before responding');
        }
    }

    if (confidence.overall === 'low' || confidence.score < 40) {
        recommendations.push('Add uncertainty markers to acknowledge limitations');
        recommendations.push('Clarify which information comes from API data vs. general knowledge');
    }

    if (factCheck.verifiedFacts.length === 0 && factCheck.unverifiedClaims.length > 0) {
        recommendations.push('Consider re-generating response with verified data only');
    }

    if (factCheck.issues.length > 2) {
        recommendations.push('Multiple issues detected - consider significant revision');
    }

    return recommendations;
};

export const validateResponse = async (
    response: string,
    apiData?: any,
    originalQuery?: string
): Promise<ValidationResult> => {
    try {
        if (!response || response.trim().length === 0) {
            const emptyFactCheck: FactCheckResult = {
                isValid: false,
                confidence: 'low',
                issues: ['Empty response'],
                verifiedFacts: [],
                unverifiedClaims: [],
            };

            const emptyConfidence: ConfidenceScore = {
                overall: 'low',
                score: 0,
                reasoning: 'Empty response',
            };

            return {
                isValid: false,
                shouldMitigate: true,
                factCheck: emptyFactCheck,
                confidence: emptyConfidence,
                summary: 'Empty response cannot be validated',
                recommendations: ['Generate a non-empty response'],
            };
        }

        const factCheck = await checkFacts(response, apiData);
        const confidence = scoreConfidence(response, apiData, factCheck);

        const isValid = factCheck.isValid && confidence.overall !== 'low';
        const shouldMitigate = (confidence.overall === 'low' || confidence.score < 40) || !factCheck.isValid;

        const summary = generateSummary(factCheck, confidence);
        const recommendations = generateRecommendations(factCheck, confidence);

        return {
            isValid,
            shouldMitigate,
            factCheck,
            confidence,
            summary,
            recommendations,
        };
    } catch (error) {
        console.error('Error validating response:', error);

        const errorFactCheck: FactCheckResult = {
            isValid: false,
            confidence: 'low',
            issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            verifiedFacts: [],
            unverifiedClaims: [],
        };

        const errorConfidence: ConfidenceScore = {
            overall: 'low',
            score: 0,
            reasoning: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };

        return {
            isValid: false,
            shouldMitigate: true,
            factCheck: errorFactCheck,
            confidence: errorConfidence,
            summary: 'Validation failed due to error',
            recommendations: ['Retry validation or check system logs'],
        };
    }
};
