# PubStation MVP 개발 기획서
**글로벌 퍼블릭 도메인 전자책 플랫폼**

---

## 📋 프로젝트 개요

### 목표
50만권의 퍼블릭 도메인 전자책을 5개 언어(한국어, 영어, 중국어, 일본어, 스페인어)로 제공하는 글로벌 전자책 플랫폼 MVP 개발

### 개발 기간
12-16주 (3-4개월)

### MVP 범위
- ✅ 웹 플랫폼 (반응형)
- ✅ 5개 언어 지원
- ✅ EPUB 뷰어
- ✅ 검색 및 탐색
- ✅ 회원 시스템
- ✅ Freemium 구독 모델
- ✅ 관리자 페이지
- ❌ 모바일 네이티브 앱 (Phase 2)
- ❌ 출판사 정산 시스템 (Phase 2)
- ❌ 소셜 기능 (Phase 2)

---

## 🛠️ 기술 스택 (확정)

### **백엔드**
```yaml
Runtime: Node.js 20.x
Framework: Next.js 14 (App Router)
  - API Routes for backend
  - Server Components for SSR
  - Built-in i18n support

Database:
  Primary: PostgreSQL 16
    - User data, metadata, subscriptions
  Cache: Redis 7
    - Session management
    - API caching
  Search: Meilisearch
    - Fast, typo-tolerant search
    - Multi-language support
    - Easier than Elasticsearch for MVP

Authentication: NextAuth.js v5
  - Email/Password
  - OAuth (Google, later)

Payment: Stripe
  - Subscription management
  - Multi-currency support

File Storage: Google Cloud Storage
  - EPUB files storage
  - Cover images

ORM: Prisma
  - Type-safe database access
  - Easy migrations
```

### **프론트엔드**
```yaml
Framework: Next.js 14 (React 18)
Language: TypeScript 5
Styling: Tailwind CSS 3
UI Components: shadcn/ui
  - Pre-built accessible components
  - Customizable

State Management: 
  - React Server Components (default)
  - Zustand (client state if needed)

Forms: React Hook Form + Zod
  - Type-safe form validation

i18n: next-intl
  - Server-side translations
  - Static generation support

EPUB Viewer: epub.js
  - React wrapper
  - Customizable reader
```

### **인프라**
```yaml
Hosting: Google Cloud Run
  - Containerized deployment
  - Auto-scaling
  - Global load balancing

Database Hosting:
  Option A: Google Cloud SQL (PostgreSQL)
  Option B: Supabase

Cache: Google Cloud Memorystore (Redis)

Search Hosting: Meilisearch Cloud

File Storage: Google Cloud Storage

Monitoring: Google Cloud Monitoring
```

### **개발 도구**
```yaml
Package Manager: pnpm
Code Quality: ESLint, Prettier
Git Workflow: main, develop, feature/*
Testing: Jest, Playwright (E2E)
```

---

## 📁 프로젝트 구조

```
pubstation/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # i18n routing
│   │   │   ├── (public)/            # Public pages
│   │   │   │   ├── page.tsx         # Homepage
│   │   │   │   ├── browse/          # Browse books
│   │   │   │   ├── book/[id]/       # Book detail
│   │   │   │   ├── reader/[id]/     # EPUB reader
│   │   │   │   ├── search/          # Search page
│   │   │   │   ├── auth/            # Login/Signup
│   │   │   │   └── pricing/         # Pricing page
│   │   │   ├── (protected)/         # Auth required
│   │   │   │   ├── library/         # User library
│   │   │   │   ├── profile/         # User profile
│   │   │   │   └── settings/        # Settings
│   │   │   └── (admin)/             # Admin only
│   │   │       ├── dashboard/
│   │   │       ├── books/           # Book management
│   │   │       └── users/           # User management
│   │   └── api/                      # API Routes
│   │       ├── auth/[...nextauth]/
│   │       ├── books/
│   │       ├── search/
│   │       ├── user/
│   │       └── webhooks/stripe/
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/                   # Layout components
│   │   ├── books/                    # Book-related components
│   │   ├── reader/                   # EPUB reader components
│   │   └── admin/                    # Admin components
│   ├── lib/
│   │   ├── db/                       # Database client
│   │   ├── auth/                     # Auth config
│   │   ├── stripe/                   # Stripe integration
│   │   ├── gcs/                      # Google Cloud Storage client
│   │   ├── search/                   # Meilisearch client
│   │   └── utils/                    # Utility functions
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # TypeScript types
│   └── i18n/                         # Translations
│       ├── locales/
│       │   ├── en.json
│       │   ├── ko.json
│       │   ├── zh.json
│       │   ├── ja.json
│       │   └── es.json
│       └── config.ts
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/
├── public/
│   ├── covers/                       # Book covers (fallback)
│   └── assets/
├── .env.local                        # Environment variables
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

---

## 🗄️ 데이터베이스 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // hashed
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  locale        String    @default("en") // preferred language
  
  // Subscription
  subscriptionStatus SubscriptionStatus @default(FREE)
  subscriptionId     String?            @unique
  subscriptionEndsAt DateTime?
  
  // Reading
  readingProgress ReadingProgress[]
  bookmarks       Bookmark[]
  favorites       Favorite[]
  
  // Limits (for free tier)
  monthlyReadsCount Int      @default(0)
  monthlyReadsReset DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
}

enum UserRole {
  USER
  ADMIN
}

enum SubscriptionStatus {
  FREE
  PREMIUM
  CANCELLED
}

// Book Catalog
model Book {
  id          String   @id @default(cuid())
  
  // Metadata
  title       String
  author      String
  language    BookLanguage
  originalLanguage BookLanguage?
  description String?  @db.Text
  
  // Classification
  genre       String[]
  tags        String[]
  publicationYear Int?
  
  // File Info
  epubUrl     String   // GCS URL
  coverUrl    String?  // GCS URL
  fileSize    Int      // bytes
  pageCount   Int?
  
  // Search & Discovery
  searchText  String   @db.Text // for full-text search
  popularity  Int      @default(0)
  difficulty  String?  // EASY, MEDIUM, HARD
  
  // Relationships
  readingProgress ReadingProgress[]
  bookmarks       Bookmark[]
  favorites       Favorite[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([language])
  @@index([author])
  @@index([genre])
  @@index([popularity])
  @@fulltext([title, author, searchText])
}

enum BookLanguage {
  EN // English
  KO // Korean
  ZH // Chinese
  JA // Japanese
  ES // Spanish
}

// Reading Progress
model ReadingProgress {
  id         String   @id @default(cuid())
  userId     String
  bookId     String
  
  // Progress
  currentPage     Int      @default(0)
  totalPages      Int
  percentage      Float    @default(0)
  currentCfi      String?  // EPUB CFI location
  
  // Time tracking
  lastReadAt      DateTime @default(now())
  totalReadTime   Int      @default(0) // seconds
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([userId, bookId])
  @@index([userId])
}

// Bookmarks
model Bookmark {
  id         String   @id @default(cuid())
  userId     String
  bookId     String
  
  cfi        String   // EPUB CFI location
  note       String?  @db.Text
  createdAt  DateTime @default(now())
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@index([userId, bookId])
}

// Favorites
model Favorite {
  id         String   @id @default(cuid())
  userId     String
  bookId     String
  createdAt  DateTime @default(now())
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([userId, bookId])
  @@index([userId])
}
```

---

## 🔌 API 엔드포인트 설계

### **Authentication**
```typescript
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/signout
GET    /api/auth/session
POST   /api/auth/verify-email
```

### **Books**
```typescript
GET    /api/books                    # List books with pagination
  Query: ?page=1&limit=20&language=en&genre=fiction&sort=popularity

GET    /api/books/[id]               # Get single book
GET    /api/books/[id]/download      # Download EPUB (auth required)
GET    /api/books/featured           # Featured books
GET    /api/books/popular            # Popular books
GET    /api/books/recent             # Recently added
```

### **Search**
```typescript
GET    /api/search                   # Search books
  Query: ?q=shakespeare&language=en&page=1&limit=20

GET    /api/search/suggestions       # Autocomplete suggestions
```

### **User**
```typescript
GET    /api/user/library             # User's library (reading)
GET    /api/user/favorites           # User's favorites
POST   /api/user/favorites/[bookId] # Add to favorites
DELETE /api/user/favorites/[bookId] # Remove from favorites

GET    /api/user/progress/[bookId]  # Get reading progress
POST   /api/user/progress/[bookId]  # Update reading progress
  Body: { currentPage, currentCfi, percentage }

GET    /api/user/bookmarks/[bookId] # Get bookmarks
POST   /api/user/bookmarks/[bookId] # Create bookmark
DELETE /api/user/bookmarks/[id]     # Delete bookmark
```

### **Subscription**
```typescript
POST   /api/subscription/checkout    # Create Stripe checkout session
POST   /api/subscription/portal      # Stripe customer portal
GET    /api/subscription/status      # Check subscription status
POST   /api/webhooks/stripe          # Stripe webhooks
```

### **Admin**
```typescript
GET    /api/admin/books              # List all books
POST   /api/admin/books              # Create book
PUT    /api/admin/books/[id]         # Update book
DELETE /api/admin/books/[id]         # Delete book
POST   /api/admin/books/bulk-upload  # Bulk upload books

GET    /api/admin/users              # List users
GET    /api/admin/stats              # Platform statistics
```

---

## 🎨 주요 페이지 및 기능 명세

### **1. Homepage (공개)**
```typescript
Path: /[locale]

Features:
- Hero section with platform introduction
- Featured books carousel (10 books)
- Popular books grid (20 books)
- Browse by language section
- Browse by genre section
- Footer with links

UI Components:
- <HeroSection />
- <BookCarousel books={featured} />
- <BookGrid books={popular} />
- <LanguageSelector />
- <GenreGrid />

API Calls:
- GET /api/books/featured
- GET /api/books/popular
```

### **2. Browse Page (공개)**
```typescript
Path: /[locale]/browse

Features:
- Filter by:
  - Language (multi-select)
  - Genre (multi-select)
  - Author (search)
  - Publication year (range)
  - Difficulty level
- Sort by:
  - Popularity
  - Title (A-Z)
  - Author (A-Z)
  - Recently added
- Pagination (infinite scroll or pages)

UI Components:
- <FilterSidebar />
- <BookGrid />
- <Pagination />

State Management:
- URL parameters for filters/sort
- Persisted in query string
```

### **3. Book Detail Page (공개)**
```typescript
Path: /[locale]/book/[id]

Features:
- Book cover
- Title, author, year
- Description
- Genre tags
- Reading difficulty badge
- Stats (page count, reading time estimate)
- Actions:
  - "Read Now" button (→ Reader)
  - "Add to Favorites" (auth required)
  - "Download EPUB" (premium only)
- Similar books section

UI Components:
- <BookHeader />
- <BookInfo />
- <ActionButtons />
- <SimilarBooks />

API Calls:
- GET /api/books/[id]
- POST /api/user/favorites/[id] (if favorited)
```

### **4. Reader Page (보호)**
```typescript
Path: /[locale]/reader/[id]

Features:
- Full-screen EPUB reader
- Navigation:
  - Previous/Next page buttons
  - TOC (Table of Contents) sidebar
  - Progress bar
- Controls:
  - Font size adjustment
  - Theme (light/dark/sepia)
  - Font family selection
- Reading features:
  - Bookmark current page
  - Highlight text (Phase 2)
  - Notes (Phase 2)
- Auto-save reading progress

UI Components:
- <EpubReader /> (using epub.js)
- <ReaderControls />
- <TOCSidebar />
- <ProgressBar />

API Calls:
- GET /api/books/[id]/download (get EPUB file)
- POST /api/user/progress/[id] (save progress every 30s)
- GET /api/user/bookmarks/[id]
- POST /api/user/bookmarks/[id]

Reading Progress Logic:
- Track current CFI (Canonical Fragment Identifier)
- Calculate percentage read
- Update every page turn
- Batch save to reduce API calls
```

### **5. Search Page (공개)**
```typescript
Path: /[locale]/search

Features:
- Search input with autocomplete
- Real-time search results
- Filters (same as Browse page)
- Search suggestions
- Recent searches (local storage)

UI Components:
- <SearchBar autocomplete />
- <SearchFilters />
- <SearchResults />

API Calls:
- GET /api/search?q=...
- GET /api/search/suggestions?q=...
```

### **6. User Library (보호)**
```typescript
Path: /[locale]/library

Features:
- Tabs:
  - Currently Reading (with progress)
  - Favorites
  - Finished
- For each book:
  - Cover thumbnail
  - Title, author
  - Progress percentage
  - "Continue Reading" button
  - "Remove" option
- Filter/Sort options

UI Components:
- <LibraryTabs />
- <BookList />
- <ProgressBadge />

API Calls:
- GET /api/user/library
- GET /api/user/favorites
```

### **7. Pricing Page (공개)**
```typescript
Path: /[locale]/pricing

Features:
- Free tier:
  - 3 books per month
  - Ads
  - Basic reader
- Premium tier ($4.99/month):
  - Unlimited reading
  - No ads
  - Download EPUB
  - Advanced reader features
  - Priority support
- "Start Free" and "Go Premium" CTAs

UI Components:
- <PricingCards />
- <FeatureComparison />

API Calls:
- POST /api/subscription/checkout (on click)
```

### **8. Admin Dashboard (관리자)**
```typescript
Path: /[locale]/admin/dashboard

Features:
- Statistics:
  - Total books
  - Total users
  - Premium subscribers
  - Books read this month
- Recent activity
- Charts (users over time, popular books)

UI Components:
- <StatCards />
- <ActivityFeed />
- <Charts />

API Calls:
- GET /api/admin/stats
```

### **9. Admin Book Management (관리자)**
```typescript
Path: /[locale]/admin/books

Features:
- Book list table:
  - Title, author, language
  - Actions: Edit, Delete, View
- Bulk upload:
  - CSV metadata + EPUB files
  - Validation
  - Progress indicator
- Single book form:
  - All metadata fields
  - Cover upload
  - EPUB upload
  - Language selection

UI Components:
- <BookTable />
- <BulkUploadForm />
- <BookForm />

API Calls:
- GET /api/admin/books
- POST /api/admin/books
- PUT /api/admin/books/[id]
- DELETE /api/admin/books/[id]
- POST /api/admin/books/bulk-upload
```

---

## 🌐 다국어 지원 구현

### **Translation Structure**
```json
// src/i18n/locales/en.json
{
  "common": {
    "readNow": "Read Now",
    "addToFavorites": "Add to Favorites",
    "download": "Download",
    "search": "Search",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out"
  },
  "home": {
    "hero": {
      "title": "Discover 500,000 Classic Books",
      "subtitle": "in 5 Languages",
      "cta": "Start Reading Free"
    },
    "featured": "Featured Books",
    "popular": "Popular Now"
  },
  "book": {
    "author": "Author",
    "publicationYear": "Published",
    "pages": "Pages",
    "difficulty": "Difficulty",
    "similarBooks": "Similar Books"
  },
  "pricing": {
    "free": {
      "title": "Free",
      "price": "$0",
      "features": [
        "3 books per month",
        "Basic reader",
        "Ad-supported"
      ]
    },
    "premium": {
      "title": "Premium",
      "price": "$4.99/month",
      "features": [
        "Unlimited reading",
        "No ads",
        "Download EPUB",
        "Advanced reader"
      ]
    }
  }
}
```

### **Language Detection**
```typescript
// src/i18n/config.ts
export const locales = ['en', 'ko', 'zh', 'ja', 'es'] as const;
export const defaultLocale = 'en';

// Auto-detect from:
// 1. URL path (/ko/...)
// 2. User preference (database)
// 3. Browser language
// 4. Default to 'en'
```

---

## 🔐 인증 및 권한

### **User Roles**
```typescript
enum UserRole {
  USER,      // Regular user
  ADMIN      // Platform admin
}
```

### **Free Tier Limits**
```typescript
const FREE_TIER_LIMITS = {
  monthlyReads: 3,           // Books per month
  showAds: true,             // Display ads
  allowDownload: false,      // EPUB download
  advancedReader: false      // Advanced features
};
```

### **Middleware Protection**
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Protect routes
  const protectedRoutes = ['/library', '/settings', '/reader'];
  const adminRoutes = ['/admin'];
  
  // Check authentication
  // Redirect to /auth/signin if not authenticated
  
  // Check subscription for reader
  // Check admin role for admin routes
}
```

---

## 💳 결제 통합 (Stripe)

### **Subscription Flow**
```typescript
1. User clicks "Go Premium"
2. POST /api/subscription/checkout
3. Create Stripe Checkout Session
4. Redirect to Stripe
5. User completes payment
6. Stripe webhook → /api/webhooks/stripe
7. Update user subscriptionStatus to PREMIUM
8. Redirect to /library
```

### **Webhook Events**
```typescript
- checkout.session.completed  → Activate subscription
- customer.subscription.updated → Update status
- customer.subscription.deleted → Downgrade to FREE
```

---

## 📚 EPUB 뷰어 구현

### **epub.js Integration**
```typescript
// components/reader/EpubReader.tsx
import { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

export function EpubReader({ bookId, epubUrl }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book>();
  const [rendition, setRendition] = useState<Rendition>();
  
  useEffect(() => {
    // Initialize book
    const book = ePub(epubUrl);
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'always' // or 'none' for single page
    });
    
    // Display book
    rendition.display();
    
    // Navigation
    rendition.on('relocated', (location) => {
      // Save progress
      saveProgress({
        currentCfi: location.start.cfi,
        percentage: book.locations.percentageFromCfi(location.start.cfi)
      });
    });
    
    setBook(book);
    setRendition(rendition);
  }, [epubUrl]);
  
  return (
    <div className="relative h-screen">
      <div ref={viewerRef} className="w-full h-full" />
      <ReaderControls 
        rendition={rendition}
        book={book}
      />
    </div>
  );
}
```

### **Reader Features**
```typescript
// Font size
rendition.themes.fontSize('120%');

// Theme
rendition.themes.register('light', { body: { background: '#fff', color: '#000' }});
rendition.themes.select('light');

// Navigation
rendition.next(); // Next page
rendition.prev(); // Previous page

// TOC
book.loaded.navigation.then((nav) => {
  const toc = nav.toc;
  // Display table of contents
});

// Bookmarks
const cfi = rendition.currentLocation().start.cfi;
// Save to database
```

---

## 🚀 배포 및 환경 설정

### **Environment Variables**
```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@host:5432/pubstation"
REDIS_URL="redis://host:6379"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google Cloud Storage
GCS_PROJECT_ID="your-project-id"
GCS_BUCKET_NAME="pubstation-books"
GCS_KEY_FILE="./gcs-service-account.json"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### **Deployment Steps (Google Cloud Run)**
```bash
1. Push to GitHub
2. Build Docker image and push to Google Container Registry
3. Deploy to Cloud Run with environment variables
4. Configure custom domain and SSL
```

---

## 📦 필수 패키지

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^1.0.0",
    "bcryptjs": "^2.4.3",
    
    "stripe": "^14.7.0",
    
    "meilisearch": "^0.37.0",

    "@google-cloud/storage": "^7.7.0",
    
    "next-intl": "^3.4.0",
    
    "epubjs": "^0.3.93",
    "react-epub-viewer": "^0.2.1",
    
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.10",
    
    "shadcn-ui": "latest",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.294.0",
    
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.2",
    
    "zustand": "^4.4.7",
    
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/bcryptjs": "^2.4.6",
    
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",
    
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 🎯 개발 우선순위

### **Week 1-2: 프로젝트 설정**
```bash
✓ Next.js 프로젝트 초기화
✓ 디렉토리 구조 설정
✓ Tailwind CSS + shadcn/ui 설정
✓ Prisma 스키마 작성 및 마이그레이션
✓ next-intl 설정 (5개 언어)
✓ NextAuth.js 설정
```

### **Week 3-4: 기본 UI 및 인증**
```bash
✓ Layout components (Header, Footer)
✓ Homepage 구현
✓ 회원가입/로그인 페이지
✓ 다국어 전환 기능
```

### **Week 5-6: 책 목록 및 검색**
```bash
✓ Book 모델 및 API 구현
✓ Browse 페이지 (필터링, 정렬)
✓ Book Detail 페이지
✓ Meilisearch 연동 및 검색 페이지
```

### **Week 7-8: 뷰어 및 독서 기능**
```bash
✓ EPUB 뷰어 구현 (epub.js)
✓ 독서 진행률 저장
✓ 북마크 기능
✓ User Library 페이지
```

### **Week 9-10: 결제 및 프리미엄**
```bash
✓ Stripe 연동
✓ Pricing 페이지
✓ 구독 체크아웃 플로우
✓ Free tier 제한 구현
✓ Webhook 처리
```

### **Week 11-12: 관리자 및 콘텐츠 관리**
```bash
✓ Admin Dashboard
✓ Book CRUD
✓ Bulk Upload (CSV + EPUB)
✓ GCS 파일 업로드
```

### **Week 13-14: 테스트 및 배포**
```bash
✓ E2E 테스트 (주요 플로우)
✓ 성능 최적화
✓ SEO 최적화
✓ Google Cloud Run 배포
✓ 도메인 연결
```

### **Week 15-16: 폴리싱**
```bash
✓ 버그 수정
✓ UI/UX 개선
✓ 로딩 상태 처리
✓ 에러 핸들링
✓ 문서화
```

---

## 📝 Claude Code 작업 지시사항

### **초기 설정**
```bash
# 1. 프로젝트 생성
npx create-next-app@latest pubstation --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. 패키지 설치
pnpm add @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs stripe meilisearch @google-cloud/storage next-intl epubjs zod react-hook-form @hookform/resolvers zustand date-fns

pnpm add -D prisma @types/node @types/react @types/bcryptjs prettier eslint-config-next @playwright/test

# 3. shadcn/ui 설정
npx shadcn-ui@latest init

# 4. Prisma 초기화
npx prisma init

# 5. 환경 변수 설정 (.env.local 파일 생성)
```

### **개발 순서**
```
1. Prisma 스키마 작성 → 마이그레이션
2. Layout 및 기본 컴포넌트
3. 인증 시스템 (NextAuth)
4. Book API 및 페이지
5. EPUB 뷰어
6. Stripe 연동
7. Admin 페이지
8. 테스트 및 배포
```

### **테스트 데이터**
```sql
-- 테스트용 책 10권 삽입
-- 각 언어별 2권씩
-- 샘플 EPUB 파일은 Gutenberg Project에서 다운로드
```

---

## 🎨 디자인 가이드라인

### **Color Palette**
```css
/* Tailwind config */
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',  /* Main brand color */
    900: '#1e3a8a'
  },
  accent: '#f59e0b', /* Highlight color */
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#f1f5f9'
}
```

### **Typography**
```css
/* Books → Serif for elegance */
font-family: 'Merriweather', 'Noto Serif KR', serif;

/* UI → Sans-serif for readability */
font-family: 'Inter', 'Noto Sans KR', sans-serif;
```

### **Responsive Breakpoints**
```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

---

## ✅ MVP 완성 체크리스트

### **기능**
- [ ] 5개 언어 지원 (UI + 콘텐츠)
- [ ] 회원가입/로그인
- [ ] 책 목록 (필터, 정렬, 페이지네이션)
- [ ] 책 상세 페이지
- [ ] 검색 (Meilisearch)
- [ ] EPUB 뷰어 (epub.js)
- [ ] 독서 진행률 자동 저장
- [ ] 북마크 기능
- [ ] 즐겨찾기
- [ ] User Library
- [ ] Freemium 구독 (Stripe)
- [ ] 월 3권 제한 (Free tier)
- [ ] 관리자 대시보드
- [ ] 책 CRUD
- [ ] 대량 업로드

### **비기능**
- [ ] 반응형 디자인
- [ ] 로딩 상태 (Skeleton)
- [ ] 에러 처리
- [ ] SEO 최적화
- [ ] 성능 최적화 (이미지, 코드 스플리팅)
- [ ] 접근성 (a11y)
- [ ] 보안 (CSP, HTTPS)

### **배포**
- [ ] Google Cloud Run 배포
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] SSL 인증서
- [ ] Google Cloud Monitoring 설정

---

## 🚨 주의사항

1. **DRM 제외**: 퍼블릭 도메인이므로 DRM 불필요
2. **출판사 정산 제외**: Phase 2로 연기
3. **모바일 앱 제외**: 웹 우선, 반응형으로 모바일 대응
4. **소셜 기능 제외**: 리뷰/평점/커뮤니티는 Phase 2
5. **AI 기능 최소화**: 추천 시스템은 간단한 알고리즘으로 시작

---

## 📊 예상 비용 (MVP 단계)

### **개발 비용**
- 개발자 인건비 (4개월): 약 1.4억원
- 디자인: 2,000만원
- 법률 검토: 1,000만원

### **운영 비용 (월)**
- Google Cloud Run: ~$30-100 (트래픽에 따라)
- Google Cloud SQL: ~$30-50
- Google Cloud Memorystore (Redis): ~$30
- Meilisearch Cloud: $29
- Google Cloud Storage: ~$20-100 (트래픽에 따라)
- Stripe 수수료: 2.9% + $0.30 per transaction

### **총 초기 투자**
약 1.7-2억원 (4개월)

---

## 🎓 참고 자료

### **기술 문서**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [epub.js Documentation](http://epubjs.org/documentation/0.3/)
- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)

### **샘플 EPUB**
- [Project Gutenberg](https://www.gutenberg.org) - 70,000+ free ebooks

---

**이 기획서를 Claude Code에 그대로 복사하여 프로젝트를 시작하세요!**

각 섹션은 독립적으로 개발 가능하며, 우선순위에 따라 순차적으로 진행할 수 있습니다.

Good luck! 🚀
