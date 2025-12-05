import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      take: 8,
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

    return NextResponse.json({ data: books });
  } catch (error) {
    console.error('Featured books error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured books' },
      { status: 500 }
    );
  }
}
