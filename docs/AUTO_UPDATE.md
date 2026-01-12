# 🔄 자동 업데이트 시스템 가이드

## 📋 개요

이 시스템은 **다른 사람들이 자동으로 업데이트를 확인하고 최신 버전을 받을 수 있도록** 도와줍니다.

---

## 🎯 누가 무엇을 하나요?

### **개발자(당신)**: 새 버전 배포
```bash
# 새 기능 개발 완료 후
./scripts/version.sh minor  # v1.0.0 → v1.1.0
```
→ GitHub에 새 버전이 자동으로 업로드됩니다

### **다른 사람들**: 업데이트 확인 및 적용

#### 방법 1: 자동 알림 (개발 서버 시작 시)
```bash
npm run dev
```
→ 새 버전이 있으면 자동으로 알림이 표시됩니다!

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆕 새로운 버전이 출시되었습니다!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재: v1.0.0 → 최신: v1.1.0

업데이트하려면:
  $ ./scripts/update.sh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 방법 2: 수동 확인
```bash
npm run check-update
```

#### 방법 3: 자동 업데이트 실행
```bash
npm run update
# 또는
./scripts/update.sh
```

#### 방법 4: 웹에서 확인
웹사이트 접속 시 우측 하단에 업데이트 알림 배너가 자동으로 표시됩니다.

---

## 🔧 시스템 구성 요소

### 1. **스크립트 파일들**

| 파일 | 용도 | 실행자 |
|------|------|--------|
| `scripts/version.sh` | 새 버전 배포 | 개발자 |
| `scripts/update.sh` | 업데이트 받기 | 사용자 |
| `scripts/check-version.sh` | 버전 확인 알림 | 자동 실행 |

### 2. **NPM 스크립트**

```json
{
  "predev": "bash scripts/check-version.sh || true",  // dev 시작 전 자동 체크
  "check-update": "bash scripts/check-version.sh",    // 수동 체크
  "update": "bash scripts/update.sh"                   // 자동 업데이트
}
```

### 3. **웹 API**

- `GET /api/version` - 현재 버전 및 최신 버전 정보 반환
- `<VersionChecker />` - 웹에서 업데이트 알림 표시

---

## 🚀 사용 시나리오

### 시나리오 1: 개발자가 새 기능 배포

```bash
# 1. 새 기능 개발 완료
git add -A
git commit -m "feat: Add new awesome feature"

# 2. 버전 업데이트 및 배포
./scripts/version.sh minor

# 결과: v1.0.0 → v1.1.0
# GitHub에 자동으로 푸시됨
```

### 시나리오 2: 다른 사람이 개발 시작

```bash
# 개발 서버 시작
npm run dev

# 출력:
# 🆕 새로운 버전이 출시되었습니다!
# 현재: v1.0.0 → 최신: v1.1.0
# 업데이트하려면: $ ./scripts/update.sh
```

### 시나리오 3: 업데이트 받기

```bash
# 방법 A: 자동 업데이트 (권장)
npm run update

# 방법 B: 수동 업데이트
git pull origin main
npm install
npx prisma generate  # 데이터베이스 변경이 있다면
```

---

## 📱 웹 버전 체크 기능

### 사용 방법

루트 레이아웃에 컴포넌트 추가:

```tsx
// app/layout.tsx
import VersionChecker from '@/components/VersionChecker';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <VersionChecker />  {/* 여기 추가 */}
      </body>
    </html>
  );
}
```

이제 웹사이트를 방문하는 사용자들에게도 업데이트 알림이 표시됩니다!

---

## 🔍 동작 원리

### 1. 버전 체크 프로세스

```
1. 로컬 버전 읽기 (package.json)
2. GitHub에서 최신 태그 가져오기
3. 버전 비교
4. 다르면 알림 표시
```

### 2. 자동 업데이트 프로세스

```
1. 변경사항 확인
2. 있으면 stash (임시 저장)
3. git pull origin main
4. npm install
5. prisma generate
6. stash pop (변경사항 복원)
7. 완료!
```

---

## ⚙️ 설정 옵션

### 버전 체크 비활성화

`npm run dev` 시 자동 체크를 원하지 않는 경우:

```json
// package.json
{
  "scripts": {
    "predev": "",  // 이 줄을 비우거나 삭제
    "dev": "next dev"
  }
}
```

### 웹 알림 비활성화

```tsx
// app/layout.tsx에서 <VersionChecker /> 제거
```

---

## 🔒 보안 및 안정성

### 안전한 업데이트

`update.sh` 스크립트는:
- ✅ 커밋되지 않은 변경사항 보호 (stash)
- ✅ 사용자 확인 후 진행
- ✅ 실패 시 롤백 지원
- ✅ 변경사항 미리보기

### GitHub API 제한

- 시간당 60회 요청 제한 (인증 없이)
- 웹 API는 1시간 캐시 사용
- 제한 초과 시에도 앱은 정상 작동

---

## 📊 버전 비교 로직

```typescript
// 버전 비교 예시
"1.0.0" === "1.0.0"  → 최신 버전 ✅
"1.0.0" !== "1.0.1"  → 업데이트 필요 🔄
"1.0.0" !== "1.1.0"  → 업데이트 필요 🔄
"1.0.0" !== "2.0.0"  → 업데이트 필요 🔄
```

---

## 🎨 커스터마이징

### 알림 메시지 변경

```bash
# scripts/check-version.sh 수정
echo "custom message here"
```

### 웹 배너 스타일 변경

```tsx
// components/VersionChecker.tsx
<div className="custom-classes">
  {/* 원하는 스타일 적용 */}
</div>
```

---

## 🐛 문제 해결

### "Permission denied" 오류

```bash
chmod +x scripts/update.sh
chmod +x scripts/check-version.sh
```

### Git fetch 실패

```bash
# 원격 저장소 확인
git remote -v

# 원격 저장소 URL 수정 (필요시)
git remote set-url origin https://github.com/Hyunmin0602/community.git
```

### npm install 실패

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 통계 확인

### 버전 히스토리 보기

```bash
# 모든 버전 태그
git tag -l

# 버전별 변경사항
git log v1.0.0..v1.1.0 --oneline

# 현재부터 마지막 태그까지
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

---

## 🎯 Best Practices

### 개발자

1. **의미 있는 버전 업데이트**
   - 버그 수정 → PATCH
   - 새 기능 → MINOR
   - 큰 변경 → MAJOR

2. **CHANGELOG 작성**
   - 변경사항 상세히 기록
   - 사용자에게 도움이 되는 정보

3. **GitHub Release 작성**
   - 주요 변경사항 요약
   - 스크린샷/데모 추가

### 사용자

1. **정기적인 업데이트 확인**
   ```bash
   npm run check-update
   ```

2. **변경사항 확인 후 업데이트**
   ```bash
   cat CHANGELOG.md
   npm run update
   ```

3. **문제 발생 시 보고**
   - GitHub Issues 활용
   - 에러 메시지 첨부

---

## 🌐 CI/CD 통합

### GitHub Actions 예시

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: CHANGELOG.md
```

---

## 📚 추가 자료

- [Semantic Versioning](https://semver.org/lang/ko/)
- [Git 태그 가이드](https://git-scm.com/book/ko/v2/Git의-기초-태그)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [NPM Scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts)

---

## ✅ 요약

| 작업 | 명령어 | 설명 |
|------|--------|------|
| **버전 배포** | `./scripts/version.sh minor` | 새 버전 만들기 (개발자) |
| **자동 체크** | `npm run dev` | 시작 시 자동 확인 |
| **수동 체크** | `npm run check-update` | 업데이트 확인만 |
| **업데이트** | `npm run update` | 자동 업데이트 |
| **수동 업데이트** | `git pull && npm install` | 직접 업데이트 |

---

**Happy Updating! 🚀**
