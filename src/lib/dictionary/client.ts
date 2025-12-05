/**
 * Dictionary client using Free Dictionary API
 * https://dictionaryapi.dev/
 */

export interface DictionaryDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  phoneticAudio?: string;
  definitions: DictionaryDefinition[];
  origin?: string;
}

interface FreeDictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface FreeDictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface FreeDictionaryMeaning {
  partOfSpeech: string;
  definitions: FreeDictionaryDefinition[];
}

interface FreeDictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics?: FreeDictionaryPhonetic[];
  meanings: FreeDictionaryMeaning[];
  origin?: string;
}

// 사전 결과 캐시 (메모리 내)
const dictionaryCache = new Map<string, DictionaryResult>();

/**
 * 단어 정의 조회
 */
export async function lookupWord(word: string): Promise<DictionaryResult> {
  // 단어 정규화 (소문자, 공백 제거)
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) {
    throw new Error('Word is required');
  }

  // 여러 단어인 경우 첫 번째 단어만 사용
  const singleWord = normalizedWord.split(/\s+/)[0];

  // 캐시 확인
  const cached = dictionaryCache.get(singleWord);
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(singleWord)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`No definition found for "${word}"`);
    }
    throw new Error('Dictionary lookup failed');
  }

  const data: FreeDictionaryResponse[] = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`No definition found for "${word}"`);
  }

  const entry = data[0];

  // 발음 정보 추출
  let phonetic = entry.phonetic;
  let phoneticAudio: string | undefined;

  if (entry.phonetics && entry.phonetics.length > 0) {
    // 오디오가 있는 발음 우선
    const phoneticWithAudio = entry.phonetics.find((p) => p.audio);
    if (phoneticWithAudio) {
      phonetic = phonetic || phoneticWithAudio.text;
      phoneticAudio = phoneticWithAudio.audio;
    } else if (!phonetic && entry.phonetics[0].text) {
      phonetic = entry.phonetics[0].text;
    }
  }

  // 정의 정리
  const definitions: DictionaryDefinition[] = [];
  for (const meaning of entry.meanings) {
    for (const def of meaning.definitions.slice(0, 3)) {
      // 품사당 최대 3개
      definitions.push({
        partOfSpeech: meaning.partOfSpeech,
        definition: def.definition,
        example: def.example,
        synonyms: def.synonyms?.slice(0, 5),
        antonyms: def.antonyms?.slice(0, 5),
      });
    }
  }

  const result: DictionaryResult = {
    word: entry.word,
    phonetic,
    phoneticAudio,
    definitions: definitions.slice(0, 10), // 최대 10개 정의
    origin: entry.origin,
  };

  // 캐시에 저장 (최대 100개)
  if (dictionaryCache.size >= 100) {
    const firstKey = dictionaryCache.keys().next().value;
    if (firstKey) {
      dictionaryCache.delete(firstKey);
    }
  }
  dictionaryCache.set(singleWord, result);

  return result;
}

/**
 * 발음 오디오 재생
 */
export function playPronunciation(audioUrl: string): void {
  if (!audioUrl) return;

  const audio = new Audio(audioUrl);
  audio.play().catch((err) => {
    console.warn('Failed to play pronunciation:', err);
  });
}

/**
 * 캐시 초기화
 */
export function clearDictionaryCache(): void {
  dictionaryCache.clear();
}
