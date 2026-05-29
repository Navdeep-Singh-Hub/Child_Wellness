import {
  BreathJawCoordinationShell,
  BreathJawOverlays,
  speakBreathJaw,
  useBreathJawHits,
  useBreathJawSession,
} from '@/components/game/speech/breath-jaw-coordination/shared/breathJawCoordinationShared';
import { HERO_CUES } from '@/components/game/speech/breath-jaw-coordination/session5/breathJawCues';
import { useBreathJawCoordination } from '@/hooks/useBreathJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = ['Watch mouth', 'Try airflow', 'Copy timing'] as const;

export function BreathJawHeroGame({ onBack, onComplete }: Props) {
  const session = useBreathJawSession('breath-jaw-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useBreathJawCoordination(canPlay, 'breath-jaw-hero', session.round);
  const cue = useMemo(() => HERO_CUES[(hits + sense.coordinationAttempt) % HERO_CUES.length] ?? HERO_CUES[0], [hits, sense.coordinationAttempt]);
  const step = STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0];

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBreathJaw('Breath jaw hero. Watch, try airflow, copy timing. No fail.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.jawApproximation, cue.jawLabel, cue.airLabel);
  }, [canPlay, cue, sense.engine]);

  useBreathJawHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <BreathJawCoordinationShell
        title="Breath Jaw Hero"
        subtitle="Integrated airflow + jaw"
        skills="🦸 Watch • Airflow • Timing"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${step}: ${cue.jawLabel} + ${cue.airLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.hero}>🦸</Text>
          <Text style={styles.step}>{step}</Text>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Hero try! ⭐</Text>
          </Pressable>
          {sense.rewardState === 'HERO' ? <Text style={styles.celebrate}>Hero celebration!</Text> : null}
        </View>
      </BreathJawCoordinationShell>
      <BreathJawOverlays
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
  hero: { fontSize: 64 },
  step: { fontSize: 18, fontWeight: '900', color: '#5B21B6', marginTop: 6 },
  emoji: { fontSize: 80, marginTop: 8 },
  btn: { marginTop: 14, backgroundColor: '#7C3AED', paddingHorizontal: 26, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#7C3AED' },
});
