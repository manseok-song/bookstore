'use client';

import { useState, useEffect, useCallback } from 'react';
import { Highlighter, Languages, BookOpen, Share2, Copy, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { HighlightColor } from '@/hooks/useHighlights';

interface SelectionMenuProps {
  selectedText: string;
  cfiRange: string;
  onHighlight: () => void;
  onTranslate: () => void;
  onDictionary: () => void;
  onShare: () => void;
  onClose: () => void;
  // 위치 정보 (선택 영역 기준)
  position?: { x: number; y: number };
}

// 빠른 하이라이트용 색상 버튼
const quickColors: { name: HighlightColor; bg: string; hover: string }[] = [
  { name: 'yellow', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
  { name: 'green', bg: 'bg-green-400', hover: 'hover:bg-green-500' },
  { name: 'blue', bg: 'bg-blue-400', hover: 'hover:bg-blue-500' },
  { name: 'pink', bg: 'bg-pink-400', hover: 'hover:bg-pink-500' },
];

export function SelectionMenu({
  selectedText,
  cfiRange,
  onHighlight,
  onTranslate,
  onDictionary,
  onShare,
  onClose,
  position,
}: SelectionMenuProps) {
  const [copied, setCopied] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // 메뉴 위치 계산
  useEffect(() => {
    if (position) {
      // 화면 경계 체크
      const menuWidth = 280; // 예상 메뉴 너비
      const menuHeight = 48; // 예상 메뉴 높이
      const padding = 10;

      let x = position.x - menuWidth / 2;
      let y = position.y - menuHeight - padding;

      // 왼쪽 경계
      if (x < padding) x = padding;
      // 오른쪽 경계
      if (x + menuWidth > window.innerWidth - padding) {
        x = window.innerWidth - menuWidth - padding;
      }
      // 위쪽 경계 (메뉴가 화면 위로 벗어나면 아래에 표시)
      if (y < padding) {
        y = position.y + padding;
      }

      setMenuPosition({ x, y });
    }
  }, [position]);

  // 텍스트 복사
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }, [selectedText]);

  // 공유 기능 (Web Share API 또는 클립보드)
  const handleShare = useCallback(async () => {
    // 명언 카드 형식으로 공유
    const shareText = `"${selectedText}"`;

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
      } catch (err) {
        // 사용자가 공유를 취소한 경우
        if ((err as Error).name !== 'AbortError') {
          handleCopy(); // 폴백으로 복사
        }
      }
    } else {
      // Web Share API가 없으면 복사
      handleCopy();
    }
    onShare();
  }, [selectedText, handleCopy, onShare]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        style={{
          left: menuPosition.x,
          top: menuPosition.y,
        }}
      >
        <div className="flex items-center gap-1 bg-popover text-popover-foreground rounded-lg shadow-lg border p-1.5">
          {/* 하이라이트 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onHighlight}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Highlight</TooltipContent>
          </Tooltip>

          {/* 구분선 */}
          <div className="w-px h-6 bg-border mx-0.5" />

          {/* 번역 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onTranslate}
              >
                <Languages className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Translate</TooltipContent>
          </Tooltip>

          {/* 사전 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onDictionary}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dictionary</TooltipContent>
          </Tooltip>

          {/* 구분선 */}
          <div className="w-px h-6 bg-border mx-0.5" />

          {/* 복사 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
          </Tooltip>

          {/* 공유 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>

          {/* 닫기 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-0.5"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

// 번역 결과 팝업 컴포넌트
interface TranslationPopupProps {
  originalText: string;
  translatedText: string;
  targetLanguage: string;
  isLoading: boolean;
  error?: string;
  onClose: () => void;
}

export function TranslationPopup({
  originalText,
  translatedText,
  targetLanguage,
  isLoading,
  error,
  onClose,
}: TranslationPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-xl p-4 max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            <span className="font-medium">Translation</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Original text */}
        <div className="bg-muted rounded p-3 mb-3 text-sm">
          <p className="text-muted-foreground text-xs mb-1">Original</p>
          <p>{originalText}</p>
        </div>

        {/* Translation */}
        <div className="bg-primary/10 rounded p-3 text-sm">
          <p className="text-muted-foreground text-xs mb-1">{targetLanguage}</p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Translating...</span>
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <p>{translatedText}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 사전 결과 팝업 컴포넌트 (다국어 지원)
interface DictionaryPopupProps {
  word: string;
  definitions: Array<{
    partOfSpeech: string;
    partOfSpeechTranslated?: string;
    definition: string;
    definitionTranslated?: string;
    example?: string;
    exampleTranslated?: string;
  }>;
  phonetic?: string;
  isLoading: boolean;
  error?: string;
  targetLanguage?: string;
  onClose: () => void;
}

export function DictionaryPopup({
  word,
  definitions,
  phonetic,
  isLoading,
  error,
  targetLanguage,
  onClose,
}: DictionaryPopupProps) {
  // 번역된 정의가 있는지 확인
  const hasTranslation = definitions.some(d => d.definitionTranslated);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-xl p-4 max-w-md w-full mx-4 max-h-[70vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Dictionary</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Word and phonetic */}
        <div className="mb-4">
          <h3 className="text-xl font-bold">{word}</h3>
          {phonetic && <p className="text-muted-foreground text-sm">{phonetic}</p>}
        </div>

        {/* Definitions */}
        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span>Looking up...</span>
          </div>
        ) : error ? (
          <p className="text-destructive py-4">{error}</p>
        ) : (
          <div className="space-y-4">
            {definitions.map((def, index) => (
              <div key={index} className="border-l-2 border-primary pl-3">
                {/* 품사 - 번역된 버전 우선 표시 */}
                <p className="text-xs text-muted-foreground italic mb-1">
                  {def.partOfSpeechTranslated || def.partOfSpeech}
                  {def.partOfSpeechTranslated && (
                    <span className="text-muted-foreground/60 ml-1">
                      ({def.partOfSpeech})
                    </span>
                  )}
                </p>

                {/* 정의 - 번역된 버전 우선 표시 */}
                <p className="text-sm">
                  {def.definitionTranslated || def.definition}
                </p>
                {/* 번역된 경우 원본도 작게 표시 */}
                {def.definitionTranslated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {def.definition}
                  </p>
                )}

                {/* 예문 */}
                {def.example && (
                  <div className="mt-2 pl-2 border-l border-muted">
                    <p className="text-xs text-muted-foreground italic">
                      &ldquo;{def.exampleTranslated || def.example}&rdquo;
                    </p>
                    {def.exampleTranslated && (
                      <p className="text-xs text-muted-foreground/60 italic mt-0.5">
                        ({def.example})
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
