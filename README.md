# 마인크래프트 커뮤니티 🎮

한국 최고의 마인크래프트 자바/베드락 서버 커뮤니티 플랫폼입니다.

![Minecraft Community](https://img.shields.io/badge/Minecraft-Community-green?style=for-the-badge&logo=minecraft)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)

## ✨ 주요 기능

- 🔍 **서버 검색 및 필터링**: 자바/베드락 에디션별로 서버 검색
- 📊 **실시간 서버 상태**: minecraft-server-util을 사용한 실시간 서버 모니터링
- 👍 **추천 시스템**: 마음에 드는 서버에 투표
- 💬 **댓글 시스템**: 서버에 대한 의견 공유
- 🔐 **사용자 인증**: NextAuth.js 기반 안전한 로그인/회원가입
- 🌙 **다크 모드**: 편안한 야간 사용을 위한 다크 테마
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14** (App Router) - 서버 사이드 렌더링 및 SEO 최적화
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **next-themes** - 다크 모드 지원
- **Lucide React** - 아이콘

### 백엔드
- **Next.js API Routes** - RESTful API
- **Prisma** - ORM
- **PostgreSQL** (Supabase) - 데이터베이스
- **NextAuth.js** - 인증
- **bcryptjs** - 비밀번호 해싱

### 서버 모니터링
- **minecraft-server-util** - 마인크래프트 서버 상태 조회

## 📋 사전 요구사항

- Node.js 18+ 및 npm
- Supabase 계정 (무료)
- Git

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd community
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 값들을 설정합니다:

#### Supabase 데이터베이스

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다
2. 프로젝트 설정 → Database → Connection string에서 연결 문자열을 복사합니다
3. `.env` 파일에 다음과 같이 설정합니다:

```env
# Connection Pooling (Prisma에서 사용)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"

# Direct Connection (마이그레이션에 사용)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### NextAuth 설정

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

`NEXTAUTH_SECRET`을 생성하려면 다음 명령어를 실행하세요:

```bash
openssl rand -base64 32
```

### 4. 데이터베이스 마이그레이션

Prisma를 사용하여 데이터베이스 스키마를 생성합니다:

```bash
npx prisma generate
npx prisma db push
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인합니다.

## 📦 프로젝트 구조

```
community/
├── app/                        # Next.js 13+ App Router
│   ├── api/                   # API 라우트
│   │   ├── auth/             # 인증 관련 API
│   │   └── servers/          # 서버 관련 API
│   ├── auth/                 # 인증 페이지
│   ├── servers/              # 서버 상세 페이지
│   │   ├── new/              # 서버 등록 페이지
│   │   └── [id]/edit/        # 서버 수정 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 홈페이지
│   └── globals.css           # 글로벌 스타일
├── components/               # 재사용 가능한 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ServerCard.tsx
│   └── ServerFilter.tsx
├── lib/                      # 유틸리티 및 설정
│   ├── prisma.ts            # Prisma 클라이언트
│   ├── auth.ts              # NextAuth 설정
│   ├── minecraft.ts         # 서버 상태 체크
│   └── utils.ts             # 헬퍼 함수
├── prisma/
│   └── schema.prisma        # 데이터베이스 스키마
└── types/                   # TypeScript 타입 정의
```

## 🗄️ 데이터베이스 스키마

### Server
서버 정보를 저장합니다.
- 이름, 설명, 호스트, 포트
- 서버 타입 (JAVA/BEDROCK)
- 온라인 상태, 플레이어 수
- MOTD, 버전 정보

### User
사용자 계정 정보를 저장합니다.
- 이름, 이메일, 비밀번호
- NextAuth 세션 관리

### Vote
서버 추천 정보를 저장합니다.
- 사용자별 서버 추천 (중복 방지)

### Comment
서버 댓글을 저장합니다.
- 사용자 작성 댓글
- 생성/수정 시간

## 🌐 배포

### Vercel에 배포하기

1. [Vercel](https://vercel.com)에 가입합니다
2. GitHub 저장소를 연결합니다
3. 환경 변수를 설정합니다:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_URL` (배포된 도메인으로 변경)
   - `NEXTAUTH_SECRET`
4. 배포 버튼을 클릭합니다

Vercel이 자동으로 빌드하고 배포합니다!

## 🔧 사용 가능한 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## 📝 API 엔드포인트

### 서버
- `GET /api/servers` - 서버 목록 조회
- `POST /api/servers` - 새 서버 등록 (인증 필요)
- `GET /api/servers/[id]` - 서버 상세 정보
- `PUT /api/servers/[id]` - 서버 정보 수정 (생성자만 가능)
- `DELETE /api/servers/[id]` - 서버 삭제 (생성자만 가능)
- `GET /api/servers/[id]/status` - 실시간 서버 상태 조회

### 투표
- `GET /api/servers/[id]/vote` - 투표 상태 확인
- `POST /api/servers/[id]/vote` - 투표/투표 취소 (인증 필요)

### 댓글
- `GET /api/servers/[id]/comments` - 댓글 목록
- `POST /api/servers/[id]/comments` - 댓글 작성 (인증 필요)

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/[...nextauth]` - NextAuth 엔드포인트

## 🎨 커스터마이징

### 색상 변경
`app/globals.css` 파일에서 CSS 변수를 수정하세요:

```css
:root {
  --primary: 142 76% 36%;  /* 메인 색상 */
  --background: 0 0% 100%; /* 배경 색상 */
  /* ... */
}
```

### Tailwind 설정
`tailwind.config.ts`에서 테마를 커스터마이즈하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

## 💡 도움말

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요!

---

**Made with ❤️ for the Minecraft community**
