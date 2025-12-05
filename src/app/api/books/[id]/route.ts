import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found', code: ErrorCode.NOT_FOUND },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.book.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 로그인한 사용자라면 즐겨찾기 여부와 읽기 진행률 확인
    let isFavorited = false;
    let readingProgress = 0;

    if (session?.user?.id) {
      const [favorite, progress] = await Promise.all([
        prisma.favorite.findUnique({
          where: {
            userId_bookId: {
              userId: session.user.id,
              bookId: id,
            },
          },
        }),
        prisma.readingProgress.findUnique({
          where: {
            userId_bookId: {
              userId: session.user.id,
              bookId: id,
            },
          },
        }),
      ]);

      isFavorited = !!favorite;
      readingProgress = progress?.percentage || 0;
    }

    // 비슷한 책 추천 (같은 장르 또는 언어)
    const similarBooks = await prisma.book.findMany({
      where: {
        id: { not: id },
        OR: [{ genre: book.genre }, { language: book.language }],
      },
      take: 6,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        language: true,
        genre: true,
        difficulty: true,
      },
    });

    return NextResponse.json({
      data: {
        ...book,
        isFavorited,
        readingProgress,
        similarBooks,
      },
    });
  } catch (error) {
    console.error('Book detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
