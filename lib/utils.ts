import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatPlayerCount(online: number, max: number): string {
    return `${online} / ${max}`;
}

export function getServerTypeLabel(type: 'JAVA' | 'BEDROCK'): string {
    return type === 'JAVA' ? '자바 에디션' : '베드락 에디션';
}

export function getServerTypeColor(type: 'JAVA' | 'BEDROCK'): string {
    return type === 'JAVA' ? 'text-java' : 'text-bedrock';
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}
