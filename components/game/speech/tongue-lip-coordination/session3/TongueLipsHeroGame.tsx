import {
  TongueLipCoordinationShell,
  TongueLipOverlays,
  speakTongueLip,
  useTongueLipHits,
  useTongueLipSession,
} from '@/components/game/speech/tongue-lip-coordination/shared/tongueLipCoordinationShared';
import { HERO_CUES } from '@/components/game/speech/tongue-lip-coordination/session3/tongueLipCues';
import { useTongueLipCoordination } from '@/hooks/useTongueLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = ['Watch mouth', 'Copy movement', 'Repeat playfully'] as const;

export function TongueLipsHeroGame({ onBack, onComplete }: Props) {
  const session = useTongueLipSession('tongue-lips-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTongueLipCoordination(canPlay, 'tongue-lips-hero', session.round);

  const cue = useMemo(
    () => HERO_CUES[(hits + sense.coordinationAttempt) % HERO_CUES.length] ?? HERO_CUES[0],
    [hits, sense.coordinationAttempt],
  );
  const step = STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0];

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    sense.engine.setCue(cue.lipApproximation, cue.tongueApproximation, cue.lipLabel, cue.tongueLabel);
    speakTongueLip('Tongue lips hero! Watch, copy, repeat. No fail state.');
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useTongueLipHits({
    canPlay,
    sense,
    hits,
    setHits,
    manager: session.manager,
    onRoundComplete: session.completeRound,
  });

  return (
    <>
      <TongueLipCoordinationShell
        title="Tongue Lips Hero"
        subtitle="Integrated coordination"
        skills="🦸 Watch • Copy • Repeat"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${step}: ${cue.lipLabel} + ${cue.tongueLabel}`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.hero}>🦸</Text>
          <Text style={styles.step}>{step}</Text>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Text style={styles.team}>
            {cue.lipLabel} · {cue.tongueLabel}
          </Text>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>Hero try! ⭐</Text>
          </Pressable>
          {sense.rewardState === 'HERO' ? <Text style={styles.celebrate}>Hero celebration!</Text> : null}
        </View>
      </TongueLipCoordinationShell>
      <TongueLipOverlays
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
  stage: { minHeight: 340, alignItems: 'center' },
  hero: { fontSize: 64 },
  step: { fontSize: 18, fontWeight: '900', color: '#5B21B6', marginTop: 6 },
  emoji: { fontSize: 80, marginTop: 8 },
  team: { fontSize: 16, fontWeight: '800', color: '#6D28D9', marginTop: 4, textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#7C3AED', paddingHorizontal: 26, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#7C3AED' },
});
