/**
 * PubStation 네이밍 컨벤션 및 공통 상수
 *
 * 이 파일은 프로젝트 전체에서 사용되는 상수와 Enum을 정의합니다.
 * 코드 일관성을 위해 반드시 이 파일의 상수를 사용하세요.
 */

// ============================================
// 사용자 역할 (User Role)
// ============================================
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ============================================
// 구독 상태 (Subscription Status)
// ============================================
export const SubscriptionStatus = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  CANCELLED: 'CANCELLED',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

// ============================================
// 책 언어 (Book Language)
// ============================================
export const BookLanguage = {
  EN: 'EN',
  KO: 'KO',
  ZH: 'ZH',
  JA: 'JA',
  ES: 'ES',
} as const;
export type BookLanguage = (typeof BookLanguage)[keyof typeof BookLanguage];

export const BOOK_LANGUAGE_LABELS: Record<BookLanguage, string> = {
  EN: 'English',
  KO: '한국어',
  ZH: '中文',
  JA: '日本語',
  ES: 'Español',
};

// ============================================
// UI 로케일 (UI Locale) - next-intl용
// ============================================
export const Locale = {
  EN: 'en',
  KO: 'ko',
  ZH: 'zh',
  JA: 'ja',
  ES: 'es',
} as const;
export type Locale = (typeof Locale)[keyof typeof Locale];

export const LOCALES = Object.values(Locale);
export const DEFAULT_LOCALE: Locale = Locale.EN;

// ============================================
// 읽기 난이도 (Reading Difficulty)
// ============================================
export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

// ============================================
// 리더 테마 (Reader Theme)
// ============================================
export const ReaderTheme = {
  LIGHT: 'light',
  DARK: 'dark',
  SEPIA: 'sepia',
  AUTO: 'auto',
  HIGH_CONTRAST: 'high-contrast',
} as const;
export type ReaderTheme = (typeof ReaderTheme)[keyof typeof ReaderTheme];

// ============================================
// 장르 (Genre)
// ============================================
export const Genre = {
  FICTION: 'FICTION',
  NON_FICTION: 'NON_FICTION',
  MYSTERY: 'MYSTERY',
  ROMANCE: 'ROMANCE',
  SCIENCE_FICTION: 'SCIENCE_FICTION',
  FANTASY: 'FANTASY',
  BIOGRAPHY: 'BIOGRAPHY',
  HISTORY: 'HISTORY',
  PHILOSOPHY: 'PHILOSOPHY',
  POETRY: 'POETRY',
  DRAMA: 'DRAMA',
  ADVENTURE: 'ADVENTURE',
  HORROR: 'HORROR',
  CLASSIC: 'CLASSIC',
  CHILDREN: 'CHILDREN',
} as const;
export type Genre = (typeof Genre)[keyof typeof Genre];

// ============================================
// 정렬 옵션 (Sort Options)
// ============================================
export const SortOption = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TITLE_ASC: 'title_asc',
  TITLE_DESC: 'title_desc',
  POPULAR: 'popular',
} as const;
export type SortOption = (typeof SortOption)[keyof typeof SortOption];

// ============================================
// 페이지네이션 기본값
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================
// 무료 티어 제한
// ============================================
export const FREE_TIER = {
  MAX_BOOKS_PER_MONTH: 3,
  MAX_DOWNLOADS_PER_MONTH: 3,
} as const;

// ============================================
// 파일 제한
// ============================================
export const FILE_LIMITS = {
  MAX_EPUB_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_COVER_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_EPUB_TYPES: ['application/epub+zip'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// ============================================
// API 에러 코드
// ============================================
export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FREE_TIER_LIMIT_EXCEEDED: 'FREE_TIER_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================
// 캐시 TTL (초 단위)
// ============================================
export const CACHE_TTL = {
  BOOK_LIST: 60 * 5, // 5분
  BOOK_DETAIL: 60 * 10, // 10분
  USER_LIBRARY: 60 * 2, // 2분
  SEARCH_RESULTS: 60 * 3, // 3분
} as const;

// ============================================
// 쿠키 이름
// ============================================
export const COOKIE_NAMES = {
  LOCALE: 'NEXT_LOCALE',
  READER_THEME: 'reader-theme',
  READER_FONT_SIZE: 'reader-font-size',
} as const;

// ============================================
// 로컬 스토리지 키
// ============================================
export const STORAGE_KEYS = {
  READING_PROGRESS: 'reading-progress',
  BOOKMARKS: 'bookmarks',
  READER_SETTINGS: 'reader-settings',
} as const;
