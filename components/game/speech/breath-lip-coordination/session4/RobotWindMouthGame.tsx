import {
  BreathLipCoordinationShell,
  BreathLipOverlays,
  speakBreathLip,
  useBreathLipHits,
  useBreathLipSession,
} from '@/components/game/speech/breath-lip-coordination/shared/breathLipCoordinationShared';
import { ROBOT_SWITCH_CUES } from '@/components/game/speech/breath-lip-coordination/session4/breathLipCues';
import { useBreathLipCoordination } from '@/hooks/useBreathLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RobotWindMouthGame({ onBack, onComplete }: Props) {
  const session = useBreathLipSession('robot-wind-mouth', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [side, setSide] = useState<'a' | 'b'>('a');
  const sense = useBreathLipCoordination(canPlay, 'robot-wind-mouth', session.round);
  const pair = useMemo(() => ROBOT_SWITCH_CUES[(session.round - 1 + hits) % ROBOT_SWITCH_CUES.length] ?? ROBOT_SWITCH_CUES[0], [session.round, hits]);
  const cue = side === 'a' ? pair.a : pair.b;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setSide('a');
    sense.engine.setCue(pair.a.lipApproximation, pair.a.lipLabel, pair.a.airLabel);
    speakBreathLip('Robot wind mouth! Slow switches. Round then blow, open then air.');
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useBreathLipHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  const onTry = () => {
    sense.coordinate();
    if (side === 'a') {
      setSide('b');
      sense.engine.setCue(pair.b.lipApproximation, pair.b.lipLabel, pair.b.airLabel);
      speakBreathLip(pair.b.tts);
    } else {
      setSide('a');
    }
  };

  return (
    <>
      <BreathLipCoordinationShell
        title="Robot Wind Mouth"
        subtitle="Movement switching"
        skills="🤖 ROUND → BLOW • OPEN → AIR"
        gradient={['#E0E7FF', '#DCFCE7']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Now: ${cue.label} — ${cue.lipLabel} + ${cue.airLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.robot}>🤖</Text>
          <View style={styles.switchRow}>
            <Text style={[styles.side, side === 'a' && styles.sideOn]}>{pair.a.label}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.side, side === 'b' && styles.sideOn]}>{pair.b.label}</Text>
          </View>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Pressable style={styles.btn} onPress={onTry}>
            <Text style={styles.btnText}>Robot try! 🤖</Text>
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
  robot: { fontSize: 58 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  side: { fontSize: 16, fontWeight: '800', color: '#9CA3AF', padding: 8 },
  sideOn: { color: '#3730A3', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10 },
  arrow: { fontSize: 22, color: '#4F46E5' },
  emoji: { fontSize: 76, marginVertical: 10 },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
