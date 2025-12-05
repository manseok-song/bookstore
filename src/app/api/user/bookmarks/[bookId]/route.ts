import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

// 북마크 목록 조회
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

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        bookId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      { error: 'Failed to get bookmarks', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 북마크 추가
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
    const { cfi, note } = await request.json();

    if (!cfi) {
      return NextResponse.json(
        { error: 'CFI is required', code: ErrorCode.VALIDATION_ERROR },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        bookId,
        cfi,
        note,
      },
    });

    return NextResponse.json({ data: bookmark }, { status: 201 });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 북마크 삭제 (bookId를 bookmarkId로 사용)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { bookId: bookmarkId } = await params;

    await prisma.bookmark.deleteMany({
      where: {
        id: bookmarkId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
