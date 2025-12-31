import ResourceList from '@/components/ResourceList';

const SEED_SUB_CATEGORIES = [
    { value: 'VILLAGE', label: '마을' },
    { value: 'RARE_BIOMES', label: '희귀 바이옴' },
    { value: 'STRUCTURES', label: '구조물' },
    { value: 'SPEEDRUN', label: '스피드런' },
    { value: 'SCENIC', label: '경치' },
];

export default function BESeedsPage() {
    return <ResourceList category="SEED" subCategories={SEED_SUB_CATEGORIES} title="시드 (Bedrock Edition)" />;
}
