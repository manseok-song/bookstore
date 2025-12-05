'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export interface HighlightData {
  id: string;
  cfiRange: string;
  text: string;
  color: string;
  note: string | null;
  createdAt: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

interface UseHighlightsOptions {
  bookId: string;
}

interface UseHighlightsReturn {
  highlights: HighlightData[];
  isLoading: boolean;
  addHighlight: (cfiRange: string, text: string, color?: HighlightColor, note?: string) => Promise<HighlightData | null>;
  updateHighlight: (id: string, updates: { note?: string; color?: HighlightColor }) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  getHighlightByCfi: (cfiRange: string) => HighlightData | undefined;
}

export function useHighlights({ bookId }: UseHighlightsOptions): UseHighlightsReturn {
  const { data: session } = useSession();
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 하이라이트 목록 로드
  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const loadHighlights = async () => {
      try {
        const response = await fetch(`/api/user/highlights/${bookId}`);
        if (response.ok) {
          const data = await response.json();
          setHighlights(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load highlights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHighlights();
  }, [bookId, session]);

  // Optimistic UI: 하이라이트 추가
  const addHighlight = useCallback(
    async (cfiRange: string, text: string, color: HighlightColor = 'yellow', note?: string): Promise<HighlightData | null> => {
      if (!session?.user) return null;

      // Optimistic: 임시 ID로 먼저 UI에 추가
      const tempId = `temp-${Date.now()}`;
      const optimisticHighlight: HighlightData = {
        id: tempId,
        cfiRange,
        text,
        color,
        note: note || null,
        createdAt: new Date().toISOString(),
      };

      setHighlights((prev) => [...prev, optimisticHighlight]);

      try {
        const response = await fetch(`/api/user/highlights/${bookId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cfiRange, text, color, note }),
        });

        if (response.ok) {
          const data = await response.json();
          // 임시 하이라이트를 실제 데이터로 교체
          setHighlights((prev) =>
            prev.map((h) => (h.id === tempId ? data.data : h))
          );
          return data.data;
        } else {
          // 실패 시 롤백
          setHighlights((prev) => prev.filter((h) => h.id !== tempId));
          toast.error('Failed to save highlight');
          return null;
        }
      } catch (error) {
        // 에러 시 롤백
        setHighlights((prev) => prev.filter((h) => h.id !== tempId));
        toast.error('Failed to save highlight');
        console.error('Failed to add highlight:', error);
        return null;
      }
    },
    [bookId, session]
  );

  // Optimistic UI: 하이라이트 수정
  const updateHighlight = useCallback(
    async (id: string, updates: { note?: string; color?: HighlightColor }) => {
      if (!session?.user) return;

      // 이전 상태 저장 (롤백용)
      const previousHighlight = highlights.find((h) => h.id === id);
      if (!previousHighlight) return;

      // Optimistic: 먼저 UI 업데이트
      setHighlights((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );

      try {
        const response = await fetch(`/api/user/highlights/item/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          // 실패 시 롤백
          setHighlights((prev) =>
            prev.map((h) => (h.id === id ? previousHighlight : h))
          );
          toast.error('Failed to update highlight');
        }
      } catch (error) {
        // 에러 시 롤백
        setHighlights((prev) =>
          prev.map((h) => (h.id === id ? previousHighlight : h))
        );
        toast.error('Failed to update highlight');
        console.error('Failed to update highlight:', error);
      }
    },
    [session, highlights]
  );

  // Optimistic UI: 하이라이트 삭제
  const removeHighlight = useCallback(
    async (id: string) => {
      if (!session?.user) return;

      // 이전 상태 저장 (롤백용)
      const previousHighlight = highlights.find((h) => h.id === id);
      if (!previousHighlight) return;

      // Optimistic: 먼저 UI에서 제거
      setHighlights((prev) => prev.filter((h) => h.id !== id));

      try {
        const response = await fetch(`/api/user/highlights/item/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // 실패 시 롤백
          setHighlights((prev) => [...prev, previousHighlight]);
          toast.error('Failed to delete highlight');
        } else {
          toast.success('Highlight deleted');
        }
      } catch (error) {
        // 에러 시 롤백
        setHighlights((prev) => [...prev, previousHighlight]);
        toast.error('Failed to delete highlight');
        console.error('Failed to remove highlight:', error);
      }
    },
    [session, highlights]
  );

  const getHighlightByCfi = useCallback(
    (cfiRange: string) => {
      return highlights.find((h) => h.cfiRange === cfiRange);
    },
    [highlights]
  );

  return {
    highlights,
    isLoading,
    addHighlight,
    updateHighlight,
    removeHighlight,
    getHighlightByCfi,
  };
}
