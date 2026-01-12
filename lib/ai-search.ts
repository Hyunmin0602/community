import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SearchIntent {
    category: 'GUIDE' | 'RESOURCE' | 'PROBLEM' | 'NAVIGATION' | 'SERVER' | 'GENERAL';
    subCategory?: 'NEWS' | 'MODS' | 'MAPS' | 'PLUGINS' | 'DEV_QUESTION' | 'SCRIPTS' | null;
    filters: {
        type?: 'JAVA' | 'BEDROCK' | null;
        tags: string[];
    };
    keywords: string[];
    sort?: 'POPULARITY' | 'LATEST' | null;
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
        
        STRICT RULE: Only analyze queries related to "Minecraft" (Game info, Servers, Resources) or "Development" (Coding, Scripts, Plugins).
        If the query is completely unrelated (e.g., "Pasta recipe", "Politics", "Car repair"), classify as "GENERAL" with no filters/keywords, and explain "This is unrelated to Minecraft or Development".

        Classify the User Query into one of these Main Categories:
        1. **SERVER**: "Server recommendation", "Play with me", "Survival Server", "RPG Server".
        2. **GUIDE**: "How to", "Rules", "Guide", "Notices", "Server Info".
        3. **RESOURCE**: "Downloads", "Maps", "Mods", "Texture Packs", "Plugins", "Datapacks".
        4. **PROBLEM**: "Fix", "Error", "Not working", "Help", "Bug".
        5. **NAVIGATION**: "Where is", "Server Address", "Discord link".
        6. **GENERAL**: Anything else or Unrelated topics.

        For RESOURCE category, identify Sub-Category if possible:
        - **NEWS**: "Update news", "Snapshots", "Patch notes"
        - **MODS**: "Mods", "Addons"
        - **MAPS**: "Maps", "Worlds", "Save files"
        - **PLUGINS**: "Plugins" (Server plugins)
        - **DEV_QUESTION**: "Coding help", "Skript help", "API usage"
        - **SCRIPTS**: "Skript", "Command blocks" (distinct from Plugins)

        Extract Filters & Logic:
        - **Type**: JAVA, BEDROCK, or null
        - **Sort Intent**: 
            - "Popular", "Best", "Top", "Most played" -> 'POPULARITY'
            - "New", "Latest", "Recent", "Fresh" -> 'LATEST'
            - Otherwise null

        User Query: "${query}"

        Return JSON ONLY:
        {
          "category": "SERVER" | "GUIDE" | "RESOURCE" | "PROBLEM" | "NAVIGATION" | "GENERAL",
          "subCategory": "NEWS" | "MODS" | "MAPS" | "PLUGINS" | "DEV_QUESTION" | "SCRIPTS" | null,
          "filters": {
            "type": "JAVA" | "BEDROCK" | null,
            "tags": ["tag1", "tag2"]
          },
          "keywords": ["keyword1", "keyword2" (stemmed core words)],
          "sort": "POPULARITY" | "LATEST" | null,
          "explanation": "Brief explanation in Korean (e.g. '마인크래프트 관련 자료를 찾습니다' or '관련 없는 주제입니다')"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(cleanedJson);
        const intent: SearchIntent = {
            category: data.category || 'GENERAL',
            subCategory: data.subCategory || null,
            filters: {
                type: data.filters?.type || null,
                tags: Array.isArray(data.filters?.tags) ? data.filters.tags : []
            },
            keywords: Array.isArray(data.keywords) ? data.keywords : [query],
            sort: data.sort || null,
            explanation: data.explanation
        };

        // Save to Cache
        searchCache.set(query, intent);
        return intent;

    } catch (error) {
        console.error('AI Search Error:', error);
        return {
            category: 'GENERAL',
            filters: { tags: [] },
            keywords: [query],
            explanation: `AI 분석 실패: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
