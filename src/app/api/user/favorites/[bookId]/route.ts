import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

// 즐겨찾기 추가
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

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        bookId,
      },
    });

    return NextResponse.json({ data: favorite }, { status: 201 });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 즐겨찾기 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { bookId } = await params;

    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        bookId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
