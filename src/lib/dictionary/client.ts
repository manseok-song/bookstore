/**
 * Dictionary client using Free Dictionary API
 * https://dictionaryapi.dev/
 *
 * With multilingual translation support
 */

import { translateText } from '@/lib/translate/client';

export interface DictionaryDefinition {
  partOfSpeech: string;
  partOfSpeechTranslated?: string;
  definition: string;
  definitionTranslated?: string;
  example?: string;
  exampleTranslated?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  phoneticAudio?: string;
  definitions: DictionaryDefinition[];
  origin?: string;
  originTranslated?: string;
  targetLanguage?: string;
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

// 품사 번역 (자주 사용되는 품사들)
const PART_OF_SPEECH_TRANSLATIONS: Record<string, Record<string, string>> = {
  ko: {
    noun: '명사',
    verb: '동사',
    adjective: '형용사',
    adverb: '부사',
    pronoun: '대명사',
    preposition: '전치사',
    conjunction: '접속사',
    interjection: '감탄사',
    determiner: '한정사',
    exclamation: '감탄사',
  },
  ja: {
    noun: '名詞',
    verb: '動詞',
    adjective: '形容詞',
    adverb: '副詞',
    pronoun: '代名詞',
    preposition: '前置詞',
    conjunction: '接続詞',
    interjection: '感嘆詞',
    determiner: '限定詞',
    exclamation: '感嘆詞',
  },
  zh: {
    noun: '名词',
    verb: '动词',
    adjective: '形容词',
    adverb: '副词',
    pronoun: '代词',
    preposition: '介词',
    conjunction: '连词',
    interjection: '感叹词',
    determiner: '限定词',
    exclamation: '感叹词',
  },
  es: {
    noun: 'sustantivo',
    verb: 'verbo',
    adjective: 'adjetivo',
    adverb: 'adverbio',
    pronoun: 'pronombre',
    preposition: 'preposición',
    conjunction: 'conjunción',
    interjection: 'interjección',
    determiner: 'determinante',
    exclamation: 'exclamación',
  },
};

// 사전 결과 캐시 (메모리 내) - word:lang 키 사용
const dictionaryCache = new Map<string, DictionaryResult>();

/**
 * 품사 번역
 */
function translatePartOfSpeech(partOfSpeech: string, targetLanguage: string): string {
  const translations = PART_OF_SPEECH_TRANSLATIONS[targetLanguage];
  if (!translations) return partOfSpeech;

  return translations[partOfSpeech.toLowerCase()] || partOfSpeech;
}

/**
 * 단어 정의 조회 (영어만)
 */
export async function lookupWord(word: string): Promise<DictionaryResult> {
  // 단어 정규화 (소문자, 공백 제거)
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) {
    throw new Error('Word is required');
  }

  // 여러 단어인 경우 첫 번째 단어만 사용
  const singleWord = normalizedWord.split(/\s+/)[0];
  const cacheKey = `${singleWord}:en`;

  // 캐시 확인
  const cached = dictionaryCache.get(cacheKey);
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
    targetLanguage: 'en',
  };

  // 캐시에 저장 (최대 200개)
  if (dictionaryCache.size >= 200) {
    const firstKey = dictionaryCache.keys().next().value;
    if (firstKey) {
      dictionaryCache.delete(firstKey);
    }
  }
  dictionaryCache.set(cacheKey, result);

  return result;
}

/**
 * 단어 정의 조회 + 번역 (다국어 지원)
 */
export async function lookupWordWithTranslation(
  word: string,
  targetLanguage: string = 'en'
): Promise<DictionaryResult> {
  // 영어인 경우 번역 없이 반환
  if (targetLanguage === 'en') {
    return lookupWord(word);
  }

  const normalizedWord = word.trim().toLowerCase();
  const singleWord = normalizedWord.split(/\s+/)[0];
  const cacheKey = `${singleWord}:${targetLanguage}`;

  // 캐시 확인
  const cached = dictionaryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 먼저 영어 정의 가져오기
  const englishResult = await lookupWord(word);

  // 번역할 텍스트 수집
  const textsToTranslate: string[] = [];

  for (const def of englishResult.definitions) {
    textsToTranslate.push(def.definition);
    if (def.example) {
      textsToTranslate.push(def.example);
    }
  }

  if (englishResult.origin) {
    textsToTranslate.push(englishResult.origin);
  }

  // 한 번에 번역 (구분자로 연결)
  const separator = '\n---SEPARATOR---\n';
  const combinedText = textsToTranslate.join(separator);

  let translatedTexts: string[] = [];

  try {
    const translationResult = await translateText({
      text: combinedText,
      targetLanguage,
    });
    translatedTexts = translationResult.translatedText.split(separator).map(t => t.trim());
  } catch (error) {
    console.warn('Translation failed, using English definitions:', error);
    // 번역 실패 시 영어 그대로 사용
    translatedTexts = textsToTranslate;
  }

  // 번역된 정의 재구성
  let textIndex = 0;
  const translatedDefinitions: DictionaryDefinition[] = englishResult.definitions.map((def) => {
    const result: DictionaryDefinition = {
      ...def,
      partOfSpeechTranslated: translatePartOfSpeech(def.partOfSpeech, targetLanguage),
      definitionTranslated: translatedTexts[textIndex++] || def.definition,
    };

    if (def.example) {
      result.exampleTranslated = translatedTexts[textIndex++] || def.example;
    }

    return result;
  });

  const result: DictionaryResult = {
    ...englishResult,
    definitions: translatedDefinitions,
    originTranslated: englishResult.origin ? translatedTexts[textIndex] : undefined,
    targetLanguage,
  };

  // 캐시에 저장
  if (dictionaryCache.size >= 200) {
    const firstKey = dictionaryCache.keys().next().value;
    if (firstKey) {
      dictionaryCache.delete(firstKey);
    }
  }
  dictionaryCache.set(cacheKey, result);

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
