# 📤 프로젝트 공유 가이드

이 문서는 다른 사람에게 프로젝트를 공유하는 방법을 설명합니다.

## 🔗 저장소 URL

```
https://github.com/Hyunmin0602/community
```

---

## 👥 공유 방법

### 방법 1: Public 저장소로 만들기 (모두에게 공개)

저장소를 공개하면 누구나 코드를 볼 수 있습니다:

1. https://github.com/Hyunmin0602/community/settings 접속
2. 맨 아래 **Danger Zone** 섹션 찾기
3. **Change repository visibility** 클릭
4. **Make public** 선택
5. 경고 메시지 확인 후 저장소 이름 입력
6. **I understand, change repository visibility** 클릭

✅ 이제 URL만 공유하면 됩니다!

### 방법 2: Collaborator 초대 (특정 사람에게만)

Private 저장소를 유지하면서 특정 사람과 협업:

1. https://github.com/Hyunmin0602/community/settings/access 접속
2. **Invite a collaborator** 클릭
3. 상대방의 GitHub 아이디/이메일 입력
4. 권한 선택:
   - **Read**: 코드 보기만 가능
   - **Write**: 코드 수정 및 푸시 가능
   - **Admin**: 저장소 설정 변경 가능
5. **Add [사용자명] to this repository** 클릭

상대방이 이메일로 받은 초대를 수락하면 접근 가능합니다.

---

## 📋 다른 사람이 받는 방법

### 단계별 안내 (공유할 내용)

다른 사람에게 다음 내용을 공유하세요:

```
안녕하세요! 👋

마인크래프트 커뮤니티 프로젝트를 공유합니다.

🔗 저장소: https://github.com/Hyunmin0602/community

📖 시작하는 방법:
1. 저장소 클론:
   git clone https://github.com/Hyunmin0602/community.git
   cd community

2. 빠른 시작 가이드 따라하기:
   https://github.com/Hyunmin0602/community/blob/main/QUICKSTART.md

3. 또는 상세 가이드:
   https://github.com/Hyunmin0602/community/blob/main/INSTALLATION.md

질문이 있으면 Issues에 남겨주세요!
```

### 필요한 사전 준비물

공유받는 사람에게 알려줄 것:

- ✅ Node.js 18+ 설치
- ✅ Git 설치
- ✅ Supabase 무료 계정 (DB용)
- ✅ 텍스트 에디터 (VS Code 권장)

---

## 🌐 GitHub Pages/배포

### Vercel에 배포 (권장)

1. https://vercel.com 가입
2. **New Project** 클릭
3. GitHub 저장소 연결
4. 환경 변수 설정:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_URL` (배포 URL로 변경)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_AI_API_KEY` (선택)
5. **Deploy** 클릭

✅ 자동으로 빌드 & 배포됩니다!

### 배포 URL 공유

배포 후 생성된 URL (예: `https://community-xxx.vercel.app`)을 공유하면 다른 사람들이 직접 사용할 수 있습니다.

---

## 🎓 협업 가이드

### Fork 방식 (오픈소스 기여)

다른 사람들이 기여하도록 하려면:

1. 저장소를 Public으로 설정
2. `CONTRIBUTING.md` 파일 작성
3. README에 기여 가이드 링크 추가

기여자 워크플로우:
```bash
# 1. Fork (GitHub에서 버튼 클릭)
# 2. Clone
git clone https://github.com/[기여자]/community.git

# 3. 브랜치 생성
git checkout -b feature/새기능

# 4. 변경사항 커밋
git commit -m "Add: 새로운 기능"

# 5. Push
git push origin feature/새기능

# 6. Pull Request 생성
```

### Branch 전략

협업 시 권장 브랜치 구조:

```
main           (프로덕션)
├── develop    (개발)
├── feature/*  (새 기능)
├── bugfix/*   (버그 수정)
└── hotfix/*   (긴급 수정)
```

---

## 🔒 주의사항

### ⚠️ 절대 커밋하면 안 되는 것

- `.env` 파일 (비밀번호, API 키 포함)
- `node_modules/` (패키지)
- 개인정보
- API 키 및 시크릿

이미 `.gitignore`에 설정되어 있지만 재확인하세요!

### 실수로 커밋한 경우

```bash
# 마지막 커밋 취소 (로컬에만)
git reset --soft HEAD~1

# 이미 푸시한 경우 (주의!)
git push --force  # 협업 중이면 절대 사용 금지!
```

**민감한 정보가 푸시된 경우:**
1. 즉시 해당 키/비밀번호 변경
2. Git 히스토리에서 완전히 제거 필요 (복잡함)
3. 새 저장소로 마이그레이션 고려

---

## 📊 협업 Best Practices

### Commit 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

예시:
```bash
git commit -m "feat: Add server search filter"
git commit -m "fix: Resolve login redirect issue"
git commit -m "docs: Update installation guide"
```

### Pull Request 템플릿

PR 생성 시 포함할 내용:

```markdown
## 변경사항
- 무엇을 변경했는지

## 이유
- 왜 이 변경이 필요한지

## 테스트
- 어떻게 테스트했는지

## 스크린샷
- UI 변경이 있다면
```

---

## 🆘 문제 해결

### "Permission denied" 오류

Collaborator로 추가되지 않았거나 권한이 없는 경우입니다.
→ 저장소 소유자에게 Collaborator 초대 요청

### Clone이 안 되는 경우

Private 저장소는 인증이 필요합니다:

```bash
# HTTPS (권장)
git clone https://github.com/Hyunmin0602/community.git

# SSH (키 설정 필요)
git clone git@github.com:Hyunmin0602/community.git
```

### GitHub 토큰 인증

2021년 이후 GitHub는 비밀번호 대신 토큰을 사용합니다:

1. GitHub → Settings → Developer settings → Personal access tokens
2. **Generate new token** (classic)
3. 권한 선택: `repo` 전체 체크
4. 토큰 복사 (이후 볼 수 없음!)
5. Clone 시 비밀번호 대신 토큰 입력

---

## ✅ 체크리스트

프로젝트를 공유하기 전:

- [ ] 민감한 정보가 커밋되지 않았는지 확인
- [ ] README.md 최신화
- [ ] INSTALLATION.md 작성 완료
- [ ] .env.example 파일 제공
- [ ] LICENSE 파일 추가
- [ ] 모든 변경사항 커밋 & 푸시
- [ ] 저장소 visibility 설정 (Public/Private)
- [ ] Collaborator 초대 (필요한 경우)

---

## 📞 지원

질문이나 문제가 있으면:

- **Issues**: https://github.com/Hyunmin0602/community/issues
- **Discussions**: https://github.com/Hyunmin0602/community/discussions

---

**Happy Collaborating! 🚀**
