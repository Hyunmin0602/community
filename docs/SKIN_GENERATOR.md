# AI Minecraft Skin Generator

AI를 활용한 마인크래프트 스킨 생성기입니다. 텍스트 프롬프트로 독특한 스킨을 만들고, 픽셀 편집기로 커스터마이징할 수 있습니다.

## 📋 주요 기능

### 🎨 AI 스킨 생성
- Hugging Face Stable Diffusion을 활용한 텍스트-투-이미지 생성
- 한글 프롬프트 지원
- 자동 픽셀 아트 스타일 변환 (64x64)
- 예시 프롬프트 제공

### ✏️ 픽셀 편집기
- 캔버스 기반 픽셀 단위 편집
- 그리기, 지우개, 채우기, 스포이드 도구
- Minecraft 색상 팔레트 제공
- Undo/Redo 기능
- 확대/축소 및 그리드 표시

### 📄 마크다운 내보내기
- 스킨 정보를 마크다운 형식으로 변환
- 생성 프롬프트, 색상 팔레트, 메타데이터 포함
- 클립보드 복사 및 파일 다운로드
- 커뮤니티 게시판 바로 공유

### 💾 갤러리
- LocalStorage 기반 스킨 저장
- 썸네일 그리드 뷰
- 재편집 및 재다운로드
- 스킨 관리 (삭제, 전체 삭제)

## 🚀 설치 및 설정

### 1. 환경 변수 설정

`.env` 파일에 Hugging Face API 키를 추가하세요:

\`\`\`bash
# Hugging Face API (For AI Skin Generator)
HUGGINGFACE_API_KEY="your-huggingface-api-key-here"
\`\`\`

### 2. Hugging Face API 키 발급

1. [Hugging Face](https://huggingface.co/)에 가입/로그인
2. Settings > Access Tokens로 이동
3. "New token" 클릭하여 API 토큰 생성
4. 생성된 토큰을 `.env` 파일에 추가

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

### 4. 접속

브라우저에서 `http://localhost:3000/skin-generator` 접속

## 📁 파일 구조

\`\`\`
community/
├── app/
│   ├── skin-generator/
│   │   └── page.tsx              # 메인 스킨 생성 페이지
│   └── api/
│       └── skin-generator/
│           └── route.ts          # API 라우트 (Hugging Face 프록시)
├── components/
│   ├── SkinCanvas.tsx            # 스킨 미리보기 & 편집 캔버스
│   ├── SkinGallery.tsx           # 스킨 갤러리
│   └── MarkdownExporter.tsx      # 마크다운 내보내기
└── lib/
    └── huggingface.ts            # Hugging Face 유틸리티
\`\`\`

## 🔧 사용 방법

### 기본 사용

1. **프롬프트 입력**: 원하는 스킨을 텍스트로 설명
   - 예: "파란색 후드티를 입은 사이버펑크 고양이"

2. **AI 생성**: "AI로 생성하기" 버튼 클릭

3. **편집 (선택)**: 
   - "편집하기" 클릭
   - 도구 선택 (그리기/지우개/채우기/스포이드)
   - 색상 팔레트에서 색상 선택
   - 픽셀 클릭하여 편집

4. **저장/다운로드**:
   - PNG 다운로드: 마인크래프트에 바로 사용
   - 저장하기: 갤러리에 저장
   - 마크다운 내보내기: 커뮤니티 공유

### 마인크래프트에서 사용

1. PNG 파일 다운로드
2. Minecraft 실행
3. 설정 > 스킨 > 파일 선택
4. 다운로드한 PNG 파일 선택

## 🎨 커스터마이징

### 색상 팔레트 수정

\`components/SkinCanvas.tsx\`에서 \`minecraftColors\` 배열을 수정:

\`\`\`typescript
const minecraftColors = [
  '#000000', '#FFFFFF', // ... 원하는 색상 추가
];
\`\`\`

### 예시 프롬프트 추가

\`app/skin-generator/page.tsx\`에서 \`examplePrompts\` 배열을 수정:

\`\`\`typescript
const examplePrompts = [
  '파란색 후드티를 입은 사이버펑크 고양이',
  // ... 원하는 프롬프트 추가
];
\`\`\`

## 🐛 문제 해결

### "API 키가 설정되지 않았습니다"

- `.env` 파일에 \`HUGGINGFACE_API_KEY\`가 설정되어 있는지 확인
- 개발 서버를 재시작

### "모델이 로딩 중입니다"

- Hugging Face 모델이 처음 사용될 때 로딩 시간이 필요할 수 있음
- 20-30초 후 다시 시도

### 생성된 이미지가 픽셀 아트 스타일이 아님

- API에서 생성된 이미지는 자동으로 64x64로 리사이즈됨
- 프롬프트에 "pixel art" 키워드가 자동으로 추가됨
- 필요시 편집기에서 수동으로 픽셀 아트 스타일로 편집

## 📝 라이선스

이 프로젝트는 커뮤니티 사이트의 일부로, 기존 라이선스를 따릅니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요!

---

*Created with ❤️ using Next.js, TypeScript, and Hugging Face*
