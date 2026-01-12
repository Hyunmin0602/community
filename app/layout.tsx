import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import VersionChecker from '@/components/VersionChecker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: '마인크래프트 커뮤니티 - 서버 찾기',
    description: '한국 최고의 마인크래프트 자바/베드락 서버 커뮤니티. 다양한 서버를 찾고 공유하세요.',
    keywords: ['마인크래프트', '마크', '서버', '자바', '베드락', '멀티플레이', 'Minecraft'],
    openGraph: {
        title: '마인크래프트 커뮤니티',
        description: '한국 최고의 마인크래프트 서버 커뮤니티',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@latest/neodgm/style.css" />
            </head>
            <body className={inter.className}>
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                    <Toaster position="top-right" />
                    <VersionChecker />
                </Providers>
            </body>
        </html>
    );
}
