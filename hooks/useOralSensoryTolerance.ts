import { OralSensoryToleranceEngine } from '@/components/game/speech/oral-sensory-tolerance/modules/OralSensoryToleranceEngine';
import { oralToleranceRoundDifficulty } from '@/components/game/speech/oral-sensory-tolerance/modules/OralToleranceSessionManager';
import type {
  OralToleranceDifficulty,
  OralToleranceSnapshot,
} from '@/components/game/speech/oral-sensory-tolerance/modules/oralSensoryTypes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type OralToleranceSense = OralToleranceSnapshot & {
  engine: OralSensoryToleranceEngine;
  difficulty: OralToleranceDifficulty;
  /** Child-friendly interaction: tap/drag/press */
  interact: (intensity?: number) => void;
  /** Parent helper: counts as participation without pressure */
  goodTry: () => void;
  /** Reduce sensory load immediately */
  calmDown: () => void;
  consumeReward: () => boolean;
};

export function useOralSensoryTolerance(
  enabled: boolean,
  gameId: Parameters<typeof OralSensoryToleranceEngine>[0],
  round: number,
) {
  const difficulty = useMemo(() => oralToleranceRoundDifficulty(round), [round]);
  const engineRef = useRef(new OralSensoryToleranceEngine(gameId));
  const [snap, setSnap] = useState<OralToleranceSnapshot>(() => engineRef.current.tick());

  useEffect(() => {
    engineRef.current.configure(difficulty);
  }, [difficulty]);

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
  }, [enabled]);

  const interact = useCallback((intensity = 0.35) => {
    engineRef.current.recordInteraction(intensity);
    setSnap(engineRef.current.tick());
  }, []);

  const goodTry = useCallback(() => {
    // treat as a gentle interaction + small comfort boost
    engineRef.current.recordInteraction(0.25);
    engineRef.current.triggerReward('SMILE');
    setSnap(engineRef.current.tick());
  }, []);

  const calmDown = useCallback(() => {
    engineRef.current.lowerSensoryLoad();
    engineRef.current.triggerReward('CALM_CELEBRATION');
    setSnap(engineRef.current.tick());
  }, []);

  const consumeReward = useCallback(() => engineRef.current.consumeRewardPulse(), []);

  return {
    ...snap,
    engine: engineRef.current,
    difficulty,
    interact,
    goodTry,
    calmDown,
    consumeReward,
  } satisfies OralToleranceSense;
}

