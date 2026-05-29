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

const TARGET_MS = 4000;

export function CookieHoldGame({ onBack, onComplete }: Props) {
  const session = useLipGameSession('cookie-hold', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSense(canPlay);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    speakLip('Cookie Hold! Sealed lips keep the cookie steady.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setShake(0);
    speakLip('Balance the cookie with closed lips.');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setShake((s) => (lip.lipsClosed ? Math.max(0, s - 0.05) : Math.min(1, s + 0.04)));
    }, 50);
    return () => clearInterval(id);
  }, [canPlay, lip.lipsClosed]);

  const progress = useLipHoldProgress(lip, TARGET_MS, canPlay, () => {
    speakLip('Yummy celebration!');
    void session.manager.markSuccess(lip.holdDuration);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipGameShell
        title="Cookie Hold"
        subtitle="Stabilize the cookie with lip seal"
        skills="🍪 Steady seal • ⚖️ Balance"
        gradient={['#FFEDD5', '#FED7AA']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={[styles.cookie, { transform: [{ rotate: `${shake * 8 - 4}deg` }] }]}>🍪</Text>
          <LipProgressRing progress={progress} accent="#EA580C" label="" />
        </View>
      </LipGameShell>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cookie: { fontSize: 88, marginBottom: 12 },
});
