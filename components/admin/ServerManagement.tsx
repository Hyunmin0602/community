'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Star, Search, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Server {
    id: string;
    name: string;
    description: string | null;
    isVerified: boolean;
    isOfficial: boolean;
    user: {
        name: string | null;
        email: string;
    };
    thumbnail: string | null; // Assuming we use banner or icon, checking schema icon/banner
    icon: string | null;
}

export default function ServerManagement({ servers }: { servers: Server[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServers = servers.filter(
        (server) =>
            server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            server.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            server.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = async (serverId: string, field: 'isVerified' | 'isOfficial', currentValue: boolean) => {
        try {
            const res = await fetch(`/api/admin/servers/${serverId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: !currentValue }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            toast.success('상태가 업데이트되었습니다');
            router.refresh();
        } catch (error) {
            toast.error('오류가 발생했습니다');
            console.error(error);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="서버 이름, 작성자 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full rounded-md border text-sm h-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    총 {filteredServers.length}개 서버
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50 dark:bg-zinc-900/50 text-left">
                            <th className="p-4 font-medium text-muted-foreground w-[60px]">아이콘</th>
                            <th className="p-4 font-medium text-muted-foreground">서버 정보</th>
                            <th className="p-4 font-medium text-muted-foreground">작성자</th>
                            <th className="p-4 font-medium text-muted-foreground text-center">공식 인증</th>
                            <th className="p-4 font-medium text-muted-foreground text-center">에디터 추천</th>
                            <th className="p-4 font-medium text-muted-foreground text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServers.map((server) => (
                            <tr key={server.id} className="border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="p-4">
                                    <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 relative">
                                        {server.icon ? (
                                            <Image src={server.icon} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold">{server.name}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{server.description}</p>
                                </td>
                                <td className="p-4">
                                    <p>{server.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{server.user.email}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => toggleStatus(server.id, 'isVerified', server.isVerified)}
                                        className={`p-2 rounded-full transition-colors ${server.isVerified
                                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                    >
                                        <ShieldCheck className="h-5 w-5" />
                                    </button>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => toggleStatus(server.id, 'isOfficial', server.isOfficial)}
                                        className={`p-2 rounded-full transition-colors ${server.isOfficial
                                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                    >
                                        <Star className="h-5 w-5" />
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => window.open(`/servers/${server.id}`, '_blank')}
                                        className="btn-secondary text-xs h-8 px-2"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
