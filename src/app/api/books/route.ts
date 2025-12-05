import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PAGINATION } from '@/constants';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || String(PAGINATION.DEFAULT_LIMIT)))
    );
    const language = searchParams.get('language');
    const genre = searchParams.get('genre');
    const difficulty = searchParams.get('difficulty');
    const sort = searchParams.get('sort') || 'newest';
    const q = searchParams.get('q');

    // 필터 조건 구성
    const where: Prisma.BookWhereInput = {};

    if (language) {
      where.language = language as Prisma.EnumBookLanguageFilter;
    }
    if (genre) {
      where.genre = genre as Prisma.EnumGenreFilter;
    }
    if (difficulty) {
      where.difficulty = difficulty as Prisma.EnumDifficultyFilter;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 정렬 조건
    let orderBy: Prisma.BookOrderByWithRelationInput = {};
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 병렬로 데이터와 총 개수 조회
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          coverUrl: true,
          language: true,
          genre: true,
          difficulty: true,
          viewCount: true,
          createdAt: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
