import {
  TongueLipCoordinationShell,
  TongueLipOverlays,
  speakTongueLip,
  useTongueLipHits,
  useTongueLipSession,
} from '@/components/game/speech/tongue-lip-coordination/shared/tongueLipCoordinationShared';
import { TEAM_CUES } from '@/components/game/speech/tongue-lip-coordination/session3/tongueLipCues';
import { useTongueLipCoordination } from '@/hooks/useTongueLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyTongueLipsTeamGame({ onBack, onComplete }: Props) {
  const session = useTongueLipSession('funny-tongue-lips-team', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTongueLipCoordination(canPlay, 'funny-tongue-lips-team', session.round);

  const cue = useMemo(
    () => TEAM_CUES[(hits + sense.coordinationAttempt) % TEAM_CUES.length] ?? TEAM_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    sense.engine.setCue(cue.lipApproximation, cue.tongueApproximation, cue.lipLabel, cue.tongueLabel);
    speakTongueLip('Tongue and lips team up! Copy in your own way. Every try gets sparkles.');
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
        title="Funny Tongue Lips Team"
        subtitle="Tongue + lips teamwork"
        skills="👅 Coordination • 👄 Movement confidence"
        gradient={['#E0F2FE', '#FCE7F3']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.lipLabel} + ${cue.tongueLabel} — all tries count`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.avatar}>😊</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
            <Text style={styles.team}>
              {cue.lipLabel} · {cue.tongueLabel}
            </Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>I tried! ✨</Text>
          </Pressable>
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
  stage: { minHeight: 340, alignItems: 'center', justifyContent: 'center', padding: 12 },
  avatar: { fontSize: 56, marginBottom: 8 },
  card: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(2,132,199,0.3)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emoji: { fontSize: 96 },
  label: { fontSize: 20, fontWeight: '900', color: '#075985', marginTop: 8 },
  team: { fontSize: 15, fontWeight: '700', color: '#0369A1', marginTop: 6, textAlign: 'center' },
  btn: { marginTop: 16, backgroundColor: '#0284C7', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
