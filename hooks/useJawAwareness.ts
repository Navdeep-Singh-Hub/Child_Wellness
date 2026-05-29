import { JawAwarenessEngine } from '@/components/game/speech/jaw-awareness/modules/JawAwarenessEngine';
import type {
  JawAwarenessSnapshot,
  JawDifficulty,
  JawPose,
} from '@/components/game/speech/jaw-awareness/modules/jawAwarenessTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface JawAwarenessSense extends JawAwarenessSnapshot {
  startPrompt: (pose: JawPose) => void;
  confirmInteraction: () => JawAwarenessSnapshot;
  registerTap: () => JawAwarenessSnapshot;
  consumePulse: () => boolean;
  engine: JawAwarenessEngine;
}

export function useJawAwareness(
  enabled: boolean,
  difficulty: JawDifficulty = 'easy',
): JawAwarenessSense {
  const engineRef = useRef(new JawAwarenessEngine());
  const [snap, setSnap] = useState<JawAwarenessSnapshot>(() => engineRef.current.getSnapshot());

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

  const startPrompt = useCallback((pose: JawPose) => {
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
