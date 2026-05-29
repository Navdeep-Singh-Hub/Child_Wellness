import {
  TongueJawCoordinationShell,
  TongueJawOverlays,
  speakTongueJaw,
  useTongueJawHits,
  useTongueJawSession,
} from '@/components/game/speech/tongue-jaw-coordination/shared/tongueJawCoordinationShared';
import { EXPLORER_CUES } from '@/components/game/speech/tongue-jaw-coordination/session2/tongueJawCues';
import { useTongueJawCoordination } from '@/hooks/useTongueJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TongueExplorerTeamworkGame({ onBack, onComplete }: Props) {
  const session = useTongueJawSession('tongue-explorer-teamwork', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTongueJawCoordination(canPlay, 'tongue-explorer-teamwork', session.round);

  const cue = useMemo(
    () => EXPLORER_CUES[(hits + sense.coordinationAttempt) % EXPLORER_CUES.length] ?? EXPLORER_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    sense.engine.setCue(cue.tongueApproximation, cue.tongueLabel, cue.jawLabel);
    speakTongueJaw(cue.tts);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useTongueJawHits({
    canPlay,
    sense,
    hits,
    setHits,
    manager: session.manager,
    onRoundComplete: session.completeRound,
  });

  return (
    <>
      <TongueJawCoordinationShell
        title="Tongue Explorer Teamwork"
        subtitle="Tongue + jaw together"
        skills="👅 Tongue play • 🦴 Jaw open/close"
        gradient={['#E0F2FE', '#FCE7F3']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.tongueLabel} + ${cue.jawLabel} — copy or tap I tried!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.avatar}>🧭</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
            <Text style={styles.team}>
              {cue.tongueLabel} · {cue.jawLabel}
            </Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>I tried! ✨</Text>
          </Pressable>
          {sense.rewardState !== 'NONE' && sense.coordinationPulse ? (
            <Text style={styles.sparkle}>Sparkles!</Text>
          ) : null}
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
  sparkle: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#0284C7' },
});

