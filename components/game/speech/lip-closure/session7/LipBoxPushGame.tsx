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

const PUSHES_PER_ROUND = 4;

export function LipBoxPushGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('lip-box-push', DEFAULT_BILABIAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const prep = useBilabialSense(canPlay, session.manager.engine);
  const [pushes, setPushes] = useState(0);
  const [treasure, setTreasure] = useState(false);

  useEffect(() => {
    speakBilabial('Box Push! Use burst power to slide the box. Soft tries count!');
    return () => clearBilabialSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setPushes(0);
    setTreasure(false);
    session.manager.startRound();
    speakBilabial('Push the box with your burst!');
  }, [session.round, canPlay]);

  const onSuccess = useCallback(
    async (timingMs: number) => {
      const next = pushes + 1;
      setPushes(next);
      await session.manager.recordSuccess(timingMs);
      if (next >= PUSHES_PER_ROUND) {
        setTreasure(true);
        speakBilabial('Treasure! You pushed the box open!');
        setTimeout(() => session.completeRound(), 1100);
      } else {
        session.manager.engine.startSession();
      }
    },
    [pushes, session],
  );

  useBilabialSuccessWatcher(prep, session.manager.engine, canPlay && !treasure && pushes < PUSHES_PER_ROUND, onSuccess, pushes);

  return (
    <>
      <BilabialGameShell
        title="Box Push"
        subtitle="Burst power moves the box"
        skills="📦 Motor planning • 👄 Lip bursts"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        prep={prep}
      >
        <View style={styles.track}>
          <View style={[styles.box, { marginLeft: `${Math.min(72, pushes * 18)}%` }]}>
            <Text style={styles.boxEmoji}>{treasure ? '🎁✨' : '📦'}</Text>
          </View>
          <BilabialProgressBar progress={pushes / PUSHES_PER_ROUND} accent="#059669" />
          <Text style={styles.hint}>{treasure ? 'Treasure found!' : 'Close lips → burst to push'}</Text>
        </View>
      </BilabialGameShell>
      <BilabialGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  box: { marginBottom: 24 },
  boxEmoji: { fontSize: 72 },
  hint: { marginTop: 12, textAlign: 'center', fontWeight: '700', color: '#047857', fontSize: 16 },
});
