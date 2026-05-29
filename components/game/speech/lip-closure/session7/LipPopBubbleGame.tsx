import {
  BilabialGameOverlays,
  BilabialGameShell,
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

export function LipPopBubbleGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('lip-pop-bubble', DEFAULT_BILABIAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const prep = useBilabialSense(canPlay, session.manager.engine);
  const [popped, setPopped] = useState(false);
  const [particles, setParticles] = useState('');

  useEffect(() => {
    speakBilabial('Pop the Bubble! Close your lips, then make a burst sound.');
    return () => clearBilabialSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setPopped(false);
    setParticles('');
    session.manager.startRound();
    speakBilabial('Close lips… then pop!');
  }, [session.round, canPlay]);

  const onSuccess = useCallback(
    async (timingMs: number) => {
      setPopped(true);
      setParticles('✨💫⭐');
      speakBilabial('Pop! Great burst!');
      await session.manager.recordSuccess(timingMs);
      setTimeout(() => session.completeRound(), 1100);
    },
    [session],
  );

  useBilabialSuccessWatcher(prep, session.manager.engine, canPlay && !popped, onSuccess);

  return (
    <>
      <BilabialGameShell
        title="Pop the Bubble"
        subtitle="Close lips → burst sound"
        skills="🫧 M/B/P prep • 👄 Lip seal + sound"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        prep={prep}
      >
        <View style={styles.center}>
          <Text style={[styles.bubble, popped && styles.bubblePop]}>
            {popped ? particles : '🫧'}
          </Text>
          {!popped && <Text style={styles.hint}>Big calm bubble — close lips & release</Text>}
        </View>
      </BilabialGameShell>
      <BilabialGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubble: { fontSize: 96 },
  bubblePop: { fontSize: 72 },
  hint: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#0369A1', textAlign: 'center' },
});
