import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/search/client';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const language = searchParams.get('language') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ data: [], total: 0 });
    }

    // Meilisearch 사용 가능 시
    try {
      const results = await searchBooks(q, {
        language,
        genre,
        difficulty,
        limit,
        offset,
      });

      return NextResponse.json({
        data: results.hits,
        total: results.estimatedTotalHits,
      });
    } catch {
      // Meilisearch 실패 시 PostgreSQL fallback
      console.log('Meilisearch unavailable, using database search');
    }

    // PostgreSQL fallback 검색
    const where = {
      AND: [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { author: { contains: q, mode: 'insensitive' as const } },
            { description: { contains: q, mode: 'insensitive' as const } },
          ],
        },
        ...(language ? [{ language: language as never }] : []),
        ...(genre ? [{ genre: genre as never }] : []),
        ...(difficulty ? [{ difficulty: difficulty as never }] : []),
      ],
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          author: true,
          coverUrl: true,
          language: true,
          genre: true,
          difficulty: true,
          description: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({ data: books, total });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
