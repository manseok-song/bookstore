'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { BookOpen, Heart, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/books';
import { Skeleton } from '@/components/ui/skeleton';
import type { BookCardData } from '@/types';

interface LibraryItem {
  book: BookCardData;
  progress?: number;
  lastReadAt?: string;
  addedAt?: string;
}

interface LibraryData {
  reading: LibraryItem[];
  completed: LibraryItem[];
  favorites: LibraryItem[];
}

export default function LibraryPage() {
  const { status } = useSession();
  const router = useRouter();
  const t = useTranslations('library');
  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const fetchLibrary = async () => {
        try {
          const response = await fetch('/api/user/library');
          const result = await response.json();
          if (result.data) {
            setLibrary(result.data);
          }
        } catch (error) {
          console.error('Failed to fetch library:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchLibrary();
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3]" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty =
    !library ||
    (library.reading.length === 0 &&
      library.completed.length === 0 &&
      library.favorites.length === 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {isEmpty ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">{t('empty')}</p>
          <Link href="/browse">
            <Button>{t('startBrowsing')}</Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="reading">
          <TabsList className="mb-6">
            <TabsTrigger value="reading" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t('reading')} ({library?.reading.length || 0})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              {t('favorites')} ({library?.favorites.length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('completed')} ({library?.completed.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading">
            {library?.reading.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No books in progress
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {library?.reading.map((item) => (
                  <BookCard
                    key={item.book.id}
                    book={item.book}
                    showProgress
                    progress={item.progress}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {library?.favorites.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No favorites yet
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {library?.favorites.map((item) => (
                  <BookCard key={item.book.id} book={item.book} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {library?.completed.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No completed books
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {library?.completed.map((item) => (
                  <BookCard key={item.book.id} book={item.book} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
