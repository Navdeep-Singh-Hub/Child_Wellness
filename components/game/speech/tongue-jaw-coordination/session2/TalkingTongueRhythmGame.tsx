import {
  TongueJawCoordinationShell,
  TongueJawOverlays,
  speakTongueJaw,
  useTongueJawHits,
  useTongueJawSession,
} from '@/components/game/speech/tongue-jaw-coordination/shared/tongueJawCoordinationShared';
import { RHYTHM_CUES } from '@/components/game/speech/tongue-jaw-coordination/session2/tongueJawCues';
import { useTongueJawCoordination } from '@/hooks/useTongueJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingTongueRhythmGame({ onBack, onComplete }: Props) {
  const session = useTongueJawSession('talking-tongue-rhythm', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const sense = useTongueJawCoordination(canPlay, 'talking-tongue-rhythm', session.round);

  const cue = useMemo(
    () => RHYTHM_CUES[(hits + sense.coordinationAttempt) % RHYTHM_CUES.length] ?? RHYTHM_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTongueJaw('Talking tongue rhythm! Slow mouth rhythm — any try counts.');
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hits > 0) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 1200);
      return () => clearTimeout(t);
    }
  }, [hits]);

  useTongueJawHits({
    canPlay,
    sense,
    hits,
    setHits,
    manager: session.manager,
    onRoundComplete: session.completeRound,
  });

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.tongueApproximation, cue.tongueLabel, cue.jawLabel);
  }, [canPlay, cue.tongueApproximation, cue.tongueLabel, cue.jawLabel, sense.engine]);

  return (
    <>
      <TongueJawCoordinationShell
        title="Talking Tongue Rhythm"
        subtitle="Slow coordination timing"
        skills="🥁 Rhythm • 👅 Tongue • 🦴 Jaw"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Slow rhythm: ${cue.label} — ${cue.tongueLabel} + ${cue.jawLabel}`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>🙂</Text>
          <Text style={styles.beat}>🥁 · · 🥁 · ·</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>Rhythm try! 🎵</Text>
          </Pressable>
          {celebrate ? <Text style={styles.celebrate}>Rhythm celebration!</Text> : null}
        </View>
      </TongueJawCoordinationShell>
      <TongueJawOverlays
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
  face: { fontSize: 76 },
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
  celebrate: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#059669' },
});

