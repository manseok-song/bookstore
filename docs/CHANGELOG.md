# Changelog

## [2.0.0] - 2025-12-05

### EPUB Viewer v2.0 Major Upgrade

Google Play Books/Kindle 수준의 리더 경험을 목표로 전면 업그레이드를 진행했습니다.

---

## 신규 기능

### 1. 상태 관리 (Zustand Store)
- **파일**: `src/store/readerStore.ts`
- Zustand를 사용한 중앙 집중식 상태 관리
- `persist` 미들웨어로 사용자 설정 로컬 저장
- 시스템 테마 연동 (`auto` 테마 옵션)
- 고대비 테마 (`high-contrast`) 추가

### 2. Immersive Mode UI
- **파일**: `src/components/reader/EpubReader.tsx`
- 메뉴 자동 숨김 (3초 후)
- Tap Zone 네비게이션:
  - 좌측 15%: 이전 페이지
  - 중앙 70%: 메뉴 토글 (텍스트 선택 가능)
  - 우측 15%: 다음 페이지
- 전체화면 모드 지원 (F 키)

### 3. Scrubber (진행률 슬라이더)
- **파일**: `src/components/reader/Scrubber.tsx`
- 드래그 가능한 진행률 슬라이더
- 현재 챕터 제목 표시
- 호버/드래그 시 페이지 미리보기
- 터치 디바이스 지원

### 4. 모바일 Swipe 제스처
- **파일**: `src/hooks/useSwipeGesture.ts`
- 터치 스와이프로 페이지 넘김
- 임계값 설정 (50px)
- 좌/우 방향 감지

### 5. Desktop Spread View (두 페이지 보기)
- **파일**: `src/hooks/useEpubReader.ts`
- 설정에서 Single/Two Pages 선택
- `rendition.spread()` API로 즉시 적용

### 6. 챕터 프리로딩
- **파일**: `src/hooks/useEpubReader.ts`
- 현재 챕터 기준 ±2 챕터 미리 로드
- 메모리 관리 (최대 5개 챕터만 유지)
- 범위 밖 챕터 자동 언로드

### 7. Optimistic UI
- **파일**: `src/hooks/useHighlights.ts`, `src/hooks/useBookmarks.ts`
- 하이라이트/북마크 생성 시 즉시 UI 반영
- API 실패 시 자동 롤백
- Toast 알림으로 상태 표시

### 8. 텍스트 선택 메뉴 (SelectionMenu)
- **파일**: `src/components/reader/SelectionMenu.tsx`
- 플로팅 툴바: 하이라이트, 번역, 사전, 복사, 공유
- 선택 영역 기준 자동 위치 조정

### 9. 번역 기능
- **파일**: `src/lib/translate/client.ts`, `src/app/api/translate/route.ts`
- OpenAI GPT-4o-mini API 사용
- 캐싱으로 중복 요청 방지
- 사용자 언어 설정 연동

### 10. 사전 기능
- **파일**: `src/lib/dictionary/client.ts`
- Free Dictionary API 연동
- 단어 정의, 발음 기호 표시
- 캐싱 지원

### 11. 본문 검색 (In-book Search)
- **파일**: `src/components/reader/SearchPanel.tsx`, `src/hooks/useBookSearch.ts`
- KWIC (키워드 전후 문맥) 표시
- 검색 결과 클릭 시 해당 위치로 이동
- 키보드 단축키 (/ 키)

### 12. TTS (Text-to-Speech)
- **파일**: `src/hooks/useTTS.ts`, `src/components/reader/TTSControls.tsx`
- Web Speech API 사용
- 재생/일시정지/정지 컨트롤
- 속도 조절 (0.5x ~ 2x)
- 음성 선택 (언어별)

### 13. Analytics (PostHog)
- **파일**: `src/lib/analytics/posthog.ts`, `src/hooks/useAnalytics.ts`
- 리더 이벤트 추적
- 이벤트 택소노미:
  - `reader_opened`: 뷰어 진입
  - `reader_page_turn`: 페이지 넘김
  - `reader_progress`: 진행률 갱신
  - `feature_used`: 기능 사용
  - `reader_error`: 에러 발생
  - `session_end`: 뷰어 종료

### 14. Error Tracking (Sentry)
- **파일**: `src/lib/analytics/sentry.ts`, `sentry.*.config.ts`
- 클라이언트/서버 에러 추적
- 소스맵 업로드 설정

### 15. 접근성 개선
- 고대비 테마 추가
- ARIA 속성 추가
- 키보드 네비게이션:
  - ← →: 페이지 넘김
  - Space: 다음 페이지
  - F: 전체화면
  - Escape: 메뉴 닫기

---

## 버그 수정

### Build 에러 수정
- `useSearchParams` Suspense boundary 추가
  - `src/app/[locale]/(public)/browse/page.tsx`
  - `src/app/[locale]/(public)/pricing/page.tsx`
  - `src/app/[locale]/(public)/search/page.tsx`

### 리더 UI 수정
- 중복 진행바 제거 (ProgressBar 삭제, Scrubber만 유지)
- 텍스트 선택 차단 문제 수정 (Tap Zone 구조 개선)
- Two page spread view 미적용 문제 수정

---

## 파일 구조

### 신규 파일
```
src/
├── store/
│   └── readerStore.ts              # Zustand store
├── components/reader/
│   ├── Scrubber.tsx                # 진행률 슬라이더
│   ├── SelectionMenu.tsx           # 텍스트 선택 메뉴
│   ├── SearchPanel.tsx             # 본문 검색
│   └── TTSControls.tsx             # TTS 컨트롤
├── hooks/
│   ├── useSwipeGesture.ts          # 스와이프 제스처
│   ├── useBookSearch.ts            # 본문 검색
│   ├── useTTS.ts                   # TTS
│   └── useAnalytics.ts             # 이벤트 추적
├── lib/
│   ├── analytics/
│   │   ├── posthog.ts              # PostHog 클라이언트
│   │   ├── sentry.ts               # Sentry 유틸리티
│   │   └── events.ts               # 이벤트 택소노미
│   ├── translate/
│   │   └── client.ts               # 번역 클라이언트
│   └── dictionary/
│       └── client.ts               # 사전 클라이언트
└── app/api/
    └── translate/
        └── route.ts                # 번역 API
```

### 수정 파일
```
src/
├── components/reader/
│   ├── EpubReader.tsx              # Immersive mode, Tap zone
│   └── ReaderControls.tsx          # 설정 옵션 추가
├── hooks/
│   ├── useEpubReader.ts            # 프리로딩, spread
│   ├── useHighlights.ts            # Optimistic UI
│   └── useBookmarks.ts             # Optimistic UI
├── constants/
│   └── naming.ts                   # auto, high-contrast 테마
└── app/[locale]/(public)/
    ├── browse/page.tsx             # Suspense 추가
    ├── pricing/page.tsx            # Suspense 추가
    └── search/page.tsx             # Suspense 추가
```

---

## 설정 파일

### 환경 변수 (.env)
```env
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
```

### 패키지 추가
```bash
pnpm add posthog-js @sentry/nextjs openai
pnpm add @radix-ui/react-scroll-area @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-slider
```

---

## 테스트 결과

- Next.js 빌드: 성공 (86개 페이지)
- TypeScript 컴파일: 성공
- 개발 서버: 정상 작동

---

## 다음 단계 (TODO)

- [ ] Service Worker 오프라인 캐싱
- [ ] RTL/세로쓰기 지원
- [ ] 다국어 폰트 최적화
- [ ] TTS Karaoke effect (현재 문장 하이라이트)
- [ ] 스크린 리더 테스트
