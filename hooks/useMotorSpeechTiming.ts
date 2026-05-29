import { MotorSpeechTimingEngine } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingEngine';
import { motorSpeechTimingRoundDifficulty } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingSessionManager';
import type {
  MotorSpeechTimingDifficulty,
  MotorSpeechTimingGameId,
  MotorSpeechTimingSnapshot,
  RhythmBeat,
} from '@/components/game/speech/motor-speech-timing/modules/motorSpeechTimingTypes';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type MotorSpeechTimingSense = MotorSpeechTimingSnapshot & {
  engine: MotorSpeechTimingEngine;
  difficulty: MotorSpeechTimingDifficulty;
  tryRhythm: (opts?: { withVocal?: boolean; rhythm?: RhythmBeat }) => void;
  goodTry: () => void;
  consumeReward: () => boolean;
  optionalMicOn: boolean;
  setOptionalMicOn: (on: boolean) => void;
  micLevel: number;
  startOptionalMic: () => Promise<boolean>;
};

export function useMotorSpeechTiming(
  enabled: boolean,
  gameId: MotorSpeechTimingGameId,
  round: number,
) {
  const difficulty = motorSpeechTimingRoundDifficulty(round);
  const engineRef = useRef(new MotorSpeechTimingEngine(gameId));
  const [snap, setSnap] = useState<MotorSpeechTimingSnapshot>(() => engineRef.current.tick());
  const [optionalMicOn, setOptionalMicOn] = useState(false);

  const voice = useVoiceLevel({
    enabled: enabled && optionalMicOn,
    sensitivity: 1.75,
    autoStart: false,
  });

  useEffect(() => {
    engineRef.current.configure(difficulty);
    engineRef.current.showPrompt();
  }, [difficulty, gameId]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      setSnap(engineRef.current.tick());
      return;
    }
    const id = setInterval(() => {
      setSnap(engineRef.current.tick());
    }, 50);
    return () => clearInterval(id);
  }, [enabled, optionalMicOn, voice.level, voice.status]);

  useEffect(() => {
    if (!optionalMicOn) voice.stop();
  }, [optionalMicOn, voice]);

  const tryRhythm = useCallback((opts?: { withVocal?: boolean; rhythm?: RhythmBeat }) => {
    engineRef.current.attempt(opts);
    setSnap(engineRef.current.tick());
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.attempt({ withVocal: false });
    engineRef.current.triggerReward('SPARKLE');
    setSnap(engineRef.current.tick());
  }, []);

  const consumeReward = useCallback(() => engineRef.current.consumeRewardPulse(), []);

  const startOptionalMic = useCallback(async () => {
    const ok = await voice.start();
    if (ok) setOptionalMicOn(true);
    return ok;
  }, [voice]);

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    tryRhythm,
    goodTry,
    consumeReward,
    optionalMicOn,
    setOptionalMicOn,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startOptionalMic,
  } satisfies MotorSpeechTimingSense;
}
