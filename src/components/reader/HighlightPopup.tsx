'use client';

import { useState } from 'react';
import { Highlighter, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { HighlightColor } from '@/hooks/useHighlights';

interface HighlightPopupProps {
  selectedText: string;
  onHighlight: (color: HighlightColor, note?: string) => void;
  onClose: () => void;
  existingHighlight?: {
    id: string;
    color: string;
    note: string | null;
  };
  onUpdateNote?: (note: string) => void;
  onDelete?: () => void;
}

const colors: { name: HighlightColor; bg: string; label: string }[] = [
  { name: 'yellow', bg: 'bg-yellow-300', label: '노랑' },
  { name: 'green', bg: 'bg-green-300', label: '초록' },
  { name: 'blue', bg: 'bg-blue-300', label: '파랑' },
  { name: 'pink', bg: 'bg-pink-300', label: '분홍' },
];

export function HighlightPopup({
  selectedText,
  onHighlight,
  onClose,
  existingHighlight,
  onUpdateNote,
  onDelete,
}: HighlightPopupProps) {
  const [showNote, setShowNote] = useState(!!existingHighlight?.note);
  const [note, setNote] = useState(existingHighlight?.note || '');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>(
    (existingHighlight?.color as HighlightColor) || 'yellow'
  );

  const handleHighlight = () => {
    console.log('HighlightPopup: handleHighlight called', { selectedColor, note });
    onHighlight(selectedColor, note || undefined);
    // onClose는 onHighlight 내부에서 처리됨
  };

  const handleSaveNote = () => {
    if (onUpdateNote) {
      onUpdateNote(note);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-xl p-4 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Highlighter className="h-5 w-5" />
            <span className="font-medium">
              {existingHighlight ? '하이라이트 편집' : '하이라이트 추가'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected text */}
        <div className="bg-muted rounded p-3 mb-4 text-sm max-h-32 overflow-y-auto">
          <p className="italic">&ldquo;{selectedText}&rdquo;</p>
        </div>

        {/* Color selection */}
        {!existingHighlight && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">색상 선택</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                    selectedColor === color.name
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Note section */}
        {(showNote || existingHighlight) && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">메모</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이 부분에 대한 메모를 작성하세요..."
              rows={3}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {!existingHighlight && !showNote && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNote(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                메모 추가
              </Button>
            )}
            {existingHighlight && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            {existingHighlight ? (
              <Button onClick={handleSaveNote}>저장</Button>
            ) : (
              <Button onClick={handleHighlight}>
                <Highlighter className="h-4 w-4 mr-1" />
                하이라이트
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
