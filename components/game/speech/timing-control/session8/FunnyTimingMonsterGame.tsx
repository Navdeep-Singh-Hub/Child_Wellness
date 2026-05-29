import {
  speakTiming,
  TimingControlShell,
  TimingOverlays,
  useTimingHits,
  useTimingSession,
} from '@/components/game/speech/timing-control/shared/timingControlShared';
import { MONSTER_TIMING_CUES } from '@/components/game/speech/timing-control/session8/timingControlCues';
import { useTimingControl } from '@/hooks/useTimingControl';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyTimingMonsterGame({ onBack, onComplete }: Props) {
  const session = useTimingSession('funny-timing-monster', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTimingControl(canPlay, 'funny-timing-monster', session.round);
  const cue = useMemo(
    () => MONSTER_TIMING_CUES[hits % MONSTER_TIMING_CUES.length] ?? MONSTER_TIMING_CUES[0],
    [hits],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTiming('Funny timing monster. Slow or missed timing still counts.');
  }, [canPlay, session.round]);

  useTimingHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <TimingControlShell
        title="Funny Timing Monster"
        subtitle="Oral timing practice"
        skills="👾 MOVE, STOP, HOLD"
        gradient={['#FEF3C7', '#DCFCE7']}
        accent="#16A34A"
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
          <Text style={styles.monster}>👾</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Monster try! 🌟</Text>
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
  monster: { fontSize: 86 },
  label: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#166534', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#16A34A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
