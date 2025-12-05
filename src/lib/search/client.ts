import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const booksIndex = client.index('books');

// 인덱스 설정 초기화
export async function initSearchIndex() {
  try {
    // 검색 가능 속성 설정
    await booksIndex.updateSearchableAttributes([
      'title',
      'author',
      'description',
    ]);

    // 필터링 가능 속성 설정
    await booksIndex.updateFilterableAttributes([
      'language',
      'genre',
      'difficulty',
    ]);

    // 정렬 가능 속성 설정
    await booksIndex.updateSortableAttributes([
      'createdAt',
      'viewCount',
      'title',
    ]);

    console.log('Search index initialized');
  } catch (error) {
    console.error('Failed to initialize search index:', error);
  }
}

// 책을 검색 인덱스에 추가
export async function indexBook(book: {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  language: string;
  genre: string;
  difficulty: string;
  coverUrl?: string | null;
  createdAt: Date;
  viewCount: number;
}) {
  try {
    await booksIndex.addDocuments([
      {
        ...book,
        createdAt: book.createdAt.getTime(),
      },
    ]);
  } catch (error) {
    console.error('Failed to index book:', error);
  }
}

// 책을 검색 인덱스에서 삭제
export async function removeBookFromIndex(bookId: string) {
  try {
    await booksIndex.deleteDocument(bookId);
  } catch (error) {
    console.error('Failed to remove book from index:', error);
  }
}

// 검색 함수
export async function searchBooks(
  query: string,
  options?: {
    language?: string;
    genre?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  }
) {
  const filters: string[] = [];

  if (options?.language) {
    filters.push(`language = "${options.language}"`);
  }
  if (options?.genre) {
    filters.push(`genre = "${options.genre}"`);
  }
  if (options?.difficulty) {
    filters.push(`difficulty = "${options.difficulty}"`);
  }

  try {
    const results = await booksIndex.search(query, {
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      attributesToHighlight: ['title', 'author', 'description'],
    });

    return results;
  } catch (error) {
    console.error('Search failed:', error);
    return { hits: [], estimatedTotalHits: 0 };
  }
}

export default client;
