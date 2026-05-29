import {
  BreathLipCoordinationShell,
  BreathLipOverlays,
  speakBreathLip,
  useBreathLipHits,
  useBreathLipSession,
} from '@/components/game/speech/breath-lip-coordination/shared/breathLipCoordinationShared';
import { MAGIC_WIND_CUES } from '@/components/game/speech/breath-lip-coordination/session4/breathLipCues';
import { useBreathLipCoordination } from '@/hooks/useBreathLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicWindLipsGame({ onBack, onComplete }: Props) {
  const session = useBreathLipSession('magic-wind-lips', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useBreathLipCoordination(canPlay, 'magic-wind-lips', session.round);
  const cue = useMemo(() => MAGIC_WIND_CUES[hits % MAGIC_WIND_CUES.length] ?? MAGIC_WIND_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBreathLip('Magic wind lips. Use soft air, lip movement, or both.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.lipApproximation, cue.lipLabel, cue.airLabel);
  }, [canPlay, cue, sense.engine]);

  useBreathLipHits({
    canPlay,
    sense,
    hits,
    setHits,
    manager: session.manager,
    onRoundComplete: session.completeRound,
  });

  return (
    <>
      <BreathLipCoordinationShell
        title="Magic Wind Lips"
        subtitle="Airflow + lips teamwork"
        skills="💨 Airflow awareness • 👄 Lip shaping"
        gradient={['#E0F2FE', '#F5F3FF']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.lipLabel} + ${cue.airLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.magic}>🪄</Text>
          <View style={styles.card}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.label}>{cue.label}</Text>
          </View>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>I tried! ✨</Text>
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
  magic: { fontSize: 54 },
  card: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', minWidth: '84%' },
  emoji: { fontSize: 80 },
  label: { fontSize: 18, fontWeight: '900', color: '#075985', marginTop: 6, textAlign: 'center' },
  btn: { marginTop: 12, backgroundColor: '#0284C7', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
