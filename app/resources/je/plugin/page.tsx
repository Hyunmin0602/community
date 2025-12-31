import ResourceList from '@/components/ResourceList';

const PLUGIN_SUB_CATEGORIES = [
    { value: 'ECONOMY', label: '경제' },
    { value: 'PVP', label: '대전' },
    { value: 'ADMIN', label: '관리' },
    { value: 'CHAT', label: '채팅' },
    { value: 'WORLD', label: '월드' },
    { value: 'FUN', label: '재미' },
    { value: 'PROTECTION', label: '보호' },
];

export default function JEPluginsPage() {
    return <ResourceList category="PLUGIN" subCategories={PLUGIN_SUB_CATEGORIES} title="플러그인 (Java Edition)" />;
}
