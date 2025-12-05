import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

// 진행률 조회
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

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
    });

    return NextResponse.json({ data: progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 진행률 저장
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { bookId } = await params;
    const { cfi, percentage } = await request.json();

    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
      update: {
        currentCfi: cfi,
        percentage,
        lastReadAt: new Date(),
      },
      create: {
        userId: session.user.id,
        bookId,
        currentCfi: cfi,
        percentage,
      },
    });

    return NextResponse.json({ data: progress });
  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json(
      { error: 'Failed to save progress', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
