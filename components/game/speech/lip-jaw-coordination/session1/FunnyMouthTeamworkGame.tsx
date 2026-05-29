import {
  LipJawCoordinationShell,
  LipJawOverlays,
  speakLipJaw,
  useCoordinationHits,
  useLipJawSession,
} from '@/components/game/speech/lip-jaw-coordination/shared/lipJawCoordinationShared';
import { TEAMWORK_CUES } from '@/components/game/speech/lip-jaw-coordination/session1/coordinationCues';
import { useLipJawCoordination } from '@/hooks/useLipJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyMouthTeamworkGame({ onBack, onComplete }: Props) {
  const session = useLipJawSession('funny-mouth-teamwork', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useLipJawCoordination(canPlay, 'funny-mouth-teamwork', session.round);

  const cue = useMemo(
    () => TEAMWORK_CUES[(hits + sense.coordinationAttempt) % TEAMWORK_CUES.length] ?? TEAMWORK_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    sense.engine.setCue(cue.mouthState, cue.lipLabel, cue.jawLabel);
    speakLipJaw(cue.tts);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useCoordinationHits(canPlay, sense, hits, setHits, session.manager, session.completeRound);

  return (
    <>
      <LipJawCoordinationShell
        title="Funny Mouth Teamwork"
        subtitle="Lips + jaw together"
        skills="👄 Lip teamwork • 🦴 Jaw teamwork"
        gradient={['#FEF3C7', '#FCE7F3']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.lipLabel} + ${cue.jawLabel} — copy or tap I tried!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.avatar}>🤪</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
            <Text style={styles.team}>{cue.lipLabel} · {cue.jawLabel}</Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>I tried! ✨</Text>
          </Pressable>
          {sense.rewardState !== 'NONE' && sense.coordinationPulse && (
            <Text style={styles.sparkle}>Sparkles!</Text>
          )}
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
  stage: { minHeight: 340, alignItems: 'center', justifyContent: 'center', padding: 12 },
  avatar: { fontSize: 56, marginBottom: 8 },
  card: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(217,119,6,0.35)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emoji: { fontSize: 100 },
  label: { fontSize: 20, fontWeight: '900', color: '#92400E', marginTop: 8 },
  team: { fontSize: 15, fontWeight: '700', color: '#B45309', marginTop: 6 },
  btn: { marginTop: 16, backgroundColor: '#D97706', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  sparkle: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#D97706' },
});
