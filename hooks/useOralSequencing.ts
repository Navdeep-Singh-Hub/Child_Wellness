import { OralSequencingEngine } from '@/components/game/speech/oral-sequencing/modules/OralSequencingEngine';
import { oralSequencingRoundDifficulty } from '@/components/game/speech/oral-sequencing/modules/OralSequencingSessionManager';
import type {
  OralSequencingDifficulty,
  OralSequencingGameId,
  OralSequencingSnapshot,
} from '@/components/game/speech/oral-sequencing/modules/oralSequencingTypes';
import { useVoiceLevel, type VoiceLevelStatus } from '@/hooks/useVoiceLevel';
import { useCallback, useEffect, useRef, useState } from 'react';

export type OralSequencingSense = OralSequencingSnapshot & {
  engine: OralSequencingEngine;
  difficulty: OralSequencingDifficulty;
  micStatus: VoiceLevelStatus;
  micError: string | null;
  startMic: () => Promise<boolean>;
  stopMic: () => void;
  coordinate: () => void;
  goodTry: () => void;
  consumeCoordinationPulse: () => boolean;
};

export function useOralSequencing(
  enabled: boolean,
  gameId: OralSequencingGameId,
  round: number,
) {
  const voice = useVoiceLevel({
    enabled: true,
    variant: 'breath',
    sensitivity: 2.0,
    autoStart: false,
  });

  const difficulty = oralSequencingRoundDifficulty(round);
  const engineRef = useRef(new OralSequencingEngine(gameId));
  const [snap, setSnap] = useState<OralSequencingSnapshot>(() => engineRef.current.process(0));

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
  } satisfies OralSequencingSense;
}
