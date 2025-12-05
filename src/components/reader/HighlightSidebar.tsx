'use client';

import { Highlighter, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { HighlightData } from '@/hooks/useHighlights';

interface HighlightSidebarProps {
  highlights: HighlightData[];
  onGoToHighlight: (cfiRange: string) => void;
  onDeleteHighlight: (id: string) => void;
}

const colorClasses: Record<string, string> = {
  yellow: 'bg-yellow-200 border-yellow-400',
  green: 'bg-green-200 border-green-400',
  blue: 'bg-blue-200 border-blue-400',
  pink: 'bg-pink-200 border-pink-400',
};

export function HighlightSidebar({
  highlights,
  onGoToHighlight,
  onDeleteHighlight,
}: HighlightSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Highlighter className="h-5 w-5" />
          {highlights.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {highlights.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Highlighter className="h-5 w-5" />
            하이라이트 ({highlights.length})
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          {highlights.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              하이라이트가 없습니다.
              <br />
              텍스트를 선택하여 하이라이트를 추가하세요.
            </p>
          ) : (
            highlights.map((highlight) => (
              <div
                key={highlight.id}
                className={`p-3 rounded-lg border-l-4 ${colorClasses[highlight.color] || colorClasses.yellow}`}
              >
                <p className="text-sm line-clamp-3 mb-2">
                  &ldquo;{highlight.text}&rdquo;
                </p>
                {highlight.note && (
                  <p className="text-xs text-muted-foreground italic mb-2 pl-2 border-l-2 border-muted">
                    {highlight.note}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(highlight.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onGoToHighlight(highlight.cfiRange)}
                      title="이동"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteHighlight(highlight.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
