'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EpubReader } from '@/components/reader';
import { Skeleton } from '@/components/ui/skeleton';

interface ReaderPageProps {
  params: Promise<{ id: string }>;
}

interface BookData {
  id: string;
  title: string;
  epubUrl: string;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [book, setBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const fetchBook = async () => {
        try {
          const response = await fetch(`/api/books/${id}`);
          const result = await response.json();
          if (result.data) {
            setBook({
              id: result.data.id,
              title: result.data.title,
              // 프록시 API를 통해 EPUB 로드 (CORS 우회)
              // .epub 확장자 추가 - epub.js가 파일로 인식하도록
              epubUrl: `/api/books/${result.data.id}/epub/book.epub`,
            });
          }
        } catch (error) {
          console.error('Failed to fetch book:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBook();
    }
  }, [id, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Skeleton className="h-[80vh] w-[80vw]" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Book not found</p>
      </div>
    );
  }

  return (
    <EpubReader
      bookId={book.id}
      epubUrl={book.epubUrl}
      title={book.title}
    />
  );
}
