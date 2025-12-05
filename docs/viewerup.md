네, 앞서 논의한 \*\*뷰어 기능 명세(v2.0)\*\*와 **사용자 행동 추적(Analytics)** 내용을 모두 통합했습니다.

아래 내용을 복사하여 **`PUBSTATION_READER_SPEC_V2.md`** 라는 이름으로 저장하시면 됩니다.

````markdown
# PubStation Web Reader 기술 명세서 (v2.0)

**문서 버전:** 2.0 (Global Production Ready)
**최종 수정일:** 2025.12.05
**목표:** 글로벌 1티어(Google Play Books, Kindle) 수준의 성능, 접근성, 데이터 분석을 갖춘 웹 리더 구축

---

## 1. UI/UX 레이아웃 설계 (Immersive Design)

### A. 화면 구성 (Z-Index Layering)
몰입 방해 요소를 최소화하고 제스처 상호작용을 극대화합니다.

1.  **Layer 0 (Background):** `epub.js` iframe 영역 (콘텐츠 렌더링)
2.  **Layer 1 (Interaction):**
    * **Tap Zones:** 좌/우 20% (페이지 넘김), 중앙 60% (메뉴 토글)
    * **Gestures:** Swipe (모바일 페이지 넘김), Pinch-to-zoom (이미지 확대)
3.  **Layer 2 (HUD/Overlays):**
    * **Top Bar:** 뒤로가기, 목차, 검색, 번역/사전 도구
    * **Bottom Bar:** 스크러버(Scrubber), 챕터 정보, 페이지 슬라이더
    * **Context Menu:** 텍스트 선택 시 뜨는 툴팁 (하이라이트, 번역, 공유)
4.  **Layer 3 (Modals):** 설정 패널, 목차 사이드바, 검색 결과창

### B. 반응형 전략 (Responsive Strategy)
* **Desktop:** Spread View (두 페이지 보기) 기본 지원. 창 크기에 따라 Single/Spread 자동 전환.
* **Mobile:** Single View. 스크롤 방식보다 **Paginated(페이지 넘김)** 방식을 기본으로 채택하여 긴 챕터 렌더링 성능 최적화.

---

## 2. 핵심 기능 및 기술 명세 (Core Technical Spec)

### A. 상태 관리 (Zustand Store)
`src/store/readerStore.ts`

```typescript
interface ReaderState {
  // 독서 상태
  currentCfi: string;
  progress: number;
  chapterTitle: string;
  isMenuOpen: boolean;
  
  // 사용자 설정 (Persisted)
  settings: {
    theme: 'light' | 'dark' | 'sepia' | 'auto'; // 시스템 테마 연동
    fontSize: number;
    fontFamily: 'serif' | 'sans' | 'original';
    lineHeight: number;
    viewMode: 'paginated' | 'scrolled';
    spread: 'auto' | 'none'; // 두 쪽 보기 설정
  };
}
````

### B. 퍼포먼스 및 렌더링 최적화 (Performance - v2.0)

  * **가상화 및 프리로딩 (Virtualization & Preloading):**
      * 현재 챕터를 읽는 동안 `epub.js` 백그라운드에서 이전/다음 챕터를 미리 렌더링(Pre-render).
      * 챕터 전환 시 로딩 스피너 제거 (Zero-latency transition).
  * **낙관적 업데이트 (Optimistic UI):**
      * 하이라이트/북마크 생성 시 DB 응답을 기다리지 않고 UI에 즉시 반영. 실패 시 롤백.
  * **Service Worker & Cache API:**
      * `next-pwa` 활용. 읽고 있는 책의 현재 챕터와 인접 챕터를 캐싱하여 **오프라인 읽기** 지원.

### C. 글로벌 타이포그래피 (Typography & i18n - v2.0)

  * **CJK/RTL 지원:**
      * EPUB 메타데이터의 `page-progression-direction` 감지.
      * `rtl`일 경우 UI 및 페이지 넘김 방향 반전.
      * `writing-mode: vertical-rl` (일본어/중국어 세로 쓰기) CSS 자동 적용.
  * **다국어 폰트 최적화:**
      * Google Fonts CDN을 통해 언어별(KR, JP, SC, TC) 최적 폰트 동적 로드.
      * "원본 스타일 유지" 옵션 제공.

-----

## 3\. 학습 및 편의 기능 (Advanced Features - v2.0)

### A. 인스턴트 학습 도구 (Context Menu)

텍스트 선택(Selection) 시 나타나는 메뉴를 확장합니다.

  * **번역 (Translate):** Google Translate API 연동. 선택한 문장을 사용자 설정 언어로 즉시 번역 팝업 표시.
  * **사전 (Dictionary):** 단어 더블 클릭 시 Wiktionary API 등을 통해 정의 표시.
  * **공유 (Share):** "이미지 카드로 공유" 기능 (명언 카드 생성).

### B. 본문 검색 (In-book Search)

  * `epub.js`의 `book.spine.each()`와 `doSearch()` 메서드를 결합한 비동기 검색 구현.
  * 검색 결과 사이드바에 키워드 전후 문맥(KWIC) 표시.
  * 클릭 시 해당 CFI로 이동 및 하이라이트 처리.

### C. TTS (Audiobook Mode)

  * **Web Speech API** 활용. 별도 오디오 파일 없이 브라우저 내장 TTS로 읽어주기 기능 구현.
  * 현재 읽고 있는 문장 하이라이트 동기화(Karaoke effect).

-----

## 4\. 데이터 분석 및 사용자 행동 추적 (Analytics & Telemetry)

글로벌 사용자의 독서 경험을 정량/정성적으로 분석하여 서비스를 개선합니다.

### A. 기술 스택

  * **Analytics:** PostHog (이벤트 추적 + Session Replay)
  * **Error Tracking:** Sentry (렌더링 에러 및 충돌 감지)

### B. 이벤트 택소노미 (Event Taxonomy)

`src/lib/analytics/events.ts`

| 이벤트명 | 트리거 시점 | 수집 데이터 (Properties) | 목적 |
| :--- | :--- | :--- | :--- |
| `reader_opened` | 뷰어 진입 시 | book\_id, language, device\_type | 인기도 및 기기 환경 파악 |
| `reader_page_turn` | 페이지 넘김 | direction, method (tap/swipe/key) | UI 사용성 및 가독성 분석 |
| `reader_progress` | 진행률 갱신 | percentage (10% 단위), time\_spent | 완독률 및 이탈 구간 분석 |
| `feature_used` | 기능 사용 시 | feature\_name (highlight/translate/tts) | 킬러 기능 발굴 및 UX 개선 |
| `reader_error` | 에러 발생 | error\_code, chapter\_id | 특정 EPUB 파일 호환성 문제 해결 |
| `session_end` | 뷰어 종료 | total\_duration, pages\_read | 사용자 몰입도(Engagement) 측정 |

### C. 구현 예시 (Hook Integration)

```typescript
// src/hooks/useAnalytics.ts
export const useTrackReading = () => {
  // PostHog Hook 사용
  const posthog = usePostHog();

  const trackProgress = (percentage: number, bookId: string) => {
    // 데이터 노이즈 감소를 위해 10% 단위로만 전송
    if (percentage > 0 && percentage % 10 === 0) {
      posthog.capture('reader_progress', { 
        book_id: bookId, 
        percentage,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  return { trackProgress };
};
```

-----

## 5\. 접근성 (Accessibility - a11y)

  * **스크린 리더:** iframe 내부 콘텐츠에 `role="doc-chapter"`, `aria-label` 등 ARIA 속성 자동 주입.
  * **키보드 네비게이션:**
      * `Tab`: 메뉴, 설정, 목차 간 포커스 이동.
      * `Arrow Left/Right`: 페이지 이동.
      * `Space`: 스크롤 모드 시 한 화면 아래로 이동.
  * **색약 지원:** 고대비(High Contrast) 테마 지원.

-----

## 6\. 개발 로드맵 (Milestones)

### Phase 1: Core Viewer (Week 1-2)

  - [ ] `epub.js` 기본 렌더링 및 페이지네이션
  - [ ] UI 레이아웃 (Top/Bottom Bars)
  - [ ] Zustand 상태 관리 및 로컬 스토리지 연동

### Phase 2: UX & Performance (Week 3-4)

  - [ ] 가상화(Preloading) 및 Optimistic UI 적용
  - [ ] 모바일 제스처 (Swipe) 및 반응형 Spread View
  - [ ] PostHog & Sentry 연동 (Analytics)

### Phase 3: Global & Advanced (Week 5-6)

  - [ ] 다국어 폰트 시스템 및 세로 쓰기(Vertical) 지원
  - [ ] 선택 메뉴 (번역/사전/하이라이트) 구현
  - [ ] 본문 검색 및 TTS 기능 추가
