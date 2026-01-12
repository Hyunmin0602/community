'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

import { Suspense } from 'react';

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            console.log('SignIn Result:', result); // Debug info

            if (result?.error) {
                console.error('Login Error:', result.error);
                setError(result.error);
            } else {
                console.log('Login Success! Redirecting to:', callbackUrl);
                // Force full reload to ensure session cookie is recognized by server components
                window.location.href = callbackUrl;
            }
        } catch (err) {
            setError('로그인에 실패했습니다');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="max-w-md mx-auto">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <LogIn className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h1 className="text-3xl font-bold mb-2">로그인</h1>
                        <p className="text-muted-foreground">계정에 로그인하세요</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="label block mb-2">
                                이메일
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input w-full"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label block mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input w-full"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full"
                        >
                            {submitting ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <Link href="/auth/find-id" className="hover:text-primary transition-colors">
                            아이디 찾기
                        </Link>
                        <span className="h-3 w-px bg-border"></span>
                        <Link href="/auth/reset-password" className="hover:text-primary transition-colors">
                            비밀번호 찾기
                        </Link>
                        <span className="h-3 w-px bg-border"></span>
                        <Link href="/auth/signup" className="hover:text-primary transition-colors">
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="container py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="card p-8">
                        Loading...
                    </div>
                </div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
