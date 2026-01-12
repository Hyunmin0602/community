# Changelog

이 파일은 프로젝트의 주목할 만한 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### 계획된 기능
- 실시간 채팅 기능
- 서버 통계 대시보드
- 모바일 앱

---

## [1.0.0] - 2026-01-12

첫 번째 안정 버전 릴리스! 🎉

### Added (추가)
- ✅ 완전한 설치 가이드 문서 (INSTALLATION.md)
- ✅ 빠른 시작 가이드 (QUICKSTART.md)
- ✅ 프로젝트 공유 가이드 (SHARING.md)
- ✅ 환경 변수 템플릿 (.env.example)
- ✅ MIT 라이센스
- ✅ AI 기반 검색 기능 (Google Gemini)
- ✅ 서버 랭킹 시스템
- ✅ 검색 분석 및 진단 도구
- ✅ Admin 검색 관리 페이지
- ✅ 태그 입력 컴포넌트
- ✅ 검색 상호작용 추적 API

### Changed (변경)
- 📦 프로젝트 버전을 0.1.0에서 1.0.0으로 업그레이드
- 📝 README.md 업데이트 (설치 가이드 링크 추가)
- 🔧 검색 로직 개선 및 최적화
- 🎨 검색 결과 UI 개선

### Fixed (수정)
- 🐛 빌드 오류 수정 (검색 페이지)
- 🐛 Rich text editor SSR 비활성화
- 🐛 로그인 리다이렉션 문제 해결
- 🐛 데이터베이스 연결 문제 해결

### Security (보안)
- 🔒 NextAuth 인증 강화
- 🔒 환경 변수 보안 개선

---

## [0.1.0] - 2025-12-28

초기 개발 버전

### Added
- 🎮 마인크래프트 서버 커뮤니티 기본 기능
- 🔍 서버 검색 및 필터링
- 📊 실시간 서버 상태 모니터링
- 👍 서버 추천 시스템
- 💬 댓글 시스템
- 🔐 사용자 인증 (NextAuth.js)
- 🌙 다크 모드 지원
- 📱 반응형 디자인
- 📚 위키 시스템
- 🎨 포럼 기능
- 📖 리소스 공유 (맵, 플러그인, 애드온)
- 👑 명예의 전당

---

## 버전 관리 가이드

### 버전 번호 올리는 방법

```bash
# PATCH 버전 (버그 수정)
npm version patch  # 1.0.0 → 1.0.1

# MINOR 버전 (새 기능)
npm version minor  # 1.0.0 → 1.1.0

# MAJOR 버전 (큰 변경)
npm version major  # 1.0.0 → 2.0.0
```

### 릴리스 체크리스트

릴리스 전 확인사항:

- [ ] 모든 테스트 통과
- [ ] CHANGELOG.md 업데이트
- [ ] README.md 업데이트 (필요시)
- [ ] 버전 번호 업데이트 (package.json)
- [ ] Git 커밋 및 푸시
- [ ] Git 태그 생성
- [ ] GitHub Release 생성

### Git 태그 생성 방법

```bash
# 버전 태그 생성
git tag -a v1.0.0 -m "Release version 1.0.0"

# 태그 푸시
git push origin v1.0.0

# 모든 태그 푸시
git push --tags
```

---

## 참고 링크

- [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/ko/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
