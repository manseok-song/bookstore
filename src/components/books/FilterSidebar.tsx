'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  BookLanguage,
  Genre,
  Difficulty,
  BOOK_LANGUAGE_LABELS,
  DIFFICULTY_LABELS,
} from '@/constants';

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLanguage = searchParams.get('language');
  const currentGenre = searchParams.get('genre');
  const currentDifficulty = searchParams.get('difficulty');

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // 필터 변경 시 첫 페이지로
    router.push(`/browse?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/browse');
  };

  const hasFilters = currentLanguage || currentGenre || currentDifficulty;

  return (
    <aside className="w-full lg:w-64 space-y-6">
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      )}

      {/* Language Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Language</Label>
        <div className="space-y-1">
          {Object.entries(BookLanguage).map(([key, value]) => (
            <Button
              key={key}
              variant={currentLanguage === value ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                updateFilter('language', currentLanguage === value ? null : value)
              }
            >
              {BOOK_LANGUAGE_LABELS[value]}
            </Button>
          ))}
        </div>
      </div>

      {/* Genre Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Genre</Label>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {Object.entries(Genre).map(([key, value]) => (
            <Button
              key={key}
              variant={currentGenre === value ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                updateFilter('genre', currentGenre === value ? null : value)
              }
            >
              {key.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Difficulty</Label>
        <div className="space-y-1">
          {Object.entries(Difficulty).map(([key, value]) => (
            <Button
              key={key}
              variant={currentDifficulty === value ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                updateFilter('difficulty', currentDifficulty === value ? null : value)
              }
            >
              {DIFFICULTY_LABELS[value]}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
