
import { PrismaClient, ContentType, Grade, ServerType } from '@prisma/client';

const prisma = new PrismaClient();

// Real Server Data (Mocking Minelist Top Servers)
const REAL_SERVERS = [
    {
        name: '픽셀릿 (Pixelit)',
        description: '국내 최대 규모의 마인크래프트 미니게임 서버. 베드워즈, 스카이블럭 등 다양한 게임을 즐겨보세요!',
        host: 'mc.pixelit.kr',
        port: 25565,
        type: ServerType.JAVA,
        tags: ['미니게임', 'RPG', '스카이블럭', 'PVP', '픽셀릿'],
        isOfficial: true,
        isVerified: true,
        banner: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop', // Placeholder
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=PX&backgroundColor=6366f1',
        onlinePlayers: 5432,
    },
    {
        name: '하이픽셀 (Hypixel)',
        description: '전 세계 1위 마인크래프트 서버. 스카이블럭, 베드워즈, 머더 등 수많은 미니게임의 원조.',
        host: 'mc.hypixel.net',
        port: 25565,
        type: ServerType.JAVA,
        tags: ['해외서버', '미니게임', '스카이블럭', 'Hypixel', 'PVP'],
        isOfficial: true,
        isVerified: true,
        banner: 'https://images.unsplash.com/photo-1605218457335-e5e6e30ab8f5?q=80&w=1000&auto=format&fit=crop', // Placeholder
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=HY&backgroundColor=fbbf24',
        onlinePlayers: 45000,
    },
    {
        name: '악어의 놀이터 2',
        description: '유명 스트리머들이 참여하는 대규모 야생 RPG/경제 서버. 누구나 참여 가능한 시즌!',
        host: 'croc.playground.kr',
        port: 25565,
        type: ServerType.JAVA,
        tags: ['야생', 'RPG', '경제', '스트리머', '대규모'],
        isOfficial: false,
        isVerified: true,
        banner: 'https://images.unsplash.com/photo-1627856014759-2a5a04cf6924?q=80&w=1000&auto=format&fit=crop',
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=CR&backgroundColor=10b981',
        onlinePlayers: 2800,
    },
    {
        name: '마인팜 24시',
        description: '24시간 열려있는 한국 대표 마인팜 서버. 나만의 농장을 가꾸고 부자가 되어보세요.',
        host: 'farm.daily.kr',
        port: 25565,
        type: ServerType.JAVA,
        tags: ['마인팜', '경제', '24시간', '농사', 'Minefarm'],
        isOfficial: false,
        isVerified: false,
        banner: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=MF&backgroundColor=8b5cf6',
        onlinePlayers: 150,
    },
    {
        name: '랜덤 무기 전쟁',
        description: '매번 바뀌는 랜덤 무기로 싸우는 PVP 서버. 실력보다는 운이 중요할지도?',
        host: 'random.pvp.kr',
        port: 19132,
        type: ServerType.BEDROCK, // Bedrock example
        tags: ['PVP', '미니게임', '랜덤무기', 'BE', '모바일'],
        isOfficial: false,
        isVerified: false,
        banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=RD&backgroundColor=ef4444',
        onlinePlayers: 320,
    },
    {
        name: '포켓몬 모드 서버 (Pixelmon)',
        description: '마인크래프트에서 포켓몬을 잡아보세요! 최신 버전 픽셀몬 모드 적용.',
        host: 'poke.mon.kr',
        port: 25565,
        type: ServerType.JAVA,
        tags: ['모드', '픽셀몬', '포켓몬', 'RPG', '수집'],
        isOfficial: false,
        isVerified: true,
        banner: 'https://images.unsplash.com/photo-1613771404721-c5b4512b9d29?q=80&w=1000&auto=format&fit=crop',
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=PO&backgroundColor=f43f5e',
        onlinePlayers: 890,
    },
    {
        name: '마인리스트 공식 서버',
        description: '서버 추천 커뮤니티 마인리스트에서 운영하는 공식 허브 서버입니다.',
        host: 'play.minelist.kr',
        port: 25565,
        type: ServerType.JAVA,
        tags: ['커뮤니티', '허브', '야생', '미니게임'],
        isOfficial: true,
        isVerified: true,
        banner: 'https://images.unsplash.com/photo-1496664444929-8c75efb9546f?q=80&w=1000&auto=format&fit=crop',
        icon: 'https://api.dicebear.com/7.x/initials/svg?seed=ML&backgroundColor=3b82f6',
        onlinePlayers: 1200,
    }
];

async function main() {
    console.log('🌍 Importing Real Server Data (Mock Minelist)...');

    // 1. Get default user to assign owner
    const owner = await prisma.user.findFirst();
    if (!owner) {
        console.error('❌ No user found. Please run basic seed first.');
        return;
    }

    for (const data of REAL_SERVERS) {
        // Create/Update Server
        const server = await prisma.server.upsert({
            where: { id: `real-${data.name.replace(/\s+/g, '-').toLowerCase()}` }, // Stable ID for re-runs
            update: {
                ...data,
                userId: owner.id,
                isOnline: true, // Display as online for testing
                lastChecked: new Date(),
            },
            create: {
                id: `real-${data.name.replace(/\s+/g, '-').toLowerCase()}`,
                ...data,
                userId: owner.id,
                isOnline: true,
                lastChecked: new Date(),
            }
        });

        // Determine Grades
        let trust: Grade = Grade.B;
        if (data.isOfficial) trust = Grade.S;
        else if (data.isVerified) trust = Grade.A;

        // Upsert SearchContent
        await prisma.searchContent.upsert({
            where: { id: `search-server-${server.id}` },
            update: {
                type: ContentType.SERVER,
                title: server.name,
                description: server.description || '',
                thumbnail: server.icon,
                link: `/servers/${server.id}`,

                trustGrade: trust,
                relevanceGrade: Grade.A, // Boost real content

                tags: server.tags,
                keywords: server.tags, // Add tags as keywords too

                viewCount: (server.onlinePlayers || 0) * 10,
                impressions: (server.onlinePlayers || 0) * 50,
                clicks: (server.onlinePlayers || 0) * 5,

                isHidden: false,
                serverId: server.id,
            },
            create: {
                id: `search-server-${server.id}`,
                type: ContentType.SERVER,
                title: server.name,
                description: server.description || '',
                thumbnail: server.icon,
                link: `/servers/${server.id}`,
                serverId: server.id,

                trustGrade: trust,
                accuracyGrade: Grade.B,
                relevanceGrade: Grade.A,

                tags: server.tags,
                keywords: server.tags,

                viewCount: (server.onlinePlayers || 0) * 10,
                impressions: (server.onlinePlayers || 0) * 50,
                clicks: (server.onlinePlayers || 0) * 5,

                isHidden: false,
            }
        });

        console.log(`✅ Imported: ${server.name}`);
    }

    console.log('🎉 Real server data import completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
