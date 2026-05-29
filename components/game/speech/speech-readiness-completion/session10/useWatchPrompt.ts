import { speakSpeechReadiness } from '@/components/game/speech/speech-readiness-completion/shared/speechReadinessCompletionShared';
import type { SpeechReadinessCompletionSense } from '@/hooks/useSpeechReadinessCompletion';
import { useEffect, useState } from 'react';

/** Watch mouth cue, then child may try (vocal or imitation). */
export function useWatchPrompt(
  canPlay: boolean,
  round: number,
  cueLine: string,
  sense: SpeechReadinessCompletionSense | null,
  promptMs = 2000,
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canPlay || !sense) {
      setReady(false);
      return;
    }
    setReady(false);
    sense.showPrompt(promptMs);
    speakSpeechReadiness(cueLine);
    const t = setTimeout(() => setReady(true), promptMs + 200);
    return () => clearTimeout(t);
    // sense.showPrompt only when round/cue changes — avoid re-firing on every mic frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlay, round, cueLine, promptMs]);

  return ready;
}
