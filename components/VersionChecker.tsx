'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
    current: string;
    latest: string;
    hasUpdate: boolean;
}

export default function VersionChecker() {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // 버전 정보 확인
        fetch('/api/version')
            .then(res => res.json())
            .then(data => {
                setVersionInfo(data);
                if (data.hasUpdate) {
                    setShowBanner(true);
                }
            })
            .catch(err => console.error('Version check failed:', err));
    }, []);

    if (!showBanner || !versionInfo?.hasUpdate) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-4 animate-bounce-subtle">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">
                            🎉 새로운 버전이 출시되었습니다!
                        </h3>
                        <p className="text-xs opacity-90 mb-2">
                            v{versionInfo.current} → v{versionInfo.latest}
                        </p>
                        <div className="flex gap-2">
                            <a
                                href="https://github.com/Hyunmin0602/community/releases/latest"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-white text-blue-600 px-3 py-1 rounded-md font-medium hover:bg-gray-100 transition-colors"
                            >
                                자세히 보기
                            </a>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="text-xs bg-white/20 px-3 py-1 rounded-md hover:bg-white/30 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowBanner(false)}
                        className="flex-shrink-0 text-white/80 hover:text-white"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
