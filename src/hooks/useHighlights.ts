'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

const getStorageKey = (bookId: string) => `highlights-${bookId}`;

const loadFromStorage = (bookId: string): HighlightData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(getStorageKey(bookId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (bookId: string, highlights: HighlightData[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(bookId), JSON.stringify(highlights));
  } catch (error) {
    console.error('Failed to save highlights to localStorage:', error);
  }
};

export function useHighlights({ bookId }: UseHighlightsOptions): UseHighlightsReturn {
  const { data: session, status } = useSession();
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current && highlights.length >= 0) {
      saveToStorage(bookId, highlights);
    }
  }, [highlights, bookId]);

  useEffect(() => {
    const loadHighlights = async () => {
      const localHighlights = loadFromStorage(bookId);
      if (localHighlights.length > 0) {
        setHighlights(localHighlights);
      }

      if (status === 'loading') {
        return;
      }

      if (session?.user) {
        try {
          const response = await fetch(`/api/user/highlights/${bookId}`);
          if (response.ok) {
            const data = await response.json();
            const serverHighlights: HighlightData[] = data.data || [];

            if (serverHighlights.length > 0) {
              const mergedHighlights = [...serverHighlights];
              const serverCfiRanges = new Set(serverHighlights.map(h => h.cfiRange));

              for (const localH of localHighlights) {
                if (!serverCfiRanges.has(localH.cfiRange) && localH.id.startsWith('local-')) {
                  mergedHighlights.push(localH);
                }
              }

              setHighlights(mergedHighlights);
            } else if (localHighlights.length > 0) {
              setHighlights(localHighlights);
            }
          }
        } catch (error) {
          console.error('Failed to load highlights from server:', error);
        }
      }

      initialLoadDone.current = true;
      setIsLoading(false);
    };

    loadHighlights();
  }, [bookId, session, status]);

  const addHighlight = useCallback(
    async (cfiRange: string, text: string, color: HighlightColor = 'yellow', note?: string): Promise<HighlightData | null> => {
      const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newHighlight: HighlightData = {
        id: localId,
        cfiRange,
        text,
        color,
        note: note || null,
        createdAt: new Date().toISOString(),
      };

      setHighlights((prev) => [...prev, newHighlight]);

      if (session?.user) {
        try {
          const response = await fetch(`/api/user/highlights/${bookId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cfiRange, text, color, note }),
          });

          if (response.ok) {
            const data = await response.json();
            setHighlights((prev) =>
              prev.map((h) => (h.id === localId ? data.data : h))
            );
            toast.success('Highlight saved');
            return data.data;
          } else {
            console.error('Server save failed, keeping local highlight');
            toast.info('Saved locally');
            return newHighlight;
          }
        } catch (error) {
          console.error('Failed to add highlight to server:', error);
          toast.info('Saved locally');
          return newHighlight;
        }
      } else {
        toast.success('Highlight saved');
        return newHighlight;
      }
    },
    [bookId, session]
  );

  const updateHighlight = useCallback(
    async (id: string, updates: { note?: string; color?: HighlightColor }) => {
      const previousHighlight = highlights.find((h) => h.id === id);
      if (!previousHighlight) return;

      setHighlights((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );

      if (id.startsWith('local-')) {
        return;
      }

      if (session?.user) {
        try {
          const response = await fetch(`/api/user/highlights/item/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            console.error('Failed to update highlight on server');
          }
        } catch (error) {
          console.error('Failed to update highlight:', error);
        }
      }
    },
    [session, highlights]
  );

  const removeHighlight = useCallback(
    async (id: string) => {
      const previousHighlight = highlights.find((h) => h.id === id);
      if (!previousHighlight) return;

      setHighlights((prev) => prev.filter((h) => h.id !== id));
      toast.success('Highlight deleted');

      if (id.startsWith('local-')) {
        return;
      }

      if (session?.user) {
        try {
          const response = await fetch(`/api/user/highlights/item/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            setHighlights((prev) => [...prev, previousHighlight]);
            toast.error('Failed to delete from server');
          }
        } catch (error) {
          setHighlights((prev) => [...prev, previousHighlight]);
          toast.error('Failed to delete');
          console.error('Failed to remove highlight:', error);
        }
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