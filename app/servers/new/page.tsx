'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ServerForm from '@/components/ServerForm';

export default function NewServerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') return null;

    if (!session) {
        return null;
    }

    return (
        <div className="container py-8">
            <div className="max-w-2xl mx-auto">
                <div className="card p-8">
                    <h1 className="text-3xl font-bold mb-2">서버 등록</h1>
                    <p className="text-muted-foreground mb-6">
                        새로운 마인크래프트 서버를 픽셀릿에 등록하세요
                    </p>
                    <ServerForm mode="create" />
                </div>
            </div>
        </div>
    );
}
