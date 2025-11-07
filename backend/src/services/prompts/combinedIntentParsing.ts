export const getCombinedIntentParsingPrompt = (userInput: string): string => {
    return `You are an intent classifier and query parser for a video games assistant. Analyze the query and return ONLY valid JSON.

CATEGORIES:
1. "game" - Questions about specific video games, game details, game information, game comparisons, game reviews, game prices, game ratings, game screenshots, game trailers, game requirements, or game recommendations
2. "developer" - Questions about game developers, developer information, games made by developers, developer comparisons, or developer history
3. "platform" - Questions about gaming platforms (PlayStation, Xbox, PC, Nintendo Switch, Steam, etc.), platform comparisons, games available on platforms, or platform features
4. "general" - General video game knowledge, gaming history, gaming terminology, gaming genres, gaming culture, or questions that don't fit the above categories

Query: "${userInput}"

Return a JSON object with this EXACT structure:
{
  "intent": "game" | "developer" | "platform" | "general",
  "gameNames": ["array of game names mentioned, if any"],
  "developerNames": ["array of developer names mentioned, if any"],
  "publisherNames": ["array of publisher names mentioned, if any"],
  "platformNames": ["array of platform names (e.g., PlayStation, Xbox, PC, Switch, Steam), if any"],
  "genres": ["array of genres mentioned (e.g., RPG, FPS, Strategy, Action), if any"],
  "years": [array of year numbers, if any],
  "filters": {
    "price": true/false if asking about price or cost,
    "reviews": true/false if asking for reviews,
    "ratings": true/false if asking for ratings or scores,
    "playerCount": true/false if asking about player count or popularity,
    "screenshots": true/false if asking for screenshots or images,
    "trailers": true/false if asking for trailers or videos,
    "requirements": true/false if asking for system requirements
  }
}

Examples:
- "What is the price of The Witcher 3?" → {"intent": "game", "gameNames": ["The Witcher 3"], "filters": {"price": true}}
- "What games did CD Projekt Red make?" → {"intent": "developer", "developerNames": ["CD Projekt Red"]}
- "What games are on PlayStation 5?" → {"intent": "platform", "platformNames": ["PlayStation 5"]}
- "What is an RPG?" → {"intent": "general"}

If a field has no data, use empty array [] or false. Return ONLY the JSON object, no other text.`;
};

