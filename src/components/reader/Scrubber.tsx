'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ScrubberProps {
  percentage: number;
  chapterTitle: string;
  onSeek: (percentage: number) => void;
  totalPages?: number;
  currentPage?: number;
}

export function Scrubber({
  percentage,
  chapterTitle,
  onSeek,
  totalPages,
  currentPage,
}: ScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewPercentage, setPreviewPercentage] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // 드래그 중인 위치 또는 현재 진행률
  const displayPercentage = isDragging && previewPercentage !== null ? previewPercentage : percentage;

  // 마우스/터치 위치에서 퍼센트 계산
  const calculatePercentage = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return Math.round(percent);
  }, []);

  // 마우스 이벤트 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const percent = calculatePercentage(e.clientX);
    setPreviewPercentage(percent);
  }, [calculatePercentage]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const percent = calculatePercentage(e.clientX);
    setPreviewPercentage(percent);
  }, [isDragging, calculatePercentage]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && previewPercentage !== null) {
      onSeek(previewPercentage);
    }
    setIsDragging(false);
    setPreviewPercentage(null);
  }, [isDragging, previewPercentage, onSeek]);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const percent = calculatePercentage(e.touches[0].clientX);
    setPreviewPercentage(percent);
  }, [calculatePercentage]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const percent = calculatePercentage(e.touches[0].clientX);
    setPreviewPercentage(percent);
  }, [isDragging, calculatePercentage]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging && previewPercentage !== null) {
      onSeek(previewPercentage);
    }
    setIsDragging(false);
    setPreviewPercentage(null);
  }, [isDragging, previewPercentage, onSeek]);

  // 호버 프리뷰
  const handleHover = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    const percent = calculatePercentage(e.clientX);
    setPreviewPercentage(percent);
    setShowPreview(true);
  }, [isDragging, calculatePercentage]);

  const handleHoverLeave = useCallback(() => {
    if (!isDragging) {
      setShowPreview(false);
      setPreviewPercentage(null);
    }
  }, [isDragging]);

  // 전역 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // 페이지 번호 계산 (총 페이지가 있는 경우)
  const previewPage = totalPages && previewPercentage !== null
    ? Math.round((previewPercentage / 100) * totalPages)
    : null;

  return (
    <div className="px-4 py-3 border-t bg-background/95 backdrop-blur">
      {/* 챕터 정보 */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground truncate max-w-[60%]">
          {chapterTitle || 'Reading...'}
        </span>
        <span className="text-muted-foreground">
          {currentPage && totalPages
            ? `${currentPage} / ${totalPages}`
            : `${displayPercentage}%`}
        </span>
      </div>

      {/* 슬라이더 트랙 */}
      <div
        ref={trackRef}
        className="relative h-8 cursor-pointer touch-none select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleHover}
        onMouseLeave={handleHoverLeave}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label="Reading progress"
        aria-valuenow={displayPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* 트랙 배경 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />

        {/* 진행률 바 */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary rounded-full -translate-y-1/2 transition-all duration-100"
          style={{ width: `${displayPercentage}%` }}
        />

        {/* 핸들 */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-4 h-4 bg-primary rounded-full shadow-md
            transition-transform duration-100
            ${isDragging ? 'scale-125' : 'hover:scale-110'}
          `}
          style={{ left: `${displayPercentage}%` }}
        />

        {/* 프리뷰 툴팁 */}
        {(showPreview || isDragging) && previewPercentage !== null && (
          <div
            className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg whitespace-nowrap"
            style={{ left: `${previewPercentage}%` }}
          >
            {previewPage ? `Page ${previewPage}` : `${previewPercentage}%`}
          </div>
        )}
      </div>
    </div>
  );
}
