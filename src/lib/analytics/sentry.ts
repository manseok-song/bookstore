/**
 * Sentry Error Tracking
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Sentry 초기화 (클라이언트)
 * Note: 실제 초기화는 sentry.client.config.ts에서 수행됨
 * 이 파일은 유틸리티 함수 제공
 */

/**
 * 에러 캡처
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * 메시지 캡처
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * 사용자 정보 설정
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * 태그 설정
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * 컨텍스트 설정
 */
export function setContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}

/**
 * 브레드크럼 추가 (이벤트 추적용)
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * 트랜잭션 시작 (성능 모니터링)
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({ name, op });
}

/**
 * 리더 에러 캡처 (특화)
 */
export function captureReaderError(
  error: Error,
  bookId?: string,
  chapterId?: string,
  additionalContext?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'reader');
    if (bookId) scope.setTag('book_id', bookId);
    if (chapterId) scope.setTag('chapter_id', chapterId);

    scope.setContext('reader', {
      book_id: bookId,
      chapter_id: chapterId,
      ...additionalContext,
    });

    Sentry.captureException(error);
  });
}

/**
 * API 에러 캡처 (특화)
 */
export function captureApiError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'api');
    scope.setTag('endpoint', endpoint);
    scope.setTag('method', method);
    if (statusCode) scope.setTag('status_code', String(statusCode));

    scope.setContext('api', {
      endpoint,
      method,
      status_code: statusCode,
    });

    Sentry.captureException(error);
  });
}
