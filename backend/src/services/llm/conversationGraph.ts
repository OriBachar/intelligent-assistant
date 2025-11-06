import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { getDefaultModel } from './groqService';
import { getIntentClassificationPrompt } from '../prompts/intentClassification';
import { getSystemPrompt } from '../prompts/systemPrompts';
import { createChain, invokeChain } from './langchainService';
import { parseQuery } from '../nfl/queryParser';
import { fetchNflData } from '../nfl/dataFetcher';
import { validateResponse, type ValidationResult } from '../hallucination/responseValidator';
import { mitigateHallucination, applyMitigation, type MitigationResult } from '../hallucination/mitigation';

export interface ConversationState {
    messages: BaseMessage[];
    userInput: string;
    intent?: 'game' | 'player' | 'team' | 'general';
    needsApiData?: boolean;
    apiData?: any;
    response?: string;
    validation?: ValidationResult;
    mitigation?: MitigationResult;
}

const classifyIntent = async (userInput: string): Promise<{ intent: 'game' | 'player' | 'team' | 'general'; needsApiData: boolean }> => {
    const classificationPrompt = getIntentClassificationPrompt(userInput);
    const model = getDefaultModel();
    const response = await model.invoke(classificationPrompt);
    const intent = (response.content as string).toLowerCase().trim();
    
    const validIntents: Array<'game' | 'player' | 'team' | 'general'> = ['game', 'player', 'team', 'general'];
    const classifiedIntent = validIntents.includes(intent as any) ? intent as 'game' | 'player' | 'team' | 'general' : 'general';
    
    return {
        intent: classifiedIntent,
        needsApiData: classifiedIntent !== 'general',
    };
};


const generateResponse = async (
    userInput: string,
    messages: BaseMessage[],
    apiData: any
): Promise<string> => {
    const systemPrompt = getSystemPrompt(apiData);
    const chain = createChain(systemPrompt, messages);
    return await invokeChain(chain, userInput);
};

export const runConversation = async (
    userInput: string,
    conversationHistory: BaseMessage[] = []
): Promise<{ response: string; state: ConversationState }> => {
    const { intent, needsApiData } = await classifyIntent(userInput);
    
    let apiData = null;
    if (needsApiData) {
        const parsedQuery = await parseQuery(userInput, intent);
        apiData = await fetchNflData(parsedQuery, userInput);
    } else if (intent === 'general') {
        const parsedQuery = await parseQuery(userInput, intent);
        apiData = await fetchNflData(parsedQuery, userInput);
    }
    
    let response = await generateResponse(userInput, conversationHistory, apiData);
    
    const validation = await validateResponse(response, apiData, userInput);
    let mitigation: MitigationResult | undefined;
    let finalResponse = response;
    
    if (validation.shouldMitigate) {
        mitigation = await mitigateHallucination(response, validation, apiData, conversationHistory);
        
        if (mitigation.action === 're-query') {
            console.warn('Response requires re-query, but continuing with flagged response');
            finalResponse = applyMitigation(response, mitigation);
        } else {
            finalResponse = applyMitigation(response, mitigation);
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
