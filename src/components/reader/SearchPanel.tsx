'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchResult } from '@/hooks/useBookSearch';

interface SearchPanelProps {
  results: SearchResult[];
  isSearching: boolean;
  searchQuery: string;
  error: string | null;
  currentResultIndex: number;
  onSearch: (query: string) => Promise<void>;
  onClearSearch: () => void;
  onGoToResult: (cfi: string) => void;
  onNextResult: () => void;
  onPrevResult: () => void;
  onSelectResult: (index: number) => void;
}

export function SearchPanel({
  results,
  isSearching,
  searchQuery,
  error,
  currentResultIndex,
  onSearch,
  onClearSearch,
  onGoToResult,
  onNextResult,
  onPrevResult,
  onSelectResult,
}: SearchPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 패널이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 검색 실행 (디바운스 적용)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // 이전 타이머 취소
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 300ms 디바운스
      debounceTimerRef.current = setTimeout(() => {
        if (value.trim().length >= 2) {
          onSearch(value);
        } else if (value.trim().length === 0) {
          onClearSearch();
        }
      }, 300);
    },
    [onSearch, onClearSearch]
  );

  // 검색 결과 클릭
  const handleResultClick = useCallback(
    (result: SearchResult, index: number) => {
      onSelectResult(index);
      onGoToResult(result.cfi);
    },
    [onGoToResult, onSelectResult]
  );

  // 검색어 하이라이트
  const highlightSearchTerm = useCallback(
    (text: string, query: string) => {
      if (!query) return text;

      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      );
    },
    []
  );

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // / 키로 검색 열기
      if (e.key === '/' && !isOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }

      // 검색 패널이 열려 있을 때
      if (isOpen && results.length > 0) {
        if (e.key === 'Enter') {
          // Enter: 현재 결과로 이동
          if (currentResultIndex >= 0 && currentResultIndex < results.length) {
            onGoToResult(results[currentResultIndex].cfi);
          }
        } else if (e.key === 'ArrowDown' && e.ctrlKey) {
          // Ctrl+Down: 다음 결과
          e.preventDefault();
          onNextResult();
        } else if (e.key === 'ArrowUp' && e.ctrlKey) {
          // Ctrl+Up: 이전 결과
          e.preventDefault();
          onPrevResult();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, currentResultIndex, onGoToResult, onNextResult, onPrevResult]);

  // 패널 닫기
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setInputValue('');
    onClearSearch();
  }, [onClearSearch]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search in book">
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search in Book
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* 검색 입력 */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter search term..."
              value={inputValue}
              onChange={handleInputChange}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {inputValue && !isSearching && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setInputValue('');
                    onClearSearch();
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 결과 수 및 네비게이션 */}
          {results.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {currentResultIndex + 1} of {results.length} results
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={onPrevResult}
                  disabled={results.length <= 1}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={onNextResult}
                  disabled={results.length <= 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {error}
            </p>
          )}

          {/* 검색 결과 목록 */}
          {results.length > 0 && (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-2 pr-4">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result, index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      index === currentResultIndex
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/50 border-transparent hover:bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {highlightSearchTerm(result.excerpt, searchQuery)}
                    </p>
                    {result.chapterTitle && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.chapterTitle}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* 빈 상태 */}
          {!isSearching && !error && results.length === 0 && inputValue.length >= 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Searching...
            </p>
          )}

          {/* 초기 상태 */}
          {!isSearching && !error && results.length === 0 && inputValue.length < 2 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              <p>Enter at least 2 characters to search</p>
              <p className="text-xs mt-2">
                Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded">/</kbd> to open search
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
