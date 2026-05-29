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

const PUFFS_PER_ROUND = 5;

export function LipBalloonBurstGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('lip-balloon-burst', DEFAULT_BILABIAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const prep = useBilabialSense(canPlay, session.manager.engine);
  const [puffs, setPuffs] = useState(0);
  const [flewAway, setFlewAway] = useState(false);

  useEffect(() => {
    speakBilabial('Balloon Burst! Each close-lip burst adds air. Keep trying — soft sounds work!');
    return () => clearBilabialSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setPuffs(0);
    setFlewAway(false);
    session.manager.startRound();
    speakBilabial('Inflate the balloon with your bursts!');
  }, [session.round, canPlay]);

  const onSuccess = useCallback(
    async (timingMs: number) => {
      const next = puffs + 1;
      setPuffs(next);
      await session.manager.recordSuccess(timingMs);
      if (next >= PUFFS_PER_ROUND) {
        setFlewAway(true);
        speakBilabial('The balloon flies away — hooray!');
        setTimeout(() => session.completeRound(), 1200);
      } else {
        speakBilabial('More air!');
        session.manager.engine.startSession();
      }
    },
    [puffs, session],
  );

  useBilabialSuccessWatcher(prep, session.manager.engine, canPlay && !flewAway && puffs < PUFFS_PER_ROUND, onSuccess, puffs);

  const size = 64 + puffs * 10;

  return (
    <>
      <BilabialGameShell
        title="Balloon Burst"
        subtitle="Bursts inflate the balloon"
        skills="🎈 Breath prep • 👄 Lip bursts"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        prep={prep}
      >
        <View style={styles.center}>
          <Text style={[styles.balloon, { fontSize: flewAway ? 48 : size }]}>
            {flewAway ? '🎈☁️✨' : '🎈'}
          </Text>
          {!flewAway && (
            <>
              <BilabialProgressBar progress={puffs / PUFFS_PER_ROUND} accent="#DB2777" />
              <Text style={styles.label}>{puffs} puffs of air</Text>
            </>
          )}
        </View>
      </BilabialGameShell>
      <BilabialGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  balloon: { marginBottom: 12 },
  label: { marginTop: 8, fontWeight: '800', color: '#9D174D', fontSize: 16 },
});
