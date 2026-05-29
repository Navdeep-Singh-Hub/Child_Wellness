import {
  BreathLipCoordinationShell,
  BreathLipOverlays,
  speakBreathLip,
  useBreathLipHits,
  useBreathLipSession,
} from '@/components/game/speech/breath-lip-coordination/shared/breathLipCoordinationShared';
import { RHYTHM_CUES } from '@/components/game/speech/breath-lip-coordination/session4/breathLipCues';
import { useBreathLipCoordination } from '@/hooks/useBreathLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function WindRhythmAdventureGame({ onBack, onComplete }: Props) {
  const session = useBreathLipSession('wind-rhythm-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useBreathLipCoordination(canPlay, 'wind-rhythm-adventure', session.round);
  const cue = useMemo(() => RHYTHM_CUES[(hits + sense.coordinationAttempt) % RHYTHM_CUES.length] ?? RHYTHM_CUES[0], [hits, sense.coordinationAttempt]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBreathLip('Wind rhythm adventure. Blow, pause, blow. Soft tries count.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.lipApproximation, cue.lipLabel, cue.airLabel);
  }, [canPlay, cue, sense.engine]);

  useBreathLipHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <BreathLipCoordinationShell
        title="Wind Rhythm Adventure"
        subtitle="Breath timing play"
        skills="🥁 Blow → pause → blow"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.label}: ${cue.lipLabel} + ${cue.airLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>😊</Text>
          <Text style={styles.beat}>💨 · ⏸️ · 💨</Text>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Rhythm try! 🎵</Text>
          </Pressable>
        </View>
      </BreathLipCoordinationShell>
      <BreathLipOverlays
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
  face: { fontSize: 72 },
  beat: { fontSize: 20, color: '#047857', marginTop: 8, letterSpacing: 3 },
  emoji: { fontSize: 70, marginTop: 10 },
  btn: { marginTop: 14, backgroundColor: '#059669', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
