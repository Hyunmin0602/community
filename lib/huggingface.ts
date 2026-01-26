/**
 * Hugging Face API Client for Minecraft Skin Generation
 * Uses Stable Diffusion for pixel art style image generation
 */

export interface SkinGenerationOptions {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
}

export interface SkinGenerationResult {
    imageUrl: string;
    prompt: string;
    timestamp: Date;
}

/**
 * Enhances user prompt with Minecraft skin specific keywords
 */
export function enhancePromptForMinecraftSkin(userPrompt: string): string {
    // Optimized for FLUX.1 ecosystem
    const keywords = [
        'minecraft skin texture file',
        'flat 2d texture map',
        'pixel art style',
        'symmetrical layout',
        'white background',
        'no shading',
        'no shadows',
        'schematic',
        'game asset'
    ];

    // Remove duplicates
    let enhanced = userPrompt
        .replace(/minecraft skin/gi, '')
        .replace(/pixel art/gi, '')
        .trim();

    // Flux responds well to natural language description of structure
    return `Texture map for a Minecraft character skin of ${enhanced}. Standard 64x64 pixel layout. Flat untiled texture file. Pixel art style. ${keywords.join(', ')}`;
}

/**
 * Generates negative prompt to avoid unwanted features
 */
export function getDefaultNegativePrompt(): string {
    return [
        'realistic',
        'photorealistic',
        '3d render',
        'blurry',
        'low quality',
        'watermark',
        'text',
        'complex details',
        'gradient',
        'smooth shading'
    ].join(', ');
}

/**
 * Converts image to 64x64 Minecraft skin format
 */
export async function resizeToMinecraftSkin(
    imageDataUrl: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Disable image smoothing for pixel-perfect scaling
            ctx.imageSmoothingEnabled = false;

            // Draw and resize
            ctx.drawImage(img, 0, 0, 64, 64);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageDataUrl;
    });
}

/**
 * Generates skin data for saving
 */
export interface SavedSkin {
    id: string;
    title: string;
    prompt: string;
    imageData: string; // base64 data URL
    colors: string[]; // extracted color palette
    createdAt: string;
}

/**
 * Extracts dominant colors from skin image
 */
export function extractColorPalette(imageDataUrl: string): Promise<string[]> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve([]);
                return;
            }

            ctx.drawImage(img, 0, 0, 64, 64);
            const imageData = ctx.getImageData(0, 0, 64, 64);
            const pixels = imageData.data;

            // Collect unique colors
            const colorMap = new Map<string, number>();

            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];

                // Skip transparent pixels
                if (a < 128) continue;

                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
            }

            // Get top 12 most used colors
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([color]) => color);

            resolve(sortedColors);
        };
        img.onerror = () => resolve([]);
        img.src = imageDataUrl;
    });
}

/**
 * Generates markdown content for skin sharing
 */
export function generateSkinMarkdown(skin: SavedSkin): string {
    const date = new Date(skin.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `# ${skin.title}

![${skin.title}](${skin.imageData})

## 📝 생성 정보

- **프롬프트**: ${skin.prompt}
- **생성 날짜**: ${date}
- **ID**: \`${skin.id}\`

## 🎨 색상 팔레트

${skin.colors.map(color => `- <span style="display:inline-block;width:16px;height:16px;background:${color};border:1px solid #ccc;border-radius:2px;"></span> \`${color}\``).join('\n')}

## 💾 다운로드 및 사용

1. 우클릭 > 이미지 저장
2. Minecraft 실행
3. 설정 > 스킨 > 파일 선택
4. 저장한 이미지 선택

---

*Generated by AI Skin Generator*
`;
}
