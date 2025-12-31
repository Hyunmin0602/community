import ResourceList from '@/components/ResourceList';

const ADDON_SUB_CATEGORIES = [
    { value: 'MOBS', label: '몹' },
    { value: 'ITEMS', label: '아이템' },
    { value: 'BLOCKS', label: '블록' },
    { value: 'MECHANICS', label: '시스템' },
    { value: 'WEAPONS', label: '무기' },
];

export default function BEAddonsPage() {
    return <ResourceList category="ADDON" subCategories={ADDON_SUB_CATEGORIES} title="애드온 (Bedrock Edition)" />;
}
