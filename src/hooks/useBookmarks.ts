'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { BookmarkData } from '@/types';

interface UseBookmarksOptions {
  bookId: string;
}

interface UseBookmarksReturn {
  bookmarks: BookmarkData[];
  isLoading: boolean;
  addBookmark: (cfi: string, note?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  updateBookmark: (bookmarkId: string, note: string) => Promise<void>;
  isBookmarked: (cfi: string) => boolean;
}

export function useBookmarks({ bookId }: UseBookmarksOptions): UseBookmarksReturn {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 북마크 목록 로드
  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const loadBookmarks = async () => {
      try {
        const response = await fetch(`/api/user/bookmarks/${bookId}`);
        if (response.ok) {
          const data = await response.json();
          setBookmarks(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [bookId, session]);

  // Optimistic UI: 북마크 추가
  const addBookmark = useCallback(
    async (cfi: string, note?: string) => {
      if (!session?.user) return;

      // Optimistic: 임시 ID로 먼저 UI에 추가
      const tempId = `temp-${Date.now()}`;
      const optimisticBookmark: BookmarkData = {
        id: tempId,
        cfi,
        note: note || null,
        createdAt: new Date(),
      };

      setBookmarks((prev) => [...prev, optimisticBookmark]);

      try {
        const response = await fetch(`/api/user/bookmarks/${bookId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cfi, note }),
        });

        if (response.ok) {
          const data = await response.json();
          // 임시 북마크를 실제 데이터로 교체
          setBookmarks((prev) =>
            prev.map((b) => (b.id === tempId ? data.data : b))
          );
          toast.success('Bookmark added');
        } else {
          // 실패 시 롤백
          setBookmarks((prev) => prev.filter((b) => b.id !== tempId));
          toast.error('Failed to add bookmark');
        }
      } catch (error) {
        // 에러 시 롤백
        setBookmarks((prev) => prev.filter((b) => b.id !== tempId));
        toast.error('Failed to add bookmark');
        console.error('Failed to add bookmark:', error);
      }
    },
    [bookId, session]
  );

  // Optimistic UI: 북마크 삭제
  const removeBookmark = useCallback(
    async (bookmarkId: string) => {
      if (!session?.user) return;

      // 이전 상태 저장 (롤백용)
      const previousBookmark = bookmarks.find((b) => b.id === bookmarkId);
      if (!previousBookmark) return;

      // Optimistic: 먼저 UI에서 제거
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));

      try {
        const response = await fetch(`/api/user/bookmarks/item/${bookmarkId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // 실패 시 롤백
          setBookmarks((prev) => [...prev, previousBookmark]);
          toast.error('Failed to remove bookmark');
        } else {
          toast.success('Bookmark removed');
        }
      } catch (error) {
        // 에러 시 롤백
        setBookmarks((prev) => [...prev, previousBookmark]);
        toast.error('Failed to remove bookmark');
        console.error('Failed to remove bookmark:', error);
      }
    },
    [session, bookmarks]
  );

  // Optimistic UI: 북마크 수정
  const updateBookmark = useCallback(
    async (bookmarkId: string, note: string) => {
      if (!session?.user) return;

      // 이전 상태 저장 (롤백용)
      const previousBookmark = bookmarks.find((b) => b.id === bookmarkId);
      if (!previousBookmark) return;

      // Optimistic: 먼저 UI 업데이트
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? { ...b, note } : b))
      );

      try {
        const response = await fetch(`/api/user/bookmarks/item/${bookmarkId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note }),
        });

        if (response.ok) {
          const data = await response.json();
          setBookmarks((prev) =>
            prev.map((b) => (b.id === bookmarkId ? data.data : b))
          );
          toast.success('Bookmark updated');
        } else {
          // 실패 시 롤백
          setBookmarks((prev) =>
            prev.map((b) => (b.id === bookmarkId ? previousBookmark : b))
          );
          toast.error('Failed to update bookmark');
        }
      } catch (error) {
        // 에러 시 롤백
        setBookmarks((prev) =>
          prev.map((b) => (b.id === bookmarkId ? previousBookmark : b))
        );
        toast.error('Failed to update bookmark');
        console.error('Failed to update bookmark:', error);
      }
    },
    [session, bookmarks]
  );

  const isBookmarked = useCallback(
    (cfi: string) => {
      return bookmarks.some((b) => b.cfi === cfi);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    updateBookmark,
    isBookmarked,
  };
}
