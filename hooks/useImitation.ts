import { ImitationEngine } from '@/components/game/speech/mouth-imitation/modules/ImitationEngine';
import type { ImitationDifficulty, ImitationSnapshot, MouthPose } from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ImitationSense extends ImitationSnapshot {
  startPrompt: (pose: MouthPose) => void;
  confirmAttempt: () => ImitationSnapshot;
  triggerHelp: () => void;
  consumeAttemptPulse: () => boolean;
  engine: ImitationEngine;
}

export function useImitation(
  enabled: boolean,
  difficulty: ImitationDifficulty = 'easy',
): ImitationSense {
  const engineRef = useRef(new ImitationEngine());
  const [snap, setSnap] = useState<ImitationSnapshot>(() => engineRef.current.getSnapshot());

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

  const startPrompt = useCallback((pose: MouthPose) => {
    engineRef.current.beginPrompt(pose);
    setSnap(engineRef.current.getSnapshot());
  }, []);

  const confirmAttempt = useCallback(() => {
    const next = engineRef.current.confirmAttempt();
    setSnap(next);
    return next;
  }, []);

  const triggerHelp = useCallback(() => {
    engineRef.current.triggerHelp();
    setSnap(engineRef.current.getSnapshot());
  }, []);

  const consumeAttemptPulse = useCallback(() => engineRef.current.consumeAttemptPulse(), []);

  return {
    ...snap,
    startPrompt,
    confirmAttempt,
    triggerHelp,
    consumeAttemptPulse,
    engine: engineRef.current,
  };
}
