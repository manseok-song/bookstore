# PubStation 네이밍 컨벤션 가이드

이 문서는 PubStation 프로젝트의 네이밍 컨벤션과 용어집을 정의합니다.
코드 일관성을 위해 이 가이드를 따라주세요.

## 용어집 (Glossary)

| 한국어 | 영어 (코드) | 용도 |
|--------|-------------|------|
| 책 | `book` | 모델, 컴포넌트, API |
| 사용자 | `user` | 모델, API |
| 서재 | `library` | 페이지, API |
| 즐겨찾기 | `favorite` | 모델, API |
| 북마크 | `bookmark` | 모델, API (책 내 위치 저장) |
| 독서 진행률 | `readingProgress` | 모델 |
| 구독 | `subscription` | API, 상태 |
| 언어 | `locale` (UI언어) / `language` (책 언어) | 설정 |
| 장르 | `genre` | 필터, 카테고리 |
| 저자 | `author` | 책 속성 |
| 표지 | `cover` | 이미지 |
| 난이도 | `difficulty` | 책 속성 |

## 파일/폴더 네이밍

### 컴포넌트
- **규칙**: PascalCase
- **예시**: `BookCard.tsx`, `SearchBar.tsx`, `EpubReader.tsx`

### 훅 (Hooks)
- **규칙**: camelCase, `use` 접두사
- **예시**: `useBookProgress.ts`, `useEpubReader.ts`, `useBookmarks.ts`

### 유틸리티 함수
- **규칙**: camelCase
- **예시**: `formatDate.ts`, `parseEpub.ts`, `validateInput.ts`

### 상수 파일
- **규칙**: camelCase 또는 특정 도메인명
- **예시**: `naming.ts`, `routes.ts`, `config.ts`

### API 라우트
- **규칙**: kebab-case 폴더
- **예시**:
  - `/api/user/reading-progress`
  - `/api/books/[id]/download`

## 변수/함수 네이밍

### 변수
- **규칙**: camelCase
- **예시**: `currentBook`, `userId`, `pageNumber`, `searchQuery`

### 함수
- **규칙**: camelCase, 동사로 시작
- **예시**: `getBooks()`, `updateProgress()`, `fetchUserLibrary()`, `validateEmail()`

### 불리언 변수
- **규칙**: `is`, `has`, `can` 접두사
- **예시**: `isLoading`, `hasSubscription`, `canDownload`, `isAuthenticated`

### 이벤트 핸들러
- **규칙**: `handle` 접두사
- **예시**: `handleClick`, `handleSubmit`, `handleBookSelect`, `handleSearch`

### Props 콜백
- **규칙**: `on` 접두사
- **예시**: `onClick`, `onBookSelect`, `onProgressChange`, `onClose`

## ID/Key 네이밍

### 데이터베이스 ID
- **규칙**: `id` (cuid 사용)
- **예시**: `clxyz123abc...`

### URL 파라미터
- **규칙**: camelCase
- **예시**: `bookId`, `userId`, `locale`

### 쿼리 파라미터
- **규칙**: 소문자
- **예시**: `page`, `limit`, `sort`, `language`, `genre`, `q` (검색어)

### 폼 필드
- **규칙**: camelCase
- **예시**: `email`, `password`, `bookTitle`, `authorName`

## 상태 값 (Enum)

모든 Enum은 `src/constants/naming.ts`에 정의되어 있습니다.

```typescript
// 구독 상태
type SubscriptionStatus = 'FREE' | 'PREMIUM' | 'CANCELLED'

// 사용자 역할
type UserRole = 'USER' | 'ADMIN'

// 책 언어
type BookLanguage = 'EN' | 'KO' | 'ZH' | 'JA' | 'ES'

// UI 로케일
type Locale = 'en' | 'ko' | 'zh' | 'ja' | 'es'

// 읽기 난이도
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

// 리더 테마
type ReaderTheme = 'light' | 'dark' | 'sepia'
```

## API 응답 형식

### 성공 응답
```typescript
interface SuccessResponse<T> {
  data: T;
  message?: string;
}
```

### 에러 응답
```typescript
interface ErrorResponse {
  error: string;
  code?: string; // ErrorCode enum 참조
}
```

### 페이지네이션 응답
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 컴포넌트 구조

### Props 인터페이스
- **규칙**: 컴포넌트명 + `Props`
- **예시**: `BookCardProps`, `SearchBarProps`

```typescript
interface BookCardProps {
  book: Book;
  onSelect?: (bookId: string) => void;
  isLoading?: boolean;
}
```

### 컴포넌트 파일 구조
```typescript
// 1. 임포트
import { ... } from '...';

// 2. Props 인터페이스
interface ComponentNameProps {
  // ...
}

// 3. 컴포넌트 정의
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // ...
}
```

## 파일 구조 예시

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/         # 공개 라우트 그룹
│   │   ├── (protected)/      # 인증 필요 라우트 그룹
│   │   └── (admin)/          # 관리자 라우트 그룹
│   └── api/
│       ├── auth/
│       ├── books/
│       ├── user/
│       └── admin/
├── components/
│   ├── ui/                   # shadcn/ui 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트
│   ├── books/                # 책 관련 컴포넌트
│   ├── reader/               # EPUB 리더 컴포넌트
│   ├── search/               # 검색 컴포넌트
│   ├── library/              # 서재 컴포넌트
│   └── admin/                # 관리자 컴포넌트
├── lib/                      # 외부 서비스 클라이언트
├── hooks/                    # 커스텀 훅
├── types/                    # TypeScript 타입
├── constants/                # 상수 및 Enum
└── i18n/                     # 다국어 설정
```

## 주의사항

1. **일관성 유지**: 한 가지 스타일을 선택했으면 프로젝트 전체에서 동일하게 사용
2. **명확한 이름**: 축약어보다 명확한 전체 단어 사용 (예: `btn` → `button`)
3. **상수 사용**: 하드코딩된 문자열 대신 `src/constants/naming.ts`의 상수 사용
4. **타입 안전성**: 문자열 리터럴 대신 타입 정의 사용
