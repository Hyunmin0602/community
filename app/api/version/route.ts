import { NextResponse } from 'next/server';
import packageJson from '@/package.json';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // GitHub API를 통해 최신 릴리스 확인
        const response = await fetch(
            'https://api.github.com/repos/Hyunmin0602/community/releases/latest',
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
                next: { revalidate: 3600 } // 1시간 캐시
            }
        );

        let latestVersion = packageJson.version;
        let hasUpdate = false;

        if (response.ok) {
            const data = await response.json();
            latestVersion = data.tag_name?.replace('v', '') || packageJson.version;
            hasUpdate = latestVersion !== packageJson.version;
        }

        return NextResponse.json({
            current: packageJson.version,
            latest: latestVersion,
            hasUpdate,
            name: packageJson.name,
            nodeVersion: process.version,
            env: process.env.NODE_ENV,
        });
    } catch (error) {
        // API 호출 실패 시에도 현재 버전은 반환
        return NextResponse.json({
            current: packageJson.version,
            latest: packageJson.version,
            hasUpdate: false,
            name: packageJson.name,
            nodeVersion: process.version,
            env: process.env.NODE_ENV,
            error: 'Failed to check for updates',
        });
    }
}
