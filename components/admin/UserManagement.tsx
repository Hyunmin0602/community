'use client';

import { useState } from 'react';
import { Crown, User as UserIcon, Shield, MoreVertical, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
    image: string | null;
    _count: {
        servers: number;
        resources: number;
        posts: number;
    };
}

export default function UserManagement({ users: initialUsers }: { users: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [filter, setFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
    const [loading, setLoading] = useState<string | null>(null);

    const filteredUsers = users.filter(user => {
        if (filter === 'ALL') return true;
        return user.role === filter;
    });

    const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
        setLoading(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!res.ok) throw new Error('Failed to update role');

            setUsers(prev =>
                prev.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );

            toast.success(`권한이 ${newRole === 'ADMIN' ? '관리자' : '사용자'}로 변경되었습니다.`);
        } catch (error) {
            toast.error('권한 변경에 실패했습니다.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden">
            {/* 헤더 */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        사용자 관리
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => setFilter('ADMIN')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'ADMIN'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            관리자
                        </button>
                        <button
                            onClick={() => setFilter('USER')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'USER'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            일반 사용자
                        </button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    총 {filteredUsers.length}명의 사용자
                </p>
            </div>

            {/* 사용자 목록 */}
            <div className="divide-y">
                {filteredUsers.map(user => (
                    <div
                        key={user.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* 프로필 이미지 */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <span>{user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}</span>
                                    )}
                                </div>

                                {/* 사용자 정보 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-sm truncate">{user.name || '이름 없음'}</h3>
                                        {user.role === 'ADMIN' && (
                                            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Crown className="h-3 w-3" />
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>서버 {user._count.servers}</span>
                                        <span>자료 {user._count.resources}</span>
                                        <span>게시글 {user._count.posts}</span>
                                        <span>가입 {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 권한 변경 버튼 */}
                            <div className="flex items-center gap-2">
                                {user.role === 'ADMIN' ? (
                                    <button
                                        onClick={() => handleRoleChange(user.id, 'USER')}
                                        disabled={loading === user.id}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <UserIcon className="h-3.5 w-3.5" />
                                        일반 사용자로 변경
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleRoleChange(user.id, 'ADMIN')}
                                        disabled={loading === user.id}
                                        className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <Shield className="h-3.5 w-3.5" />
                                        관리자로 승격
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
