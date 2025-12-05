/**
 * PubStation TypeScript 타입 정의
 */

import type {
  BookLanguage,
  Difficulty,
  Genre,
  SubscriptionStatus,
  UserRole,
  Locale,
  ReaderTheme,
  ErrorCode,
} from '@/constants';

// ============================================
// 데이터베이스 모델 타입
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate: Date | null;
  monthlyBooksRead: number;
  lastBookResetDate: Date;
  preferredLocale: Locale;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverUrl: string | null;
  epubUrl: string;
  language: BookLanguage;
  genre: Genre;
  difficulty: Difficulty;
  pageCount: number | null;
  publishedYear: number | null;
  gutenbergId: string | null;
  isPublicDomain: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentCfi: string; // EPUB CFI (Canonical Fragment Identifier)
  percentage: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  cfi: string;
  note: string | null;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
}

// ============================================
// API 요청/응답 타입
// ============================================

// 성공 응답
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 에러 응답
export interface ApiError {
  error: string;
  code?: ErrorCode;
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================
// 책 관련 타입
// ============================================

// 책 목록 조회 파라미터
export interface GetBooksParams {
  page?: number;
  limit?: number;
  language?: BookLanguage;
  genre?: Genre;
  difficulty?: Difficulty;
  sort?: 'newest' | 'oldest' | 'popular' | 'title_asc' | 'title_desc';
  q?: string; // 검색어
}

// 책 카드용 간략 정보
export interface BookCardData {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  language: BookLanguage;
  genre: Genre;
  difficulty: Difficulty;
}

// 책 상세 정보 (관련 데이터 포함)
export interface BookDetail extends Book {
  isFavorited?: boolean;
  readingProgress?: number;
  similarBooks?: BookCardData[];
}

// ============================================
// 사용자 관련 타입
// ============================================

// 서재 아이템
export interface LibraryItem {
  book: BookCardData;
  progress: number;
  lastReadAt: Date;
}

// 사용자 통계
export interface UserStats {
  totalBooksRead: number;
  totalReadingTime: number; // minutes
  favoriteCount: number;
  currentStreak: number; // days
}

// ============================================
// 검색 관련 타입
// ============================================

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  language: BookLanguage;
  genre: Genre;
  snippet?: string; // 검색어가 포함된 텍스트 조각
}

export interface SearchSuggestion {
  type: 'book' | 'author' | 'genre';
  value: string;
  count?: number;
}

// ============================================
// EPUB 리더 관련 타입
// ============================================

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number; // 12-24
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  lineHeight: number; // 1.2-2.0
  spread: 'auto' | 'none'; // 두 페이지 보기 설정
}

export interface TocItem {
  id: string;
  label: string;
  href: string;
  level: number;
  children?: TocItem[];
}

export interface BookmarkData {
  id: string;
  cfi: string;
  note: string | null;
  createdAt: Date;
  displayText?: string; // 북마크 위치의 텍스트 미리보기
}

// ============================================
// 관리자 관련 타입
// ============================================

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalBooks: number;
  totalReads: number;
  recentSignups: number; // 최근 7일
  popularBooks: BookCardData[];
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  language: BookLanguage;
  genre: Genre;
  difficulty: Difficulty;
  publishedYear?: number;
  gutenbergId?: string;
  epubFile?: File;
  coverFile?: File;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{
    fileName: string;
    error: string;
  }>;
}

// ============================================
// 결제 관련 타입
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

// ============================================
// 컴포넌트 Props 타입
// ============================================

export interface BookCardProps {
  book: BookCardData;
  onSelect?: (bookId: string) => void;
  showProgress?: boolean;
  progress?: number;
}

export interface BookGridProps {
  books: BookCardData[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
