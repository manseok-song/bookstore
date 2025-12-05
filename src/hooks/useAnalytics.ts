'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  initPostHog,
  identifyUser,
  resetUser,
  trackPageView,
  trackReaderOpened,
  trackPageTurn,
  trackReaderProgress,
  trackFeatureUsed,
  trackSessionEnd,
  resetProgressTracking,
} from '@/lib/analytics/posthog';
import { setUser as setSentryUser, addBreadcrumb } from '@/lib/analytics/sentry';
import { getDeviceType, type FeatureUsedProps } from '@/lib/analytics/events';

/**
 * Analytics 초기화 및 사용을 위한 훅
 */
export function useAnalytics() {
  const { data: session } = useSession();
  const isInitializedRef = useRef(false);

  // 초기화
  useEffect(() => {
    if (isInitializedRef.current) return;

    initPostHog();
    isInitializedRef.current = true;
  }, []);

  // 사용자 식별
  useEffect(() => {
    if (session?.user?.id) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
      setSentryUser({
        id: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name || undefined,
      });
    } else {
      resetUser();
      setSentryUser(null);
    }
  }, [session]);

  return {
    trackPageView,
    trackEvent: trackPageView,
  };
}

/**
 * 리더 전용 Analytics 훅
 */
export function useReaderAnalytics(bookId: string, bookTitle?: string, language?: string) {
  const sessionStartRef = useRef<number>(Date.now());
  const pagesReadRef = useRef<number>(0);
  const lastProgressRef = useRef<number>(0);

  // 리더 열기 추적
  useEffect(() => {
    sessionStartRef.current = Date.now();
    pagesReadRef.current = 0;
    lastProgressRef.current = 0;

    resetProgressTracking();

    trackReaderOpened({
      book_id: bookId,
      book_title: bookTitle,
      language,
      device_type: getDeviceType(),
    });

    addBreadcrumb('reader', 'Reader opened', { book_id: bookId });

    // 세션 종료 시 추적
    return () => {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      trackSessionEnd({
        book_id: bookId,
        total_duration_seconds: duration,
        pages_read: pagesReadRef.current,
        final_progress: lastProgressRef.current,
      });

      addBreadcrumb('reader', 'Reader closed', {
        book_id: bookId,
        duration,
        pages_read: pagesReadRef.current,
      });
    };
  }, [bookId, bookTitle, language]);

  // 페이지 넘김 추적
  const trackPageTurnEvent = useCallback(
    (direction: 'forward' | 'backward', method: 'swipe' | 'tap' | 'keyboard' | 'scrubber') => {
      if (direction === 'forward') {
        pagesReadRef.current += 1;
      }

      trackPageTurn({
        book_id: bookId,
        direction,
        method,
      });

      addBreadcrumb('reader', `Page turn ${direction}`, { method });
    },
    [bookId]
  );

  // 진행률 추적
  const trackProgress = useCallback(
    (percentage: number, chapter?: string) => {
      lastProgressRef.current = percentage;

      trackReaderProgress({
        book_id: bookId,
        percentage,
        chapter,
        time_spent_seconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
      });
    },
    [bookId]
  );

  // 기능 사용 추적
  const trackFeature = useCallback(
    (featureName: FeatureUsedProps['feature_name']) => {
      trackFeatureUsed({
        feature_name: featureName,
        book_id: bookId,
      });

      addBreadcrumb('feature', `Used ${featureName}`, { book_id: bookId });
    },
    [bookId]
  );

  return {
    trackPageTurn: trackPageTurnEvent,
    trackProgress,
    trackFeature,
  };
}
