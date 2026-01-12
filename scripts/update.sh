#!/bin/bash

# 자동 업데이트 체크 스크립트
# 다른 사람 환경에서 새 버전이 있는지 확인하고 업데이트

set -e

echo "🔍 업데이트 확인 중..."
echo ""

# 현재 로컬 버전
LOCAL_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
echo "📦 현재 버전: v$LOCAL_VERSION"

# 원격 최신 정보 가져오기
echo "🌐 GitHub에서 최신 정보 확인 중..."
git fetch origin --tags --quiet 2>/dev/null || {
    echo "⚠️  원격 저장소에 접근할 수 없습니다."
    exit 1
}

# 원격 최신 태그 확인
REMOTE_TAG=$(git describe --tags --abbrev=0 origin/main 2>/dev/null || echo "")

if [ -z "$REMOTE_TAG" ]; then
    echo "ℹ️  원격 태그를 찾을 수 없습니다."
    exit 0
fi

REMOTE_VERSION=${REMOTE_TAG#v}  # v1.0.0 → 1.0.0
echo "🌐 최신 버전: v$REMOTE_VERSION"
echo ""

# 버전 비교
if [ "$LOCAL_VERSION" = "$REMOTE_VERSION" ]; then
    echo "✅ 최신 버전을 사용 중입니다!"
    echo ""
    
    # 커밋은 다를 수 있으니 확인
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main)
    
    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "⚠️  버전은 같지만 최신 커밋이 아닙니다."
        echo ""
        echo "최신 변경사항을 받으려면:"
        echo "$ git pull origin main"
        echo "$ npm install"
    fi
    
    exit 0
fi

echo "🆕 새로운 버전이 있습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "현재: v$LOCAL_VERSION → 최신: v$REMOTE_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 변경사항 미리보기
echo "📝 변경사항 미리보기:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --oneline --decorate HEAD..origin/main | head -10
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 업데이트 여부 묻기
read -p "지금 업데이트하시겠습니까? (y/N) " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 업데이트를 취소했습니다."
    echo ""
    echo "나중에 업데이트하려면:"
    echo "$ ./scripts/update.sh"
    echo ""
    echo "또는 수동으로:"
    echo "$ git pull origin main"
    echo "$ npm install"
    exit 0
fi

# 변경사항 확인
if [[ -n $(git status -s) ]]; then
    echo "⚠️  커밋되지 않은 변경사항이 있습니다:"
    git status -s
    echo ""
    read -p "변경사항을 stash하고 계속하시겠습니까? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 업데이트를 취소했습니다."
        echo ""
        echo "변경사항을 먼저 커밋하거나 stash하세요:"
        echo "$ git stash"
        echo "$ ./scripts/update.sh"
        echo "$ git stash pop"
        exit 1
    fi
    
    echo "📦 변경사항을 임시 저장 중..."
    git stash push -m "Auto-stash before update"
    STASHED=true
else
    STASHED=false
fi

# 업데이트 진행
echo "⬇️  업데이트 중..."
echo ""

# Git pull
echo "1/3 📥 코드 업데이트..."
git pull origin main

# 태그 업데이트
echo "2/3 🏷️  태그 업데이트..."
git fetch --tags

# 패키지 업데이트
echo "3/3 📦 패키지 설치..."
npm install

# Prisma 재생성 (필요시)
if [ -f "prisma/schema.prisma" ]; then
    echo "🔧 Prisma 클라이언트 재생성..."
    npx prisma generate
fi

# Stash 복원
if [ "$STASHED" = true ]; then
    echo ""
    echo "📂 임시 저장된 변경사항 복원 중..."
    git stash pop || {
        echo "⚠️  변경사항 복원 중 충돌이 발생했습니다."
        echo "수동으로 해결해주세요: git stash pop"
    }
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 업데이트 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 새 버전 확인
NEW_VERSION=$(node -p "require('./package.json').version")
echo "🎉 v$LOCAL_VERSION → v$NEW_VERSION"
echo ""

# CHANGELOG 확인
if [ -f "CHANGELOG.md" ]; then
    echo "📝 변경 내역을 확인하세요:"
    echo "$ cat CHANGELOG.md"
    echo ""
fi

echo "서버를 재시작하세요:"
echo "$ npm run dev"
echo ""
echo "🎊 완료!"
