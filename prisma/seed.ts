
import { PrismaClient, ContentType, Grade } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting Search System V2 Migration...');

    // 1. Clean up existing index
    console.log('🗑️  Clearing old SearchContent...');
    await prisma.searchContent.deleteMany({});

    // 2. Migrate Servers
    console.log('🌍 Migrating Servers...');
    const servers = await prisma.server.findMany();
    for (const server of servers) {
        // Determine Trust Grade
        let trust: Grade = Grade.B;
        if (server.isOfficial) trust = Grade.S;
        else if (server.isVerified) trust = Grade.A;

        await prisma.searchContent.create({
            data: {
                type: ContentType.SERVER,
                title: server.name,
                description: server.description || '',
                thumbnail: server.icon,
                link: `/servers/${server.id}`,
                serverId: server.id,

                // Weights
                trustGrade: trust,
                accuracyGrade: Grade.B, // Default
                relevanceGrade: Grade.B, // Default

                // Initial optimization
                tags: server.tags,
                viewCount: 0,
                likeCount: 0, // Server doesn't have native likes suitable for this yet, or map from votes
                reportCount: 0,
                impressions: 100,
                clicks: 25,
                commentCount: 0,
            }
        });
    }
    console.log(`✅ Migrated ${servers.length} servers.`);

    // --- ADDED FOR SEARCH TEST ---
    const SAMPLE_RESOURCES = [
        {
            title: '테스트자료1 (Test Mod)',
            description: '이것은 테스트용 모드 자료입니다. 검색 테스트를 위해 추가되었습니다.',
            tags: ['모드', 'Mod', '테스트'],
            trustGrade: Grade.A, // Using Grade enum
            viewCount: 120,
            thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=TM',
        },
        {
            title: '옵티파인 최신 버전 (Optifine)',
            description: '마인크래프트 최적화 필수 모드인 옵티파인입니다.',
            tags: ['모드', '최적화', 'Optifine'],
            trustGrade: Grade.S, // Using Grade enum
            viewCount: 5000,
            thumbnail: 'https://api.dicebear.com/7.x/shapes/svg?seed=OPT',
        },
    ];

    console.log('📦 Migrating Sample Mod Resources...');
    for (const res of SAMPLE_RESOURCES) {
        await prisma.searchContent.create({
            data: {
                type: ContentType.RESOURCE,
                title: res.title,
                description: res.description,
                thumbnail: res.thumbnail,
                link: `/resources/test-${Math.floor(Math.random() * 1000)}`,
                resourceId: 'dummy-mod-' + Math.floor(Math.random() * 10000), // Dummy Resource ID

                trustGrade: res.trustGrade,
                accuracyGrade: Grade.B,
                relevanceGrade: Grade.B,

                tags: res.tags,
                keywords: res.tags,
                viewCount: res.viewCount,
                likeCount: 0,
                reportCount: 0,
                impressions: res.viewCount * 2,
                clicks: res.viewCount,
                commentCount: 0,
            }
        });
    }
    // ----------------------------

    // 3. Migrate Resources
    console.log('📦 Migrating Resources...');
    const resources = await prisma.resource.findMany();
    for (const res of resources) {
        let trust: Grade = Grade.B;
        if (res.isEditorsChoice) trust = Grade.S;
        else if (res.isVerified) trust = Grade.A;

        await prisma.searchContent.create({
            data: {
                type: ContentType.RESOURCE,
                title: res.title,
                description: res.description ? res.description.substring(0, 500) : '',
                thumbnail: res.thumbnail,
                link: `/resources/${res.id}`,
                resourceId: res.id,

                trustGrade: trust,
                accuracyGrade: Grade.B,
                relevanceGrade: Grade.B,

                tags: res.tags,
                viewCount: res.downloadCount,
                likeCount: 0, // Should fetch real likes if possible, but simplify for seed
                reportCount: 0,
                impressions: res.downloadCount * 3,
                clicks: res.downloadCount,
                commentCount: 0,
            }
        });
    }
    console.log(`✅ Migrated ${resources.length} resources.`);

    // 4. Migrate Wiki & Create Diverse Dummy Wikis
    console.log('📚 Migrating Wikis & Creating Diverse Dummy Wikis...');

    const wikiData: Record<string, { title: string, content: string }[]> = {
        'UPDATE': [
            { title: '1.21 업데이트 요약', content: '트라이얼 챔버와 새로운 구리 블록들이 추가되었습니다. 브리즈 몹을 조심하세요.' },
            { title: '1.20 흔적과 이야기', content: '고고학 시스템, 스니퍼, 벚꽃 숲이 추가된 대규모 업데이트입니다.' },
            { title: '차기 업데이트 루머', content: '엔드 차원 업데이트에 대한 커뮤니티의 추측과 루머를 정리했습니다.' },
            { title: '스냅샷 24w13a 분석', content: '새로운 메이스 무기와 무거운 코어에 대한 변경사항이 포함되었습니다.' },
            { title: '마인크래프트 라이브 2024', content: '올해 마인크래프트 라이브에서 발표될 내용 예상 정리.' }
        ],
        'MECHANIC': [
            { title: '레드스톤 기초 가이드', content: '레드스톤 가루, 중계기, 비교기의 기본적인 사용법을 알아봅니다.' },
            { title: '주민 교배와 거래', content: '효율적인 주민 번식장 만들기 및 직업별 거래 목록 정리.' },
            { title: '낚시 시스템 분석', content: '보물 낚시 확률과 비가 올 때의 낚시 속도 변화에 대해.' },
            { title: '엔챈트 메커니즘', content: '마법부여대의 레벨별 확률과 책장 배치 최적화 방법.' },
            { title: '공격 쿨타임 이해하기', content: '자바 에디션 1.9 이후 추가된 공격 쿨타임 시스템 완벽 분석.' }
        ],
        'ITEM': [
            { title: '다이아몬드 검', content: '가장 대중적인 강력한 무기. 날카로움 5 인챈트가 필수입니다.' },
            { title: '겉날개 (Elytra)', content: '엔드 시티에서 얻을 수 있는 비행 도구. 폭죽과 함께 사용하세요.' },
            { title: '신호기 설치법', content: '위더를 잡고 얻은 네더의 별로 신호기를 만들어 버프를 받으세요.' },
            { title: '치유의 포션 제조법', content: '반짝이는 수박을 사용하여 즉시 치유 포션을 만드는 방법.' },
            { title: '삼지창 획득 공략', content: '드라운드를 사냥하여 삼지창을 얻는 확률과 충성 인챈트 활용법.' }
        ],
        'ENTITY': [
            { title: '워든 (Warden)', content: '고대 도시의 스컬크 비명체가 소환하는 강력한 적대적 몹입니다.' },
            { title: '크리퍼 대처법', content: '조용히 다가와 폭발하는 크리퍼를 방패로 막거나 고양이로 쫓아내세요.' },
            { title: '엔더 드래곤 공략', content: '엔드 수정 파괴부터 침대 폭파 전략까지 엔더 드래곤 사냥의 모든 것.' },
            { title: '알레이 활용하기', content: '아이템을 주워주는 유용한 몹 알레이를 찾아 감옥에서 구출하세요.' },
            { title: '약탈자 습격 방어', content: '흉조 효과를 얻고 마을에 들어갔을 때 시작되는 습격을 막아내는 팁.' }
        ],
        'GUIDE': [
            { title: '효율적인 광질 방법', content: 'Y좌표 -58에서 다이아몬드를 가장 효율적으로 찾는 브랜치 마이닝 기법.' },
            { title: '서버 최적화 팁', content: '페이퍼(Paper) 서버 설정과 플러그인을 통한 렉 줄이는 방법.' },
            { title: '스타터 하우스 건축', content: '첫날 밤을 안전하게 보내기 위한 예쁜 목재 스타터 하우스 짓기.' },
            { title: '지옥문 네더 허브', content: '오버월드 이동 단축을 위한 지옥 천장 위 네더 허브 건설 가이드.' },
            { title: '자동 농장 모음', content: '철 농장, 금 농장, 슬라임 농장 등 필수 자동화 시설 만드는 법.' }
        ]
    };

    const wikiCategories = Object.keys(wikiData);
    for (const cat of wikiCategories) {
        let i = 0;
        for (const item of wikiData[cat] as any) {
            i++;
            try {
                const slug = `${cat.toLowerCase()}-doc-${i}`;

                // Create or update wiki doc
                const wiki = await prisma.wikiDoc.upsert({
                    where: { slug },
                    update: {
                        title: item.title,
                        content: item.content,
                        excerpt: item.content.substring(0, 50) + '...',
                    },
                    create: {
                        title: item.title,
                        slug,
                        content: item.content,
                        excerpt: item.content.substring(0, 50) + '...',
                        category: cat as any,
                        published: true,
                        views: Math.floor(Math.random() * 1000) + 100,
                    }
                });

                // Add to Search
                await prisma.searchContent.create({
                    data: {
                        type: ContentType.WIKI,
                        title: wiki.title,
                        description: wiki.excerpt || '',
                        link: `/wiki/${wiki.slug}`,
                        wikiId: wiki.id,
                        trustGrade: Grade.A,
                        relevanceGrade: Grade.A,
                        tags: [cat, '마인크래프트', item.title.split(' ')[0]],
                        viewCount: wiki.views,
                        likeCount: 0,
                        reportCount: 0,
                        impressions: wiki.views * 2,
                        clicks: Math.floor(wiki.views * 0.6),
                        commentCount: 0,
                        createdAt: wiki.createdAt, // Sync creation date
                    }
                });
            } catch (e) {
                // Ignore duplicates
            }
        }
    }

    // 5. Migrate Posts & Create Diverse Dummy Posts
    console.log('📝 Migrating Posts & Creating Diverse Dummy Posts...');

    const postData: Record<string, { title: string, content: string }[]> = {
        'FREE': [
            { title: '다들 오늘 뭐하시나요?', content: '저는 하루종일 광질만 하다가 용암에 빠졌네요 ㅠㅠ' },
            { title: '건축 대회 참가하실 분', content: '중세 시대 테마로 같이 마을 꾸미실 분 구합니다.' },
            { title: '서버 렉이 좀 심한가요?', content: '저만 핑이 튀는건지 서버 문제인지 모르겠네요.' },
            { title: '제 스킨 평가 좀 해주세요', content: '직접 찍었는데 명암 넣기가 너무 어렵네요.' },
            { title: '야생 서버 추천 받아요', content: '반야생 말고 완전 바닐라 야생 서버 찾습니다.' }
        ],
        'QUESTION': [
            { title: '옵티파인 설치 오류 질문', content: '자바가 설치되어 있는데도 실행이 안됩니다. 해결법 아시는 분?' },
            { title: '슬라임 청크 찾는 법', content: '시드 맵 사이트 말고 인게임에서 확인하는 방법 있나요?' },
            { title: '주민이 직업을 안 가져요', content: '직업 블록을 뒀는데도 백수 상태로 멍하니 있습니다.' },
            { title: '엔드 폰탈 못 찾겠어요', content: '눈 던져서 따라왔는데 땅 파도 아무것도 안 나옵니다.' },
            { title: '서버 여는 법 도와주세요', content: '포트포워딩까지 했는데 친구가 접속을 못해요.' }
        ],
        'TIP': [
            { title: '다이아 좌표 꿀팁 정리', content: '1.18 이후로는 -58 좌표가 국룰입니다. 청크 경계를 파세요.' },
            { title: '자동 낚시터 막혔나요?', content: '보물 낚시 조건이 바뀌어서 예전 디자인은 안 됩니다. 최신 설계도 공유.' },
            { title: '네더라이트 쉽게 캐는 법', content: '침대 폭파가 최고입니다. 양털 자동화부터 하세요.' },
            { title: '겉날개 내구도 관리', content: '수선 인챈트 필수고, 팬텀 막잡 잡아서 수리하세요.' },
            { title: 'F3 단축키 모음', content: '청크 경계 보기, 히트박스 보기 등 유용한 디버그 키 정리.' }
        ],
        'NOTICE': [
            { title: '주간 정기 점검 안내', content: '매주 목요일 오전 9시부터 11시까지 서버 점검이 진행됩니다.' },
            { title: '서버 규칙 위반 제재 명단', content: '엑스레이 사용 및 욕설로 인한 차단 유저 목록입니다.' },
            { title: '여름 맞이 이벤트 개최!', content: '스폰 지역 워터파크 개장 및 보물찾기 이벤트가 시작됩니다.' },
            { title: '신규 후원 혜택 추가', content: 'VIP 등급에게 펫 시스템 접근 권한이 부여됩니다.' },
            { title: '디스코드 연동 방법 안내', content: '인게임 계정과 디스코드를 연동하고 보상을 받으세요.' }
        ]
    };

    const postCategories = Object.keys(postData);
    const user = await prisma.user.findFirst();
    if (user) {
        for (const cat of postCategories) {
            for (const item of postData[cat] as any) {
                const title = `[${cat}] ${item.title}`;

                // Random date within last 30 days
                const daysAgo = Math.floor(Math.random() * 30);
                const createdAt = new Date();
                createdAt.setDate(createdAt.getDate() - daysAgo);

                const post = await prisma.post.create({
                    data: {
                        title,
                        content: item.content,
                        category: cat as any,
                        userId: user.id,
                        views: Math.floor(Math.random() * 500),
                        createdAt: createdAt, // Set actual creation date
                    }
                });

                let trust: Grade = Grade.B;
                let relevance: Grade = Grade.B;

                if (cat === 'NOTICE') {
                    relevance = Grade.S;
                    trust = Grade.S; // Explicitly requested by user for Community Notices
                }
                if (cat === 'TIP') relevance = Grade.A;

                const tags = [cat, '커뮤니티', '마인크래프트'];
                if (cat === 'NOTICE') tags.push('커뮤니티 공지');

                await prisma.searchContent.create({
                    data: {
                        type: ContentType.POST,
                        title: post.title,
                        description: post.content.substring(0, 300),
                        link: `/forum/post/${post.id}`,
                        postId: post.id,
                        trustGrade: trust,
                        relevanceGrade: relevance,
                        viewCount: post.views,
                        likeCount: 0,
                        reportCount: 0,
                        impressions: post.views * 2, // Dummy: impressions usually > views
                        clicks: Math.floor(post.views * 0.4), // Dummy 40% CTR
                        commentCount: 0,
                        createdAt: post.createdAt,
                    }
                });
            }
        }
    }

    console.log(`✅ Added diverse dummy wikis and posts.`);

    // 5. Create Dummy Search Logs
    console.log('📝 Creating Dummy Search Logs...');
    const queries = ['마인크래프트 서버', '생존 서버 추천', '건축 강좌', '플러그인 다운로드', 'PVP 잘하는 법', '레드스톤', '무료 서버', '오류 해결'];

    for (const query of queries) {
        // Random count between 5 and 50
        const count = Math.floor(Math.random() * 45) + 5;
        for (let i = 0; i < count; i++) {
            await prisma.searchQueryLog.create({
                data: {
                    query,
                    resultCount: Math.floor(Math.random() * 20),
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // Random past time
                }
            });
        }
    }
    console.log('✅ Added dummy search logs.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
