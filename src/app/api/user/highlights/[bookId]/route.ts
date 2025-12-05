import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

// 하이라이트 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { bookId } = await params;

    const highlights = await prisma.highlight.findMany({
      where: {
        userId: session.user.id,
        bookId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: highlights });
  } catch (error) {
    console.error('Get highlights error:', error);
    return NextResponse.json(
      { error: 'Failed to get highlights', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 하이라이트 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    console.log('POST /api/user/highlights: Starting');
    const session = await auth();
    console.log('POST /api/user/highlights: Session', { userId: session?.user?.id });

    if (!session?.user?.id) {
      console.log('POST /api/user/highlights: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { bookId } = await params;
    console.log('POST /api/user/highlights: bookId', bookId);

    const body = await request.json();
    console.log('POST /api/user/highlights: body', body);
    const { cfiRange, text, color, note } = body;

    if (!cfiRange || !text) {
      console.log('POST /api/user/highlights: Validation error - missing cfiRange or text');
      return NextResponse.json(
        { error: 'cfiRange and text are required', code: ErrorCode.VALIDATION_ERROR },
        { status: 400 }
      );
    }

    console.log('POST /api/user/highlights: Creating highlight');
    const highlight = await prisma.highlight.create({
      data: {
        userId: session.user.id,
        bookId,
        cfiRange,
        text,
        color: color || 'yellow',
        note,
      },
    });
    console.log('POST /api/user/highlights: Created', highlight);

    return NextResponse.json({ data: highlight }, { status: 201 });
  } catch (error) {
    console.error('Create highlight error:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
