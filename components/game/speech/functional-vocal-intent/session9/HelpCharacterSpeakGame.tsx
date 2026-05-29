import {
  FunctionalVocalIntentFrame,
  FunctionalVocalIntentOverlays,
  speakFunctionalVocalIntent,
  useFunctionalVocalIntentSession,
  useVocalIntentPulseCounter,
} from '@/components/game/speech/functional-vocal-intent/shared/functionalVocalIntentShared';
import type { FunctionalVocalIntentSense } from '@/hooks/useFunctionalVocalIntent';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function HelpPlay({
  sense,
  active,
  onAttempt,
}: {
  sense: FunctionalVocalIntentSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [moving, setMoving] = useState(false);
  const [step, setStep] = useState(0);

  useVocalIntentPulseCounter(active, sense, (intensity, duration) => {
    setMoving(true);
    setStep((s) => Math.min(s + 1, 3));
    onAttempt(intensity, duration);
    setTimeout(() => setMoving(false), 1200);
  });

  return (
    <View style={styles.stage}>
      <Text style={[styles.hero, moving && styles.heroMove]}>🦊</Text>
      <Text style={styles.pause}>{moving ? 'Adventure continues!' : 'Character paused…'}</Text>
      <View style={styles.steps}>
        {['🌱', '🌸', '🏠'].map((e, i) => (
          <Text key={e} style={[styles.stepEmoji, i < step && styles.stepOn]}>
            {i < step ? e : '⬜'}
          </Text>
        ))}
      </View>
      <Text style={styles.hint}>Make a sound to help them move!</Text>
    </View>
  );
}

export function HelpCharacterSpeakGame({ onBack, onComplete }: Props) {
  const session = useFunctionalVocalIntentSession('help-character-speak', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctionalVocalIntent('The character needs your sound to continue the adventure!');
  }, [canPlay, session.round]);

  const onAttempt = useCallback(
    (intensity: number, duration: number) => {
      session.manager.recordInteraction(intensity, duration);
      setHits((h) => {
        const next = h + 1;
        if (next >= 3) setTimeout(() => session.completeRound(), 800);
        return next;
      });
    },
    [session],
  );

  return (
    <>
      <FunctionalVocalIntentFrame
        title="Help the Character Speak"
        subtitle="Sound continues adventure"
        skills="🦊 Purposeful vocal • 💬 Communication"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="helps"
      >
        {(sense) => (
          <HelpPlay sense={sense} active={canPlay && !session.gameFinished} onAttempt={onAttempt} />
        )}
      </FunctionalVocalIntentFrame>
      <FunctionalVocalIntentOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stage: { minHeight: 320, alignItems: 'center', padding: 10 },
  hero: { fontSize: 88 },
  heroMove: { transform: [{ translateX: 12 }] },
  pause: { fontSize: 17, fontWeight: '900', color: '#9A3412', marginTop: 8 },
  steps: { flexDirection: 'row', gap: 12, marginVertical: 14 },
  stepEmoji: { fontSize: 36, opacity: 0.4 },
  stepOn: { opacity: 1 },
  hint: { fontSize: 15, fontWeight: '700', color: '#64748B' },
});
