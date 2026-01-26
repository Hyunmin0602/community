'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Server, User, Comment as CommentType } from '@prisma/client';
import { Heart, Users, Copy, RefreshCw, MessageCircle, Clock, Globe, MessageSquare, Edit, ShieldCheck } from 'lucide-react';
import { getServerTypeLabel, formatDate } from '@/lib/utils';
import Image from 'next/image';

interface ServerDetailProps {
    server: Server & {
        user: Pick<User, 'name' | 'email'>;
        _count: {
            votes: number;
            comments: number;
        };
    };
}

interface Comment extends CommentType {
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
}

export default function ServerDetail({ server: initialServer }: ServerDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [server, setServer] = useState(initialServer);
    const [checking, setChecking] = useState(false);
    const [voted, setVoted] = useState(false);
    const [voteCount, setVoteCount] = useState(initialServer._count.votes);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchVoteStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/servers/${server.id}/vote`);
            const data = await res.json();
            setVoted(data.voted);
        } catch (error) {
            console.error('Failed to fetch vote status:', error);
        }
    }, [server.id]);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/servers/${server.id}/comments`);
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    }, [server.id]);

    useEffect(() => {
        fetchVoteStatus();
        fetchComments();
    }, [fetchVoteStatus, fetchComments]);

    const checkStatus = async () => {
        setChecking(true);
        try {
            const res = await fetch(`/api/servers/${server.id}/status`);
            const status = await res.json();

            setServer((prev) => ({
                ...prev,
                isOnline: status.online,
                onlinePlayers: status.players?.online || null,
                maxPlayers: status.players?.max || null,
                version: status.version || null,
                motd: status.motd || null,
            }));
        } catch (error) {
            console.error('Failed to check status:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleVote = async () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }

        try {
            const res = await fetch(`/api/servers/${server.id}/vote`, {
                method: 'POST',
            });
            const data = await res.json();
            setVoted(data.voted);
            setVoteCount((prev) => (data.voted ? prev + 1 : prev - 1));
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (!commentContent.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/servers/${server.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentContent }),
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments([newComment, ...comments]);
                setCommentContent('');
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(`${server.host}:${server.port}`);
        alert('서버 주소가 복사되었습니다!');
    };

    return (
        <div className="container py-8">
            <div className="max-w-4xl mx-auto">
                {/* 서버 배너 */}
                {server.banner && (
                    <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                        <Image
                            src={server.banner}
                            alt={`${server.name} 배너`}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                {/* Server Header */}
                <div className="card p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{server.name}</h1>
                                {server.isOfficial && (
                                    <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        오피셜
                                    </span>
                                )}
                                {server.isVerified && (
                                    <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        인증됨
                                    </span>
                                )}
                                {session?.user?.email === server.user.email && (
                                    <button
                                        onClick={() => router.push(`/servers/${server.id}/edit`)}
                                        className="btn-secondary flex items-center gap-2 text-sm"
                                    >
                                        <Edit className="h-4 w-4" />
                                        수정
                                    </button>
                                )}
                            </div>
                            <span
                                className={`badge ${server.type === 'JAVA' ? 'badge-java' : 'badge-bedrock'}`}
                            >
                                {getServerTypeLabel(server.type)}
                            </span>
                        </div>
                        <div
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${server.isOnline
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                        >
                            <div
                                className={`w-3 h-3 rounded-full ${server.isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-500'
                                    }`}
                            />
                            <span>{server.isOnline ? '온라인' : '오프라인'}</span>
                        </div>
                    </div>

                    {server.description && (
                        <p className="text-muted-foreground mb-6">{server.description}</p>
                    )}

                    {/* 태그 */}
                    {server.tags && server.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {server.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Server Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {server.isOnline &&
                            server.onlinePlayers !== null &&
                            server.maxPlayers !== null && (
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">플레이어</p>
                                        <p className="font-bold">
                                            {server.onlinePlayers} / {server.maxPlayers}
                                        </p>
                                    </div>
                                </div>
                            )}
                        <div className="flex items-center space-x-2">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">추천</p>
                                <p className="font-bold">{voteCount}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">댓글</p>
                                <p className="font-bold">{comments.length}</p>
                            </div>
                        </div>
                        {server.version && (
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">버전</p>
                                    <p className="font-bold text-sm">{server.version}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Server Address */}
                    <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground mb-2">서버 주소</p>
                        <div className="flex items-center justify-between">
                            <code className="text-lg font-mono">
                                {server.host}:{server.port}
                            </code>
                            <button onClick={copyAddress} className="btn-ghost">
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* MOTD */}
                    {server.motd && (
                        <div className="bg-muted p-4 rounded-lg mb-4">
                            <p className="text-sm text-muted-foreground mb-2">서버 메시지</p>
                            <p className="font-mono text-sm">{server.motd}</p>
                        </div>
                    )}

                    {/* 소셜 링크 */}
                    {(server.website || server.discord) && (
                        <div className="flex space-x-3 mb-4">
                            {server.website && (
                                <a
                                    href={server.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>웹사이트</span>
                                </a>
                            )}
                            {server.discord && (
                                <a
                                    href={server.discord}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span>디스코드</span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleVote}
                            className={`btn-primary flex items-center space-x-2 ${voted ? 'bg-red-500 hover:bg-red-600' : ''
                                }`}
                        >
                            <Heart className={`h-4 w-4 ${voted ? 'fill-current' : ''}`} />
                            <span>{voted ? '추천 취소' : '추천하기'}</span>
                        </button>
                        <button
                            onClick={checkStatus}
                            disabled={checking}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                            <span>상태 새로고침</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-6">댓글 ({comments.length})</h2>

                    {/* Comment Form */}
                    {session ? (
                        <form onSubmit={handleCommentSubmit} className="mb-6">
                            <textarea
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                className="input w-full h-24 resize-none mb-3"
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                disabled={submitting || !commentContent.trim()}
                                className="btn-primary"
                            >
                                {submitting ? '작성 중...' : '댓글 작성'}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-muted p-4 rounded-lg mb-6 text-center">
                            <p className="text-muted-foreground">
                                댓글을 작성하려면{' '}
                                <a href="/auth/signin" className="text-primary hover:underline">
                                    로그인
                                </a>
                                해주세요.
                            </p>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                아직 댓글이 없습니다.
                            </p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="border-b pb-4 last:border-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-bold text-primary">
                                                    {(comment.user.name || comment.user.email)[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium">
                                                {comment.user.name || comment.user.email.split('@')[0]}
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground ml-10">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
