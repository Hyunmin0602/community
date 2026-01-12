
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEYWORDS = [
    // 1. Server Genres
    { term: '야생', synonyms: ['Survival', '서바이벌', '야생서버'], category: 'GENRE' },
    { term: '마인팜', synonyms: ['Minefarm', '마팜', '광산'], category: 'GENRE' },
    { term: '스카이블록', synonyms: ['Skyblock', '스블', '하늘섬'], category: 'GENRE' },
    { term: 'RPG', synonyms: ['알피지', 'Roleplay'], category: 'GENRE' },
    { term: '약탈', synonyms: ['Raiding', 'PVP', '전쟁'], category: 'GENRE' },
    { term: '인생게임', synonyms: ['Life', 'RealLife', '현실경제'], category: 'GENRE' },
    { term: '포켓몬', synonyms: ['Pixelmon', '픽셀몬'], category: 'GENRE' },
    { term: '미니게임', synonyms: ['Minigame', 'Minigames'], category: 'GENRE' },
    { term: '랜무', synonyms: ['RandomWeapon', '랜덤무기'], category: 'GENRE' },
    { term: '국가전쟁', synonyms: ['NationWar', '국가'], category: 'GENRE' },

    // 2. Slang / Abbreviations (From Namuwiki, Communities)
    { term: '섬손', synonyms: ['섬세한손길', 'Silk Touch', '실크터치'], category: 'SLANG' },
    { term: '날카', synonyms: ['날카로움', 'Sharpness', '샤프니스'], category: 'SLANG' },
    { term: '행운', synonyms: ['Fortune', '포춘'], category: 'SLANG' },
    { term: '내구', synonyms: ['내구성', 'Unbreaking', '언브레이킹'], category: 'SLANG' },
    { term: '셜커', synonyms: ['Shulker', '셜커박스'], category: 'ITEM' },
    { term: '김치', synonyms: ['썩은살점', 'ZombieFlesh'], category: 'SLANG' },
    { term: '징징이', synonyms: ['주민', 'Villager'], category: 'SLANG' },
    { term: '황사', synonyms: ['황금사과', 'GoldenApple'], category: 'ITEM' },
    { term: '엔더맨', synonyms: ['Enderman'], category: 'MOB' },
    { term: '크리퍼', synonyms: ['Creeper', '폭발'], category: 'MOB' },

    // 3. Technical / Game Terms
    { term: '쉐이더', synonyms: ['Shader', '셰이더'], category: 'GAME_TERM' },
    { term: '리소스팩', synonyms: ['ResourcePack', '리팩', 'TexturePack', '텍스쳐팩'], category: 'GAME_TERM' },
    { term: '옵티파인', synonyms: ['Optifine'], category: 'MOD' },
    { term: '소듐', synonyms: ['Sodium'], category: 'MOD' },
    { term: '패브릭', synonyms: ['Fabric'], category: 'MOD_LOADER' },
    { term: '포지', synonyms: ['Forge'], category: 'MOD_LOADER' },
    { term: '우마공', synonyms: ['우리들의마인크래프트공간', 'Cafe'], category: 'COMMUNITY' },
    { term: '한마포', synonyms: ['한국마인크래프트포럼'], category: 'COMMUNITY' },

    // 4. Intent Triggers (For future use)
    { term: '서버추천', synonyms: ['서버 찾아요', '할만한 서버'], category: 'INTENT_TRIGGER' },
    { term: '서버추천', synonyms: ['서버 찾아요', '할만한 서버'], category: 'INTENT_TRIGGER' },
    { term: '오류해결', synonyms: ['접속이 안돼요', '튕김'], category: 'INTENT_TRIGGER' },

    // 5. Common Typos/Variations (Added for robustness)
    { term: '모드', synonyms: ['Mod', 'Mods', 'Mode'], category: 'GAME_TERM' }, // Mode is a common typo for Mod in Korean context
    { term: '야생', synonyms: ['Wild', 'Surv'], category: 'GENRE' },
];

async function main() {
    console.log('🌱 Seeding Search Keywords...');

    for (const kw of KEYWORDS) {
        await prisma.searchKeyword.upsert({
            where: { term: kw.term },
            update: {
                synonyms: kw.synonyms,
                category: kw.category,
            },
            create: {
                term: kw.term,
                synonyms: kw.synonyms,
                category: kw.category,
                popularity: 10, // Base popularity
            }
        });
    }

    console.log(`✅ Seeded ${KEYWORDS.length} keywords.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
