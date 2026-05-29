import {
  LipJawCoordinationShell,
  LipJawOverlays,
  speakLipJaw,
  useCoordinationHits,
  useLipJawSession,
} from '@/components/game/speech/lip-jaw-coordination/shared/lipJawCoordinationShared';
import { RHYTHM_CUES } from '@/components/game/speech/lip-jaw-coordination/session1/coordinationCues';
import { useLipJawCoordination } from '@/hooks/useLipJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingFaceRhythmGame({ onBack, onComplete }: Props) {
  const session = useLipJawSession('talking-face-rhythm', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [dance, setDance] = useState(false);
  const sense = useLipJawCoordination(canPlay, 'talking-face-rhythm', session.round);

  const cue = useMemo(
    () => RHYTHM_CUES[(hits + sense.coordinationAttempt) % RHYTHM_CUES.length] ?? RHYTHM_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    sense.engine.setCue(cue.mouthState, cue.lipLabel, cue.jawLabel);
    speakLipJaw('Talking face rhythm! Slow mouth moves — lips and jaw together!');
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hits > 0) {
      setDance(true);
      const t = setTimeout(() => setDance(false), 1200);
      return () => clearTimeout(t);
    }
  }, [hits]);

  useCoordinationHits(canPlay, sense, hits, setHits, session.manager, session.completeRound);

  return (
    <>
      <LipJawCoordinationShell
        title="Talking Face Rhythm"
        subtitle="Slow movement timing"
        skills="😊 Face rhythm • 👄 Coordinated pace"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Slow: ${cue.label} — ${cue.lipLabel} + ${cue.jawLabel}`}
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
          {dance && <Text style={styles.dance}>Face dance!</Text>}
        </View>
      </LipJawCoordinationShell>
      <LipJawOverlays
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
