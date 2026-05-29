import {
  TongueJawCoordinationShell,
  TongueJawOverlays,
  speakTongueJaw,
  useTongueJawHits,
  useTongueJawSession,
} from '@/components/game/speech/tongue-jaw-coordination/shared/tongueJawCoordinationShared';
import { TUNNEL_PAIRS } from '@/components/game/speech/tongue-jaw-coordination/session2/tongueJawCues';
import { useTongueJawCoordination } from '@/hooks/useTongueJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthTunnelGame({ onBack, onComplete }: Props) {
  const session = useTongueJawSession('magic-mouth-tunnel', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [side, setSide] = useState<'a' | 'b'>('a');
  const sense = useTongueJawCoordination(canPlay, 'magic-mouth-tunnel', session.round);

  const pair = useMemo(
    () => TUNNEL_PAIRS[(session.round - 1 + hits) % TUNNEL_PAIRS.length] ?? TUNNEL_PAIRS[0],
    [session.round, hits],
  );
  const cue = side === 'a' ? pair.a : pair.b;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setSide('a');
    sense.engine.setCue(pair.a.tongueApproximation, pair.a.tongueLabel, pair.a.jawLabel);
    speakTongueJaw('Magic mouth tunnel! Slow switches — any try counts!');
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useTongueJawHits({
    canPlay,
    sense,
    hits,
    setHits,
    manager: session.manager,
    onRoundComplete: session.completeRound,
  });

  const onTry = () => {
    sense.coordinate();
    if (side === 'a') {
      setSide('b');
      sense.engine.setCue(pair.b.tongueApproximation, pair.b.tongueLabel, pair.b.jawLabel);
      speakTongueJaw(pair.b.tts);
    } else {
      setSide('a');
    }
  };

  return (
    <>
      <TongueJawCoordinationShell
        title="Magic Mouth Tunnel"
        subtitle="Movement switching"
        skills="🪄 OPEN → tongue out • OPEN → CLOSED"
        gradient={['#F5F3FF', '#E0F2FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Now: ${cue.label} — ${cue.tongueLabel} + ${cue.jawLabel}`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.wand}>🪄</Text>
          <View style={styles.switchRow}>
            <Text style={[styles.side, side === 'a' && styles.sideOn]}>{pair.a.label}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.side, side === 'b' && styles.sideOn]}>{pair.b.label}</Text>
          </View>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Pressable style={styles.btn} onPress={onTry}>
            <Text style={styles.btnText}>Tunnel switch! ⭐</Text>
          </Pressable>
          <Text style={styles.stars}>✨ Magic stars for every try</Text>
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

