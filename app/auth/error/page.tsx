'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    if (error === 'Configuration') errorMessage = '서버 설정 오류입니다.';
    else if (error === 'AccessDenied') errorMessage = '접근이 거부되었습니다. 권한이 없거나 차단된 계정일 수 있습니다.';
    else if (error === 'Verification') errorMessage = '인증 링크가 만료되었거나 이미 사용되었습니다.';
    else if (error === 'OAuthSignin') errorMessage = '로그인 제공자 연결 중 오류가 발생했습니다.';
    else if (error === 'OAuthCallback') errorMessage = '로그인 처리 중 오류가 발생했습니다.';
    else if (error === 'Default') errorMessage = '인증 중 오류가 발생했습니다.';

    return (
        <div className="container py-20 flex justify-center">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-xl shadow-sm text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">로그인 오류</h1>
                <p className="text-muted-foreground mb-8">
                    {errorMessage}
                    {error && <span className="block text-xs mt-2 text-slate-400">Code: {error}</span>}
                </p>

                <div className="flex gap-3 justify-center">
                    <Link href="/auth/signin" className="btn-primary px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        로그인 다시 시도
                    </Link>
                    <Link href="/" className="btn-secondary px-6 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                        홈으로
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
