import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // 읽는 중인 책 (진행률이 있는 책)
    const readingProgress = await prisma.readingProgress.findMany({
      where: {
        userId: session.user.id,
        percentage: { lt: 100 },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            language: true,
            genre: true,
            difficulty: true,
          },
        },
      },
      orderBy: { lastReadAt: 'desc' },
    });

    // 완독한 책
    const completed = await prisma.readingProgress.findMany({
      where: {
        userId: session.user.id,
        percentage: { gte: 100 },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            language: true,
            genre: true,
            difficulty: true,
          },
        },
      },
      orderBy: { lastReadAt: 'desc' },
    });

    // 즐겨찾기
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            language: true,
            genre: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: {
        reading: readingProgress.map((p) => ({
          book: p.book,
          progress: p.percentage,
          lastReadAt: p.lastReadAt,
        })),
        completed: completed.map((p) => ({
          book: p.book,
          progress: p.percentage,
          lastReadAt: p.lastReadAt,
        })),
        favorites: favorites.map((f) => ({
          book: f.book,
          addedAt: f.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Library error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
