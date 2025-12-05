# PubStation

공개 도메인 전자책을 위한 현대적인 웹 기반 EPUB 리더 플랫폼입니다.

## 주요 기능

### EPUB 리더 (v2.0)
- **Immersive Mode**: 자동 숨김 메뉴, Tap Zone 네비게이션
- **Scrubber**: 드래그 가능한 진행률 슬라이더
- **모바일 지원**: 스와이프 제스처, 터치 최적화
- **Desktop Spread View**: 두 페이지 보기 모드
- **테마**: Light, Dark, Sepia, High Contrast, Auto (시스템 연동)
- **폰트 설정**: 크기, 종류, 줄 높이 조절
- **하이라이트**: 4가지 색상, 메모 기능
- **북마크**: 추가, 삭제, 이름 수정
- **본문 검색**: KWIC 표시, 결과 네비게이션
- **번역**: OpenAI GPT-4o-mini 기반
- **사전**: Free Dictionary API 연동
- **TTS**: Web Speech API 기반 음성 읽기

### 플랫폼 기능
- **다국어 지원**: 영어, 한국어, 중국어, 일본어, 스페인어
- **사용자 인증**: NextAuth.js (이메일/소셜 로그인)
- **구독 시스템**: Stripe 결제 연동
- **읽기 진행률**: 자동 저장 및 동기화
- **라이브러리**: 개인 책 관리

### 개발자 도구
- **Analytics**: PostHog 이벤트 추적
- **Error Tracking**: Sentry 에러 모니터링

## 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand
- **Database**: PostgreSQL + Prisma ORM
- **Search**: Meilisearch
- **Cache**: Redis
- **EPUB Rendering**: epub.js
- **Authentication**: NextAuth.js v5
- **Payment**: Stripe
- **Analytics**: PostHog
- **Error Tracking**: Sentry

## 시작하기

### 요구사항
- Node.js 18+
- pnpm
- PostgreSQL
- Redis
- Meilisearch

### 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/manseok-song/bookstore.git
cd bookstore
```

2. 의존성 설치
```bash
pnpm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에 필요한 값 입력
```

4. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
npx prisma generate
```

5. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 환경 변수

```env
# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PubStation

# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/pubstation"

# Redis
REDIS_URL="redis://localhost:6379"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-master-key"

# NextAuth.js
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# Stripe (선택)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (번역 기능)
OPENAI_API_KEY="sk-..."

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_DSN="https://...@sentry.io/..."
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 다국어 라우트
│   │   ├── (public)/      # 공개 페이지
│   │   ├── (protected)/   # 인증 필요 페이지
│   │   └── (admin)/       # 관리자 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── reader/           # EPUB 리더 컴포넌트
│   ├── books/            # 도서 관련 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── hooks/                 # Custom React Hooks
├── lib/                   # 유틸리티 및 라이브러리
│   ├── analytics/        # PostHog, Sentry
│   ├── translate/        # 번역 클라이언트
│   └── dictionary/       # 사전 클라이언트
├── store/                 # Zustand 스토어
├── constants/             # 상수 정의
├── types/                 # TypeScript 타입
└── messages/              # i18n 번역 파일
```

## 문서

- [EPUB Viewer 가이드](docs/EPUB_VIEWER.md)
- [Changelog](docs/CHANGELOG.md)
- [Viewer Upgrade Spec](docs/viewerup.md)

## 라이선스

MIT License

## 기여

이슈 및 PR 환영합니다!

## 배포

### Google Cloud Platform 배포 정보

- **서비스 URL**: https://pubstation-1039219401072.asia-northeast3.run.app
- **리전**: asia-northeast3 (서울)
- **인프라**:
  - Cloud Run (Next.js 앱)
  - Cloud SQL PostgreSQL 15
  - Cloud Storage (ebooks, covers 버킷)
  - Secret Manager

### 테스트 계정

- **관리자**: admin@pubstation.com / admin123
- **일반 사용자**: user@example.com / user1234

### 배포 명령어

```bash
# Cloud Run 배포
gcloud run deploy pubstation \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --project ebookplat

# 데이터베이스 마이그레이션
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Seed 데이터
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```
