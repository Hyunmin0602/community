import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    // 관리자 권한 체크 로직이 들어가야 하지만, 일단 로그인 유저로 제한
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { url, text } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY is not configured' },
                { status: 500 }
            );
        }

        let contentToAnalyze = text || '';
        let imageContext = '';

        // URL 목록 파싱 (줄바꿈이나 콤마로 구분)
        const urls = url ? url.split(/[\n,]+/).map((u: string) => u.trim()).filter((u: string) => u.length > 0) : [];

        // URL이 있으면 스크래핑 (병렬 처리)
        if (urls.length > 0 && !text) {
            try {
                const results = await Promise.all(urls.map(async (targetUrl: string, index: number) => {
                    try {
                        const response = await fetch(targetUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                            }
                        });
                        const html = await response.text();
                        const $ = cheerio.load(html);

                        // 불필요한 태그 제거
                        $('script').remove();
                        $('style').remove();
                        $('nav').remove();
                        $('footer').remove();
                        $('header').remove();

                        // 이미지 추출
                        const images: { src: string; alt: string }[] = [];
                        $('img').each((i, el) => {
                            // Lazy load 대응: data-src, data-original 우선 확인
                            const src = $(el).attr('data-src') || $(el).attr('data-original') || $(el).attr('src');
                            const alt = $(el).attr('alt') || '';
                            if (src) {
                                try {
                                    const absoluteUrl = new URL(src, targetUrl).href;
                                    if (!absoluteUrl.match(/\.(svg|ico|gif)$/i) && images.length < 15) {
                                        images.push({ src: absoluteUrl, alt });
                                    }
                                } catch (e) { }
                            }
                        });

                        // 텍스트 추출
                        const content = $('article').text() || $('main').text() || $('body').text();
                        return {
                            url: targetUrl,
                            text: content.slice(0, 10000), // 개별 URL 당 토큰 제한
                            images
                        };
                    } catch (e) {
                        console.error(`Fetch error for ${targetUrl}:`, e);
                        return null;
                    }
                }));

                const validResults = results.filter(r => r !== null) as any[];

                if (validResults.length === 0) {
                    return NextResponse.json({ error: 'Failed to fetch any URLs' }, { status: 400 });
                }

                // 텍스트 합치기
                contentToAnalyze = validResults.map((r, i) => `
                === Source ${i + 1}: ${r.url} ===
                ${r.text}
                `).join('\n\n');

                // 이미지 합치기
                const allImages = validResults.flatMap(r => r.images);
                // 중복 제거 (URL 기준)
                const uniqueImages = Array.from(new Map(allImages.map(img => [img.src, img])).values());

                if (uniqueImages.length > 0) {
                    imageContext = `
                    Here are the images provided from the source URLs. 
                    Synthesize the information from multiple sources.
                    You SHOULD insert relevant images into the 'content' markdown where appropriate.
                    Use standard markdown syntax: ![Alt Text](Image URL)
                    
                    Available Images:
                    ${uniqueImages.slice(0, 20).map((img: any, i: number) => `${i + 1}. URL: ${img.src} (Alt: ${img.alt})`).join('\n')}
                    `;
                }
            } catch (e) {
                console.error('Multi-fetch error:', e);
                return NextResponse.json({ error: 'Failed to process URLs' }, { status: 500 });
            }
        }

        if (!contentToAnalyze.trim()) {
            return NextResponse.json({ error: 'No content to analyze' }, { status: 400 });
        }

        // Gemini 호출
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // 테스트 결과: gemini-flash-latest가 정상 작동함 (2.0은 권한/쿼터 문제)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
        You are a **Professional Minecraft Community Editor** (like a high-quality blog writer).
        
        **Your Goal**: 
        Read the source text and **RECONSTRUCT** it into a high-quality Korean blog post.
        
        **CRITICAL INSTRUCTIONS**:
        1. **NO Translation-ese (번역투 금지)**: Do NOT translate sentence by sentence. Read the whole context and rewrite it naturally in Korean.
           - Bad: "이 맵은 서머에 의해 만들어졌습니다." (Passive)
           - Good: "제작자 서머님이 만드신 이번 맵은..." (Active/Natural)
        2. **Player-Centric Focus**: 
           - Skip boring technical details unless important.
           - Focus on: **"What's fun?"**, **"How to play?"**, **"Key features"**, **"Secrets"**.
           - If it's an update, explain **"How this changes gameplay"**.
        3. **Synthesize**: If multiple sources are provided, merge them into one coherent story.

        ${imageContext}

        Input Text:
        ----------------------------------------
        ${contentToAnalyze}
        ----------------------------------------

        Requirements:
        1. **Language**: The output MUST be in **Natural Korean (한국어)**.
        2. **Format**: Return a JSON object (NOT markdown, just raw JSON).
        3. **Content Structure**: The 'content' field must follow this specific Blog Post structure:
           - **Main Title**: Start with \`# [Title of the Post]\` (Big Header, wrapped in brackets, followed by a blank line).
           - **Metadata Table**: using Markdown Table below the title. Fields: [게임버전, 분류, 출처].
           - **Intro Hook**: A short, immersive, or interesting 1-2 sentence intro.
           - **Main Content**: Detailed explanation re-written for players.
           - **Images**: Insert images provided in the context here.
           - **Installation Guide** (Only if it is a Map/Mod/Resource):
             > "Window + R 키를 동시에 눌러주세요. '실행' 창이 뜨면 %appdata% 를 입력해주세요. '.minecraft' 폴더내의 'saves'폴더에 해당 맵 파일을 넣어주세요."
           - **Download Link**: "다운로드: [링크]" (Use the source URL).
           - **Closing**: "이상으로 종합에디터였습니다."

        4. **Fields in JSON**:
           - title: A concise Korean title (Fun & Clicky).
           - excerpt: A 1-2 sentence summary.
           - content: The full structured blog post in Markdown.
           - category: Choose one best fit from [UPDATE, MECHANIC, ITEM, ENTITY, GUIDE, RESOURCE].

        Example Output Format:
        {
          "title": "소름 돋는 반전... 이번 공포 탈출맵 '아포리아' 리뷰",
          "excerpt": "단순한 공포가 아닙니다. 1.19.2 버전에서 즐길 수 있는 최고의 스토리 맵!",
          "category": "RESOURCE",
          "content": "| 게임버전 | 분류 | 출처 |\\n|---|---|---|\\n| 1.19.2 | 탈출맵 | [링크](...) |\\n\\n### 👻 기자에게 도착한 의문의 편지...\\n\\n단순히 무서운 맵인 줄 알았는데, 플레이해보니 스토리가 정말 깊더군요... (본문)\\n\\n![Image](...)\\n\\n### 맵 적용법\\nWindow + R 키를..."
        }
        
        Make sure the 'content' field is rich Markdown.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // JSON 파싱 (Gemini가 가끔 마크다운 코드블럭 \`\`\`json ... \`\`\` 으로 감싸서 줄 때가 있음)
        let cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(cleanedJson);
            return NextResponse.json(data);
        } catch (e) {
            console.error('JSON parse error:', e, responseText);
            // 파싱 실패 시 원본 텍스트라도 반환
            return NextResponse.json({
                title: '자동 생성된 문서 (파싱 실패)',
                category: 'GUIDE',
                excerpt: 'JSON 파싱에 실패했습니다. 내용을 확인해주세요.',
                content: responseText
            });
        }

    } catch (error) {
        console.error('Gemini Error:', error);

        // API 호출 실패 시 더미 데이터 반환 (Fallback)
        return NextResponse.json({
            title: 'AI 자동 생성 예시 (API 오류 대체)',
            category: 'GUIDE',
            excerpt: 'Gemini API 호출에 실패하여 표시되는 예시 데이터입니다. 실제 API 키가 유효하면 이 문구 대신 실제 요약이 뜹니다.',
            content: `
## ⚠️ API 호출 실패 (Fallback Mode)

현재 **Google Gemini API 키**가 유효하지 않거나, 해당 모델(\`gemini-1.5-flash\`)에 접근할 권한이 없어서 예시 데이터를 보여드리고 있습니다.

### 원래라면 이렇게 나옵니다:
*   **입력된 URL/텍스트**를 바탕으로
*   **AI가 내용을 요약**하고
*   **한국어로 번역**해서 정리해줍니다.

---

### 기능 테스트를 위해 필요한 것:
1.  **올바른 API Key**: Google AI Studio에서 발급받은 \`v1beta\` 접근 가능 키.
2.  **모델 권한**: 사용 중인 키가 \`gemini-1.5-flash\`를 지원해야 함.

지금은 우선 **'저장하기'** 버튼을 눌러 위키 생성 흐름이 잘 되는지 확인해보세요!
            `.trim()
        });
    }
}
