import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SearchIntent {
    category: 'GUIDE' | 'RESOURCE' | 'PROBLEM' | 'NAVIGATION' | 'GENERAL'; // New categories
    filters: {
        type?: 'JAVA' | 'BEDROCK' | null;
        tags: string[];
    };
    keywords: string[];
    explanation?: string;
}

const searchCache = new Map<string, SearchIntent>();

export async function analyzeSearchQuery(query: string): Promise<SearchIntent> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found, falling back to keyword search');
        return { category: 'GENERAL', filters: { tags: [] }, keywords: [query] };
    }

    // Check Cache
    if (searchCache.has(query)) {
        // console.log('AI Search Cache Hit:', query);
        return searchCache.get(query)!;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
        You are a Search Intent Analyzer for a Minecraft Community.
        Classify the User Query into one of these categories:
        
        1. **GUIDE** (Start/Info): Asking for "How to", "Rules", "Guide", "Notices", "Server Info".
        2. **RESOURCE** (Discovery): Asking for "Recommendations", "Maps", "Mods", "Finding stuff".
        3. **PROBLEM** (Troubleshooting): Asking for "Fix", "Error", "Not working", "Help".
        4. **NAVIGATION** (Where is?): Asking for "Channel", "Server Address", "Where to go".
        5. **GENERAL**: Anything else.

        Also extract filters and keywords.

        User Query: "${query}"

        Return JSON ONLY:
        {
          "category": "GUIDE" | "RESOURCE" | "PROBLEM" | "NAVIGATION" | "GENERAL",
          "filters": {
            "type": "JAVA" | "BEDROCK" | null,
            "tags": ["tag1", "tag2"]
          },
          "keywords": ["keyword1", "keyword2" (stemmed core words)],
          "explanation": "Brief explanation in Korean"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(cleanedJson);
        const intent: SearchIntent = {
            category: data.category || 'GENERAL',
            filters: {
                type: data.filters?.type || null,
                tags: Array.isArray(data.filters?.tags) ? data.filters.tags : []
            },
            keywords: Array.isArray(data.keywords) ? data.keywords : [query],
            explanation: data.explanation
        };

        // Save to Cache
        searchCache.set(query, intent);
        return intent;

    } catch (error) {
        console.error('AI Search Error:', error);
        return { category: 'GENERAL', filters: { tags: [] }, keywords: [query], explanation: 'AI 분석 실패' };
    }
}
