'use client';

import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { TocItem } from '@/types';

interface TOCSidebarProps {
  toc: TocItem[];
  onSelect: (href: string) => void;
}

export function TOCSidebar({ toc, onSelect }: TOCSidebarProps) {
  const renderTocItem = (item: TocItem) => (
    <div key={item.id}>
      <button
        onClick={() => onSelect(item.href)}
        className={`w-full text-left px-4 py-2 hover:bg-muted rounded-md text-sm transition-colors ${
          item.level > 0 ? 'pl-8' : ''
        }`}
      >
        {item.label}
      </button>
      {item.children?.map(renderTocItem)}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <List className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Table of Contents</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-1 overflow-y-auto max-h-[calc(100vh-100px)]">
          {toc.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No table of contents available
            </p>
          ) : (
            toc.map(renderTocItem)
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
