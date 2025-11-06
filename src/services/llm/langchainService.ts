import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { getDefaultModel } from './groqService';

export const createChain = (
    systemPrompt: string,
    history?: BaseMessage[]
): RunnableSequence => {
    if (history && history.length > 0) {
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', systemPrompt],
            new MessagesPlaceholder('history'),
            ['human', '{input}'],
        ]);

        return RunnableSequence.from([
            {
                input: (x: { input: string }) => x.input,
                history: () => history,
            },
            prompt,
            getDefaultModel(),
        ]);
    }

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['human', '{input}'],
    ]);

    return RunnableSequence.from([prompt, getDefaultModel()]);
};

export const invokeChain = async (
    chain: RunnableSequence,
    input: string
): Promise<string> => {
    try {
        const result = await chain.invoke({ input });
        return result.content as string;
    } catch (error) {
        throw new Error(`LangChain invocation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const createSimpleChain = (systemPrompt: string): RunnableSequence => {
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['human', '{input}'],
    ]);

    return RunnableSequence.from([prompt, getDefaultModel()]);
};

export const convertToLangChainMessages = (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
): BaseMessage[] => {
    return messages.map((msg) => {
        if (msg.role === 'user') {
            return new HumanMessage(msg.content);
        } else {
            return new AIMessage(msg.content);
        }
    });
};
