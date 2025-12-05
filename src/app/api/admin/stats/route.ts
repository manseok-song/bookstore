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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', code: ErrorCode.FORBIDDEN },
        { status: 403 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, premiumUsers, totalBooks, totalReads, recentSignups, popularBooks] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionStatus: 'PREMIUM' } }),
        prisma.book.count(),
        prisma.readingProgress.count(),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.book.findMany({
          take: 5,
          orderBy: { viewCount: 'desc' },
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            language: true,
            genre: true,
            difficulty: true,
            viewCount: true,
          },
        }),
      ]);

    return NextResponse.json({
      data: {
        totalUsers,
        premiumUsers,
        totalBooks,
        totalReads,
        recentSignups,
        popularBooks,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
