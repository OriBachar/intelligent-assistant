export const getIntentClassificationPrompt = (userInput: string): string => {
    return `You are an intent classifier for an NFL assistant. Classify the following query into exactly one category.

CATEGORIES:
1. "game" - Questions about games, scores, schedules, matchups, game results, upcoming games, past games
2. "player" - Questions about player statistics, player comparisons, player information, player performance
3. "team" - Questions about teams, rosters, standings, team statistics, team information
4. "general" - General NFL knowledge, rules, history, league structure, or questions that don't fit the above categories

EXAMPLES:
- "What are today's NFL games?" → game
- "Who scored the most touchdowns this season?" → player
- "What is the NFL standings?" → team
- "How many teams are in the NFL?" → general

Query to classify: "${userInput}"

Respond with ONLY the single word: game, player, team, or general.`;
};
