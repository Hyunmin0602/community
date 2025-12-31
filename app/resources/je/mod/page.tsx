import ResourceList from '@/components/ResourceList';

const MOD_SUB_CATEGORIES = [
    { value: 'TECHNOLOGY', label: '기술' },
    { value: 'MAGIC', label: '마법' },
    { value: 'ADVENTURE', label: '모험' },
    { value: 'DECORATION', label: '장식' },
    { value: 'UTILITY', label: '유틸리티' },
    { value: 'OPTIMIZATION', label: '최적화' },
];

export default function JEModsPage() {
    return <ResourceList category="MOD" subCategories={MOD_SUB_CATEGORIES} title="모드 (Java Edition)" />;
}
