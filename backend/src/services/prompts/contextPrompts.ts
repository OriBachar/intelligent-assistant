export const getContextAwarePrompt = (conversationHistory: string, currentQuery: string): string => {
    return `You are continuing a conversation with context from previous exchanges.

CONVERSATION HISTORY:
${conversationHistory}

CURRENT QUERY: "${currentQuery}"

CONTEXT HANDLING GUIDELINES:
1. Reference previous conversation when relevant (e.g., "As we discussed earlier...")
2. Understand follow-up questions (e.g., "What about its price?" refers to previously mentioned entity)
3. Maintain consistency with previous answers
4. If the query is ambiguous, use conversation history to clarify intent
5. Don't repeat information already provided unless asked

Analyze the conversation history and current query:
1. What context from previous messages is relevant?
2. Is this a follow-up question? If so, what is it referring to?
3. How should I incorporate previous context into my response?
4. What is my answer that maintains conversation continuity?`;
};

export const getContextSummaryPrompt = (conversationHistory: string): string => {
    return `Summarize the key context from this conversation for use in future exchanges.

CONVERSATION HISTORY:
${conversationHistory}

Create a concise summary that includes:
1. Main topics discussed
2. Key entities mentioned (games, developers, platforms, or other relevant entities)
3. Important facts or data points shared
4. User's interests or focus areas
5. Any unresolved questions or topics

Provide a structured summary that can be used to maintain context in future conversations.`;
};

export const getFollowUpClarificationPrompt = (currentQuery: string, conversationHistory: string): string => {
    return `The user's query may be a follow-up question that references previous conversation.

CURRENT QUERY: "${currentQuery}"

CONVERSATION HISTORY:
${conversationHistory}

ANALYSIS PROCESS:
1. Does this query contain pronouns or references (he, she, they, it, that, etc.)?
2. What in the conversation history do these refer to?
3. Is this query incomplete without context? (e.g., "What about its price?" or "Tell me more about that")
4. What is the full, clarified question?

Identify:
- What entity/topic is being referenced
- What specific information is being requested
- How to expand the query using conversation context

Provide the clarified, complete question.`;
};

export const getContextWindowPrompt = (recentMessages: string, olderSummary: string, currentQuery: string): string => {
    return `You have access to both recent conversation and a summary of older context.

RECENT MESSAGES (last few exchanges):
${recentMessages}

SUMMARY OF OLDER CONTEXT:
${olderSummary}

CURRENT QUERY: "${currentQuery}"

CONTEXT INTEGRATION:
1. Use recent messages for immediate context and flow
2. Reference older summary for background information
3. Combine both to provide comprehensive answers
4. Maintain consistency across the entire conversation

Determine:
- What from recent messages is most relevant?
- What from older context should be referenced?
- How to synthesize both for a complete answer?`;
};

export const getTopicTransitionPrompt = (previousTopic: string, currentQuery: string): string => {
    return `The conversation is transitioning from one topic to another.

PREVIOUS TOPIC: "${previousTopic}"
CURRENT QUERY: "${currentQuery}"

TRANSITION HANDLING:
1. Acknowledge the topic change naturally
2. Don't force connection to previous topic unless relevant
3. Answer the new query directly
4. If previous context is needed, reference it briefly

Determine:
- Is this a complete topic change or related?
- Should I reference the previous topic?
- How to smoothly transition while answering the new query?`;
};
