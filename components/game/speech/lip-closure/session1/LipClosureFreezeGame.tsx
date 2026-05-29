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

export function LipClosureFreezeGame({ onBack, onComplete }: Props) {
  const session = useLipGameSession('lip-closure-freeze', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSense(canPlay);
  const target = difficultyHoldMs(roundDifficulty(session.round));

  useEffect(() => {
    speakLip('Freeze Mouth! Hold a gentle lip seal until the ring fills.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    speakLip('Freeze your lips closed.');
  }, [session.round, canPlay]);

  const progress = useLipHoldProgress(lip, target, canPlay, () => {
    speakLip('Great freeze!');
    void session.manager.markSuccess(lip.holdDuration);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipGameShell
        title="Freeze Mouth"
        subtitle="Lip statue — hold the seal"
        skills="🧊 Sustained seal • ⏱️ Endurance"
        gradient={['#CFFAFE', '#67E8F9']}
        accent="#0891B2"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.statue}>🗿👄</Text>
          <LipProgressRing progress={progress} accent="#0891B2" label="" />
          <Text style={styles.hint}>Ring fills while lips stay closed</Text>
        </View>
      </LipGameShell>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statue: { fontSize: 72, marginBottom: 12 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#0E7490' },
});
