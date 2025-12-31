'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: 이메일입력, 2: 인증코드확인, 3: 새비번설정
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // 타이머
    const [emailTimer, setEmailTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // 1단계: 인증 코드 전송
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // 먼저 가입된 이메일인지 체크 (보안상 좋진 않지만 UX 편의를 위해)
            const checkRes = await fetch('/api/auth/find/id', {
                method: 'POST',
                body: JSON.stringify({ email: formData.email })
            });
            const checkData = await checkRes.json();
            if (!checkData.exists) {
                throw new Error('가입되지 않은 이메일입니다.');
            }

            const res = await fetch('/api/auth/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStep(2);
            setSuccess('인증 코드가 전송되었습니다.');
            startTimer();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2단계: 인증 코드 확인 (API 호출 없이 단순히 다음 단계로 넘어가서 최종 변경 때 코드 검증)
    // 하지만 사용자 경험상 여기서 검증해주는 게 좋음. /api/auth/email/verify 사용
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: formData.code }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStep(3);
            setSuccess('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
            if (timerRef.current) clearInterval(timerRef.current);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3단계: 비밀번호 변경
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: formData.code,
                    newPassword: formData.newPassword
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setSuccess('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.');
            setTimeout(() => {
                router.push('/auth/signin');
            }, 2000);
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
                        <KeyRound className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h1 className="text-2xl font-bold mb-2">비밀번호 찾기</h1>
                        <p className="text-sm text-muted-foreground">
                            {step === 1 && '가입한 이메일 주소를 입력해주세요'}
                            {step === 2 && '이메일로 전송된 인증 코드를 입력해주세요'}
                            {step === 3 && '새로운 비밀번호를 설정해주세요'}
                        </p>
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

                    {step === 1 && (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="label block mb-1.5">이메일</label>
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
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? '전송 중...' : '인증 코드 전송'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label htmlFor="code" className="label block mb-1.5 flex justify-between">
                                    <span>인증 코드</span>
                                    {emailTimer > 0 && <span className="text-primary">{formatTime(emailTimer)}</span>}
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="input w-full"
                                    placeholder="6자리 코드"
                                    required
                                />
                                <div className="text-right">
                                    <button type="button" onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-primary">
                                        이메일 다시 입력하기
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? '확인 중...' : '인증 확인'}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="label block mb-1.5">새 비밀번호</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="input w-full"
                                    placeholder="8자 이상 권장"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="label block mb-1.5">새 비밀번호 확인</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                                    className="input w-full"
                                    placeholder="비밀번호 재입력"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? '처리 중...' : '비밀번호 변경'}
                            </button>
                        </form>
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
