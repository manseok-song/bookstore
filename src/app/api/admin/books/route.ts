import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

// 관리자 권한 확인
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 };
  }

  return { user: session.user };
}

// 책 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  const adminCheck = await checkAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error, code: ErrorCode.FORBIDDEN },
      { status: adminCheck.status }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const q = searchParams.get('q');

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { author: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
    console.error('Admin books list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 책 생성
export async function POST(request: NextRequest) {
  const adminCheck = await checkAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error, code: ErrorCode.FORBIDDEN },
      { status: adminCheck.status }
    );
  }

  try {
    const body = await request.json();

    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        description: body.description,
        coverUrl: body.coverUrl,
        epubUrl: body.epubUrl,
        language: body.language,
        genre: body.genre,
        difficulty: body.difficulty || 'MEDIUM',
        pageCount: body.pageCount,
        publishedYear: body.publishedYear,
        gutenbergId: body.gutenbergId,
      },
    });

    return NextResponse.json({ data: book }, { status: 201 });
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json(
      { error: 'Failed to create book', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
