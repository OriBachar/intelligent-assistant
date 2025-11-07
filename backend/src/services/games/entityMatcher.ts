import type { Company } from '../../types/igdb';
import * as igdbService from './igdbService';

const DEVELOPER_ABBREVIATIONS: Record<string, string> = {
    'ea': 'Electronic Arts',
    'cdpr': 'CD Projekt Red',
    'cd projekt red': 'CD Projekt Red',
    'r*': 'Rockstar Games',
    'rockstar': 'Rockstar Games',
    '2k': '2K Games',
    '2k games': '2K Games',
    'ubisoft': 'Ubisoft Entertainment',
    'activision': 'Activision Blizzard',
    'blizzard': 'Blizzard Entertainment',
    'bethesda': 'Bethesda Softworks',
    'nintendo': 'Nintendo',
    'sony': 'Sony Interactive Entertainment',
    'sie': 'Sony Interactive Entertainment',
    'microsoft': 'Microsoft Studios',
    'xbox game studios': 'Microsoft Studios',
    'valve': 'Valve Corporation',
    'epic': 'Epic Games',
    'epic games': 'Epic Games',
};
    
const COMPANY_SUFFIXES = [
    'inc.',
    'inc',
    'llc',
    'ltd.',
    'ltd',
    'corporation',
    'corp.',
    'corp',
    'entertainment',
    'games',
    'game studio',
    'studios',
    'studio',
];

export function normalizeDeveloperName(name: string): string {
    if (!name || typeof name !== 'string') {
        return '';
    }

    const trimmed = name.trim();
    if (!trimmed) {
        return '';
    }

    const lower = trimmed.toLowerCase();

    if (DEVELOPER_ABBREVIATIONS[lower]) {
        return DEVELOPER_ABBREVIATIONS[lower];
    }

    let normalized = lower;
    for (const suffix of COMPANY_SUFFIXES) {
        const regex = new RegExp(`\\s+${suffix.replace('.', '\\.')}\\s*$`, 'i');
        normalized = normalized.replace(regex, '').trim();
    }

    return normalized || trimmed;
}

function calculateSimilarity(query: string, target: string): number {
    const queryLower = query.toLowerCase().trim();
    const targetLower = target.toLowerCase().trim();

    if (queryLower === targetLower) {
        return 1.0;
    }

    if (targetLower.startsWith(queryLower)) {
        return 0.9;
    }

    if (targetLower.includes(queryLower)) {
        if (queryLower.length <= 3) {
            return 0.3;
        }
        return 0.7;
    }

    const normalizedQuery = normalizeDeveloperName(queryLower);
    const normalizedTarget = normalizeDeveloperName(targetLower);

    if (normalizedQuery === normalizedTarget) {
        return 0.95;
    }

    if (normalizedTarget.includes(normalizedQuery)) {
        return 0.8;
    }

    const maxLen = Math.max(queryLower.length, targetLower.length);
    if (maxLen === 0) return 0;

    let matches = 0;
    let queryIdx = 0;
    for (let i = 0; i < targetLower.length && queryIdx < queryLower.length; i++) {
        if (targetLower[i] === queryLower[queryIdx]) {
            matches++;
            queryIdx++;
        }
    }

    const charSimilarity = matches / maxLen;

    const lengthDiff = Math.abs(queryLower.length - targetLower.length);
    const lengthSimilarity = 1 - lengthDiff / maxLen;

    return (charSimilarity * 0.6 + lengthSimilarity * 0.4) * 0.5;
}

export function validateDeveloperMatch(query: string, result: Company): boolean {
    if (!result || !result.name) {
        return false;
    }

    const queryLower = query.toLowerCase().trim();
    const resultName = result.name.toLowerCase();

    if (queryLower.length <= 3) {
        const expanded = DEVELOPER_ABBREVIATIONS[queryLower];
        if (expanded) {
            const expandedLower = expanded.toLowerCase();
            return (
                resultName === expandedLower ||
                resultName.startsWith(expandedLower) ||
                calculateSimilarity(expandedLower, resultName) > 0.7
            );
        }

        const words = resultName.split(/\s+/);
        const matchesWord = words.some(word => word === queryLower || word.startsWith(queryLower));
        const startsWith = resultName.startsWith(queryLower);
        
        return matchesWord || startsWith;
    }

    const similarity = calculateSimilarity(queryLower, resultName);
    return similarity >= 0.5;
}

export async function searchDevelopersWithStrategy(
    query: string
): Promise<Company[]> {
    if (!query || typeof query !== 'string' || !query.trim()) {
        return [];
    }

    const normalizedQuery = normalizeDeveloperName(query);
    const results: Company[] = [];

    try {
        const exactResults = await igdbService.getDevelopers(normalizedQuery, { limit: 10 });
        if (exactResults.length > 0) {
            results.push(...exactResults);
        }
    } catch (error) {
        console.warn('Exact match search failed:', error);
    }

    if (normalizedQuery !== query.trim().toLowerCase()) {
        try {
            const originalResults = await igdbService.getDevelopers(query, { limit: 10 });
            for (const result of originalResults) {
                if (!results.some(r => r.id === result.id)) {
                    results.push(result);
                }
            }
        } catch (error) {
            console.warn('Original query search failed:', error);
        }
    }

    if (results.length === 0 || query.trim().length <= 3) {
        try {
            const fuzzyResults = await igdbService.getDevelopers(query, { limit: 20 });
            for (const result of fuzzyResults) {
                if (!results.some(r => r.id === result.id)) {
                    results.push(result);
                }
            }
        } catch (error) {
            console.warn('Fuzzy search failed:', error);
        }
    }

    const validatedResults = results.filter(result => validateDeveloperMatch(query, result));

    const scoredResults = validatedResults.map(result => ({
        result,
        score: calculateSimilarity(query, result.name),
    }));

    scoredResults.sort((a, b) => b.score - a.score);

    return scoredResults.map(item => item.result);
}

export function getBestMatch(query: string, results: Company[]): Company | null {
    if (!results || results.length === 0) {
        return null;
    }

    const validated = results.filter(result => validateDeveloperMatch(query, result));

    if (validated.length === 0) {
        return null;
    }

    const normalizedQuery = normalizeDeveloperName(query).toLowerCase();
    const queryLower = query.toLowerCase();
    
    const isAbbreviation = queryLower.length <= 3 && DEVELOPER_ABBREVIATIONS[queryLower];
    const similarityQuery = isAbbreviation ? normalizedQuery : query;
    
    const scored = validated.map(result => {
        const baseScore = calculateSimilarity(similarityQuery, result.name);
        const normalizedResultName = normalizeDeveloperName(result.name).toLowerCase();
        const resultLower = result.name.toLowerCase();
        
        let bonus = 0;
        if (normalizedResultName === normalizedQuery) {
            bonus = 0.3;
        } else if (normalizedResultName.startsWith(normalizedQuery)) {
            bonus = 0.2;
        }
        
        let penalty = 0;
        
        if (normalizedResultName.startsWith(normalizedQuery) && normalizedResultName.length > normalizedQuery.length) {
            const extraWords = normalizedResultName.substring(normalizedQuery.length).trim();
            if (extraWords.length > 2) {
                const subsidiaryIndicators = [
                    'victor', 'interactive', 'mobile', 'sports', 'studios', 'games',
                    'entertainment', 'publishing', 'digital', 'online', 'network'
                ];
                const hasSubsidiaryIndicator = subsidiaryIndicators.some(indicator => 
                    extraWords.includes(indicator)
                );
                if (hasSubsidiaryIndicator) {
                    penalty = 0.25;
                } else {
                    penalty = 0.1;
                }
            }
        }
        
        if (queryLower.length <= 5 && resultLower !== queryLower && resultLower.startsWith(queryLower)) {
            const extraPart = resultLower.substring(queryLower.length).trim();
            if (extraPart.length > 0) {
                penalty += 0.15;
            }
        }
        
        if (!queryLower.includes('inc') && !queryLower.includes('llc') && !queryLower.includes('corp')) {
            if (resultLower.includes(' inc') || resultLower.includes(' llc') || resultLower.includes(' corp')) {
                penalty += 0.05;
            }
        }
        
        const finalScore = Math.min(1.0, baseScore + bonus - penalty);
        
        return {
            result,
            score: finalScore,
        };
    });

    scored.sort((a, b) => {
        if (Math.abs(a.score - b.score) > 0.01) {
            return b.score - a.score;
        }
        return a.result.name.length - b.result.name.length;
    });

    const best = scored[0];
    if (best.score >= 0.5) {
        return best.result;
    }

    return null;
}

