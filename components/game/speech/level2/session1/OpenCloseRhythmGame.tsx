import {
  DEFAULT_JAW_ROUNDS,
  JawGameOverlays,
  JawGameShell,
  clearJawSpeech,
  hapticSuccess,
  speakJaw,
  useJawGameSession,
  useJawSense,
} from '@/components/game/speech/level2/shared/jawAwarenessShared';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const BEAT_MS = 1100;
const BEATS_PER_ROUND = 6;

export function OpenCloseRhythmGame({ onBack, onComplete }: Props) {
  const session = useJawGameSession('open-close-rhythm', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const jaw = useJawSense(canPlay);
  const [wantOpen, setWantOpen] = useState(true);
  const [hits, setHits] = useState(0);
  const hitsRef = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const matchedBeatRef = useRef(-1);

  useEffect(() => {
    speakJaw('Match the beat! Open and close with the rhythm!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    hitsRef.current = 0;
    setHits(0);
    matchedBeatRef.current = -1;
    setBeatIndex(0);
    speakJaw('Follow the beat — open, close, open, close!');
    const beat = setInterval(() => {
      setBeatIndex((b) => b + 1);
      setWantOpen((w) => !w);
    }, BEAT_MS);
    return () => clearInterval(beat);
  }, [session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (matchedBeatRef.current === beatIndex) return;
    const match = wantOpen ? jaw.isOpen : !jaw.isOpen;
    if (match) {
      matchedBeatRef.current = beatIndex;
      hitsRef.current += 1;
      setHits(hitsRef.current);
      hapticSuccess();
      if (hitsRef.current >= BEATS_PER_ROUND) {
        speakJaw('Perfect rhythm!');
        setTimeout(() => session.completeRound(), 800);
      }
    }
  }, [wantOpen, jaw.isOpen, canPlay, session, beatIndex]);

  return (
    <>
      <JawGameShell
        title="Open-Close Rhythm"
        subtitle="Match the open/close beat"
        skills="🎵 Timing • 👄 Coordination • 🔄 Rhythm"
        gradient={['#F3E8FF', '#D8B4FE']}
        accent="#9333EA"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        jaw={jaw}
      >
        <View style={styles.center}>
          <Text style={styles.beat}>{wantOpen ? '🥁 OPEN' : '🥁 CLOSE'}</Text>
          <Text style={styles.face}>{wantOpen ? '😮' : '😐'}</Text>
          <Text style={styles.hits}>
            Beats matched: {hits} / {BEATS_PER_ROUND}
          </Text>
        </View>
      </JawGameShell>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  beat: { fontSize: 28, fontWeight: '900', color: '#6B21A8' },
  face: { fontSize: 88, marginVertical: 16 },
  hits: { fontSize: 17, fontWeight: '800', color: '#7E22CE' },
});
