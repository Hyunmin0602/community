import { NextRequest, NextResponse } from 'next/server';
import { enhancePromptForMinecraftSkin, getDefaultNegativePrompt } from '@/lib/huggingface';

// HUGGINGFACE_API_URL replaced by dynamic model selection

// Rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const limit = rateLimitMap.get(ip);

    if (!limit || now > limit.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
        return true;
    }

    if (limit.count >= 5) { // 5 requests per minute
        return false;
    }

    limit.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: '프롬프트를 입력해주세요.' },
                { status: 400 }
            );
        }

        // Check for API key
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API 키가 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        // Enhance prompt for Minecraft skin style
        const enhancedPrompt = enhancePromptForMinecraftSkin(prompt);
        const negativePrompt = getDefaultNegativePrompt();

        // List of models to try
        // Only FLUX.1-schnell is confirmed working on the serverless inference API currently
        const MODELS = [
            'black-forest-labs/FLUX.1-schnell',
            'stabilityai/stable-diffusion-xl-base-1.0'
        ];

        // Hostnames to try
        // The correct router path is /hf-inference/models
        const HOSTS = [
            'https://router.huggingface.co/hf-inference/models'
        ];

        let response;
        let lastError;
        let successfulModel = '';

        // Try models and hosts sequentially
        modelLoop: for (const model of MODELS) {
            for (const host of HOSTS) {
                try {
                    const apiUrl = `${host}/${model}`;
                    console.log(`Trying ${apiUrl}...`);

                    response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            inputs: enhancedPrompt,
                            parameters: {
                                negative_prompt: negativePrompt,
                                num_inference_steps: 25,
                                guidance_scale: 7.5,
                                width: 512,
                                height: 512,
                            },
                        }),
                    });

                    if (response.ok) {
                        successfulModel = `${model} (${host})`;
                        console.log(`Success with ${successfulModel}`);
                        break modelLoop;
                    }

                    const errorText = await response.text();
                    console.error(`Failed ${apiUrl}: ${response.status} - ${errorText.substring(0, 200)}...`);

                    // If 401/403 (Auth error), abort immediately as it won't work for other models usually
                    if (response.status === 401 || response.status === 403) {
                        lastError = { status: response.status, text: errorText };
                        break modelLoop;
                    }

                    // Save last error but continue
                    lastError = { status: response.status, text: errorText };

                } catch (e) {
                    console.error(`Error connecting to ${host}/${model}:`, e);
                    lastError = { status: 500, text: String(e) };
                }
            }
        }

        if (!response || !response.ok) {
            // Throw the last meaningful error
            if (lastError?.status === 503) {
                return NextResponse.json(
                    {
                        error: '사용 가능한 AI 모델이 로딩 중입니다. 20-30초 후 다시 시도해주세요.',
                        retryAfter: 30
                    },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: `이미지 생성 실패: ${lastError?.text || '모든 모델 시도 실패'}` },
                { status: lastError?.status || 500 }
            );
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API Error:', errorText);

            if (response.status === 503) {
                return NextResponse.json(
                    {
                        error: '모델이 로딩 중입니다. 20-30초 후 다시 시도해주세요.',
                        retryAfter: 30
                    },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: `이미지 생성 실패: ${response.statusText}` },
                { status: response.status }
            );
        }

        // Get image blob
        const imageBlob = await response.blob();

        // Convert to base64 for client
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            prompt: enhancedPrompt,
            originalPrompt: prompt,
        });

    } catch (error: any) {
        console.error('Skin generation error:', error);
        return NextResponse.json(
            { error: error.message || '알 수 없는 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
