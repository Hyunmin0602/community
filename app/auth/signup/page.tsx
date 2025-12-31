'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { UserPlus, Mail, Check, AlertCircle, RefreshCw } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function SignUpPage() {
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        code: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 이메일 인증 상태
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailTimer, setEmailTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 약관 동의
    const [isAgreed, setIsAgreed] = useState(false);

    // 캡차
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setEmailTimer(300); // 5분
        timerRef.current = setInterval(() => {
            setEmailTimer((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleSendCode = async () => {
        if (!formData.email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setIsEmailSent(true);
            setIsEmailVerified(false);
            setSuccess('인증 코드가 전송되었습니다.');
            startTimer();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleVerifyCode = async () => {
        if (!formData.code) {
            setError('인증 코드를 입력해주세요.');
            return;
        }
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: formData.code }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setIsEmailVerified(true);
            setSuccess('이메일 인증이 완료되었습니다.');
            if (timerRef.current) clearInterval(timerRef.current);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!isEmailVerified) {
            setError('이메일 인증을 완료해주세요.');
            return;
        }

        if (!isAgreed) {
            setError('이용약관 및 개인정보 수집에 동의해야 합니다.');
            return;
        }

        // 캡차 토큰 확인 (키가 설정된 경우)
        if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) {
            setError('로봇이 아님을 증명해주세요.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    code: formData.code,
                    isAgreed,
                    captchaToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '회원가입에 실패했습니다');
            }

            // Auto sign in after registration
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.ok) {
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="max-w-md mx-auto">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h1 className="text-2xl font-bold mb-2">회원가입</h1>
                        <p className="text-sm text-muted-foreground">새로운 여정을 시작하세요</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                            <Check className="h-5 w-5 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 이메일 입력 및 인증 */}
                        <div>
                            <label htmlFor="email" className="label block mb-1.5">이메일 (아이디)</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        setIsEmailSent(false);
                                        setIsEmailVerified(false);
                                    }}
                                    className="input w-full"
                                    placeholder="your@email.com"
                                    disabled={isEmailVerified}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={isEmailSent && emailTimer > 0 || isEmailVerified}
                                    className="btn-secondary whitespace-nowrap min-w-[80px]"
                                >
                                    {isEmailSent && emailTimer > 0 ? formatTime(emailTimer) : (isEmailSent ? '재전송' : '인증')}
                                </button>
                            </div>
                        </div>

                        {/* 인증 코드 입력 */}
                        {isEmailSent && !isEmailVerified && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label htmlFor="code" className="label block mb-1.5">인증 코드</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="input w-full"
                                        placeholder="6자리 코드 입력"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyCode}
                                        className="btn-primary whitespace-nowrap min-w-[80px]"
                                    >
                                        확인
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    이메일로 전송된 6자리 코드를 입력해주세요.
                                </p>
                            </div>
                        )}

                        {/* 닉네임 */}
                        <div>
                            <label htmlFor="name" className="label block mb-1.5">닉네임</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input w-full"
                                placeholder="사용할 닉네임"
                                required
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label htmlFor="password" className="label block mb-1.5">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input w-full"
                                placeholder="8자 이상, 영문/숫자/특수문자 조합 권장"
                                minLength={6}
                                required
                            />
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label htmlFor="confirmPassword" className="label block mb-1.5">비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="input w-full"
                                placeholder="비밀번호 재입력"
                                minLength={6}
                                required
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
                            )}
                        </div>

                        {/* 약관 동의 */}
                        <div className="flex items-start gap-2 py-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer select-none">
                                <span className="font-medium text-foreground">이용약관</span> 및 <span className="font-medium text-foreground">개인정보 수집 및 이용</span>에 동의합니다.
                            </label>
                        </div>

                        {/* 캡차 */}
                        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                            <div className="flex justify-center py-2">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={setCaptchaToken}
                                    theme="light" // or dark based on theme
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !isEmailVerified || !isAgreed}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    처리 중...
                                </span>
                            ) : (
                                '회원가입 완료'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                                로그인하기
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
