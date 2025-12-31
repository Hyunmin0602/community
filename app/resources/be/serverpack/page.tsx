import ResourceList from '@/components/ResourceList';

const SERVERPACK_SUB_CATEGORIES = [
    { value: 'SURVIVAL', label: '서바이벌' },
    { value: 'MODDED', label: '모드' },
    { value: 'MINIGAMES', label: '미니게임' },
    { value: 'RPG', label: 'RPG' },
    { value: 'SKYBLOCK', label: '스카이블럭' },
];

export default function BEServerPacksPage() {
    return <ResourceList category="SERVERPACK" subCategories={SERVERPACK_SUB_CATEGORIES} title="서버팩 (Bedrock Edition)" />;
}
