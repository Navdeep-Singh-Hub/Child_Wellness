import {
  BreathLipCoordinationShell,
  BreathLipOverlays,
  speakBreathLip,
  useBreathLipHits,
  useBreathLipSession,
} from '@/components/game/speech/breath-lip-coordination/shared/breathLipCoordinationShared';
import { BALLOON_CUES } from '@/components/game/speech/breath-lip-coordination/session4/breathLipCues';
import { useBreathLipCoordination } from '@/hooks/useBreathLipCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyBalloonBreathsGame({ onBack, onComplete }: Props) {
  const session = useBreathLipSession('funny-balloon-breaths', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useBreathLipCoordination(canPlay, 'funny-balloon-breaths', session.round);
  const cue = useMemo(() => BALLOON_CUES[hits % BALLOON_CUES.length] ?? BALLOON_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBreathLip('Funny balloon breaths! Weak air, hum air, or lip movement all count.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.lipApproximation, cue.lipLabel, cue.airLabel);
  }, [canPlay, cue, sense.engine]);

  useBreathLipHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  const balloonScale = 1 + Math.min(0.5, sense.smoothedLevel * 0.8) + hits * 0.03;

  return (
    <>
      <BreathLipCoordinationShell
        title="Funny Balloon Breaths"
        subtitle="Air + lip play"
        skills="🎈 Air attempt • 👄 Lip movement"
        gradient={['#FCE7F3', '#E0F2FE']}
        accent="#DB2777"
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
          <Text style={[styles.balloon, { transform: [{ scale: balloonScale }] }]}>🎈</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Balloon try! 🌟</Text>
          </Pressable>
          {hits > 0 ? <Text style={styles.celebrate}>Balloon celebration!</Text> : null}
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
  balloon: { fontSize: 96 },
  label: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#9D174D', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#DB2777', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '800', color: '#DB2777' },
});
