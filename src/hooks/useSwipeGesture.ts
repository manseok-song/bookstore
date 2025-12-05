'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SwipeConfig {
  threshold?: number; // 스와이프 인식 최소 거리 (px)
  preventDefaultTouchMove?: boolean; // 기본 스크롤 방지
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface UseSwipeGestureReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useSwipeGesture({
  threshold = 50,
  preventDefaultTouchMove = false,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: SwipeConfig): UseSwipeGestureReturn {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchMoveRef = useRef<TouchPoint | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchMoveRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // 가로 스와이프가 우세하면 기본 스크롤 방지
    if (preventDefaultTouchMove) {
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  }, [preventDefaultTouchMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null;
      return;
    }

    const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
    const deltaY = touchMoveRef.current.y - touchStartRef.current.y;
    const deltaTime = touchMoveRef.current.time - touchStartRef.current.time;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // 너무 느린 스와이프는 무시 (500ms 이상)
    if (deltaTime > 500) {
      touchStartRef.current = null;
      touchMoveRef.current = null;
      return;
    }

    // 가로 스와이프가 우세
    if (absX > absY && absX >= threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    // 세로 스와이프가 우세
    else if (absY > absX && absY >= threshold) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

// 간단한 사용을 위한 ref 기반 훅
export function useSwipeGestureRef(
  config: SwipeConfig
): React.RefCallback<HTMLElement> {
  const elementRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);

  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = config;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (deltaTime <= 500) {
        if (absX > absY && absX >= threshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else if (absY > absX && absY >= threshold) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);
}
