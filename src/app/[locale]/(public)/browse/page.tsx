'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BookGrid, FilterSidebar } from '@/components/books';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { BookCardData, Pagination } from '@/types';

function BrowseContent() {
  const t = useTranslations('books');
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);

        const response = await fetch(`/api/books?${params.toString()}`);
        const result = await response.json();

        if (result.data) {
          setBooks(result.data);
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [searchParams, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <FilterSidebar />

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Browse Books</h1>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="title_asc">Title A-Z</SelectItem>
                <SelectItem value="title_desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Book grid */}
          <BookGrid
            books={books}
            isLoading={isLoading}
            emptyMessage={t('noBooks')}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(currentPage - 1));
                  window.location.href = `/browse?${params.toString()}`;
                }}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(currentPage + 1));
                  window.location.href = `/browse?${params.toString()}`;
                }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BrowsePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-64">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowseContent />
    </Suspense>
  );
}
