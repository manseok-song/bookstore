# EPUB 뷰어 기능 정리

## 개요
epub.js 라이브러리를 사용한 EPUB 전자책 뷰어입니다.

---

## 핵심 컴포넌트

### 1. EpubReader (`src/components/reader/EpubReader.tsx`)
메인 뷰어 컴포넌트로 모든 하위 컴포넌트와 훅을 통합합니다.

**Props:**
- `bookId`: 책 ID
- `epubUrl`: EPUB 파일 URL
- `title`: 책 제목

**기능:**
- 테마 적용 (light, dark, sepia)
- 키보드 네비게이션 (←, →, Space)
- 클릭 네비게이션 (좌측 25%, 우측 25% 영역)

### 2. ReaderControls (`src/components/reader/ReaderControls.tsx`)
설정 및 북마크 관리 컨트롤입니다.

**설정 옵션:**
- 테마: Light / Dark / Sepia
- 폰트 크기: 12px ~ 24px
- 폰트 종류: Serif / Sans / Mono
- 줄 간격: 1.2 ~ 2.0

### 3. TOCSidebar (`src/components/reader/TOCSidebar.tsx`)
목차 사이드바입니다.

### 4. ProgressBar (`src/components/reader/ProgressBar.tsx`)
하단 진행률 표시 바입니다.

### 5. HighlightPopup (`src/components/reader/HighlightPopup.tsx`)
텍스트 선택 시 나타나는 하이라이트 팝업입니다.

**색상 옵션:**
- Yellow, Green, Blue, Pink

### 6. HighlightSidebar (`src/components/reader/HighlightSidebar.tsx`)
저장된 하이라이트 목록을 표시합니다.

---

## 커스텀 훅

### 1. useEpubReader (`src/hooks/useEpubReader.ts`)
epub.js 라이브러리 래퍼 훅입니다.

**반환값:**
```typescript
{
  isLoading: boolean;
  error: string | null;
  currentCfi: string;           // 현재 위치 (CFI)
  percentage: number;           // 진행률 (0-100)
  toc: TocItem[];              // 목차
  settings: ReaderSettings;     // 현재 설정
  goToLocation: (cfi: string) => void;
  goNext: () => void;
  goPrev: () => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  containerRef: React.RefCallback<HTMLDivElement>;
  addHighlightToRenderer: (cfiRange: string, color: HighlightColor) => void;
  removeHighlightFromRenderer: (cfiRange: string) => void;
}
```

### 2. useReadingProgress (`src/hooks/useReadingProgress.ts`)
읽기 진행률 저장/복원 훅입니다.

**기능:**
- 페이지 이동 시 자동 저장 (debounce 적용)
- 다음 접속 시 마지막 위치에서 시작

**API:**
- GET/POST `/api/user/progress/[bookId]`

### 3. useBookmarks (`src/hooks/useBookmarks.ts`)
북마크 관리 훅입니다.

**반환값:**
```typescript
{
  bookmarks: BookmarkData[];
  isLoading: boolean;
  addBookmark: (cfi: string, note?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  updateBookmark: (bookmarkId: string, note: string) => Promise<void>;
  isBookmarked: (cfi: string) => boolean;
}
```

**API:**
- GET/POST `/api/user/bookmarks/[bookId]`
- PATCH/DELETE `/api/user/bookmarks/item/[id]`

### 4. useHighlights (`src/hooks/useHighlights.ts`)
하이라이트 관리 훅입니다.

**반환값:**
```typescript
{
  highlights: HighlightData[];
  isLoading: boolean;
  addHighlight: (cfiRange, text, color, note?) => Promise<HighlightData | null>;
  updateHighlight: (id, updates) => Promise<void>;
  removeHighlight: (id) => Promise<void>;
  getHighlightByCfi: (cfiRange) => HighlightData | undefined;
}
```

**API:**
- GET/POST `/api/user/highlights/[bookId]`
- PATCH/DELETE `/api/user/highlights/item/[id]`

---

## API 엔드포인트

### 읽기 진행률
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/user/progress/[bookId]` | 진행률 조회 |
| POST | `/api/user/progress/[bookId]` | 진행률 저장 |

### 북마크
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/user/bookmarks/[bookId]` | 북마크 목록 |
| POST | `/api/user/bookmarks/[bookId]` | 북마크 추가 |
| PATCH | `/api/user/bookmarks/item/[id]` | 북마크 수정 |
| DELETE | `/api/user/bookmarks/item/[id]` | 북마크 삭제 |

### 하이라이트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/user/highlights/[bookId]` | 하이라이트 목록 |
| POST | `/api/user/highlights/[bookId]` | 하이라이트 추가 |
| PATCH | `/api/user/highlights/item/[id]` | 하이라이트 수정 |
| DELETE | `/api/user/highlights/item/[id]` | 하이라이트 삭제 |

---

## 데이터 모델 (Prisma)

### ReadingProgress
```prisma
model ReadingProgress {
  id         String   @id @default(cuid())
  userId     String
  bookId     String
  cfi        String   // EPUB CFI 위치
  percentage Int      @default(0)
  updatedAt  DateTime @updatedAt

  @@unique([userId, bookId])
}
```

### Bookmark
```prisma
model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  bookId    String
  cfi       String   // EPUB CFI 위치
  note      String?  // 북마크 이름
  createdAt DateTime @default(now())

  @@index([userId, bookId])
}
```

### Highlight
```prisma
model Highlight {
  id        String   @id @default(cuid())
  userId    String
  bookId    String
  cfiRange  String   // EPUB CFI 범위
  text      String   @db.Text
  color     String   @default("yellow")
  note      String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, bookId])
}
```

---

## 타입 정의 (`src/types/index.ts`)

```typescript
// 리더 설정
interface ReaderSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  lineHeight: number;
}

// 목차 항목
interface TocItem {
  id: string;
  label: string;
  href: string;
  level: number;
  children?: TocItem[];
}

// 북마크
interface BookmarkData {
  id: string;
  cfi: string;
  note?: string;
  createdAt: string;
}

// 하이라이트
interface HighlightData {
  id: string;
  cfiRange: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  note?: string;
  createdAt: string;
}
```

---

## 사용 예시

```tsx
// 리더 페이지에서 사용
import { EpubReader } from '@/components/reader/EpubReader';

export default function ReaderPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);

  return (
    <EpubReader
      bookId={book.id}
      epubUrl={`/api/books/${book.id}/epub`}
      title={book.title}
    />
  );
}
```

---

## 알려진 이슈

1. **iframe 보안 경고**: epub.js가 `allow-scripts`와 `allow-same-origin`을 함께 사용하여 콘솔에 경고가 표시됨. EPUB 소스가 신뢰할 수 있는 경우 무시해도 됨.

2. **하이라이트 렌더링 지연**: 페이지 로드 후 500ms 지연 후 하이라이트가 적용됨 (epub.js 렌더링 완료 대기).
