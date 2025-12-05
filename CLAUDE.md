# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

PubStation은 5개 언어(한국어, 영어, 중국어, 일본어, 스페인어)로 50만 권의 퍼블릭 도메인 전자책을 제공하는 글로벌 전자책 플랫폼입니다. 반응형 웹 플랫폼 MVP입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router) + TypeScript
- **데이터베이스**: PostgreSQL 16 (Prisma ORM), Redis 7 (캐싱/세션)
- **검색**: Meilisearch
- **인증**: NextAuth.js v5
- **결제**: Stripe (구독)
- **스토리지**: Google Cloud Storage (EPUB 파일, 표지)
- **배포**: Google Cloud Run
- **스타일링**: Tailwind CSS 3 + shadcn/ui
- **다국어**: next-intl (5개 로케일: en, ko, zh, ja, es)
- **EPUB 리더**: epub.js
- **패키지 매니저**: pnpm

## 개발 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 린트 실행
pnpm lint

# 코드 포맷팅
pnpm format

# 데이터베이스
pnpm prisma generate      # Prisma 클라이언트 생성
pnpm prisma migrate dev   # 개발 환경 마이그레이션 실행
pnpm prisma studio        # Prisma Studio 열기

# 테스트
pnpm test                 # 유닛 테스트 실행
pnpm test:e2e            # Playwright E2E 테스트 실행
```

## 아키텍처

### 디렉토리 구조
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 다국어 라우팅 (en, ko, zh, ja, es)
│   │   ├── (public)/      # 공개 페이지 (홈, 탐색, 책 상세, 검색, 요금제)
│   │   ├── (protected)/   # 인증 필요 (내 서재, 프로필, 설정, 리더)
│   │   └── (admin)/       # 관리자 전용 (대시보드, 책 관리, 사용자 관리)
│   └── api/               # API 라우트
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── layout/            # Header, Footer 등
│   ├── books/             # 책 카드, 그리드, 캐러셀
│   ├── reader/            # EPUB 리더 컴포넌트
│   └── admin/             # 관리자 컴포넌트
├── lib/
│   ├── db/                # Prisma 클라이언트
│   ├── auth/              # NextAuth 설정
│   ├── stripe/            # Stripe 연동
│   ├── gcs/               # Google Cloud Storage 파일 작업
│   └── search/            # Meilisearch 클라이언트
├── hooks/                 # 커스텀 React 훅
├── types/                 # TypeScript 타입 정의
└── i18n/                  # 번역 파일 (locales/*.json)
```

### 주요 데이터 모델 (Prisma)
- **User**: 인증, 구독 상태, 읽기 설정
- **Book**: 메타데이터, EPUB/표지 URL, 검색 텍스트, 인기도
- **ReadingProgress**: CFI 위치, 진행률, 총 읽은 시간
- **Bookmark**: CFI 위치 및 메모
- **Favorite**: 사용자 즐겨찾기 책

### 구독 모델
- **무료 티어**: 월 3권, 광고 표시, 다운로드 불가
- **프리미엄 티어**: 무제한 읽기, 광고 없음, EPUB 다운로드 가능

### 라우트 보호
- `/library`, `/reader/*`, `/settings`는 인증 필요
- `/admin/*` 라우트는 ADMIN 역할 필요
- 미들웨어에서 인증 확인 및 구독 제한 처리

## 주요 연동

### EPUB 리더 (epub.js)
- CFI (Canonical Fragment Identifier)로 읽기 위치 저장
- 30초마다 및 페이지 전환 시 자동 저장
- 글꼴 크기, 테마(라이트/다크/세피아), 북마크 지원

### Stripe 웹훅
`/api/webhooks/stripe`에서 처리하는 이벤트:
- `checkout.session.completed` - 구독 활성화
- `customer.subscription.updated` - 상태 업데이트
- `customer.subscription.deleted` - 무료로 다운그레이드

### Meilisearch
- 다국어 검색 및 오타 허용
- 제목, 저자, searchText 필드로 책 인덱싱
