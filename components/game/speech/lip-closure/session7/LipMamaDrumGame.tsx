import {
  BilabialGameOverlays,
  BilabialGameShell,
  BilabialProgressBar,
  DEFAULT_BILABIAL_ROUNDS,
  clearBilabialSpeech,
  speakBilabial,
  useBilabialGameSession,
  useBilabialSense,
  useBilabialSuccessWatcher,
} from '@/components/game/speech/lip-closure/shared/bilabialPrepShared';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HITS_PER_ROUND = 4;

export function LipMamaDrumGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('lip-mama-drum', DEFAULT_BILABIAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const prep = useBilabialSense(canPlay, session.manager.engine);
  const [hits, setHits] = useState(0);
  const [beatFlash, setBeatFlash] = useState(false);

  useEffect(() => {
    speakBilabial('Mama Drum! Close lips and tap the drum with your voice. Ma ma ma — any soft sounds count!');
    return () => clearBilabialSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    session.manager.startRound();
    speakBilabial('Beat the drum — close lips then sound!');
  }, [session.round, canPlay]);

  const onSuccess = useCallback(
    async (timingMs: number) => {
      setBeatFlash(true);
      setTimeout(() => setBeatFlash(false), 200);
      const next = hits + 1;
      setHits(next);
      speakBilabial(next >= HITS_PER_ROUND ? 'Drum party!' : 'Boom!');
      await session.manager.recordSuccess(timingMs);
      session.manager.engine.startSession();
      if (next >= HITS_PER_ROUND) {
        setTimeout(() => session.completeRound(), 900);
      }
    },
    [hits, session],
  );

  useBilabialSuccessWatcher(prep, session.manager.engine, canPlay && hits < HITS_PER_ROUND, onSuccess, hits);

  return (
    <>
      <BilabialGameShell
        title="Mama Drum"
        subtitle="Repeat close-lip bursts"
        skills="🥁 Rhythm • 👄 Bilabial bursts"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        prep={prep}
      >
        <View style={styles.center}>
          <Text style={[styles.drum, beatFlash && styles.drumHit]}>🥁</Text>
          <Text style={styles.notes}>{beatFlash ? '🎵' : '♪'}</Text>
          <BilabialProgressBar progress={hits / HITS_PER_ROUND} accent="#CA8A04" />
          <Text style={styles.count}>
            {hits} / {HITS_PER_ROUND} beats
          </Text>
        </View>
      </BilabialGameShell>
      <BilabialGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  drum: { fontSize: 88 },
  drumHit: { transform: [{ scale: 1.08 }] },
  notes: { fontSize: 32, marginVertical: 8 },
  count: { marginTop: 8, fontWeight: '800', color: '#854D0E', fontSize: 16 },
});
