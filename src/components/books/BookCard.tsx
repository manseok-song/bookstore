'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BOOK_LANGUAGE_LABELS, DIFFICULTY_LABELS } from '@/constants';
import type { BookCardData } from '@/types';

interface BookCardProps {
  book: BookCardData;
  showProgress?: boolean;
  progress?: number;
}

export function BookCard({ book, showProgress, progress }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-[2/3] relative bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-primary/20 to-primary/5 p-4">
              <BookOpen className="h-10 w-10 text-primary/60 mb-2" />
              <p className="text-xs text-center text-primary/80 font-medium line-clamp-3">
                {book.title}
              </p>
              <p className="text-[10px] text-center text-primary/50 mt-1 line-clamp-1">
                {book.author}
              </p>
            </div>
          )}
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {book.author}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-muted rounded">
              {BOOK_LANGUAGE_LABELS[book.language]}
            </span>
            <span className="px-2 py-0.5 bg-muted rounded">
              {DIFFICULTY_LABELS[book.difficulty]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
