import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (환경 변수 또는 Secret Manager에서 가져옴)
let openaiClient: OpenAI | null = null;

async function getOpenAIClient(): Promise<OpenAI> {
  if (openaiClient) return openaiClient;

  // 환경 변수에서 API 키 가져오기
  // 프로덕션에서는 Google Secret Manager 사용 권장
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

// 지원되는 언어 목록
const SUPPORTED_LANGUAGES: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  ja: 'Japanese',
  zh: 'Chinese (Simplified)',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ru: 'Russian',
  ar: 'Arabic',
  vi: 'Vietnamese',
  th: 'Thai',
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: TranslateRequest = await request.json();
    const { text, targetLanguage, sourceLanguage } = body;

    // 유효성 검사
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage || !SUPPORTED_LANGUAGES[targetLanguage]) {
      return NextResponse.json(
        { error: 'Invalid target language' },
        { status: 400 }
      );
    }

    // 텍스트 길이 제한 (비용 관리)
    const MAX_TEXT_LENGTH = 2000;
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.` },
        { status: 400 }
      );
    }

    const openai = await getOpenAIClient();

    // 번역 프롬프트 구성
    const targetLangName = SUPPORTED_LANGUAGES[targetLanguage];
    const sourceLangInfo = sourceLanguage
      ? `from ${SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage} `
      : '';

    const systemPrompt = `You are a professional translator. Translate the following text ${sourceLangInfo}to ${targetLangName}.
Preserve the original meaning, tone, and style.
Only return the translated text without any explanations or additional text.
If the text contains idioms or cultural references, translate them appropriately for the target audience.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3, // 번역은 일관성을 위해 낮은 온도
      max_tokens: 1000,
    });

    const translatedText = response.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Translation failed' },
        { status: 500 }
      );
    }

    const result: TranslateResponse = {
      translatedText,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation error:', error);

    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'Translation service not configured' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}

// 지원 언어 목록 반환
export async function GET() {
  return NextResponse.json({
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code,
      name,
    })),
  });
}
