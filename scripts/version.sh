#!/bin/bash

# 버전 관리 헬퍼 스크립트
# 사용법: ./scripts/version.sh [patch|minor|major]

set -e  # 에러 발생 시 즉시 종료

VERSION_TYPE=${1:-patch}

echo "🏷️  버전 업데이트 스크립트"
echo "================================"
echo ""

# 현재 버전 확인
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 현재 버전: v$CURRENT_VERSION"
echo ""

# 변경사항 확인
if [[ -n $(git status -s) ]]; then
    echo "⚠️  커밋되지 않은 변경사항이 있습니다:"
    git status -s
    echo ""
    read -p "계속하시겠습니까? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 취소됨"
        exit 1
    fi
    
    echo "📝 변경사항 커밋 중..."
    git add -A
    git commit -m "chore: Prepare for version bump"
fi

# 버전 타입 확인
case $VERSION_TYPE in
    patch)
        echo "🔧 PATCH 버전 업데이트 (버그 수정)"
        ;;
    minor)
        echo "✨ MINOR 버전 업데이트 (새 기능)"
        ;;
    major)
        echo "🚀 MAJOR 버전 업데이트 (큰 변경)"
        ;;
    *)
        echo "❌ 올바른 버전 타입이 아닙니다: $VERSION_TYPE"
        echo "사용법: $0 [patch|minor|major]"
        exit 1
        ;;
esac

# 버전 업데이트
echo ""
echo "🔄 버전 업데이트 중..."
npm version $VERSION_TYPE --no-git-tag-version

# 새 버전 가져오기
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ 새 버전: v$NEW_VERSION"
echo ""

# CHANGELOG 업데이트 알림
echo "⚠️  중요: CHANGELOG.md를 수동으로 업데이트하세요!"
echo ""
echo "다음 섹션을 추가하세요:"
echo "-----------------------------------"
echo "## [$NEW_VERSION] - $(date +%Y-%m-%d)"
echo ""
echo "### Added"
echo "- 새로운 기능들..."
echo ""
echo "### Changed"
echo "- 변경사항들..."
echo ""
echo "### Fixed"
echo "- 버그 수정들..."
echo "-----------------------------------"
echo ""

read -p "CHANGELOG.md를 업데이트했습니까? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  나중에 CHANGELOG.md를 업데이트하는 것을 잊지 마세요!"
fi

# 커밋 및 태그
echo ""
echo "📝 변경사항 커밋 중..."
git add package.json CHANGELOG.md
git commit -m "chore: Bump version to v$NEW_VERSION"

echo "🏷️  Git 태그 생성 중..."
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

echo "☁️  GitHub에 푸시 중..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "================================"
echo "✅ 버전 업데이트 완료!"
echo "================================"
echo ""
echo "📦 버전: v$CURRENT_VERSION → v$NEW_VERSION"
echo "🏷️  태그: v$NEW_VERSION"
echo "🌐 GitHub: https://github.com/Hyunmin0602/community/releases/tag/v$NEW_VERSION"
echo ""
echo "다음 단계:"
echo "1. GitHub에서 Release 노트 작성"
echo "2. 변경사항 확인"
echo "3. 팀원들에게 알림"
echo ""
echo "🎉 완료!"
