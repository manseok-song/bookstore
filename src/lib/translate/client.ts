/**
 * Translation client for calling the translation API
 */

export interface TranslateOptions {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateResult {
  translatedText: string;
  detectedLanguage?: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
}

// 번역 결과 캐시 (메모리 내)
const translationCache = new Map<string, TranslateResult>();

function getCacheKey(options: TranslateOptions): string {
  return `${options.text}:${options.targetLanguage}:${options.sourceLanguage || 'auto'}`;
}

/**
 * 텍스트 번역
 */
export async function translateText(options: TranslateOptions): Promise<TranslateResult> {
  const cacheKey = getCacheKey(options);

  // 캐시 확인
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Translation failed');
  }

  const result: TranslateResult = await response.json();

  // 캐시에 저장 (최대 100개)
  if (translationCache.size >= 100) {
    // 가장 오래된 항목 제거
    const firstKey = translationCache.keys().next().value;
    if (firstKey) {
      translationCache.delete(firstKey);
    }
  }
  translationCache.set(cacheKey, result);

  return result;
}

/**
 * 지원 언어 목록 가져오기
 */
export async function getSupportedLanguages(): Promise<SupportedLanguage[]> {
  const response = await fetch('/api/translate');

  if (!response.ok) {
    throw new Error('Failed to fetch supported languages');
  }

  const data = await response.json();
  return data.languages;
}

/**
 * 캐시 초기화
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}
