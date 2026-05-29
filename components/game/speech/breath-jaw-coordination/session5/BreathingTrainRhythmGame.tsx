import {
  BreathJawCoordinationShell,
  BreathJawOverlays,
  speakBreathJaw,
  useBreathJawHits,
  useBreathJawSession,
} from '@/components/game/speech/breath-jaw-coordination/shared/breathJawCoordinationShared';
import { TRAIN_RHYTHM_CUES } from '@/components/game/speech/breath-jaw-coordination/session5/breathJawCues';
import { useBreathJawCoordination } from '@/hooks/useBreathJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function BreathingTrainRhythmGame({ onBack, onComplete }: Props) {
  const session = useBreathJawSession('breathing-train-rhythm', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useBreathJawCoordination(canPlay, 'breathing-train-rhythm', session.round);
  const cue = useMemo(
    () => TRAIN_RHYTHM_CUES[(hits + sense.coordinationAttempt) % TRAIN_RHYTHM_CUES.length] ?? TRAIN_RHYTHM_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBreathJaw('Breathing train rhythm. Blow, pause, blow with open and close timing.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.jawApproximation, cue.jawLabel, cue.airLabel);
  }, [canPlay, cue, sense.engine]);

  useBreathJawHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <BreathJawCoordinationShell
        title="Breathing Train Rhythm"
        subtitle="Breath timing coordination"
        skills="🚂 Blow → pause → blow"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.label}: ${cue.jawLabel} + ${cue.airLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.train}>🚂</Text>
          <Text style={styles.beat}>💨 · ⏸️ · 💨</Text>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Rhythm try! 🎵</Text>
          </Pressable>
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
  train: { fontSize: 72 },
  beat: { fontSize: 20, color: '#047857', marginTop: 8, letterSpacing: 3 },
  emoji: { fontSize: 70, marginTop: 10 },
  btn: { marginTop: 14, backgroundColor: '#059669', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
