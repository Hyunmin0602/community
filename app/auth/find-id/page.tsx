'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function FindIdPage() {
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<{ exists: boolean; message: string } | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/find/id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="max-w-md mx-auto">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <Search className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h1 className="text-2xl font-bold mb-2">아이디 찾기</h1>
                        <p className="text-sm text-muted-foreground">가입된 이메일인지 확인해보세요</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!result ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="label block mb-1.5">이메일</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input w-full"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? '확인 중...' : '확인'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className={`p-4 rounded-lg text-sm flex items-start gap-3 ${result.exists ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                {result.exists ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                                <div>
                                    <p className="font-medium mb-1">{result.exists ? '계정을 찾았습니다!' : '계정을 찾을 수 없습니다.'}</p>
                                    <p className="text-xs opacity-90">{result.message}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {result.exists ? (
                                    <Link href="/auth/signin" className="btn-primary w-full block text-center">
                                        로그인하기
                                    </Link>
                                ) : (
                                    <Link href="/auth/signup" className="btn-primary w-full block text-center">
                                        회원가입하기
                                    </Link>
                                )}
                                <button
                                    onClick={() => { setResult(null); setEmail(''); }}
                                    className="btn-secondary w-full"
                                >
                                    다시 찾기
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
                            <ArrowLeft className="h-3 w-3" />
                            로그인으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
