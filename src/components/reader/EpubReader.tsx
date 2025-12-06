'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useEpubReader } from '@/hooks/useEpubReader';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useHighlights, type HighlightColor } from '@/hooks/useHighlights';
import { useReaderStore } from '@/store/readerStore';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useBookSearch } from '@/hooks/useBookSearch';
import { ReaderControls } from './ReaderControls';
import { TOCSidebar } from './TOCSidebar';
import { Scrubber } from './Scrubber';
import { HighlightPopup } from './HighlightPopup';
import { HighlightSidebar } from './HighlightSidebar';
import { SelectionMenu, TranslationPopup, DictionaryPopup } from './SelectionMenu';
import { SearchPanel } from './SearchPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Maximize, Minimize, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { translateText } from '@/lib/translate/client';
import { lookupWord, type DictionaryResult } from '@/lib/dictionary/client';

interface EpubReaderProps {
  bookId: string;
  epubUrl: string;
  title: string;
}

export function EpubReader({ bookId, epubUrl, title }: EpubReaderProps) {
  const { initialCfi, saveProgress, isLoading: progressLoading } = useReadingProgress({ bookId });
  const { bookmarks, addBookmark, removeBookmark, updateBookmark, isBookmarked } = useBookmarks({ bookId });
  const {
    highlights,
    addHighlight,
    removeHighlight,
    isLoading: highlightsLoading,
  } = useHighlights({ bookId });

  // Zustand store
  const {
    isFullscreen,
    setFullscreen,
    settings: storeSettings,
    updateSettings: updateStoreSettings,
    getEffectiveTheme,
  } = useReaderStore();

  // 텍스트 선택 상태
  const [selectedText, setSelectedText] = useState<{ cfiRange: string; text: string; position?: { x: number; y: number } } | null>(null);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);

  // 번역 상태
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationResult, setTranslationResult] = useState<{ text: string; error?: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // 사전 상태
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryResult | null>(null);
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Book ref for search
  const bookRef = useRef<ePub.Book | null>(null);

  // 텍스트 선택 핸들러
  const handleTextSelect = useCallback((cfiRange: string, text: string) => {
    // 마우스 위치 가져오기
    const selection = window.getSelection();
    let position = { x: window.innerWidth / 2, y: 100 };

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2,
        y: rect.top,
      };
    }

    setSelectedText({ cfiRange, text, position });
    setShowSelectionMenu(true);
  }, []);

  const {
    isLoading,
    error,
    currentCfi,
    percentage,
    toc,
    settings,
    goToLocation,
    goNext,
    goPrev,
    updateSettings,
    containerRef,
    addHighlightToRenderer,
    removeHighlightFromRenderer,
    chapterTitle,
  } = useEpubReader({
    bookId,
    epubUrl,
    initialCfi: initialCfi || undefined,
    highlights,
    onTextSelect: handleTextSelect,
  });

  // 도서 내 검색
  const {
    results: searchResults,
    isSearching,
    searchQuery,
    error: searchError,
    search,
    clearSearch,
    currentResultIndex,
    goToNextResult,
    goToPrevResult,
    setCurrentResultIndex,
  } = useBookSearch(bookRef);

  // 선택 메뉴 닫기
  const closeSelectionMenu = useCallback(() => {
    setShowSelectionMenu(false);
  }, []);

  // 하이라이트 팝업 열기 (SelectionMenu에서)
  const openHighlightPopup = useCallback(() => {
    setShowSelectionMenu(false);
    setShowHighlightPopup(true);
  }, []);

  // 번역 기능
  const handleTranslate = useCallback(async () => {
    if (!selectedText) return;

    setShowSelectionMenu(false);
    setShowTranslation(true);
    setIsTranslating(true);
    setTranslationResult(null);

    try {
      // 사용자의 선호 언어로 번역 (기본값: 한국어)
      const result = await translateText({
        text: selectedText.text,
        targetLanguage: 'ko', // TODO: 사용자 설정에서 가져오기
      });
      setTranslationResult({ text: result.translatedText });
    } catch (err) {
      setTranslationResult({
        text: '',
        error: err instanceof Error ? err.message : 'Translation failed',
      });
    } finally {
      setIsTranslating(false);
    }
  }, [selectedText]);

  // 사전 조회 기능
  const handleDictionary = useCallback(async () => {
    if (!selectedText) return;

    setShowSelectionMenu(false);
    setShowDictionary(true);
    setIsLookingUp(true);
    setDictionaryResult(null);
    setDictionaryError(null);

    try {
      const result = await lookupWord(selectedText.text);
      setDictionaryResult(result);
    } catch (err) {
      setDictionaryError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setIsLookingUp(false);
    }
  }, [selectedText]);

  // 공유 기능 (SelectionMenu에서 처리됨)
  const handleShare = useCallback(() => {
    setShowSelectionMenu(false);
  }, []);

  // 하이라이트 추가 핸들러
  const handleAddHighlight = async (color: HighlightColor, note?: string) => {
    if (!selectedText) return;

    const result = await addHighlight(selectedText.cfiRange, selectedText.text, color, note);
    if (result) {
      addHighlightToRenderer(selectedText.cfiRange, color);
    }
    setSelectedText(null);
    setShowHighlightPopup(false);
  };

  // 하이라이트 삭제 핸들러
  const handleDeleteHighlight = async (id: string) => {
    const highlight = highlights.find((h) => h.id === id);
    if (highlight) {
      removeHighlightFromRenderer(highlight.cfiRange);
      await removeHighlight(id);
    }
  };

  // 진행률 저장
  useEffect(() => {
    if (currentCfi && percentage >= 0) {
      saveProgress(currentCfi, percentage);
    }
  }, [currentCfi, percentage, saveProgress]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen?.();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, isFullscreen, setMenuOpen]);

  // 전체화면 토글
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [setFullscreen]);

  // 전체화면 상태 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setFullscreen]);

  // 스와이프 제스처 (모바일)
  const swipeHandlers = useSwipeGesture({
    threshold: 50,
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  // Tap Zone 핸들러 (좌 20%, 중앙 60%, 우 20%)
  const handleTapZone = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const relativeX = x / width;

    if (relativeX < 0.2) {
      // 좌측 20% - 이전 페이지
      goPrev();
    } else if (relativeX > 0.8) {
      // 우측 20% - 다음 페이지
      goNext();
    } else {
      // 중앙 60% - 메뉴 토글
      toggleMenu();
    }
  }, [goPrev, goNext, toggleMenu]);

  // 테마 스타일
  const effectiveTheme = getEffectiveTheme();
  const themeStyles: Record<string, string> = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-[#f4ecd8] text-[#5c4b37]',
    'high-contrast': 'bg-black text-white',
  };

  // 에러 상태
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // 진행률/하이라이트 로딩 중에는 스켈레톤 표시
  if (progressLoading || highlightsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-[60vh] w-[80vw] max-w-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col ${themeStyles[effectiveTheme]} transition-colors duration-300`}
    >
      {/* Header - Immersive Mode */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Link href={`/book/${bookId}`}>
            <Button variant="ghost" size="icon" aria-label="Back to book">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="font-medium truncate max-w-[200px] md:max-w-md">{title}</h1>
            {chapterTitle && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md">
                {chapterTitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SearchPanel
            results={searchResults}
            isSearching={isSearching}
            searchQuery={searchQuery}
            error={searchError}
            currentResultIndex={currentResultIndex}
            onSearch={search}
            onClearSearch={clearSearch}
            onGoToResult={goToLocation}
            onNextResult={goToNextResult}
            onPrevResult={goToPrevResult}
            onSelectResult={setCurrentResultIndex}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
          <TOCSidebar toc={toc} onSelect={goToLocation} />
          <HighlightSidebar
            highlights={highlights}
            onGoToHighlight={goToLocation}
            onDeleteHighlight={handleDeleteHighlight}
          />
          <ReaderControls
            settings={settings}
            onUpdateSettings={updateSettings}
            bookmarks={bookmarks}
            onGoToBookmark={goToLocation}
            onAddBookmark={() => {
              if (currentCfi) {
                addBookmark(currentCfi);
              }
            }}
            onRemoveBookmark={removeBookmark}
            onUpdateBookmark={updateBookmark}
            isCurrentBookmarked={isBookmarked(currentCfi)}
          />
        </div>
      </header>

      {/* Reader container with Tap Zones */}
      <div className="flex-1 relative overflow-hidden">
        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <p className="text-muted-foreground">Loading book...</p>
            </div>
          </div>
        )}

        {/* 좌측 Tap Zone - 이전 페이지 (EPUB 위에 오버레이) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[15%] z-20 hover:bg-black/5 transition-colors cursor-pointer"
          onClick={goPrev}
          role="button"
          aria-label="Previous page"
        />

        {/* EPUB content - 중앙 영역, 텍스트 선택 가능 */}
        <div
          ref={containerRef}
          className="h-full w-full max-w-4xl mx-auto px-4 md:px-8 relative"
          {...swipeHandlers}
        />

        {/* 우측 Tap Zone - 다음 페이지 (EPUB 위에 오버레이) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[15%] z-20 hover:bg-black/5 transition-colors cursor-pointer"
          onClick={goNext}
          role="button"
          aria-label="Next page"
        />
      </div>

      {/* Bottom Bar - Scrubber (항상 표시) */}
      <Scrubber
        percentage={percentage}
        chapterTitle={chapterTitle || ''}
        onSeek={(newPercentage) => {
          // TODO: CFI로 변환하여 이동
        }}
      />

      {/* Selection menu (floating toolbar) */}
      {showSelectionMenu && selectedText && (
        <SelectionMenu
          selectedText={selectedText.text}
          cfiRange={selectedText.cfiRange}
          position={selectedText.position}
          onHighlight={openHighlightPopup}
          onTranslate={handleTranslate}
          onDictionary={handleDictionary}
          onShare={handleShare}
          onClose={closeSelectionMenu}
        />
      )}

      {/* Highlight popup (full modal) */}
      {showHighlightPopup && selectedText && (
        <HighlightPopup
          selectedText={selectedText.text}
          onHighlight={handleAddHighlight}
          onClose={() => {
            setShowHighlightPopup(false);
            setSelectedText(null);
          }}
        />
      )}

      {/* Translation popup */}
      {showTranslation && selectedText && (
        <TranslationPopup
          originalText={selectedText.text}
          translatedText={translationResult?.text || ''}
          targetLanguage="Korean"
          isLoading={isTranslating}
          error={translationResult?.error}
          onClose={() => {
            setShowTranslation(false);
            setSelectedText(null);
          }}
        />
      )}

      {/* Dictionary popup */}
      {showDictionary && selectedText && (
        <DictionaryPopup
          word={selectedText.text}
          definitions={dictionaryResult?.definitions || []}
          phonetic={dictionaryResult?.phonetic}
          isLoading={isLookingUp}
          error={dictionaryError || undefined}
          onClose={() => {
            setShowDictionary(false);
            setDictionaryResult(null);
            setDictionaryError(null);
            setSelectedText(null);
          }}
        />
      )}
    </div>
  );
}
