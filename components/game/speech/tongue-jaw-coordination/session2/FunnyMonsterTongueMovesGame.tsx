import {
  TongueJawCoordinationShell,
  TongueJawOverlays,
  speakTongueJaw,
  useTongueJawHits,
  useTongueJawSession,
} from '@/components/game/speech/tongue-jaw-coordination/shared/tongueJawCoordinationShared';
import { MONSTER_CUES } from '@/components/game/speech/tongue-jaw-coordination/session2/tongueJawCues';
import { useTongueJawCoordination } from '@/hooks/useTongueJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyMonsterTongueMovesGame({ onBack, onComplete }: Props) {
  const session = useTongueJawSession('funny-monster-tongue-moves', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [dance, setDance] = useState(false);
  const sense = useTongueJawCoordination(canPlay, 'funny-monster-tongue-moves', session.round);

  const cue = useMemo(
    () => MONSTER_CUES[(hits + sense.coordinationAttempt) % MONSTER_CUES.length] ?? MONSTER_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTongueJaw('Funny monster tongue moves! Copy the monster — any try counts!');
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canPlay) return;
    if (hits <= 0) return;
    setDance(true);
    const t = setTimeout(() => setDance(false), 1200);
    return () => clearTimeout(t);
  }, [hits, canPlay]);

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
        title="Funny Monster Tongue Moves"
        subtitle="Silly tongue-jaw play"
        skills="👾 Monster imitation • 👅 Tongue moves"
        gradient={['#FEF3C7', '#DCFCE7']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.label}: ${cue.tongueLabel} + ${cue.jawLabel}`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={[styles.monster, dance && styles.monsterDance]}>👾</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>Monster try! 💚</Text>
          </Pressable>
          {dance ? <Text style={styles.dance}>Monster dance!</Text> : null}
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
  monster: { fontSize: 88 },
  monsterDance: { transform: [{ scale: 1.05 }] },
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    minWidth: '85%',
  },
  emoji: { fontSize: 84 },
  label: { fontSize: 18, fontWeight: '900', color: '#166534', marginTop: 6 },
  btn: { marginTop: 12, backgroundColor: '#16A34A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dance: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#16A34A' },
});

