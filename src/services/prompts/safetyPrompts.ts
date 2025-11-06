import { formatApiData } from './promptUtils';

export const getHallucinationPreventionPrompt = (): string => {
    return `CRITICAL SAFETY GUIDELINES - Follow these rules strictly:

1. FACT VERIFICATION:
   - Only state facts that you can verify from provided API data
   - If you don't have data, explicitly say "I don't have current data on this"
   - Never invent statistics, scores, or player information
   - Never guess or estimate when specific data is requested

2. UNCERTAINTY HANDLING:
   - If uncertain, say "I'm not certain about this" or "I don't have enough information"
   - Use phrases like "Based on available data" or "According to the data provided"
   - Distinguish between what you know from data vs. general knowledge

3. DATA SOURCING:
   - Always reference where information comes from (API data, general knowledge, etc.)
   - If using general knowledge, clearly state it's general knowledge, not current data
   - Never present general knowledge as current/factual data

4. RESPONSE BOUNDARIES:
   - Stay within NFL domain - don't make up information about other sports
   - Don't extrapolate beyond what the data shows
   - If asked about something not in the data, say so clearly

5. NUMERIC ACCURACY:
   - Only use exact numbers from provided data
   - Never round, estimate, or approximate statistics
   - If a number isn't in the data, don't make one up`;
};

export const getFactCheckPrompt = (claim: string, apiData?: unknown): string => {
    const basePrompt = `You need to fact-check a claim before including it in your response.

CLAIM TO VERIFY: "${claim}"

FACT-CHECKING PROCESS:
1. Does the claim contain specific numbers, statistics, or facts?
2. Can these be verified against the provided data?
3. If not in the data, is it general knowledge or potentially false?
4. What is your confidence level (high/medium/low)?
5. Should this claim be included, modified, or excluded?`;

    if (apiData) {
        const formattedData = formatApiData(apiData);
        
        return `${basePrompt}

AVAILABLE DATA FOR VERIFICATION:
${formattedData}

Analyze step by step:
1. Check if the claim matches data in the API response
2. Identify any discrepancies
3. Determine if the claim is supported, partially supported, or unsupported
4. Provide your fact-check conclusion`;
    }

    return `${basePrompt}

WARNING: No API data available for verification. 
- If the claim contains specific statistics or facts, you cannot verify it
- You should indicate uncertainty or exclude unverifiable specific claims
- Only use general knowledge if explicitly appropriate`;
};

export const getConfidenceScoringPrompt = (response: string, apiData?: unknown): string => {
    const basePrompt = `Evaluate the confidence level of your response.

RESPONSE TO EVALUATE:
"${response}"

CONFIDENCE SCORING CRITERIA:
- HIGH: All facts come from verified API data, no speculation
- MEDIUM: Mix of verified data and general knowledge, clearly distinguished
- LOW: Contains unverified claims, speculation, or uncertain information

Score your response and identify any low-confidence statements.`;

    if (apiData) {
        const formattedData = formatApiData(apiData);
        
        return `${basePrompt}

AVAILABLE DATA:
${formattedData}

Evaluate:
1. Which parts of the response are directly supported by API data? (HIGH confidence)
2. Which parts are general knowledge? (MEDIUM confidence)
3. Which parts are uncertain or unverified? (LOW confidence)
4. What should be modified or removed?`;
    }

    return `${basePrompt}

WARNING: No API data available.
- Responses without API data should be marked as MEDIUM or LOW confidence
- Clearly indicate when information is general knowledge, not current data
- Flag any specific statistics or facts that cannot be verified`;
};

export const getCorrectionPrompt = (
    originalResponse: string,
    issues: string[],
    unverifiedClaims: string[],
    confidence: string,
    confidenceScore: number,
    apiData?: unknown
): string => {
    const issuesList = issues.join(', ');
    const claimsList = unverifiedClaims.join(', ');
    
    let prompt = `The following response was generated but contains issues that need to be corrected:

ORIGINAL RESPONSE:
"${originalResponse}"

ISSUES DETECTED:
- ${issuesList}
- Unverified claims: ${claimsList}
- Confidence: ${confidence} (score: ${confidenceScore})

REQUIREMENTS:
1. Remove or correct all unverified claims
2. Only use information from the provided API data
3. Add appropriate uncertainty markers if data is missing
4. Maintain the helpful and conversational tone
5. Clearly indicate when information is from API data vs. general knowledge`;

    if (apiData) {
        const formattedData = formatApiData(apiData);
        
        prompt += `

AVAILABLE API DATA:
${formattedData}

Generate a corrected response that only uses verified data from the API.`;
    } else {
        prompt += `

WARNING: No API data available. Generate a response that clearly indicates uncertainty and only uses general knowledge.`;
    }

    return prompt;
};

export const getResponseValidationPrompt = (response: string, originalQuery: string, apiData?: unknown): string => {
    const basePrompt = `Validate that your response is accurate and appropriate.

ORIGINAL QUERY: "${originalQuery}"
PROPOSED RESPONSE: "${response}"

VALIDATION CHECKLIST:
1. Does the response answer the query?
2. Are all facts verifiable from provided data?
3. Are there any made-up statistics or numbers?
4. Is uncertainty properly communicated?
5. Are sources clearly indicated?
6. Does it stay within NFL domain?`;

    if (apiData) {
        const formattedData = formatApiData(apiData);
        
        return `${basePrompt}

AVAILABLE DATA:
${formattedData}

Validate:
1. Cross-reference every fact in the response with the API data
2. Identify any claims not supported by data
3. Flag any numbers or statistics that don't appear in the data
4. Determine if the response needs correction or qualification`;
    }

    return `${basePrompt}

WARNING: No API data available.
- Response should clearly indicate when using general knowledge
- No specific statistics or current data should be presented
- Uncertainty must be explicitly communicated`;
};
