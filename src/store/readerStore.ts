'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ReaderTheme = 'light' | 'dark' | 'sepia' | 'auto' | 'high-contrast';
export type FontFamily = 'serif' | 'sans-serif' | 'monospace';
export type ViewMode = 'paginated' | 'scrolled';
export type SpreadMode = 'auto' | 'none';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: FontFamily;
  lineHeight: number;
  viewMode: ViewMode;
  spread: SpreadMode;
}

interface ReaderState {
  // 독서 상태 (non-persisted)
  currentCfi: string;
  progress: number;
  chapterTitle: string;
  isMenuOpen: boolean;
  isFullscreen: boolean;

  // 사용자 설정 (persisted)
  settings: ReaderSettings;

  // Actions - 독서 상태
  setCurrentCfi: (cfi: string) => void;
  setProgress: (progress: number) => void;
  setChapterTitle: (title: string) => void;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;

  // Actions - 설정
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  resetSettings: () => void;

  // 시스템 테마 감지용
  getEffectiveTheme: () => 'light' | 'dark' | 'sepia' | 'high-contrast';
}

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  fontFamily: 'serif',
  lineHeight: 1.6,
  viewMode: 'paginated',
  spread: 'none',
};

// 시스템 테마 감지 함수
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      // 초기 상태 - 독서
      currentCfi: '',
      progress: 0,
      chapterTitle: '',
      isMenuOpen: true,
      isFullscreen: false,

      // 초기 상태 - 설정
      settings: defaultSettings,

      // Actions - 독서 상태
      setCurrentCfi: (cfi) => set({ currentCfi: cfi }),
      setProgress: (progress) => set({ progress }),
      setChapterTitle: (title) => set({ chapterTitle: title }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

      // Actions - 설정
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),

      // 시스템 테마 연동
      getEffectiveTheme: () => {
        const { theme } = get().settings;
        if (theme === 'auto') {
          return getSystemTheme();
        }
        return theme;
      },
    }),
    {
      name: 'reader-settings',
      storage: createJSONStorage(() => localStorage),
      // 설정만 저장 (독서 상태는 서버에 저장)
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);

// 시스템 테마 변경 감지 훅
export const useSystemThemeListener = () => {
  if (typeof window === 'undefined') return;

  const updateSettings = useReaderStore((state) => state.updateSettings);
  const settings = useReaderStore((state) => state.settings);

  // 시스템 테마 변경 시 강제 리렌더링
  if (settings.theme === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // 상태를 강제로 업데이트하여 리렌더링 트리거
      updateSettings({});
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
};
