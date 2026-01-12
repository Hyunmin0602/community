#!/bin/bash

# 간단한 버전 체크 (npm run dev 시작 시 자동 실행용)
# 알림만 하고 자동 업데이트는 하지 않음

# 컬러 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 원격 정보 가져오기 (조용히)
git fetch origin --tags --quiet 2>/dev/null || exit 0

# 현재 버전
LOCAL_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

# 원격 최신 태그
REMOTE_TAG=$(git describe --tags --abbrev=0 origin/main 2>/dev/null || echo "")

if [ -z "$REMOTE_TAG" ]; then
    exit 0
fi

REMOTE_VERSION=${REMOTE_TAG#v}

# 버전이 다르면 알림
if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🆕 새로운 버전이 출시되었습니다!${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "현재: ${YELLOW}v$LOCAL_VERSION${NC} → 최신: ${GREEN}v$REMOTE_VERSION${NC}"
    echo ""
    echo "업데이트하려면:"
    echo "  $ ./scripts/update.sh"
    echo ""
    echo "또는 수동으로:"
    echo "  $ git pull origin main && npm install"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
fi
