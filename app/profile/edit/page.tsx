'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Save, ArrowLeft, User, ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';

export default function ProfileEditPage() {
    const router = useRouter();
    const { data: session, status, update: updateSession } = useSession(); // updateSession 추가

    const [name, setName] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setPreviewImage(session.user.image || '');
        }
    }, [session]);

    if (status === 'loading') {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
    }

    if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const res = await fetch('/api/profile', {
                method: 'PUT',
                body: formData, // FormData 전송시 Content-Type 헤더 생략 (자동 설정됨)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || '업데이트 실패');
            }

            // 세션 업데이트 (중요: 클라이언트 세션정보 갱신)
            await updateSession();

            alert('프로필이 수정되었습니다!');
            router.push('/profile');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container max-w-xl py-10 space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> 돌아가기
            </button>

            <div className="card p-8 border rounded-xl shadow-sm bg-card">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" /> 프로필 수정
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Upload Section */}
                    <div className="space-y-4 flex flex-col items-center">
                        <div
                            className="relative h-32 w-32 rounded-full bg-muted border-4 border-background shadow-lg overflow-hidden group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewImage ? (
                                <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <User className="h-full w-full p-6 text-muted-foreground" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white h-8 w-8" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            프로필 사진 변경
                        </button>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">닉네임</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                            maxLength={20}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                            placeholder="사용할 닉네임을 입력하세요"
                        />
                        <p className="text-xs text-muted-foreground">커뮤니티에서 표시될 이름입니다. (2~20자)</p>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">이메일</label>
                        <input
                            type="text"
                            value={session?.user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 rounded-lg border bg-muted/50 text-muted-foreground cursor-not-allowed"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            변경사항 저장하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
