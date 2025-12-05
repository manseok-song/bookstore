/**
 * Analytics Event Taxonomy for EPUB Reader
 * 모든 분석 이벤트의 타입 정의
 */

// 이벤트 이름 상수
export const AnalyticsEvents = {
  // 리더 관련
  READER_OPENED: 'reader_opened',
  READER_PAGE_TURN: 'reader_page_turn',
  READER_PROGRESS: 'reader_progress',
  READER_ERROR: 'reader_error',
  SESSION_END: 'session_end',

  // 기능 사용
  FEATURE_USED: 'feature_used',

  // 책 관련
  BOOK_SEARCH: 'book_search',
  BOOK_FAVORITE: 'book_favorite',
  BOOK_DOWNLOAD: 'book_download',

  // 사용자 관련
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  SUBSCRIPTION_STARTED: 'subscription_started',
} as const;

// 이벤트 타입
export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

// 기본 이벤트 속성 타입 (index signature 포함)
interface BaseEventProps {
  [key: string]: unknown;
}

// 이벤트 속성 타입
export interface ReaderOpenedProps extends BaseEventProps {
  book_id: string;
  book_title?: string;
  language?: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
}

export interface PageTurnProps extends BaseEventProps {
  book_id: string;
  direction: 'forward' | 'backward';
  method: 'swipe' | 'tap' | 'keyboard' | 'scrubber';
}

export interface ReaderProgressProps extends BaseEventProps {
  book_id: string;
  percentage: number;
  chapter?: string;
  time_spent_seconds?: number;
}

export interface FeatureUsedProps extends BaseEventProps {
  feature_name:
    | 'highlight'
    | 'bookmark'
    | 'translate'
    | 'dictionary'
    | 'search'
    | 'tts'
    | 'share'
    | 'settings';
  book_id?: string;
}

export interface ReaderErrorProps extends BaseEventProps {
  error_code: string;
  error_message?: string;
  book_id?: string;
  chapter_id?: string;
}

export interface SessionEndProps extends BaseEventProps {
  book_id: string;
  total_duration_seconds: number;
  pages_read: number;
  final_progress: number;
}

export interface BookSearchProps extends BaseEventProps {
  query: string;
  results_count: number;
}

export interface BookFavoriteProps extends BaseEventProps {
  book_id: string;
  action: 'add' | 'remove';
}

// 기기 타입 감지
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
