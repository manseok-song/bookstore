# Work Log - PubStation

## 2025-12-05: Google Cloud Platform 배포

### 작업 내용

#### 1. Cloud Run 배포 설정
- **서비스 URL**: https://pubstation-1039219401072.asia-northeast3.run.app
- **리전**: asia-northeast3 (서울)
- **스펙**: 1Gi 메모리, 1 CPU
- **Dockerfile 생성**: Next.js standalone 빌드 지원

#### 2. Cloud SQL PostgreSQL 설정
- **인스턴스명**: pubstation-db
- **버전**: PostgreSQL 15
- **IP 주소**: 34.64.185.66
- **티어**: db-f1-micro
- **데이터베이스**: pubstation
- **사용자**: pubstation_user

#### 3. Cloud Storage 버킷 생성
- **ebooks 버킷**: gs://pubstation-ebooks
- **covers 버킷**: gs://pubstation-covers
- **위치**: asia-northeast3

#### 4. Secret Manager 설정
- `database-url`: PostgreSQL 연결 문자열
- `openai-api-key`: OpenAI API 키 (editor-pro 프로젝트에서 가져옴)
- `auth-secret`: NextAuth 인증 시크릿

#### 5. 환경 변수 설정
- `NODE_ENV=production`
- `AUTH_URL`, `NEXTAUTH_URL`: Cloud Run 서비스 URL
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog 분석 키
- `SENTRY_DSN`: Sentry 에러 트래킹
- `GCS_BUCKET_EBOOKS`, `GCS_BUCKET_COVERS`: 스토리지 버킷명

#### 6. 데이터베이스 초기화
- Prisma 마이그레이션 실행 완료
- Seed 데이터 추가: 약 100권의 전자책 (영어, 스페인어, 중국어, 일본어, 한국어)
- 관리자 계정: admin@pubstation.com / admin123
- 테스트 계정: user@example.com / user1234

#### 7. 인증 설정 수정
- Google OAuth를 조건부로 활성화 (환경변수가 있을 때만)
- Credentials 인증 기본 활성화
- `src/lib/auth/config.ts` 수정

### 수정된 파일
- `next.config.ts`: standalone 출력 설정 추가
- `Dockerfile`: Cloud Run 배포용 생성
- `.dockerignore`: 빌드 최적화
- `src/lib/auth/config.ts`: Google OAuth 조건부 설정
- `prisma/seed-extra.ts`: 추가 전자책 데이터

### GCP 프로젝트 정보
- **프로젝트 ID**: ebookplat
- **프로젝트 이름**: ebookplatform
- **계정**: manseok84.dev2@gmail.com

### 알려진 이슈
- Google OAuth 사용 시 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET 환경변수 필요
- 이메일/비밀번호 로그인은 정상 작동

---
*작성일: 2025-12-05*
