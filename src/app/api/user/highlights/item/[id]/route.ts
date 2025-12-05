import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ErrorCode } from '@/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 하이라이트 수정 (메모 추가/수정)
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
    const { note, color } = await request.json();

    const highlight = await prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight || highlight.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Highlight not found', code: ErrorCode.NOT_FOUND },
        { status: 404 }
      );
    }

    const updated = await prisma.highlight.update({
      where: { id },
      data: {
        ...(note !== undefined && { note }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update highlight error:', error);
    return NextResponse.json(
      { error: 'Failed to update highlight', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

// 하이라이트 삭제
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

    const highlight = await prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight || highlight.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Highlight not found', code: ErrorCode.NOT_FOUND },
        { status: 404 }
      );
    }

    await prisma.highlight.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete highlight error:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight', code: ErrorCode.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
