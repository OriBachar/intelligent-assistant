export const getQueryParsingPrompt = (userInput: string, classifiedIntent: string): string => {
    return `Extract structured information from this NFL query. Return ONLY valid JSON, no other text.

Query: "${userInput}"
Intent: ${classifiedIntent}

Extract and return a JSON object with this structure:
{
  "teamNames": ["array of team names mentioned, if any"],
  "playerNames": ["array of player names mentioned, if any"],
  "dates": ["array of dates in YYYY-MM-DD format, if any"],
  "seasons": [array of year numbers, if any],
  "filters": {
    "stats": true/false if asking for statistics,
    "schedule": true/false if asking for schedule,
    "standings": true/false if asking for standings,
    "roster": true/false if asking for roster
  }
}

If a field has no data, use empty array [] or false. Return ONLY the JSON object.`;
};
