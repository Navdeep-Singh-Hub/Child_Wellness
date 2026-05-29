import {
  BreathJawCoordinationShell,
  BreathJawOverlays,
  speakBreathJaw,
  useBreathJawHits,
  useBreathJawSession,
} from '@/components/game/speech/breath-jaw-coordination/shared/breathJawCoordinationShared';
import { DRAGON_CUES } from '@/components/game/speech/breath-jaw-coordination/session5/breathJawCues';
import { useBreathJawCoordination } from '@/hooks/useBreathJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyDragonBreathsGame({ onBack, onComplete }: Props) {
  const session = useBreathJawSession('funny-dragon-breaths', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useBreathJawCoordination(canPlay, 'funny-dragon-breaths', session.round);
  const cue = useMemo(() => DRAGON_CUES[hits % DRAGON_CUES.length] ?? DRAGON_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBreathJaw('Funny dragon breaths. Weak blow, hum, or mouth opening all count.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    sense.engine.setCue(cue.jawApproximation, cue.jawLabel, cue.airLabel);
  }, [canPlay, cue, sense.engine]);

  useBreathJawHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  const dragonScale = 1 + Math.min(0.4, sense.smoothedLevel * 0.7) + hits * 0.02;

  return (
    <>
      <BreathJawCoordinationShell
        title="Funny Dragon Breaths"
        subtitle="Air + jaw play"
        skills="🐉 Air attempt • 🦴 Jaw movement"
        gradient={['#FEF3C7', '#FCE7F3']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.jawLabel} + ${cue.airLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={[styles.dragon, { transform: [{ scale: dragonScale }] }]}>🐉</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Dragon try! 🌟</Text>
          </Pressable>
          {hits > 0 ? <Text style={styles.celebrate}>Dragon celebration!</Text> : null}
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
  dragon: { fontSize: 96 },
  label: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#9A3412', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#EA580C', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '800', color: '#EA580C' },
});
