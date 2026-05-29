import { difficultyHoldMs, roundDifficulty } from '@/components/game/speech/lip-closure/modules/LipClosureSessionManager';
import {
  DEFAULT_LIP_ROUNDS,
  LipGameOverlays,
  LipGameShell,
  LipProgressRing,
  clearLipSpeech,
  speakLip,
  useLipGameSession,
  useLipHoldProgress,
  useLipSense,
} from '@/components/game/speech/lip-closure/shared/lipClosureShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function BubbleSealGame({ onBack, onComplete }: Props) {
  const session = useLipGameSession('bubble-seal', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSense(canPlay);
  const target = difficultyHoldMs(roundDifficulty(session.round));
  const [size, setSize] = useState(0.35);

  useEffect(() => {
    speakLip('Bubble Seal! Close lips to stop the leak and grow the bubble.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setSize(0.35);
    speakLip('Seal your lips on the bubble!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setSize((s) => {
        if (lip.lipsClosed) return Math.min(1, s + 0.015);
        return Math.max(0.2, s - 0.008);
      });
    }, 50);
    return () => clearInterval(id);
  }, [canPlay, lip.lipsClosed]);

  const progress = useLipHoldProgress(lip, target, canPlay, () => {
    speakLip('Pop! Stars for you!');
    void session.manager.markSuccess(lip.holdDuration);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipGameShell
        title="Bubble Seal"
        subtitle="Close lips to stop the air leak"
        skills="🫧 Lip seal • 💨 Air control"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={[styles.bubble, { transform: [{ scale: size }] }]}>🫧</Text>
          <LipProgressRing progress={progress} accent="#0284C7" label="" />
          <Text style={styles.hint}>Hold lips closed to fill the bar</Text>
        </View>
      </LipGameShell>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubble: { fontSize: 88, marginBottom: 8 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#0369A1' },
});
