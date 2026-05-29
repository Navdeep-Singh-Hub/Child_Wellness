import { LipAwarenessEngine } from '@/components/game/speech/lip-awareness/modules/LipAwarenessEngine';
import type {
  LipAwarenessSnapshot,
  LipDifficulty,
  LipPose,
} from '@/components/game/speech/lip-awareness/modules/lipAwarenessTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LipAwarenessSense extends LipAwarenessSnapshot {
  startPrompt: (pose: LipPose) => void;
  confirmInteraction: () => LipAwarenessSnapshot;
  registerTap: () => LipAwarenessSnapshot;
  consumePulse: () => boolean;
  engine: LipAwarenessEngine;
}

export function useLipAwareness(
  enabled: boolean,
  difficulty: LipDifficulty = 'easy',
): LipAwarenessSense {
  const engineRef = useRef(new LipAwarenessEngine());
  const [snap, setSnap] = useState<LipAwarenessSnapshot>(() =>
    engineRef.current.getSnapshot(),
  );

  useEffect(() => {
    engineRef.current.configure(difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.reset();
      setSnap(engineRef.current.getSnapshot());
      return;
    }
    const id = setInterval(() => {
      setSnap(engineRef.current.tick());
    }, 80);
    return () => clearInterval(id);
  }, [enabled]);

  const startPrompt = useCallback((pose: LipPose) => {
    engineRef.current.beginPrompt(pose);
    setSnap(engineRef.current.getSnapshot());
  }, []);

  const confirmInteraction = useCallback(() => {
    const next = engineRef.current.confirmInteraction();
    setSnap(next);
    return next;
  }, []);

  const registerTap = useCallback(() => {
    const next = engineRef.current.registerTap();
    setSnap(next);
    return next;
  }, []);

  const consumePulse = useCallback(() => engineRef.current.consumeInteractionPulse(), []);

  return {
    ...snap,
    startPrompt,
    confirmInteraction,
    registerTap,
    consumePulse,
    engine: engineRef.current,
  };
}
