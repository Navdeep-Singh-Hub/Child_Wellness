import {
  speakTiming,
  TimingControlShell,
  TimingOverlays,
  useTimingHits,
  useTimingSession,
} from '@/components/game/speech/timing-control/shared/timingControlShared';
import { RHYTHM_ROAD_CUES } from '@/components/game/speech/timing-control/session8/timingControlCues';
import { useTimingControl } from '@/hooks/useTimingControl';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingRhythmRoadGame({ onBack, onComplete }: Props) {
  const session = useTimingSession('talking-rhythm-road', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTimingControl(canPlay, 'talking-rhythm-road', session.round);
  const cue = useMemo(() => RHYTHM_ROAD_CUES[hits % RHYTHM_ROAD_CUES.length] ?? RHYTHM_ROAD_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTiming('Talking rhythm road. Movement, pause, movement.');
  }, [canPlay, session.round]);

  useTimingHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <TimingControlShell
        title="Talking Rhythm Road"
        subtitle="Timing and pacing play"
        skills="🥁 Movement, pause, movement"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${cue.label} — ${sense.currentStepLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>😊</Text>
          <Text style={styles.beat}>👉 · ⏸️ · 👉</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Rhythm try! 🎵</Text>
          </Pressable>
        </View>
      </TimingControlShell>
      <TimingOverlays
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
  face: { fontSize: 76 },
  beat: { fontSize: 20, color: '#047857', marginTop: 8, letterSpacing: 3 },
  btn: { marginTop: 14, backgroundColor: '#059669', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
