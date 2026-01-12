'use client';

import { useCallback } from 'react';

export function useSearchLogger() {
    const logInteraction = useCallback((searchContentId: string, type: 'CLICK' | 'VIEW' | 'LIKE' | 'SHARE' = 'CLICK') => {
        try {
            // Fire and forget
            fetch('/api/search/interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    searchContentId,
                    type,
                    dwellTime: 0 // Dwell time is hard to track on click, usually monitored on the detailed page unload
                }),
                keepalive: true // Ensure request survives page navigation
            });
        } catch (e) {
            console.error(e);
        }
    }, []);

    return { logInteraction };
}
