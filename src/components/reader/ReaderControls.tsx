'use client';

import { useState } from 'react';
import { Settings, Bookmark, Sun, Moon, Type, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { ReaderSettings, BookmarkData } from '@/types';

interface ReaderControlsProps {
  settings: ReaderSettings;
  onUpdateSettings: (settings: Partial<ReaderSettings>) => void;
  bookmarks: BookmarkData[];
  onGoToBookmark: (cfi: string) => void;
  onAddBookmark: () => void;
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, note: string) => void;
  isCurrentBookmarked: boolean;
}

export function ReaderControls({
  settings,
  onUpdateSettings,
  bookmarks,
  onGoToBookmark,
  onAddBookmark,
  onRemoveBookmark,
  onUpdateBookmark,
  isCurrentBookmarked,
}: ReaderControlsProps) {
  const [editingBookmark, setEditingBookmark] = useState<BookmarkData | null>(null);
  const [editNote, setEditNote] = useState('');

  const handleEditBookmark = (bookmark: BookmarkData) => {
    setEditingBookmark(bookmark);
    setEditNote(bookmark.note || '');
  };

  const handleSaveBookmark = () => {
    if (editingBookmark) {
      onUpdateBookmark(editingBookmark.id, editNote);
      setEditingBookmark(null);
      setEditNote('');
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Bookmark button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Bookmark className={`h-5 w-5 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Bookmarks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onAddBookmark}>
            {isCurrentBookmarked ? 'Remove bookmark here' : 'Add bookmark here'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {bookmarks.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No bookmarks yet
            </div>
          ) : (
            bookmarks.map((bookmark, index) => (
              <DropdownMenuItem
                key={bookmark.id}
                className="flex items-center justify-between gap-2"
                onSelect={() => onGoToBookmark(bookmark.cfi)}
              >
                <span className="flex-1 truncate">
                  {bookmark.note || `Bookmark ${index + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditBookmark(bookmark);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveBookmark(bookmark.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bookmark Edit Dialog */}
      <Dialog open={!!editingBookmark} onOpenChange={(open) => !open && setEditingBookmark(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bookmark-note">Bookmark Name</Label>
              <Input
                id="bookmark-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Enter bookmark name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBookmark(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBookmark}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reader Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Theme */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                >
                  <Sun className="h-4 w-4 mr-1" /> Light
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                >
                  <Moon className="h-4 w-4 mr-1" /> Dark
                </Button>
                <Button
                  variant={settings.theme === 'sepia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ theme: 'sepia' })}
                  className="bg-[#f4ecd8] text-[#5c4b37] border-[#d4c4a8]"
                >
                  Sepia
                </Button>
                <Button
                  variant={settings.theme === 'high-contrast' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ theme: 'high-contrast' })}
                  className="bg-black text-white border-white hover:bg-gray-800"
                  aria-label="High contrast theme for accessibility"
                >
                  High Contrast
                </Button>
              </div>
            </div>

            {/* Font size */}
            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })
                  }
                >
                  <Type className="h-3 w-3" />
                </Button>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) =>
                    onUpdateSettings({ fontSize: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdateSettings({ fontSize: Math.min(24, settings.fontSize + 2) })
                  }
                >
                  <Type className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Font family */}
            <div className="space-y-2">
              <Label>Font Family</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.fontFamily === 'serif' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ fontFamily: 'serif' })}
                  className="font-serif"
                >
                  Serif
                </Button>
                <Button
                  variant={settings.fontFamily === 'sans-serif' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ fontFamily: 'sans-serif' })}
                  className="font-sans"
                >
                  Sans
                </Button>
                <Button
                  variant={settings.fontFamily === 'monospace' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ fontFamily: 'monospace' })}
                  className="font-mono"
                >
                  Mono
                </Button>
              </div>
            </div>

            {/* Line height */}
            <div className="space-y-2">
              <Label>Line Height: {settings.lineHeight}</Label>
              <input
                type="range"
                min="1.2"
                max="2"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) =>
                  onUpdateSettings({ lineHeight: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Spread View (Desktop only) */}
            <div className="space-y-2">
              <Label>Page View</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.spread === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ spread: 'none' })}
                >
                  Single
                </Button>
                <Button
                  variant={settings.spread === 'auto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateSettings({ spread: 'auto' })}
                >
                  Two Pages
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Two pages mode is recommended for wide screens
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
