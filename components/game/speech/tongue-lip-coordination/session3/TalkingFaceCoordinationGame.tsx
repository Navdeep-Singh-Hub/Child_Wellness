import {
  TongueLipCoordinationShell,
  TongueLipOverlays,
  speakTongueLip,
  useTongueLipHits,
  useTongueLipSession,
} from '@/components/game/speech/tongue-lip-coordination/shared/tongueLipCoordinationShared';
import { RHYTHM_CUES } from '@/components/game/speech/tongue-lip-coordination/session3/tongueLipCues';
import { useTongueLipCoordination } from '@/hooks/useTongueLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingFaceCoordinationGame({ onBack, onComplete }: Props) {
  const session = useTongueLipSession('talking-face-coordination', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [dance, setDance] = useState(false);
  const sense = useTongueLipCoordination(canPlay, 'talking-face-coordination', session.round);

  const cue = useMemo(
    () => RHYTHM_CUES[(hits + sense.coordinationAttempt) % RHYTHM_CUES.length] ?? RHYTHM_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTongueLip('Talking face coordination! Slow oral rhythm. Any attempt gets rewarded.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.lipApproximation, cue.tongueApproximation, cue.lipLabel, cue.tongueLabel);
  }, [canPlay, cue, sense.engine]);

  useEffect(() => {
    if (hits <= 0) return;
    setDance(true);
    const t = setTimeout(() => setDance(false), 1200);
    return () => clearTimeout(t);
  }, [hits]);

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
        title="Talking Face Coordination"
        subtitle="Timing and coordination"
        skills="🥁 Rhythm • 👄+👅 synchronized play"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Slow rhythm: ${cue.lipLabel} + ${cue.tongueLabel}`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={[styles.face, dance && styles.faceDance]}>😊</Text>
          <Text style={styles.beat}>🥁 · · 🥁 · ·</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>Rhythm try! 💃</Text>
          </Pressable>
          {dance && <Text style={styles.dance}>Dance celebration!</Text>}
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
  face: { fontSize: 80 },
  faceDance: { transform: [{ scale: 1.08 }] },
  beat: { fontSize: 20, color: '#047857', marginVertical: 8, letterSpacing: 4 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    minWidth: '80%',
  },
  emoji: { fontSize: 72 },
  label: { fontSize: 18, fontWeight: '900', color: '#065F46', marginTop: 6 },
  btn: { marginTop: 12, backgroundColor: '#059669', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dance: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#059669' },
});
