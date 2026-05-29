import {
  DEFAULT_HOLD_ROUNDS,
  LipHoldGameOverlays,
  LipHoldGameShell,
  LipHoldProgressRing,
  clearHoldSpeech,
  speakHold,
  useLipHoldGameSession,
  useLipHoldSense,
  useLipStabilityProgress,
} from '@/components/game/speech/lip-closure/shared/lipHoldShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const TARGET_MS = 5000;

export function QuietMouseGame({ onBack, onComplete }: Props) {
  const session = useLipHoldGameSession('quiet-mouse', DEFAULT_HOLD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipHoldSense(canPlay);
  const [catNear, setCatNear] = useState(0);

  useEffect(() => {
    speakHold('Quiet Mouse! Stay still so the mouse can hide.');
    return () => clearHoldSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setCatNear(0);
    speakHold('Keep lips steady — shhh!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setCatNear((c) => {
        if (lip.stableHold) return Math.max(0, c - 0.018);
        return Math.min(1, c + 0.012);
      });
      if (lip.stableHold) session.manager.onStable();
      else if (!lip.inGracePeriod) session.manager.onWarning();
    }, 70);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold, lip.inGracePeriod]);

  const progress = useLipStabilityProgress(lip, TARGET_MS, canPlay, () => {
    speakHold('Mouse dance! The cat went away!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 900);
  });

  const scene =
    catNear > 0.6 ? '🐱👀' : catNear > 0.2 ? '🐱…🐭' : lip.stableHold ? '🐭🌿' : '🐭';

  return (
    <>
      <LipHoldGameShell
        title="Quiet Mouse"
        subtitle="Still lips keep the mouse hidden"
        skills="🐭 Stillness • 🤫 Quiet hold"
        gradient={['#DCFCE7', '#BBF7D0']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.scene}>{scene}</Text>
          {catNear > 0.2 && catNear < 0.6 ? (
            <Text style={styles.warn}>Hold still… the cat is curious</Text>
          ) : null}
          <LipHoldProgressRing progress={progress} accent="#16A34A" />
        </View>
      </LipHoldGameShell>
      <LipHoldGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scene: { fontSize: 76, marginBottom: 12 },
  warn: { fontSize: 15, fontWeight: '800', color: '#15803D', marginBottom: 8 },
});
