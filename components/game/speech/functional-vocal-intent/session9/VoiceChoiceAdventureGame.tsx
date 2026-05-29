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

const PATHS = ['🌲 Forest', '🌊 River', '⭐ Stars'] as const;

function AdventurePlay({
  sense,
  active,
  onAttempt,
}: {
  sense: FunctionalVocalIntentSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [pathIdx, setPathIdx] = useState(0);
  const [magic, setMagic] = useState(false);

  useVocalIntentPulseCounter(active, sense, (intensity, duration) => {
    const idx = Math.floor(Math.random() * PATHS.length);
    setPathIdx(idx);
    setMagic(true);
    onAttempt(intensity, duration);
    setTimeout(() => setMagic(false), 1400);
  });

  return (
    <View style={styles.stage}>
      <Text style={styles.wand}>✨</Text>
      <Text style={styles.label}>{PATHS[pathIdx]}</Text>
      <View style={[styles.glow, magic && styles.glowOn]} />
      <Text style={styles.hint}>Any sound picks a magic path!</Text>
    </View>
  );
}

export function VoiceChoiceAdventureGame({ onBack, onComplete }: Props) {
  const session = useFunctionalVocalIntentSession('voice-choice-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctionalVocalIntent('Voice choice adventure! Make any sound — the path lights up!');
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
        title="Voice Choice Adventure"
        subtitle="Sound activates paths"
        skills="✨ Communication effect • 🗣️ Vocal play"
        gradient={['#FDF4FF', '#E0F2FE']}
        accent="#A855F7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="paths"
      >
        {(sense) => (
          <AdventurePlay sense={sense} active={canPlay && !session.gameFinished} onAttempt={onAttempt} />
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
  stage: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  wand: { fontSize: 56 },
  label: { fontSize: 24, fontWeight: '900', color: '#6B21A8', marginVertical: 10 },
  glow: {
    width: 140,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  glowOn: { backgroundColor: '#A855F7' },
  hint: { marginTop: 14, fontSize: 15, fontWeight: '700', color: '#64748B' },
});
