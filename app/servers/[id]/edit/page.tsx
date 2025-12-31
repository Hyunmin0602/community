'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ServerForm from '@/components/ServerForm';

export default function EditServerPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [serverData, setServerData] = useState<any>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        const fetchServer = async () => {
            try {
                const res = await fetch(`/api/servers/${params.id}`);
                if (!res.ok) throw new Error('서버 정보를 불러오는데 실패했습니다');
                const data = await res.json();

                if (session?.user?.id && data.userId !== session.user.id) {
                    setError('수정 권한이 없습니다.');
                    return;
                }

                setServerData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchServer();
        }
    }, [params.id, session, status, router]);

    if (loading) {
        return (
            <div className="container py-20 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-20 flex flex-col items-center gap-4">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    {error}
                </div>
                <Link href={`/servers/${params.id}`} className="btn-secondary">
                    돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href={`/servers/${params.id}`}
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <div className="card p-8">
                    <h1 className="text-3xl font-bold mb-2">서버 정보 수정</h1>
                    <p className="text-muted-foreground mb-6">
                        서버 정보를 최신 상태로 업데이트하세요
                    </p>

                    <ServerForm
                        initialData={serverData}
                        mode="edit"
                        serverId={params.id}
                    />
                </div>
            </div>
        </div>
    );
}
