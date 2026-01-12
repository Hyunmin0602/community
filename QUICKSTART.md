# ⚡ 빠른 시작 가이드

5분 안에 프로젝트를 실행해보세요!

## 🏃 빠른 설치 (5분)

### 1️⃣ 프로젝트 다운로드
```bash
git clone https://github.com/Hyunmin0602/community.git
cd community
```

### 2️⃣ 패키지 설치
```bash
npm install
```

### 3️⃣ 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일을 열어서 수정하세요
# 최소한 DATABASE_URL과 NEXTAUTH_SECRET은 필수입니다
```

**NEXTAUTH_SECRET 생성:**
```bash
openssl rand -base64 32
```

### 4️⃣ 데이터베이스 설정
```bash
npx prisma generate
npx prisma db push
```

### 5️⃣ 서버 실행
```bash
npm run dev
```

🎉 **완료!** http://localhost:3000 열기

---

## 📝 필수 환경 변수

`.env` 파일에 최소한 다음 값들은 설정해야 합니다:

```env
DATABASE_URL="your-supabase-connection-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generated-secret-key"
```

**Supabase 무료 계정 만들기:**
1. https://supabase.com 접속
2. 새 프로젝트 생성
3. Settings → Database → Connection string 복사

---

## ❓ 문제가 생겼나요?

더 자세한 설명은 [INSTALLATION.md](./INSTALLATION.md)를 참고하세요!
