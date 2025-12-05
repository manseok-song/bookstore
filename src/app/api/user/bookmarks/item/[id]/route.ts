import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 북마크 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { note } = await request.json();

    const bookmark = await prisma.bookmark.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        note,
      },
    });

    if (bookmark.count === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found', code: ErrorCode.NOT_FOUND },
        { status: 404 }
      );
    }

    const updatedBookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    return NextResponse.json({ data: updatedBookmark });
  } catch (error) {
    console.error('Update bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 북마크 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.bookmark.deleteMany({
      where: {
        id,
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
