/**
 * PostHog Analytics Client
 */

import posthog from 'posthog-js';
import {
  AnalyticsEvents,
  type ReaderOpenedProps,
  type PageTurnProps,
  type ReaderProgressProps,
  type FeatureUsedProps,
  type ReaderErrorProps,
  type SessionEndProps,
  type BookSearchProps,
  type BookFavoriteProps,
} from './events';

// PostHog 초기화 여부
let isInitialized = false;

/**
 * PostHog 클라이언트 초기화
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('PostHog API key not configured');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    // 개인정보 보호 설정
    autocapture: false, // 자동 캡처 비활성화 (수동 이벤트만)
    capture_pageview: false, // 페이지뷰 수동 처리
    capture_pageleave: true,
    persistence: 'localStorage',
    // 디버그 모드 (개발 환경)
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PostHog initialized');
      }
    },
  });

  isInitialized = true;
}

/**
 * 사용자 식별
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  posthog.identify(userId, properties);
}

/**
 * 사용자 로그아웃
 */
export function resetUser() {
  if (!isInitialized) return;
  posthog.reset();
}

/**
 * 페이지뷰 추적
 */
export function trackPageView(pageName: string, properties?: Record<string, unknown>) {
  if (!isInitialized) return;
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
    ...properties,
  });
}

/**
 * 이벤트 추적 (일반)
 */
export function trackEvent<T extends Record<string, unknown>>(
  eventName: string,
  properties?: T
) {
  if (!isInitialized) return;
  posthog.capture(eventName, properties as Record<string, unknown>);
}

// ============================================
// 특정 이벤트 추적 함수들
// ============================================

/**
 * 리더 열기 추적
 */
export function trackReaderOpened(props: ReaderOpenedProps) {
  trackEvent(AnalyticsEvents.READER_OPENED, props);
}

/**
 * 페이지 넘김 추적
 */
export function trackPageTurn(props: PageTurnProps) {
  trackEvent(AnalyticsEvents.READER_PAGE_TURN, props);
}

/**
 * 진행률 추적 (10% 단위로만 기록)
 */
let lastTrackedProgress = -1;
export function trackReaderProgress(props: ReaderProgressProps) {
  const roundedProgress = Math.floor(props.percentage / 10) * 10;

  // 10% 단위로 변경된 경우만 추적
  if (roundedProgress !== lastTrackedProgress && roundedProgress > lastTrackedProgress) {
    lastTrackedProgress = roundedProgress;
    trackEvent(AnalyticsEvents.READER_PROGRESS, {
      ...props,
      percentage: roundedProgress,
    });
  }
}

/**
 * 진행률 추적 리셋 (새 책 열 때)
 */
export function resetProgressTracking() {
  lastTrackedProgress = -1;
}

/**
 * 기능 사용 추적
 */
export function trackFeatureUsed(props: FeatureUsedProps) {
  trackEvent(AnalyticsEvents.FEATURE_USED, props);
}

/**
 * 에러 추적
 */
export function trackReaderError(props: ReaderErrorProps) {
  trackEvent(AnalyticsEvents.READER_ERROR, props);
}

/**
 * 세션 종료 추적
 */
export function trackSessionEnd(props: SessionEndProps) {
  trackEvent(AnalyticsEvents.SESSION_END, props);
}

/**
 * 책 검색 추적
 */
export function trackBookSearch(props: BookSearchProps) {
  trackEvent(AnalyticsEvents.BOOK_SEARCH, props);
}

/**
 * 즐겨찾기 추적
 */
export function trackBookFavorite(props: BookFavoriteProps) {
  trackEvent(AnalyticsEvents.BOOK_FAVORITE, props);
}

/**
 * PostHog 인스턴스 반환 (고급 사용)
 */
export function getPostHog() {
  return isInitialized ? posthog : null;
}
