import {
  speakTiming,
  TimingControlShell,
  TimingOverlays,
  useTimingHits,
  useTimingSession,
} from '@/components/game/speech/timing-control/shared/timingControlShared';
import { ROBOT_PAUSE_CUES } from '@/components/game/speech/timing-control/session8/timingControlCues';
import { useTimingControl } from '@/hooks/useTimingControl';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RobotPauseGoGame({ onBack, onComplete }: Props) {
  const session = useTimingSession('robot-pause-go', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTimingControl(canPlay, 'robot-pause-go', session.round);
  const cue = useMemo(() => ROBOT_PAUSE_CUES[hits % ROBOT_PAUSE_CUES.length] ?? ROBOT_PAUSE_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTiming('Robot pause and go. Slow predictable start-stop pacing.');
  }, [canPlay, session.round]);

  useTimingHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <TimingControlShell
        title="Robot Pause & Go"
        subtitle="Start-stop control"
        skills="🤖 GO, STOP, GO"
        gradient={['#E0E7FF', '#DCFCE7']}
        accent="#4F46E5"
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
          <Text style={styles.robot}>🤖</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Robot try! 🤖</Text>
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
  robot: { fontSize: 82 },
  label: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#3730A3', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#4F46E5', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
