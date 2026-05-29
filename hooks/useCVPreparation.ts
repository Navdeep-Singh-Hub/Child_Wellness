import { CVPreparationEngine } from '@/components/game/speech/cv-preparation/modules/CVPreparationEngine';
import { cvPreparationRoundDifficulty } from '@/components/game/speech/cv-preparation/modules/CVPreparationSessionManager';
import type {
  CVPreparationDifficulty,
  CVPreparationGameId,
  CVPreparationSnapshot,
  CVPattern,
} from '@/components/game/speech/cv-preparation/modules/cvPreparationTypes';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CVPreparationSense = CVPreparationSnapshot & {
  engine: CVPreparationEngine;
  difficulty: CVPreparationDifficulty;
  tryPattern: (opts?: { withVocal?: boolean; pattern?: CVPattern }) => void;
  goodTry: () => void;
  consumeReward: () => boolean;
  optionalMicOn: boolean;
  setOptionalMicOn: (on: boolean) => void;
  micLevel: number;
  startOptionalMic: () => Promise<boolean>;
};

export function useCVPreparation(
  enabled: boolean,
  gameId: CVPreparationGameId,
  round: number,
) {
  const difficulty = cvPreparationRoundDifficulty(round);
  const engineRef = useRef(new CVPreparationEngine(gameId));
  const [snap, setSnap] = useState<CVPreparationSnapshot>(() => engineRef.current.tick());
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

  const tryPattern = useCallback((opts?: { withVocal?: boolean; pattern?: CVPattern }) => {
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
    tryPattern,
    goodTry,
    consumeReward,
    optionalMicOn,
    setOptionalMicOn,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startOptionalMic,
  } satisfies CVPreparationSense;
}
