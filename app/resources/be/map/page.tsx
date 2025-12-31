import ResourceList from '@/components/ResourceList';

const MAP_SUB_CATEGORIES = [
    { value: 'ADVENTURE', label: '모험' },
    { value: 'PARKOUR', label: '파쿠르' },
    { value: 'PVP', label: 'PvP' },
    { value: 'SURVIVAL', label: '서바이벌' },
    { value: 'PUZZLE', label: '퍼즐' },
    { value: 'HORROR', label: '공포' },
    { value: 'MINIGAME', label: '미니게임' },
    { value: 'CREATIVE', label: '창작' },
];

export default function BEMapsPage() {
    return <ResourceList category="MAP" subCategories={MAP_SUB_CATEGORIES} title="맵 (Bedrock Edition)" />;
}
