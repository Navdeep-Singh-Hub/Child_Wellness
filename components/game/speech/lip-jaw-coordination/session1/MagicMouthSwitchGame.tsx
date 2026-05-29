import {
  LipJawCoordinationShell,
  LipJawOverlays,
  speakLipJaw,
  useCoordinationHits,
  useLipJawSession,
} from '@/components/game/speech/lip-jaw-coordination/shared/lipJawCoordinationShared';
import { SWITCH_CUES } from '@/components/game/speech/lip-jaw-coordination/session1/coordinationCues';
import { useLipJawCoordination } from '@/hooks/useLipJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthSwitchGame({ onBack, onComplete }: Props) {
  const session = useLipJawSession('magic-mouth-switch', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [side, setSide] = useState<'a' | 'b'>('a');
  const sense = useLipJawCoordination(canPlay, 'magic-mouth-switch', session.round);

  const pair = useMemo(
    () => SWITCH_CUES[(session.round - 1 + hits) % SWITCH_CUES.length] ?? SWITCH_CUES[0],
    [session.round, hits],
  );
  const cue = side === 'a' ? pair.a : pair.b;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setSide('a');
    sense.engine.setCue(pair.a.mouthState, pair.a.lipLabel, pair.a.jawLabel);
    speakLipJaw(pair.a.tts);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useCoordinationHits(canPlay, sense, hits, setHits, session.manager, session.completeRound);

  const onTry = () => {
    sense.coordinate();
    if (side === 'a') {
      setSide('b');
      sense.engine.setCue(pair.b.mouthState, pair.b.lipLabel, pair.b.jawLabel);
      speakLipJaw(pair.b.tts);
    } else {
      setSide('a');
    }
  };

  return (
    <>
      <LipJawCoordinationShell
        title="Magic Mouth Switch"
        subtitle="Slow mouth switches"
        skills="✨ OPEN ↔ CLOSED • ⭕ ROUND ↔ SMILE"
        gradient={['#F5F3FF', '#FEF9C3']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Now: ${cue.label} — ${cue.lipLabel} + ${cue.jawLabel}`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.wand}>🪄</Text>
          <View style={styles.switchRow}>
            <Text style={[styles.side, side === 'a' && styles.sideOn]}>{pair.a.label}</Text>
            <Text style={styles.arrow}>↔</Text>
            <Text style={[styles.side, side === 'b' && styles.sideOn]}>{pair.b.label}</Text>
          </View>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Pressable style={styles.btn} onPress={onTry}>
            <Text style={styles.btnText}>I switched! ⭐</Text>
          </Pressable>
          <Text style={styles.stars}>✨ Magic stars for every try</Text>
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
  wand: { fontSize: 48 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  side: { fontSize: 16, fontWeight: '800', color: '#9CA3AF', padding: 8 },
  sideOn: { color: '#5B21B6', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10 },
  arrow: { fontSize: 22, color: '#7C3AED' },
  emoji: { fontSize: 88, marginVertical: 12 },
  btn: { backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  stars: { marginTop: 12, fontSize: 15, fontWeight: '800', color: '#6D28D9' },
});
