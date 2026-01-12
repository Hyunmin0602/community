# 🚀 설치 가이드

이 문서는 마인크래프트 커뮤니티 프로젝트를 로컬 환경에 설치하고 실행하는 방법을 안내합니다.

## 📋 사전 요구사항

다음 프로그램들이 설치되어 있어야 합니다:

- **Node.js 18 이상** - [다운로드](https://nodejs.org/)
- **Git** - [다운로드](https://git-scm.com/)
- **Supabase 계정** - [무료 가입](https://supabase.com)

### Node.js 설치 확인

터미널에서 다음 명령어를 실행하여 설치를 확인하세요:

```bash
node --version  # v18.0.0 이상이어야 함
npm --version
git --version
```

---

## 📥 1단계: 프로젝트 클론

터미널을 열고 프로젝트를 저장할 폴더로 이동한 후:

```bash
git clone https://github.com/Hyunmin0602/community.git
cd community
```

---

## 📦 2단계: 의존성 설치

프로젝트 폴더에서 다음 명령어를 실행합니다:

```bash
npm install
```

> 💡 이 과정은 몇 분 정도 걸릴 수 있습니다.

---

## ⚙️ 3단계: 환경 변수 설정

### 3-1. .env 파일 생성

```bash
cp .env.example .env
```

Windows에서는:
```bash
copy .env.example .env
```

### 3-2. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에 로그인
2. **New Project** 클릭
3. 프로젝트 이름과 비밀번호 설정 (비밀번호를 기억해두세요!)
4. 리전은 **Northeast Asia (Seoul)** 선택 (한국 사용자의 경우)
5. 프로젝트 생성 완료까지 대기 (1-2분 소요)

### 3-3. 데이터베이스 연결 문자열 가져오기

1. 생성된 프로젝트에서 **Settings** (톱니바퀴 아이콘) 클릭
2. **Database** 메뉴 클릭
3. **Connection string** 섹션에서:
   - **Connection Pooling** 탭의 URI 복사 (Prisma용)
   - **Direct Connection** 탭의 URI 복사 (마이그레이션용)

### 3-4. .env 파일 수정

텍스트 에디터로 `.env` 파일을 열고 다음 값들을 수정합니다:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# NextAuth 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="여기에-랜덤한-문자열을-생성하여-입력"

# Google Gemini AI (선택사항 - AI 검색 기능용)
GOOGLE_AI_API_KEY="필요한-경우-API-키-입력"
```

**중요:**
- `[YOUR-PASSWORD]`를 Supabase 프로젝트 생성 시 설정한 비밀번호로 변경
- `NEXTAUTH_SECRET`는 아래 명령어로 생성:
  ```bash
  openssl rand -base64 32
  ```
  (Windows에서는 [randomkeygen.com](https://randomkeygen.com/)에서 생성)

---

## 🗄️ 4단계: 데이터베이스 초기화

### 4-1. Prisma 클라이언트 생성

```bash
npx prisma generate
```

### 4-2. 데이터베이스 스키마 적용

```bash
npx prisma db push
```

### 4-3. 초기 데이터 입력 (선택사항)

```bash
npx prisma db seed
```

> 💡 샘플 데이터가 필요한 경우 이 명령어를 실행하세요.

---

## 🎯 5단계: 개발 서버 실행

모든 설정이 완료되었습니다! 이제 개발 서버를 실행합니다:

```bash
npm run dev
```

다음과 같은 메시지가 나타나면 성공입니다:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in Xms
```

브라우저에서 **http://localhost:3000**을 열어 애플리케이션을 확인하세요!

---

## ✅ 설치 확인

설치가 제대로 되었는지 확인하세요:

- [ ] 홈페이지가 정상적으로 로드됨
- [ ] 회원가입/로그인이 작동함
- [ ] 서버 목록이 표시됨
- [ ] 에러 메시지가 없음

---

## 🔧 문제 해결

### 오류: "Cannot find module..."

```bash
rm -rf node_modules package-lock.json
npm install
```

### 오류: "Database connection failed"

- `.env` 파일의 DATABASE_URL이 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 비밀번호에 특수문자가 있다면 URL 인코딩 필요

### 오류: "Port 3000 is already in use"

다른 포트로 실행:
```bash
PORT=3001 npm run dev
```

### Prisma 관련 오류

```bash
npx prisma generate
npx prisma db push --force-reset
```

---

## 📚 추가 명령어

### 데이터베이스 관리

```bash
# Prisma Studio (데이터베이스 GUI)
npx prisma studio

# 마이그레이션 생성
npx prisma migrate dev --name 마이그레이션_이름

# 데이터베이스 초기화
npx prisma db push --force-reset
```

### 빌드 및 프로덕션

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### 코드 품질

```bash
# ESLint 실행
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

---

## 🆘 도움이 필요하신가요?

- **Issues**: [GitHub Issues](https://github.com/Hyunmin0602/community/issues)
- **문서**: [README.md](./README.md)
- **질문**: 이슈를 통해 질문해주세요!

---

## 🎉 축하합니다!

설치가 완료되었습니다. 이제 개발을 시작하세요!

다음 단계:
1. [개발 가이드](./README.md) 읽기
2. 코드 구조 파악하기
3. 첫 기여하기

**Happy Coding! 🚀**
