import { formatApiData } from './promptUtils';

export const getChainOfThoughtPrompt = (userQuery: string, apiData?: unknown): string => {
    const basePrompt = `You are an expert NFL assistant. When answering complex questions, break down your reasoning step by step.

REASONING PROCESS:
1. Understand the question - What is the user really asking?
2. Identify what information is needed - What data points are required?
3. Analyze available data - What information do we have from APIs or knowledge?
4. Synthesize the answer - How do the pieces fit together?
5. Verify accuracy - Are all facts correct and supported by data?

USER QUERY: "${userQuery}"`;

    if (apiData) {
        const formattedData = formatApiData(apiData);
        
        return `${basePrompt}

AVAILABLE DATA:
${formattedData}

Now, think through your answer step by step:
1. What specific information does the user need?
2. What relevant data do we have from the API?
3. How should I combine this data to answer the question?
4. What is my final answer?

Provide your reasoning, then give the final answer.`;
    }

    return `${basePrompt}

Think through your answer step by step:
1. What specific information does the user need?
2. What do I know about this topic?
3. How should I structure my response?
4. What is my final answer?

Provide your reasoning, then give the final answer.`;
};

export const getComparisonPrompt = (query: string, data1: unknown, data2: unknown): string => {
    const formattedData1 = formatApiData(data1);
    const formattedData2 = formatApiData(data2);
    
    return `You are comparing two NFL entities (players, teams, games, etc.) based on the user's query.

USER QUERY: "${query}"

COMPARISON PROCESS:
1. Identify what is being compared
2. Extract relevant metrics from each data set
3. Compare the metrics side by side
4. Highlight key differences
5. Provide a clear conclusion

FIRST ENTITY DATA:
${formattedData1}

SECOND ENTITY DATA:
${formattedData2}

Think step by step:
1. What specific attributes should I compare?
2. What are the values for each attribute in both entities?
3. What are the key differences?
4. What is the conclusion?

Provide your step-by-step analysis, then give the final comparison.`;
};

export const getMultiStepQueryPrompt = (query: string, steps: string[], apiData?: unknown): string => {
    const stepsList = steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
    const basePrompt = `You need to answer a complex query that requires multiple steps of reasoning.

USER QUERY: "${query}"

REQUIRED STEPS:
${stepsList}

Think through each step sequentially:`;

    if (apiData) {
        const formattedData = formatApiData(apiData);
        
        return `${basePrompt}

AVAILABLE DATA:
${formattedData}

For each step:
1. What information do I need for this step?
2. What data do I have available?
3. What is the result of this step?
4. How does this connect to the next step?

After completing all steps, synthesize the final answer.`;
    }

    return `${basePrompt}

For each step:
1. What information do I need for this step?
2. What do I know about this?
3. What is the result of this step?
4. How does this connect to the next step?

After completing all steps, synthesize the final answer.`;
};
