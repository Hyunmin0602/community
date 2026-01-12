# 🏷️ 버전 관리 빠른 가이드

## 📌 현재 버전 확인하기

```bash
# package.json에서 버전 확인
cat package.json | grep version

# Git 태그 목록 보기
git tag -l

# 최신 태그 보기
git describe --tags --abbrev=0
```

---

## 🚀 버전 올리기

### 자동 방식 (권장)

```bash
# 버그 수정 (1.0.0 → 1.0.1)
npm run version:patch

# 새 기능 추가 (1.0.0 → 1.1.0)
npm run version:minor

# 큰 변경 (1.0.0 → 2.0.0)
npm run version:major

# 빌드 + 버전 업 + 릴리스
npm run release
```

### 수동 방식

```bash
# 1. CHANGELOG.md 업데이트
# 2. package.json 버전 수정
# 3. 커밋
git add -A
git commit -m "chore: Bump version to v1.1.0"

# 4. 태그 생성
git tag -a v1.1.0 -m "Release version 1.1.0"

# 5. Push
git push origin main
git push origin v1.1.0
```

### 스크립트 방식

```bash
# 실행 권한 부여 (최초 1회)
chmod +x scripts/version.sh

# 버전 업데이트
./scripts/version.sh patch   # 버그 수정
./scripts/version.sh minor   # 새 기능
./scripts/version.sh major   # 큰 변경
```

---

## 📝 언제 어떤 버전을 올릴까?

| 변경 유형 | 버전 | 예시 |
|-----------|------|------|
| 🐛 **버그 수정** | PATCH (1.0.1) | 오타 수정, 작은 버그 수정 |
| ✨ **새 기능** | MINOR (1.1.0) | 새 페이지, 새 컴포넌트, API 추가 |
| 💥 **큰 변경** | MAJOR (2.0.0) | DB 구조 변경, API 호환성 파괴 |

---

## 🔍 버전 히스토리 보기

```bash
# 모든 버전 태그 보기
git tag -l -n

# 버전별 변경사항 보기
git log v1.0.0..v1.1.0 --oneline

# 현재 버전과 마지막 태그 비교
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# CHANGELOG 보기
cat CHANGELOG.md
```

---

## 🌐 GitHub에서 릴리스 만들기

1. **GitHub 저장소 접속**
   https://github.com/Hyunmin0602/community

2. **Releases 페이지로 이동**
   우측 사이드바 "Releases" 클릭
   
3. **Create a new release** 클릭

4. **태그 선택**
   - Choose a tag: `v1.0.0` 선택 (또는 새로 만들기)

5. **릴리스 정보 입력**
   ```markdown
   # 🎉 v1.0.0 - First Stable Release
   
   ## ✨ 주요 기능
   - AI 기반 검색 시스템
   - 서버 랭킹 및 추천
   - 완전한 문서화
   
   ## 📚 문서
   - [빠른 시작](./QUICKSTART.md)
   - [설치 가이드](./INSTALLATION.md)
   - [변경 이력](./CHANGELOG.md)
   
   ## 🚀 시작하기
   \`\`\`bash
   git clone https://github.com/Hyunmin0602/community.git
   cd community
   npm install
   \`\`\`
   ```

6. **Publish release** 클릭

---

## 🎯 릴리스 체크리스트

버전을 올리기 전에 확인:

- [ ] 모든 기능이 정상 작동하는지 테스트
- [ ] `npm run build` 성공하는지 확인
- [ ] CHANGELOG.md 업데이트
- [ ] README.md 업데이트 (필요시)
- [ ] 환경 변수 문서 확인
- [ ] 커밋되지 않은 변경사항 확인
- [ ] package.json 버전 업데이트
- [ ] Git 태그 생성
- [ ] GitHub에 푸시
- [ ] GitHub Release 생성
- [ ] 팀원들에게 알림

---

## 🔄 버전 롤백하기

잘못된 버전을 올린 경우:

```bash
# 로컬 태그 삭제
git tag -d v1.1.0

# 원격 태그 삭제
git push origin :refs/tags/v1.1.0

# 커밋 되돌리기
git reset --hard HEAD~1
git push origin main --force  # 주의: force push!
```

⚠️ **주의**: 이미 배포된 버전은 롤백하지 말고 새 패치 버전을 만드세요!

---

## 📊 버전 정보 표시하기

앱에서 버전 표시하기:

```typescript
// lib/version.ts
import packageJson from '../package.json';

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;
```

```typescript
// 컴포넌트에서 사용
import { APP_VERSION } from '@/lib/version';

function Footer() {
  return (
    <footer>
      <p>Version {APP_VERSION}</p>
    </footer>
  );
}
```

---

## 🤝 협업 시 버전 관리

### 브랜치별 버전

```bash
main        → 1.0.0 (안정 버전)
develop     → 1.1.0-beta (개발 버전)
feature/x   → 1.1.0-alpha (알파 버전)
```

### Pre-release 버전

```bash
# 알파 버전
npm version prerelease --preid=alpha
# 1.0.0 → 1.0.1-alpha.0

# 베타 버전
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0

# RC (Release Candidate)
npm version prerelease --preid=rc
# 1.0.0 → 1.0.1-rc.0
```

---

## 📱 버전 확인 API

```typescript
// app/api/version/route.ts
import { NextResponse } from 'next/server';
import packageJson from '@/package.json';

export async function GET() {
  return NextResponse.json({
    name: packageJson.name,
    version: packageJson.version,
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
  });
}
```

---

## 🎓 더 알아보기

- [Semantic Versioning 공식 문서](https://semver.org/lang/ko/)
- [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)
- [Git 태그 가이드](https://git-scm.com/book/ko/v2/Git의-기초-태그)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Happy Versioning! 🚀**
