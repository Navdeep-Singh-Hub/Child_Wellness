import { BreathLipCoordinationEngine } from '@/components/game/speech/breath-lip-coordination/modules/BreathLipCoordinationEngine';
import { breathLipRoundDifficulty } from '@/components/game/speech/breath-lip-coordination/modules/BreathLipCoordinationSessionManager';
import type {
  BreathLipCoordinationDifficulty,
  BreathLipCoordinationGameId,
  BreathLipCoordinationSnapshot,
} from '@/components/game/speech/breath-lip-coordination/modules/breathLipCoordinationTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type BreathLipCoordinationSense = BreathLipCoordinationSnapshot & {
  engine: BreathLipCoordinationEngine;
  difficulty: BreathLipCoordinationDifficulty;
  micStatus: VoiceLevelStatus;
  micError: string | null;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useBreathLipCoordination(
  enabled: boolean,
  gameId: BreathLipCoordinationGameId,
  round: number,
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'breath',
    sensitivity: 2.0,
    autoStart: false,
  });

  const difficulty = breathLipRoundDifficulty(round);
  const engineRef = useRef(new BreathLipCoordinationEngine(gameId));
  const [snap, setSnap] = useState<BreathLipCoordinationSnapshot>(() => engineRef.current.process(0));

  useEffect(() => {
    engineRef.current.configure(difficulty);
    engineRef.current.showPrompt();
  }, [difficulty, gameId]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      setSnap(engineRef.current.process(0));
      return;
    }
    const id = setInterval(() => {
      const level = voice.status === 'active' ? voice.level : 0;
      setSnap(engineRef.current.process(level));
    }, 50);
    return () => clearInterval(id);
  }, [enabled, voice.level, voice.status]);

  const coordinate = useCallback(() => {
    engineRef.current.coordinate();
    setSnap(engineRef.current.process(0.25));
  }, []);

  const goodTry = useCallback(() => {
    engineRef.current.goodTry();
    setSnap(engineRef.current.process(0.2));
  }, []);

  const consumeCoordinationPulse = useCallback(
    () => engineRef.current.consumeCoordinationPulse(),
    [],
  );

  useEffect(() => () => voice.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    micStatus: voice.status,
    micError: voice.error,
    startMic: voice.start,
    stopMic: voice.stop,
    coordinate,
    goodTry,
    consumeCoordinationPulse,
  } satisfies BreathLipCoordinationSense;
}
