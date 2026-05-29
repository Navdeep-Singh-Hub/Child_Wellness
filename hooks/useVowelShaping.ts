import { VowelShapingEngine } from '@/components/game/speech/vowel-shaping/modules/VowelShapingEngine';
import { vowelShapingRoundDifficulty } from '@/components/game/speech/vowel-shaping/modules/VowelShapingSessionManager';
import type {
  VowelShapingDifficulty,
  VowelShapingGameId,
  VowelShapingSnapshot,
} from '@/components/game/speech/vowel-shaping/modules/vowelShapingTypes';
import { useVoiceLevel } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type VowelShapingSense = VowelShapingSnapshot & {
  engine: VowelShapingEngine;
  difficulty: VowelShapingDifficulty;
  imitate: (withVocal?: boolean) => void;
  goodTry: () => void;
  consumeReward: () => boolean;
  optionalMicOn: boolean;
  setOptionalMicOn: (on: boolean) => void;
  micLevel: number;
  startOptionalMic: () => Promise<boolean>;
};

export function useVowelShaping(
  enabled: boolean,
  gameId: VowelShapingGameId,
  round: number,
) {
  const difficulty = vowelShapingRoundDifficulty(round);
  const engineRef = useRef(new VowelShapingEngine(gameId));
  const [snap, setSnap] = useState<VowelShapingSnapshot>(() => engineRef.current.tick());
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

  const imitate = useCallback((withVocal?: boolean) => {
    engineRef.current.imitate({ withVocal });
    setSnap(engineRef.current.tick());
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.imitate({ withVocal: false });
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
    imitate,
    goodTry,
    consumeReward,
    optionalMicOn,
    setOptionalMicOn,
    micLevel: voice.status === 'active' ? voice.level : 0,
    startOptionalMic,
  } satisfies VowelShapingSense;
}
