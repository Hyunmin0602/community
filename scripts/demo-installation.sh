#!/bin/bash

# 다른 사람이 프로젝트를 클론하고 실행하는 시뮬레이션
# 이 스크립트는 교육용입니다

echo "========================================="
echo "🚀 마인크래프트 커뮤니티 프로젝트 설치"
echo "========================================="
echo ""

# Step 1: 저장소 클론
echo "📥 1단계: GitHub에서 프로젝트 다운로드"
echo "$ git clone https://github.com/Hyunmin0602/community.git"
echo "$ cd community"
echo ""

# Step 2: 패키지 설치
echo "📦 2단계: 필요한 패키지 설치"
echo "$ npm install"
echo "⏳ 패키지 설치 중... (수백 개의 패키지 설치)"
echo ""

# Step 3: 환경 변수
echo "⚙️ 3단계: 환경 변수 설정"
echo "$ cp .env.example .env"
echo "$ nano .env  # 또는 원하는 에디터로 편집"
echo ""
echo "필수 설정 항목:"
echo "  - DATABASE_URL: Supabase 데이터베이스 URL"
echo "  - NEXTAUTH_SECRET: 인증 시크릿 키"
echo ""

# Step 4: 데이터베이스
echo "🗄️ 4단계: 데이터베이스 설정"
echo "$ npx prisma generate"
echo "$ npx prisma db push"
echo ""

# Step 5: 서버 실행
echo "🎯 5단계: 개발 서버 실행"
echo "$ npm run dev"
echo ""
echo "✅ 서버가 http://localhost:3000 에서 실행 중입니다!"
echo ""

echo "========================================="
echo "🎉 설치 완료!"
echo "========================================="
echo ""
echo "더 자세한 내용은 다음 문서를 참고하세요:"
echo "  - QUICKSTART.md   (빠른 시작)"
echo "  - INSTALLATION.md (상세 가이드)"
echo "  - README.md       (프로젝트 정보)"
