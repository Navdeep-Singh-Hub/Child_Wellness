import {
  SoundStabilityFrame,
  SoundStabilityOverlays,
  speakSoundStability,
  useSoundStabilitySession,
} from '@/components/game/speech/sound-stability/shared/soundStabilityShared';
import { useStabilityInteraction } from '@/components/game/speech/sound-stability/session7/useStabilityInteraction';
import type { SoundStabilitySessionManager } from '@/components/game/speech/sound-stability/modules/SoundStabilitySessionManager';
import type { SoundStabilitySense } from '@/hooks/useSoundStability';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = ['Hold sound', 'Watch glow', 'Try again'] as const;

function HeroPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: SoundStabilitySense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: SoundStabilitySessionManager;
  onRoundComplete: () => void;
}) {
  const step = STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0];

  useStabilityInteraction(sense, active, hits, setHits, manager, onRoundComplete);

  return (
    <View style={styles.stage}>
      <Text style={styles.hero}>🦸</Text>
      <Text style={styles.step}>{step}</Text>
      <View style={styles.glowRing}>
        <View style={[styles.glowFill, { height: `${Math.round(sense.sustainGlow * 100)}%` }]} />
      </View>
      <Text style={styles.hint}>Hold aaa, mmm, or ooo — hero glows with you!</Text>
      <Pressable style={styles.tap} onPress={() => sense.tapGoodTry()}>
        <Text style={styles.tapText}>Or Good try hold</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function SpeechStabilityHeroGame({ onBack, onComplete }: Props) {
  const session = useSoundStabilitySession('speech-stability-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundStability('Speech stability hero! Hold sound, watch the glow, try again — no fail!');
  }, [canPlay, session.round]);

  return (
    <>
      <SoundStabilityFrame
        title="Speech Stability Hero"
        subtitle="Integrate sound stability"
        skills="🦸 Hold • ✨ Confidence • 🔁 Repeat"
        gradient={['#F5F3FF', '#E0F2FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="hero holds"
      >
        {(sense) => (
          <HeroPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </SoundStabilityFrame>
      <SoundStabilityOverlays
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
  stage: { minHeight: 300, alignItems: 'center' },
  hero: { fontSize: 80 },
  step: { fontSize: 19, fontWeight: '900', color: '#5B21B6', marginTop: 8 },
  glowRing: {
    marginTop: 14,
    width: 48,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  glowFill: { width: '100%', backgroundColor: '#A78BFA' },
  hint: { marginTop: 14, fontSize: 15, color: '#6D28D9', textAlign: 'center', paddingHorizontal: 16 },
  tap: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tapText: { fontWeight: '800', color: '#7C3AED' },
  celebrate: { marginTop: 10, fontSize: 20, fontWeight: '900', color: '#7C3AED' },
});
