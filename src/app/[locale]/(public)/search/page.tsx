'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchBar } from '@/components/search';
import { BookGrid } from '@/components/books';
import { Skeleton } from '@/components/ui/skeleton';
import type { BookCardData } from '@/types';

function SearchContent() {
  const t = useTranslations('search');
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<BookCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setTotal(0);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="flex justify-center mb-8">
        <SearchBar
          placeholder={t('placeholder')}
          defaultValue={query}
          autoFocus={!query}
        />
      </div>

      {/* Results */}
      {query && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {t('results')}: &quot;{query}&quot;
          </h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? 'book' : 'books'} found
          </p>
        </div>
      )}

      {query ? (
        <BookGrid
          books={results}
          isLoading={isLoading}
          emptyMessage={t('noResults')}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Enter a search term to find books
          </p>
        </div>
      )}
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <Skeleton className="h-10 w-full max-w-lg" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
