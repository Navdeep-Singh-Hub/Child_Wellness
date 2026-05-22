import { useJawDetection } from '@/hooks/useJawDetection';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
} from '@/components/game/speech/level3/shared/voiceGameShared';
import { Platform } from 'react-native';
import React, { useCallback, useEffect, useRef } from 'react';

export {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  DEFAULT_VOICE_ROUNDS,
};

export function useBilabialGameSession(gameId: string, rounds = DEFAULT_VOICE_ROUNDS) {
  const session = useVoiceGameSession(gameId, rounds);
  return session;
}

export type BilabialCtx = {
  voiceLevel: number;
  voiceActive: boolean;
  isOpen: boolean;
  ratio: number;
  isDetecting: boolean;
};

export function useBilabialHooks() {
  const voice = useVoiceLevel({ enabled: true });
  const jaw = useJawDetection(false);

  const ctx: BilabialCtx = {
    voiceLevel: voice.level,
    voiceActive: voice.status === 'active',
    isOpen: jaw.isOpen || false,
    ratio: jaw.ratio || 0,
    isDetecting: jaw.isDetecting || false,
  };

  return { voice, ctx };
}

/** Web: count speech hits for target syllables */
export function useSpeechHitCounter(
  active: boolean,
  targetWords: string[],
  confidence = 0.55,
) {
  const sr = useSpeechRecognition(active && Platform.OS === 'web', {
    continuous: true,
    interimResults: true,
    targetWords,
    confidenceThreshold: confidence,
  });
  const hitsRef = useRef(0);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const len = sr.detectedWords.length;
    if (len > prevLenRef.current) {
      hitsRef.current += len - prevLenRef.current;
      prevLenRef.current = len;
    }
  }, [sr.detectedWords]);

  const resetHits = useCallback(() => {
    hitsRef.current = 0;
    prevLenRef.current = sr.detectedWords.length;
  }, [sr.detectedWords.length]);

  const consumeHit = useCallback(() => {
    if (hitsRef.current <= 0) return false;
    hitsRef.current -= 1;
    return true;
  }, []);

  const hasHit = hitsRef.current > 0;

  return {
    ...sr,
    hits: hitsRef.current,
    hasNewHit: hasHit,
    consumeHit,
    resetHits,
    useSpeech: Platform.OS === 'web' && sr.isAvailable && sr.hasMicrophone,
  };
}

/** Plosive / bilabial burst (puh, buh) from mic envelope */
export function createBurstDetector(options?: {
  minDelta?: number;
  minLevel?: number;
  cooldownMs?: number;
}) {
  const minDelta = options?.minDelta ?? 0.12;
  const minLevel = options?.minLevel ?? 0.2;
  const cooldownMs = options?.cooldownMs ?? 450;
  let smooth = 0;
  let lastBurst = 0;

  return {
    tick(level: number, active: boolean): boolean {
      if (!active) {
        smooth = level;
        return false;
      }
      const delta = level - smooth;
      smooth = smooth * 0.65 + level * 0.35;
      const now = Date.now();
      if (delta >= minDelta && level >= minLevel && now - lastBurst >= cooldownMs) {
        lastBurst = now;
        return true;
      }
      return false;
    },
    reset() {
      smooth = 0;
      lastBurst = 0;
    },
  };
}

/** “Ma ma ma” lip cycle on native when speech API unavailable */
export function createLipCycleDetector() {
  let wasClosed = false;
  let lastHit = 0;

  return {
    tick(_isOpen: boolean, ratio: number, isDetecting: boolean, cooldownMs = 480): boolean {
      if (!isDetecting) return false;
      const now = Date.now();
      const closed = ratio < 0.034;
      const open = ratio > 0.042;
      if (closed) wasClosed = true;
      if (wasClosed && open && now - lastHit > cooldownMs) {
        wasClosed = false;
        lastHit = now;
        return true;
      }
      return false;
    },
    reset() {
      wasClosed = false;
      lastHit = 0;
    },
  };
}

/** Sustained hum for “mmm” */
export function sustainedVoice(
  level: number,
  active: boolean,
  holdMs: number,
  holdRef: React.MutableRefObject<number | null>,
  minLevel = VOICE_ACTIVE_THRESHOLD,
): { progress: number; done: boolean } {
  const now = Date.now();
  if (!active || level < minLevel) {
    holdRef.current = null;
    return { progress: 0, done: false };
  }
  if (!holdRef.current) holdRef.current = now;
  const held = now - holdRef.current;
  return { progress: Math.min(1, held / holdMs), done: held >= holdMs };
}
