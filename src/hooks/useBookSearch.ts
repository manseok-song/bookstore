'use client';

import { useState, useCallback, useRef } from 'react';

export interface SearchResult {
  cfi: string;
  excerpt: string;
  chapterTitle?: string;
}

interface UseBookSearchOptions {
  maxResults?: number;
  contextLength?: number; // 검색어 전후 문자 수
}

interface UseBookSearchReturn {
  results: SearchResult[];
  isSearching: boolean;
  searchQuery: string;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  currentResultIndex: number;
  goToNextResult: () => void;
  goToPrevResult: () => void;
  setCurrentResultIndex: (index: number) => void;
}

/**
 * epub.js를 사용한 도서 내 검색 훅
 */
export function useBookSearch(
  bookRef: React.RefObject<ePub.Book | null>,
  options: UseBookSearchOptions = {}
): UseBookSearchReturn {
  const { maxResults = 50, contextLength = 50 } = options;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  // 검색 취소를 위한 ref
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * KWIC (Key Word In Context) 형식으로 excerpt 생성
   */
  const createExcerpt = useCallback(
    (text: string, query: string, length: number): string => {
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);

      if (index === -1) return text.slice(0, length * 2);

      const start = Math.max(0, index - length);
      const end = Math.min(text.length, index + query.length + length);

      let excerpt = text.slice(start, end);

      // 시작/끝이 단어 중간이면 생략 표시
      if (start > 0) excerpt = '...' + excerpt;
      if (end < text.length) excerpt = excerpt + '...';

      return excerpt;
    },
    []
  );

  /**
   * 책에서 검색 수행
   */
  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setSearchQuery('');
        setError(null);
        return;
      }

      const book = bookRef.current;
      if (!book) {
        setError('Book not loaded');
        return;
      }

      // 이전 검색 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      setSearchQuery(query);
      setError(null);
      setResults([]);
      setCurrentResultIndex(-1);

      const searchResults: SearchResult[] = [];

      try {
        // epub.js의 spine을 순회하며 각 섹션에서 검색
        const spine = book.spine as unknown as {
          spineItems: Array<{
            load: (loader: (path: string) => Promise<Document>) => Promise<Document>;
            unload: () => void;
            href: string;
            index: number;
            cfiBase: string;
          }>;
        };

        for (const section of spine.spineItems) {
          // 취소 확인
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          // 최대 결과 수 확인
          if (searchResults.length >= maxResults) {
            break;
          }

          try {
            // 섹션 로드 - epub.js의 load 메서드는 Document를 반환
            const doc = await section.load(book.load.bind(book) as (path: string) => Promise<Document>);

            if (!doc || !doc.body) continue;

            // 텍스트 콘텐츠 추출
            const content = doc.body.textContent || '';

            // 검색어 찾기 (대소문자 무시)
            const lowerContent = content.toLowerCase();
            const lowerQuery = query.toLowerCase();

            let searchIndex = 0;
            let foundIndex = lowerContent.indexOf(lowerQuery, searchIndex);

            while (foundIndex !== -1 && searchResults.length < maxResults) {
              // CFI 생성을 위한 텍스트 노드 찾기
              const range = doc.createRange();
              const textWalker = doc.createTreeWalker(
                doc.body,
                NodeFilter.SHOW_TEXT,
                null
              );

              let currentOffset = 0;
              let targetNode: Text | null = null;
              let nodeOffset = 0;

              while (textWalker.nextNode()) {
                const node = textWalker.currentNode as Text;
                const nodeLength = node.length;

                if (currentOffset + nodeLength > foundIndex) {
                  targetNode = node;
                  nodeOffset = foundIndex - currentOffset;
                  break;
                }
                currentOffset += nodeLength;
              }

              if (targetNode) {
                try {
                  range.setStart(targetNode, nodeOffset);
                  range.setEnd(targetNode, Math.min(nodeOffset + query.length, targetNode.length));

                  // CFI 생성
                  const cfi = section.cfiBase + '!' + book.section(section.href).cfiFromRange(range);

                  // excerpt 생성
                  const excerpt = createExcerpt(content, query, contextLength);

                  searchResults.push({
                    cfi,
                    excerpt,
                  });
                } catch (cfiError) {
                  // CFI 생성 실패 시 간단한 CFI 사용
                  const simpleCfi = `epubcfi(${section.cfiBase})`;
                  searchResults.push({
                    cfi: simpleCfi,
                    excerpt: createExcerpt(content, query, contextLength),
                  });
                }
              }

              searchIndex = foundIndex + 1;
              foundIndex = lowerContent.indexOf(lowerQuery, searchIndex);
            }

            // 메모리 관리를 위해 섹션 언로드
            if (typeof section.unload === 'function') {
              section.unload();
            }
          } catch (sectionError) {
            console.warn('Error searching section:', section.href, sectionError);
          }
        }

        setResults(searchResults);

        if (searchResults.length === 0) {
          setError(`No results found for "${query}"`);
        } else if (searchResults.length > 0) {
          setCurrentResultIndex(0);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // 검색 취소됨
          return;
        }
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    },
    [bookRef, maxResults, contextLength, createExcerpt]
  );

  /**
   * 검색 결과 초기화
   */
  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResults([]);
    setSearchQuery('');
    setError(null);
    setCurrentResultIndex(-1);
  }, []);

  /**
   * 다음 검색 결과로 이동
   */
  const goToNextResult = useCallback(() => {
    if (results.length === 0) return;
    setCurrentResultIndex((prev) => (prev + 1) % results.length);
  }, [results.length]);

  /**
   * 이전 검색 결과로 이동
   */
  const goToPrevResult = useCallback(() => {
    if (results.length === 0) return;
    setCurrentResultIndex((prev) => (prev - 1 + results.length) % results.length);
  }, [results.length]);

  return {
    results,
    isSearching,
    searchQuery,
    error,
    search,
    clearSearch,
    currentResultIndex,
    goToNextResult,
    goToPrevResult,
    setCurrentResultIndex,
  };
}
