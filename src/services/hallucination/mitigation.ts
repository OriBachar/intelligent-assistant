import { getSystemPrompt } from '../prompts/systemPrompts';
import { getCorrectionPrompt } from '../prompts/safetyPrompts';
import { createChain, invokeChain } from '../llm/langchainService';
import type { ValidationResult } from './responseValidator';
import type { BaseMessage } from '@langchain/core/messages';

export interface MitigationResult {
    action: 'accept' | 'flag' | 'correct' | 're-query';
    correctedResponse?: string;
    disclaimer?: string;
    shouldRetry: boolean;
}

const generateDisclaimer = (validation: ValidationResult): string => {
    const disclaimers: string[] = [];

    if (validation.factCheck.unverifiedClaims.length > 0) {
        disclaimers.push('Some information may not be verified');
    }

    if (validation.confidence.overall === 'low') {
        disclaimers.push('Response has low confidence');
    }

    if (validation.factCheck.issues.length > 0) {
        disclaimers.push('Some claims could not be verified against available data');
    }

    if (disclaimers.length === 0) {
        return '';
    }

    return `Note: ${disclaimers.join('. ')}.`;
};

const shouldReQuery = (validation: ValidationResult): boolean => {
    return (
        !validation.isValid &&
        validation.factCheck.unverifiedClaims.length > 2 &&
        validation.confidence.score < 30
    );
};

const shouldCorrect = (validation: ValidationResult): boolean => {
    return (
        validation.shouldMitigate &&
        validation.factCheck.unverifiedClaims.length > 0 &&
        validation.factCheck.unverifiedClaims.length <= 2
    );
};

const shouldFlag = (validation: ValidationResult): boolean => {
    return (
        validation.shouldMitigate &&
        validation.confidence.overall === 'medium' &&
        validation.factCheck.isValid
    );
};

export const mitigateHallucination = async (
    originalResponse: string,
    validation: ValidationResult,
    apiData?: any,
    conversationHistory?: BaseMessage[]
): Promise<MitigationResult> => {
    try {
        if (!validation.shouldMitigate) {
            return {
                action: 'accept',
                shouldRetry: false,
            };
        }

        if (shouldReQuery(validation)) {
            return {
                action: 're-query',
                shouldRetry: true,
                disclaimer: generateDisclaimer(validation),
            };
        }

        if (shouldCorrect(validation)) {
            const correctionPrompt = getCorrectionPrompt(
                originalResponse,
                validation.factCheck.issues,
                validation.factCheck.unverifiedClaims,
                validation.confidence.overall,
                validation.confidence.score,
                apiData
            );
            const systemPrompt = getSystemPrompt(apiData);
            const chain = createChain(systemPrompt, conversationHistory);
            
            const correctedResponse = await invokeChain(chain, correctionPrompt);
            
            return {
                action: 'correct',
                correctedResponse,
                disclaimer: generateDisclaimer(validation),
                shouldRetry: false,
            };
        }

        if (shouldFlag(validation)) {
            return {
                action: 'flag',
                disclaimer: generateDisclaimer(validation),
                shouldRetry: false,
            };
        }

        return {
            action: 'flag',
            disclaimer: generateDisclaimer(validation),
            shouldRetry: false,
        };
    } catch (error) {
        console.error('Error in mitigation:', error);
        return {
            action: 'flag',
            disclaimer: 'An error occurred during response validation. Please verify the information.',
            shouldRetry: false,
        };
    }
};

export const applyMitigation = (
    originalResponse: string,
    mitigation: MitigationResult
): string => {
    if (mitigation.action === 'accept') {
        return originalResponse;
    }

    if (mitigation.action === 'correct' && mitigation.correctedResponse) {
        let result = mitigation.correctedResponse;
        if (mitigation.disclaimer) {
            result += `\n\n${mitigation.disclaimer}`;
        }
        return result;
    }

    if (mitigation.action === 'flag' || mitigation.action === 're-query') {
        let result = originalResponse;
        if (mitigation.disclaimer) {
            result += `\n\n${mitigation.disclaimer}`;
        }
        return result;
    }

    return originalResponse;
};
