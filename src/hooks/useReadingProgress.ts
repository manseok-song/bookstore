'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface UseReadingProgressOptions {
  bookId: string;
  debounceMs?: number;
}

interface UseReadingProgressReturn {
  saveProgress: (cfi: string, percentage: number) => void;
  initialCfi: string | null;
  isLoading: boolean;
}

export function useReadingProgress({
  bookId,
  debounceMs = 3000,
}: UseReadingProgressOptions): UseReadingProgressReturn {
  const { data: session } = useSession();
  const [initialCfi, setInitialCfi] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<{ cfi: string; percentage: number } | null>(null);

  // 초기 진행률 로드
  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/user/progress/${bookId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.currentCfi) {
            setInitialCfi(data.data.currentCfi);
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [bookId, session]);

  // 진행률 저장 (디바운스)
  const saveProgress = useCallback(
    (cfi: string, percentage: number) => {
      if (!session?.user) return;

      // 이전과 동일하면 저장하지 않음
      if (
        lastSavedRef.current?.cfi === cfi &&
        lastSavedRef.current?.percentage === percentage
      ) {
        return;
      }

      // 기존 타이머 취소
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // 디바운스 저장
      debounceRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/user/progress/${bookId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cfi, percentage }),
          });
          lastSavedRef.current = { cfi, percentage };
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }, debounceMs);
    },
    [bookId, session, debounceMs]
  );

  // 컴포넌트 언마운트 시 즉시 저장
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    saveProgress,
    initialCfi,
    isLoading,
  };
}
