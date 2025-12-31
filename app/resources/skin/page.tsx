import ResourceList from '@/components/ResourceList';

const SKIN_SUB_CATEGORIES = [
    { value: 'PLAYER', label: '플레이어' },
    { value: 'MOB', label: '몹' },
    { value: 'HD', label: 'HD/4K' },
    { value: 'ANIME', label: '애니메이션' },
    { value: 'FANTASY', label: '판타지' },
    { value: 'REALISTIC', label: '현실적' },
];

export default function SkinsPage() {
    return <ResourceList category="SKIN" subCategories={SKIN_SUB_CATEGORIES} title="스킨" />;
}
