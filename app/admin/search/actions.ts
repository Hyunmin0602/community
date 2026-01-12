'use server';

import { performSearch, SearchResponse } from '@/lib/search-service';

export async function runSearchDiagnostics(query: string): Promise<SearchResponse> {
    return await performSearch(query);
}
