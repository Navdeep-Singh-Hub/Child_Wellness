import { FacialImitationEngine } from '@/components/game/speech/facial-imitation/modules/FacialImitationEngine';
import type {
  FacePose,
  FacialDifficulty,
  FacialImitationSnapshot,
} from '@/components/game/speech/facial-imitation/modules/facialImitationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface FacialImitationSense extends FacialImitationSnapshot {
  startPrompt: (pose: FacePose) => void;
  confirmImitation: () => FacialImitationSnapshot;
  registerTap: () => FacialImitationSnapshot;
  consumePulse: () => boolean;
  engine: FacialImitationEngine;
}

export function useFacialImitation(
  enabled: boolean,
  difficulty: FacialDifficulty = 'easy',
): FacialImitationSense {
  const engineRef = useRef(new FacialImitationEngine());
  const [snap, setSnap] = useState<FacialImitationSnapshot>(() => engineRef.current.getSnapshot());

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

  const startPrompt = useCallback((pose: FacePose) => {
    engineRef.current.beginPrompt(pose);
    setSnap(engineRef.current.getSnapshot());
  }, []);

  const confirmImitation = useCallback(() => {
    const next = engineRef.current.confirmImitation();
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
    confirmImitation,
    registerTap,
    consumePulse,
    engine: engineRef.current,
  };
}
