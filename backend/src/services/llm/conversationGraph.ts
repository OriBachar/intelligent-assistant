import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { getDefaultModel, getLightweightModel } from './groqService';
import { getSystemPrompt } from '../prompts/systemPrompts';
import { getChainOfThoughtPrompt } from '../prompts/reasoningPrompts';
import { createChain, invokeChain } from './langchainService';
import { classifyIntentAndParseQuery } from '../games/combinedIntentParser';
import { fetchGameData } from '../games/dataFetcher';
import { validateResponse, type ValidationResult } from '../hallucination/responseValidator';
import { mitigateHallucination, applyMitigation, type MitigationResult } from '../hallucination/mitigation';

export interface ConversationState {
    messages: BaseMessage[];
    userInput: string;
    intent?: 'game' | 'developer' | 'platform' | 'general';
    needsApiData?: boolean;
    apiData?: any;
    response?: string;
    validation?: ValidationResult;
    mitigation?: MitigationResult;
}

const isComplexQuery = (userInput: string, apiData: any): boolean => {
    const lowerInput = userInput.toLowerCase();
    const complexIndicators = [
        'compare', 'comparison', 'difference', 'versus', 'vs',
        'why', 'how', 'explain', 'analyze', 'evaluate',
        'pros and cons', 'advantages', 'disadvantages'
    ];
    
    const simpleIndicators = [
        'recommend', 'recommendation', 'suggest', 'best', 'top', 'what is', 'tell me about'
    ];
    
    if (simpleIndicators.some(indicator => lowerInput.includes(indicator)) && 
        !complexIndicators.some(indicator => lowerInput.includes(indicator))) {
        return false;
    }
    
    const hasComplexIndicator = complexIndicators.some(indicator => lowerInput.includes(indicator));
    const hasMultipleEntities = (apiData?.data && typeof apiData.data === 'object' && Object.keys(apiData.data).length > 3);
    const isLongQuery = userInput.length > 50;
    
    return hasComplexIndicator || (hasMultipleEntities && isLongQuery);
};

const generateResponse = async (
    userInput: string,
    messages: BaseMessage[],
    apiData: any
): Promise<string> => {
    if (isComplexQuery(userInput, apiData)) {
        const chainOfThoughtPrompt = getChainOfThoughtPrompt(userInput, apiData);
        const systemPrompt = getSystemPrompt(apiData);
        const chain = createChain(systemPrompt, messages);
        return await invokeChain(chain, chainOfThoughtPrompt);
    }
    
    const systemPrompt = getSystemPrompt(apiData);
    const chain = createChain(systemPrompt, messages);
    return await invokeChain(chain, userInput);
};

const isFollowUpQuestion = async (userInput: string, history: BaseMessage[]): Promise<boolean> => {
    if (history.length === 0) return false;
    
    const lowerInput = userInput.toLowerCase().trim();
    
    const quickFollowUpPatterns = [
        /^(yes|yeah|yep|sure|ok|okay|tell me more|more|what about|how about|and|also)$/i,
        /^and\s+/i,
    ];
    
    if (quickFollowUpPatterns.some(pattern => pattern.test(lowerInput))) {
        return true;
    }
    
    if (lowerInput.length < 15 && lowerInput.includes('?')) {
        return true;
    }
    
    const enhancedPatterns = [
        /^(what about|how about|and|also|tell me more|more info|more information|more details|can you|could you|is it|does it|was it|will it)/i,
        /^(yes|yeah|yep|sure|ok|okay|alright|correct|right|exactly)/i,
        /^(when|where|why|how|who|which|what|is|are|was|were|do|does|did|can|could|will|would)\s+(it|that|this|the game|they|them)/i,
    ];
    
    if (enhancedPatterns.some(pattern => pattern.test(lowerInput))) {
        return true;
    }
    
    const hasReference = /\b(it|that|this|the game|they|them|its|their|he|she|him|her)\b/i.test(lowerInput);
    const isShort = lowerInput.length < 40 && (lowerInput.includes('?') || lowerInput.split(' ').length < 10);
    
    if (hasReference && isShort) {
        return true;
    }
    
    try {
        const lastMessage = history[history.length - 1];
        if (lastMessage instanceof AIMessage && lowerInput.length < 50) {
            const lastContentStr = typeof lastMessage.content === 'string' 
                ? lastMessage.content 
                : String(lastMessage.content);
            const lastContent = lastContentStr.substring(0, 150);
            const followUpPrompt = `Is this a follow-up question? Answer ONLY "yes" or "no".

Previous: "${lastContent}..."
Current: "${userInput}"

Answer:`;
            
            const model = getLightweightModel();
            const response = await model.invoke(followUpPrompt);
            const answerStr = typeof response.content === 'string' 
                ? response.content 
                : String(response.content);
            const answer = answerStr.toLowerCase().trim();
            return answer.startsWith('yes');
        }
    } catch (error) {
        console.warn('Follow-up detection LLM check failed, using fallback:', error);
    }
    
    return false;
};

export const runConversation = async (
    userInput: string,
    conversationHistory: BaseMessage[] = []
): Promise<{ response: string; state: ConversationState }> => {
    const isFollowUp = await isFollowUpQuestion(userInput, conversationHistory);
    
    let apiData = null;
    let intent: 'game' | 'developer' | 'platform' | 'general' = 'general';
    let needsApiData = false;
    
    if (!isFollowUp) {
        const combinedResult = await classifyIntentAndParseQuery(userInput);
        intent = combinedResult.intent;
        needsApiData = combinedResult.needsApiData;
        
        if (needsApiData || (intent === 'general' && combinedResult.isGamingRelated)) {
            apiData = await fetchGameData(combinedResult.parsedQuery, userInput);
        }
    } else {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        if (lastMessage instanceof AIMessage) {
            intent = 'general';
        }
    }
    
    let response = await generateResponse(userInput, conversationHistory, apiData);
    
    let validation: ValidationResult | undefined;
    let mitigation: MitigationResult | undefined;
    let finalResponse = response;
    
    if (!isFollowUp && apiData && response.length > 50) {
        validation = await validateResponse(response, apiData, userInput);
        
        if (validation.shouldMitigate && validation.confidence.overall === 'low') {
            mitigation = await mitigateHallucination(response, validation, apiData, conversationHistory);
            
            if (mitigation.action === 're-query') {
                console.warn('Response requires re-query, but continuing with flagged response');
                finalResponse = applyMitigation(response, mitigation);
            } else {
                finalResponse = applyMitigation(response, mitigation);
            }
        }
    }
    
    const newMessages = [
        ...conversationHistory,
        new HumanMessage(userInput),
        new AIMessage(finalResponse),
    ];
    
    const state: ConversationState = {
        messages: newMessages,
        userInput,
        intent,
        needsApiData,
        apiData,
        response: finalResponse,
        validation,
        mitigation,
    };
    
    return { response: finalResponse, state };
};
