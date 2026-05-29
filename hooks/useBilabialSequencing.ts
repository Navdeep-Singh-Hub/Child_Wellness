import { BilabialSequencingEngine } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingEngine';
import { bilabialSequencingRoundDifficulty } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingSessionManager';
import type {
  BilabialRepeat,
  BilabialSequencingDifficulty,
  BilabialSequencingGameId,
  BilabialSequencingSnapshot,
} from '@/components/game/speech/bilabial-sequencing/modules/bilabialSequencingTypes';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type BilabialSequencingSense = BilabialSequencingSnapshot & {
  engine: BilabialSequencingEngine;
  difficulty: BilabialSequencingDifficulty;
  tryRepeat: (opts?: { withVocal?: boolean; repeat?: BilabialRepeat }) => void;
  goodTry: () => void;
  consumeReward: () => boolean;
  optionalMicOn: boolean;
  setOptionalMicOn: (on: boolean) => void;
  micLevel: number;
  startOptionalMic: () => Promise<boolean>;
};

export function useBilabialSequencing(
  enabled: boolean,
  gameId: BilabialSequencingGameId,
  round: number,
) {
  const difficulty = bilabialSequencingRoundDifficulty(round);
  const engineRef = useRef(new BilabialSequencingEngine(gameId));
  const [snap, setSnap] = useState<BilabialSequencingSnapshot>(() => engineRef.current.tick());
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

  const tryRepeat = useCallback((opts?: { withVocal?: boolean; repeat?: BilabialRepeat }) => {
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
    tryRepeat,
    goodTry,
    consumeReward,
    optionalMicOn,
    setOptionalMicOn,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startOptionalMic,
  } satisfies BilabialSequencingSense;
}
