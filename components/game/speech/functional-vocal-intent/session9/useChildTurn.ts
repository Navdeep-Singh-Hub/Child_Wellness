import { speakFunctionalVocalIntent } from '@/components/game/speech/functional-vocal-intent/shared/functionalVocalIntentShared';
import { useEffect, useState } from 'react';

/** Friend speaks first, then child may respond with any sound. */
export function useChildTurn(
  canPlay: boolean,
  round: number,
  friendLine: string,
  delayMs = 2400,
) {
  const [childTurn, setChildTurn] = useState(false);

  useEffect(() => {
    if (!canPlay) {
      setChildTurn(false);
      return;
    }
    setChildTurn(false);
    speakFunctionalVocalIntent(friendLine);
    const t = setTimeout(() => setChildTurn(true), delayMs);
    return () => clearTimeout(t);
  }, [canPlay, round, friendLine, delayMs]);

  return childTurn;
}
