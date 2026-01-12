'use client';

import { useEffect } from 'react';

export default function SearchAnalytics({ query, userId }: { query: string; userId?: string }) {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;

            const searchContentId = target.getAttribute('data-search-content-id');
            if (searchContentId) {
                // Fire and forget beacon
                const data = {
                    searchContentId,
                    query,
                    userId
                };

                // Use sendBeacon if available for reliability on page unload
                if (navigator.sendBeacon) {
                    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                    navigator.sendBeacon('/api/search/track', blob);
                } else {
                    fetch('/api/search/track', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json' },
                        keepalive: true
                    }).catch(() => { });
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [query, userId]);

    return null;
}
