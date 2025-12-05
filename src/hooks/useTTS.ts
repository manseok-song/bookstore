'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface TTSOptions {
  rate?: number; // 0.5 - 2
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
  voice?: SpeechSynthesisVoice | null;
}

interface UseTTSReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number; // 0-100
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  getVoicesForLanguage: (lang: string) => SpeechSynthesisVoice[];
}

/**
 * Web Speech API를 사용한 TTS 훅
 */
export function useTTS(options: TTSOptions = {}): UseTTSReturn {
  const { rate: initialRate = 1, pitch = 1, volume = 1, voice: initialVoice = null } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(initialVoice);
  const [rate, setRate] = useState(initialRate);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Web Speech API 지원 확인 및 음성 목록 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    synthRef.current = synth;

    // 음성 목록 로드
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);

      // 기본 음성 설정 (영어 우선)
      if (!selectedVoice && availableVoices.length > 0) {
        const englishVoice = availableVoices.find(
          (v) => v.lang.startsWith('en-') && v.default
        ) || availableVoices.find((v) => v.lang.startsWith('en-'));
        setSelectedVoice(englishVoice || availableVoices[0]);
      }
    };

    // 일부 브라우저에서는 비동기로 음성 목록이 로드됨
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  // 특정 언어의 음성 목록 가져오기
  const getVoicesForLanguage = useCallback(
    (lang: string): SpeechSynthesisVoice[] => {
      return voices.filter((v) => v.lang.startsWith(lang));
    },
    [voices]
  );

  // 텍스트 읽기
  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !isSupported) return;

      // 기존 음성 중지
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // 이벤트 핸들러
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentText(text);
        setProgress(0);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
      };

      utterance.onerror = (event) => {
        console.error('TTS error:', event.error);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      // 진행률 추적 (boundary 이벤트)
      utterance.onboundary = (event) => {
        if (event.name === 'word' && text.length > 0) {
          const progressPercent = Math.round((event.charIndex / text.length) * 100);
          setProgress(progressPercent);
        }
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [isSupported, rate, pitch, volume, selectedVoice]
  );

  // 일시정지
  const pause = useCallback(() => {
    if (!synthRef.current || !isPlaying) return;
    synthRef.current.pause();
    setIsPaused(true);
  }, [isPlaying]);

  // 재개
  const resume = useCallback(() => {
    if (!synthRef.current || !isPaused) return;
    synthRef.current.resume();
    setIsPaused(false);
  }, [isPaused]);

  // 정지
  const stop = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentText('');
  }, []);

  // 속도 변경
  const handleSetRate = useCallback((newRate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, newRate));
    setRate(clampedRate);
  }, []);

  // 음성 변경
  const handleSetVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  // 컴포넌트 언마운트 시 정지
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentText,
    progress,
    voices,
    selectedVoice,
    rate,
    speak,
    pause,
    resume,
    stop,
    setRate: handleSetRate,
    setVoice: handleSetVoice,
    getVoicesForLanguage,
  };
}
