'use client';

import { useState, useCallback, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, SkipForward, SkipBack, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTTS } from '@/hooks/useTTS';

interface TTSControlsProps {
  getText: () => string; // 현재 페이지의 텍스트를 가져오는 함수
  onNext?: () => void; // 다음 페이지로 이동
  onPrev?: () => void; // 이전 페이지로 이동
  bookLanguage?: string; // 책 언어 (en, ko 등)
}

export function TTSControls({ getText, onNext, onPrev, bookLanguage = 'en' }: TTSControlsProps) {
  const {
    isSupported,
    isPlaying,
    isPaused,
    progress,
    voices,
    selectedVoice,
    rate,
    speak,
    pause,
    resume,
    stop,
    setRate,
    setVoice,
    getVoicesForLanguage,
  } = useTTS();

  const [isOpen, setIsOpen] = useState(false);
  const [autoNextPage, setAutoNextPage] = useState(true);

  // 책 언어에 맞는 음성 필터링
  const filteredVoices = getVoicesForLanguage(bookLanguage);

  // 재생/일시정지 토글
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      const text = getText();
      if (text) {
        speak(text);
      }
    }
  }, [isPlaying, isPaused, resume, pause, getText, speak]);

  // 정지
  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  // 음성 선택 핸들러
  const handleVoiceChange = useCallback(
    (voiceName: string) => {
      const voice = voices.find((v) => v.name === voiceName);
      if (voice) {
        setVoice(voice);
      }
    },
    [voices, setVoice]
  );

  // 속도 선택 핸들러
  const handleRateChange = useCallback(
    (value: string) => {
      setRate(parseFloat(value));
    },
    [setRate]
  );

  // 자동 다음 페이지 (TTS 완료 시)
  useEffect(() => {
    if (!isPlaying && progress === 100 && autoNextPage && onNext) {
      // 짧은 딜레이 후 다음 페이지로 이동
      const timer = setTimeout(() => {
        onNext();
        // 다음 페이지 텍스트 읽기
        setTimeout(() => {
          const text = getText();
          if (text) {
            speak(text);
          }
        }, 500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, progress, autoNextPage, onNext, getText, speak]);

  if (!isSupported) {
    return null; // TTS 미지원 시 숨김
  }

  return (
    <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-lg border p-2 shadow-lg">
      {/* 이전 페이지 */}
      {onPrev && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={isPlaying}
          className="h-8 w-8 p-0"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
      )}

      {/* 재생/일시정지 */}
      <Button
        variant={isPlaying && !isPaused ? 'default' : 'outline'}
        size="sm"
        onClick={handlePlayPause}
        className="h-8 w-8 p-0"
      >
        {isPlaying && !isPaused ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* 정지 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStop}
        disabled={!isPlaying}
        className="h-8 w-8 p-0"
      >
        <Square className="h-4 w-4" />
      </Button>

      {/* 다음 페이지 */}
      {onNext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={isPlaying}
          className="h-8 w-8 p-0"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      )}

      {/* 진행률 표시 */}
      {isPlaying && (
        <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 속도 표시 */}
      <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
        {rate}x
      </span>

      {/* 설정 팝오버 */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">TTS Settings</h4>

            {/* 음성 선택 */}
            <div className="space-y-2">
              <Label className="text-xs">Voice</Label>
              <Select
                value={selectedVoice?.name || ''}
                onValueChange={handleVoiceChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {(filteredVoices.length > 0 ? filteredVoices : voices).map((voice) => (
                    <SelectItem key={voice.name} value={voice.name} className="text-xs">
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 속도 조절 */}
            <div className="space-y-2">
              <Label className="text-xs">Speed: {rate}x</Label>
              <Select value={rate.toString()} onValueChange={handleRateChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x (Normal)</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="1.75">1.75x</SelectItem>
                  <SelectItem value="2">2x (Fast)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 자동 다음 페이지 */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Auto next page</Label>
              <Button
                variant={autoNextPage ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-xs"
                onClick={() => setAutoNextPage(!autoNextPage)}
              >
                {autoNextPage ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
