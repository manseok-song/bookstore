import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id } = await params;

    console.log('EPUB proxy: Fetching book with id:', id);

    const book = await prisma.book.findUnique({
      where: { id },
      select: { epubUrl: true, title: true },
    });

    console.log('EPUB proxy: Book found:', book?.title, 'URL:', book?.epubUrl);

    if (!book || !book.epubUrl) {
      console.error('EPUB proxy: Book not found or no EPUB URL');
      return new NextResponse('Book not found', { status: 404 });
    }

    // EPUB 파일을 외부 서버에서 가져오기
    console.log('EPUB proxy: Fetching from external URL...');
    const response = await fetch(book.epubUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('EPUB proxy: External response status:', response.status);

    if (!response.ok) {
      console.error('EPUB proxy: Failed to fetch from external URL:', response.status, response.statusText);
      return new NextResponse(`Failed to fetch EPUB: ${response.status}`, { status: 502 });
    }

    const epubBuffer = await response.arrayBuffer();
    console.log('EPUB proxy: Buffer size:', epubBuffer.byteLength, 'bytes');

    if (epubBuffer.byteLength === 0) {
      console.error('EPUB proxy: Empty buffer received');
      return new NextResponse('Empty EPUB file', { status: 502 });
    }

    return new NextResponse(epubBuffer, {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `inline; filename="${id}.epub"`,
        'Content-Length': epubBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('EPUB proxy error:', error);
    return new NextResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
