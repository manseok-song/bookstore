'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Heart, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookGrid } from '@/components/books';
import { BOOK_LANGUAGE_LABELS, DIFFICULTY_LABELS } from '@/constants';
import type { BookDetail } from '@/types';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default function BookPage({ params }: BookPageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const t = useTranslations('books');
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`);
        const result = await response.json();
        if (result.data) {
          setBook(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleFavorite = async () => {
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    setIsFavoriting(true);
    try {
      const method = book?.isFavorited ? 'DELETE' : 'POST';
      await fetch(`/api/user/favorites/${id}`, { method });
      setBook((prev) =>
        prev ? { ...prev, isFavorited: !prev.isFavorited } : null
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsFavoriting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Book not found</p>
        <Link href="/browse">
          <Button variant="link">Back to browse</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link href="/browse" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to browse
      </Link>

      {/* Book detail */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Cover */}
        <div className="aspect-[2/3] relative bg-muted rounded-lg overflow-hidden">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-24 w-24 text-primary/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground">{book.author}</p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              {BOOK_LANGUAGE_LABELS[book.language]}
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              {book.genre.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              {DIFFICULTY_LABELS[book.difficulty]}
            </span>
            {book.pageCount && (
              <span className="px-3 py-1 bg-muted rounded-full text-sm">
                {book.pageCount} pages
              </span>
            )}
            {book.publishedYear && (
              <span className="px-3 py-1 bg-muted rounded-full text-sm">
                {book.publishedYear}
              </span>
            )}
          </div>

          {/* Reading progress */}
          {book.readingProgress !== undefined && book.readingProgress > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reading Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(book.readingProgress)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${book.readingProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/reader/${book.id}`}>
              <Button size="lg">
                <BookOpen className="h-5 w-5 mr-2" />
                {t('readNow')}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={handleFavorite}
              disabled={isFavoriting}
            >
              <Heart
                className={`h-5 w-5 mr-2 ${book.isFavorited ? 'fill-red-500 text-red-500' : ''}`}
              />
              {book.isFavorited ? t('removeFromFavorites') : t('addToFavorites')}
            </Button>
            <Button size="lg" variant="outline">
              <Download className="h-5 w-5 mr-2" />
              {t('download')}
            </Button>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">{t('description')}</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Similar books */}
      {book.similarBooks && book.similarBooks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">{t('similarBooks')}</h2>
          <BookGrid books={book.similarBooks} />
        </section>
      )}
    </div>
  );
}
