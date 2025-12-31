# 검색 가중치 시스템 (Search Weights System)

## 개요
검색 시스템은 **3가지 메트릭(Metric)**을 기반으로 콘텐츠의 우선순위를 결정합니다:
1. **Trust Grade** (신뢰도)
2. **Accuracy Grade** (정확도)
3. **Relevance Grade** (관련성)

각 Grade는 `S`, `A`, `B` 등급으로 나뉘며, **S가 가장 높은 가중치**입니다.

---

## Grade 등급 체계

| Grade | 가중치 | 설명 |
|-------|--------|------|
| **S** | 최상 | 공식/에디터 추천 콘텐츠 |
| **A** | 상 | 검증된 콘텐츠 |
| **B** | 기본 | 일반 콘텐츠 |

---

## 콘텐츠 타입별 가중치

### 1️⃣ 서버 (SERVER)

| 메트릭 | Grade 기준 |
|--------|-----------|
| **Trust** | • Official 서버: `S`<br>• Verified 서버: `A`<br>• 일반 서버: `B` |
| **Accuracy** | `B` (기본값) |
| **Relevance** | `B` (기본값) |

**특이사항:**
- `viewCount`: 현재 0으로 설정 (서버에 조회수 필드 없음)
- `tags`: 서버 태그 활용

---

### 2️⃣ 리소스 (RESOURCE)

| 메트릭 | Grade 기준 |
|--------|-----------|
| **Trust** | • Editor's Choice: `S`<br>• Verified: `A`<br>• 일반: `B` |
| **Accuracy** | `B` (기본값) |
| **Relevance** | `B` (기본값) |

**특이사항:**
- `viewCount`: 다운로드 수(`downloadCount`)를 조회수 대용으로 사용
- `description`: 최대 500자로 제한
- `tags`: 리소스 태그 활용

---

### 3️⃣ 위키 (WIKI)

| 메트릭 | Grade 기준 |
|--------|-----------|
| **Trust** | `A` (위키는 일반적으로 신뢰됨) |
| **Accuracy** | 설정 안 됨 (기본값) |
| **Relevance** | `A` (정보 관련성 높음) |

**특이사항:**
- `viewCount`: 실제 조회수(`views`) 사용
- `description`: `excerpt` 우선, 없으면 `content` 앞 300자 사용

---

### 4️⃣ 게시글 (POST)

**마이그레이션 대상:** `TIP`, `NOTICE`, `QUESTION` 카테고리만 (FREE 채팅 제외)

| 메트릭 | Grade 기준 |
|--------|-----------|
| **Trust** | `B` (기본값) |
| **Accuracy** | 설정 안 됨 (기본값) |
| **Relevance** | • NOTICE: `S`<br>• TIP: `A`<br>• 기타: `B` |

**특이사항:**
- `viewCount`: 실제 조회수(`views`) 사용
- `description`: 본문 앞 300자 사용

---

## 구현 파일 위치

### 데이터 마이그레이션
- **파일**: [`prisma/seed.ts`](file:///Users/hyunminlee/Desktop/community/prisma/seed.ts)
- **역할**: 기존 콘텐츠를 `SearchContent` 테이블로 마이그레이션하며 가중치 설정

### 검색 로직
- **파일**: [`app/search/page.tsx`](file:///Users/hyunminlee/Desktop/community/app/search/page.tsx)
- **역할**: 3가지 메트릭을 기반으로 검색 결과 스코어링 및 정렬

---

## 가중치 조정 가이드

### Trust Grade 상향 조정
```typescript
// 예: 특정 리소스를 S등급으로 승격
trustGrade: Grade.S
```

### Relevance Grade 상향 조정
```typescript
// 예: 특정 게시글 카테고리를 중요도 높게 설정
if (post.category === 'GUIDE') relevance = Grade.S;
```

### 새 콘텐츠 타입 추가 시
1. `ContentType` enum에 타입 추가
2. `seed.ts`에 마이그레이션 로직 추가
3. 적절한 Trust/Accuracy/Relevance Grade 설정
4. viewCount, tags 등 부가 정보 매핑

---

## 참고사항

> [!IMPORTANT]
> 가중치 변경 후 반드시 `npm run seed`를 실행하여 SearchContent 테이블을 재생성해야 합니다.

> [!TIP]
> viewCount가 높을수록 검색 순위에서 추가 가산점을 받습니다.

> [!NOTE]
> 현재 Accuracy Grade는 대부분 기본값(B)으로 설정되어 있어, 향후 콘텐츠 품질 검증 시스템 도입 시 활용 가능합니다.
