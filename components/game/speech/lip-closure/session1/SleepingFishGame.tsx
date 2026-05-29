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

const TARGET_MS = 5000;

export function SleepingFishGame({ onBack, onComplete }: Props) {
  const session = useLipGameSession('sleeping-fish', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSense(canPlay);
  const [wake, setWake] = useState(0);

  useEffect(() => {
    speakLip('Sleeping Fish! Quiet lips keep the fish asleep.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setWake(0);
    speakLip('Keep the fish sleeping with closed lips.');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setWake((w) => {
        if (lip.lipsClosed) return Math.max(0, w - 0.02);
        return Math.min(1, w + 0.015);
      });
    }, 80);
    return () => clearInterval(id);
  }, [canPlay, lip.lipsClosed]);

  const progress = useLipHoldProgress(lip, TARGET_MS, canPlay, () => {
    speakLip('The fish smiles! Treasure time!');
    void session.manager.markSuccess(lip.holdDuration);
    setTimeout(() => session.completeRound(), 900);
  });

  const fish = wake > 0.5 ? '🐟' : wake > 0.15 ? '😴🐠' : '😴🐟';

  return (
    <>
      <LipGameShell
        title="Sleeping Fish"
        subtitle="Keep the fish asleep with sealed lips"
        skills="🐟 Gentle closure • 😴 Calm hold"
        gradient={['#DBEAFE', '#93C5FD']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.fish}>{fish}</Text>
          {wake > 0.15 && wake < 0.5 ? (
            <Text style={styles.warn}>Shhh… close lips again</Text>
          ) : null}
          <LipProgressRing progress={progress} accent="#2563EB" label="" />
        </View>
      </LipGameShell>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fish: { fontSize: 80, marginBottom: 12 },
  warn: { fontSize: 16, fontWeight: '800', color: '#1D4ED8', marginBottom: 8 },
});
