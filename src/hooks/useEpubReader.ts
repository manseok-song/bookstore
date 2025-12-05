'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReaderSettings, TocItem } from '@/types';
import type { HighlightData, HighlightColor } from '@/hooks/useHighlights';

interface UseEpubReaderOptions {
  bookId: string;
  epubUrl: string;
  initialCfi?: string;
  highlights?: HighlightData[];
  onTextSelect?: (cfiRange: string, text: string) => void;
}

interface UseEpubReaderReturn {
  isLoading: boolean;
  error: string | null;
  currentCfi: string;
  percentage: number;
  toc: TocItem[];
  settings: ReaderSettings;
  chapterTitle: string;
  currentSpineIndex: number;
  totalSpineItems: number;
  goToLocation: (cfi: string) => void;
  goNext: () => void;
  goPrev: () => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  containerRef: React.RefCallback<HTMLDivElement>;
  addHighlightToRenderer: (cfiRange: string, color: HighlightColor) => void;
  removeHighlightFromRenderer: (cfiRange: string) => void;
}

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  fontFamily: 'serif',
  lineHeight: 1.6,
  spread: 'none',
};

export function useEpubReader({
  bookId,
  epubUrl,
  initialCfi,
  highlights = [],
  onTextSelect,
}: UseEpubReaderOptions): UseEpubReaderReturn {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const renditionRef = useRef<ePub.Rendition | null>(null);
  const bookRef = useRef<ePub.Book | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCfi, setCurrentCfi] = useState(initialCfi || '');
  const [percentage, setPercentage] = useState(0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [chapterTitle, setChapterTitle] = useState('');
  const [currentSpineIndex, setCurrentSpineIndex] = useState(0);
  const [totalSpineItems, setTotalSpineItems] = useState(0);

  // 프리로딩된 챕터 추적 (메모리 관리용)
  const preloadedChaptersRef = useRef<Set<number>>(new Set());
  const lastPreloadedIndexRef = useRef<number>(-1);

  // callback ref로 컨테이너 요소 추적
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      console.log('useEpubReader: Container element set');
      setContainerElement(node);
    }
  }, []);

  // EPUB 초기화
  useEffect(() => {
    if (!containerElement || !epubUrl) {
      console.log('useEpubReader: Container or URL not ready', {
        hasContainer: !!containerElement,
        epubUrl,
      });
      return;
    }

    const initBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('useEpubReader: Initializing book from URL:', epubUrl);

        // epub.js 동적 import
        const ePub = (await import('epubjs')).default;
        console.log('useEpubReader: epub.js loaded');

        const book = ePub(epubUrl);
        bookRef.current = book;
        console.log('useEpubReader: Book object created');

        const rendition = book.renderTo(containerElement, {
          width: '100%',
          height: '100%',
          spread: settings.spread === 'auto' ? 'auto' : 'none',
          allowScriptedContent: true,
        });

        renditionRef.current = rendition;

        // spine이 로드될 때까지 대기
        await book.loaded.spine;
        console.log('useEpubReader: Spine loaded');

        // spine 항목 수 저장
        // epub.js의 Spine 객체는 spineItems 배열을 가지고 있음
        const spineItems = (book.spine as unknown as { spineItems: unknown[] }).spineItems || [];
        const spineLength = spineItems.length;
        setTotalSpineItems(spineLength);
        console.log('useEpubReader: Total spine items:', spineLength);

        // 초기 위치로 이동
        console.log('useEpubReader: Displaying content, initialCfi:', initialCfi);
        if (initialCfi) {
          await rendition.display(initialCfi);
        } else {
          await rendition.display();
        }
        console.log('useEpubReader: Content displayed');

        // 목차 로드
        console.log('useEpubReader: Loading navigation');
        const navigation = await book.loaded.navigation;
        const tocItems: TocItem[] = navigation.toc.map((item, index) => ({
          id: String(index),
          label: item.label,
          href: item.href,
          level: 0,
          children: item.subitems?.map((sub, subIndex) => ({
            id: `${index}-${subIndex}`,
            label: sub.label,
            href: sub.href,
            level: 1,
          })),
        }));
        setToc(tocItems);

        // 위치 변경 이벤트
        rendition.on('locationChanged', () => {
          // rendition.location에서 직접 CFI 가져오기
          const currentLocation = rendition.location;

          let cfi: string | undefined;

          if (currentLocation?.start?.cfi) {
            cfi = currentLocation.start.cfi;
          }

          if (cfi) {
            setCurrentCfi(cfi);

            // 현재 spine 인덱스 추적
            const spineIndex = currentLocation?.start?.index;
            if (typeof spineIndex === 'number') {
              setCurrentSpineIndex(spineIndex);

              // 이전/다음 챕터 프리로딩 (현재 위치가 변경될 때만)
              if (spineIndex !== lastPreloadedIndexRef.current) {
                lastPreloadedIndexRef.current = spineIndex;
                preloadAdjacentChapters(book, spineIndex, spineLength);
              }
            }

            // 진행률 계산 (locations가 생성된 후에만)
            try {
              if (book.locations.length() > 0) {
                const progress = book.locations.percentageFromCfi(cfi);
                setPercentage(Math.round(progress * 100));
              }
            } catch (e) {
              // locations가 아직 준비되지 않은 경우 무시
            }

            // 현재 챕터 제목 찾기
            try {
              const currentHref = currentLocation?.start?.href;
              if (currentHref) {
                const chapter = navigation.toc.find((item) =>
                  currentHref.includes(item.href.split('#')[0])
                );
                if (chapter) {
                  setChapterTitle(chapter.label.trim());
                }
              }
            } catch (e) {
              // 챕터 정보를 가져올 수 없는 경우 무시
            }
          }
        });

        // 인접 챕터 프리로딩 함수
        const preloadAdjacentChapters = async (
          bookInstance: ePub.Book,
          currentIndex: number,
          totalItems: number
        ) => {
          const chaptersToPreload: number[] = [];

          // 이전 챕터 (현재 -1)
          if (currentIndex > 0) {
            chaptersToPreload.push(currentIndex - 1);
          }

          // 다음 챕터 (현재 +1)
          if (currentIndex < totalItems - 1) {
            chaptersToPreload.push(currentIndex + 1);
          }

          // 다다음 챕터 (현재 +2) - 더 부드러운 경험을 위해
          if (currentIndex < totalItems - 2) {
            chaptersToPreload.push(currentIndex + 2);
          }

          // 프리로드 실행
          for (const index of chaptersToPreload) {
            if (!preloadedChaptersRef.current.has(index)) {
              try {
                const spineItem = bookInstance.spine.get(index);
                if (spineItem) {
                  // 백그라운드에서 챕터 로드 (load 메서드로 콘텐츠 미리 가져오기)
                  await spineItem.load(bookInstance.load.bind(bookInstance));
                  preloadedChaptersRef.current.add(index);
                  console.log(`useEpubReader: Preloaded chapter ${index}`);
                }
              } catch (e) {
                // 프리로딩 실패는 무시 (치명적이지 않음)
                console.warn(`Failed to preload chapter ${index}:`, e);
              }
            }
          }

          // 메모리 관리: 현재 위치에서 너무 먼 챕터는 제거
          // 최대 5개 챕터만 메모리에 유지 (현재 ±2)
          const chaptersToKeep = new Set<number>();
          for (let i = Math.max(0, currentIndex - 2); i <= Math.min(totalItems - 1, currentIndex + 2); i++) {
            chaptersToKeep.add(i);
          }

          // 범위 밖의 챕터 언로드
          for (const loadedIndex of preloadedChaptersRef.current) {
            if (!chaptersToKeep.has(loadedIndex)) {
              try {
                const spineItem = bookInstance.spine.get(loadedIndex);
                if (spineItem && typeof spineItem.unload === 'function') {
                  spineItem.unload();
                  preloadedChaptersRef.current.delete(loadedIndex);
                  console.log(`useEpubReader: Unloaded chapter ${loadedIndex}`);
                }
              } catch (e) {
                // 언로드 실패는 무시
              }
            }
          }
        };

        // 로케이션 생성 (진행률 계산용) - 백그라운드에서 실행
        book.locations.generate(1024).then(() => {
          console.log('useEpubReader: Locations generated');
          // locations 생성 후 현재 위치의 진행률 재계산
          if (renditionRef.current?.location?.start?.cfi) {
            try {
              const progress = book.locations.percentageFromCfi(renditionRef.current.location.start.cfi);
              setPercentage(Math.round(progress * 100));
            } catch (e) {
              // ignore
            }
          }
        }).catch((e: Error) => {
          console.warn('Failed to generate locations:', e);
        });

        // 텍스트 선택 이벤트 처리
        rendition.on('selected', (cfiRange: string, contents: ePub.Contents) => {
          console.log('useEpubReader: Text selected', { cfiRange, hasOnTextSelect: !!onTextSelect });
          if (onTextSelect) {
            try {
              const range = contents.range(cfiRange);
              const text = range.toString();
              console.log('useEpubReader: Selected text', text);
              if (text.trim()) {
                onTextSelect(cfiRange, text);
              }
            } catch (e) {
              console.error('useEpubReader: Error getting range', e);
            }
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load EPUB:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load book: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    initBook();

    return () => {
      // 프리로딩 상태 초기화
      preloadedChaptersRef.current.clear();
      lastPreloadedIndexRef.current = -1;

      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [containerElement, epubUrl, initialCfi]);

  // 설정 적용
  useEffect(() => {
    if (!renditionRef.current) return;

    const bgColors: Record<string, string> = {
      light: '#ffffff',
      dark: '#1a1a1a',
      sepia: '#f4ecd8',
      'high-contrast': '#000000',
    };

    const textColors: Record<string, string> = {
      light: '#1a1a1a',
      dark: '#e5e5e5',
      sepia: '#5c4b37',
      'high-contrast': '#ffffff',
    };

    // epub.js themes API - register and select theme
    renditionRef.current.themes.register('custom', {
      body: {
        background: bgColors[settings.theme] || '#ffffff',
        color: textColors[settings.theme] || '#1a1a1a',
        'font-size': `${settings.fontSize}px !important`,
        'font-family': `${settings.fontFamily} !important`,
        'line-height': `${settings.lineHeight} !important`,
      },
    });
    renditionRef.current.themes.select('custom');

    // Spread (두 페이지 보기) 설정 적용
    try {
      const spreadValue = settings.spread === 'auto' ? 'auto' : 'none';
      renditionRef.current.spread(spreadValue);
    } catch (e) {
      console.warn('Failed to apply spread setting:', e);
    }
  }, [settings]);

  const goToLocation = useCallback((cfi: string) => {
    renditionRef.current?.display(cfi);
  }, []);

  const goNext = useCallback(() => {
    renditionRef.current?.next();
  }, []);

  const goPrev = useCallback(() => {
    renditionRef.current?.prev();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // 하이라이트 색상 맵
  const highlightColors: Record<HighlightColor, string> = {
    yellow: 'rgba(255, 255, 0, 0.4)',
    green: 'rgba(0, 255, 0, 0.3)',
    blue: 'rgba(0, 191, 255, 0.3)',
    pink: 'rgba(255, 105, 180, 0.3)',
  };

  // 렌더러에 하이라이트 추가
  const addHighlightToRenderer = useCallback((cfiRange: string, color: HighlightColor) => {
    if (!renditionRef.current) return;

    try {
      renditionRef.current.annotations.add(
        'highlight',
        cfiRange,
        {},
        undefined,
        'hl',
        { fill: highlightColors[color] || highlightColors.yellow }
      );
    } catch (e) {
      console.warn('Failed to add highlight to renderer:', e);
    }
  }, []);

  // 렌더러에서 하이라이트 제거
  const removeHighlightFromRenderer = useCallback((cfiRange: string) => {
    if (!renditionRef.current) return;

    try {
      renditionRef.current.annotations.remove(cfiRange, 'highlight');
    } catch (e) {
      console.warn('Failed to remove highlight from renderer:', e);
    }
  }, []);

  // 기존 하이라이트 렌더링 (highlights가 로드되고 rendition이 준비된 후)
  useEffect(() => {
    if (!renditionRef.current || isLoading || highlights.length === 0) return;

    // 약간의 지연을 주어 렌더링이 완료된 후 하이라이트 적용
    const timeoutId = setTimeout(() => {
      highlights.forEach((hl) => {
        addHighlightToRenderer(hl.cfiRange, hl.color as HighlightColor);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [highlights, isLoading, addHighlightToRenderer]);

  return {
    isLoading,
    error,
    currentCfi,
    percentage,
    toc,
    settings,
    chapterTitle,
    currentSpineIndex,
    totalSpineItems,
    goToLocation,
    goNext,
    goPrev,
    updateSettings,
    containerRef,
    addHighlightToRenderer,
    removeHighlightFromRenderer,
  };
}
