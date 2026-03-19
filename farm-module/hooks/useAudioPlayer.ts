'use client';

import { useCallback, useRef } from 'react';

/**
 * Simple hook to play instruction/feedback via Web Speech API.
 * Use for voice instructions and counting.
 */
export function useAudioPlayer(rate = 0.85) {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (!synthRef.current) synthRef.current = window.speechSynthesis;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    },
    [rate]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
