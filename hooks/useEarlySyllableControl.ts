import { EarlySyllableControlEngine } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlEngine';
import { earlySyllableRoundDifficulty } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlSessionManager';
import type {
  EarlySyllable,
  EarlySyllableControlGameId,
  EarlySyllableControlSnapshot,
  EarlySyllableDifficulty,
} from '@/components/game/speech/early-syllable-control/modules/earlySyllableControlTypes';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type EarlySyllableControlSense = EarlySyllableControlSnapshot & {
  engine: EarlySyllableControlEngine;
  difficulty: EarlySyllableDifficulty;
  trySyllable: (opts?: { withVocal?: boolean; syllable?: EarlySyllable }) => void;
  goodTry: () => void;
  consumeReward: () => boolean;
  optionalMicOn: boolean;
  setOptionalMicOn: (on: boolean) => void;
  micLevel: number;
  startOptionalMic: () => Promise<boolean>;
};

export function useEarlySyllableControl(
  enabled: boolean,
  gameId: EarlySyllableControlGameId,
  round: number,
) {
  const difficulty = earlySyllableRoundDifficulty(round);
  const engineRef = useRef(new EarlySyllableControlEngine(gameId));
  const [snap, setSnap] = useState<EarlySyllableControlSnapshot>(() => engineRef.current.tick());
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

  const trySyllable = useCallback((opts?: { withVocal?: boolean; syllable?: EarlySyllable }) => {
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
    trySyllable,
    goodTry,
    consumeReward,
    optionalMicOn,
    setOptionalMicOn,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startOptionalMic,
  } satisfies EarlySyllableControlSense;
}
