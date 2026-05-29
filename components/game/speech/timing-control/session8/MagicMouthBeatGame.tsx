import {
  speakTiming,
  TimingControlShell,
  TimingOverlays,
  useTimingHits,
  useTimingSession,
} from '@/components/game/speech/timing-control/shared/timingControlShared';
import { MAGIC_BEAT_CUES } from '@/components/game/speech/timing-control/session8/timingControlCues';
import { useTimingControl } from '@/hooks/useTimingControl';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthBeatGame({ onBack, onComplete }: Props) {
  const session = useTimingSession('magic-mouth-beat', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTimingControl(canPlay, 'magic-mouth-beat', session.round);
  const cue = useMemo(() => MAGIC_BEAT_CUES[hits % MAGIC_BEAT_CUES.length] ?? MAGIC_BEAT_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTiming('Magic mouth beat. Try the movement with your own timing.');
  }, [canPlay, session.round]);

  useTimingHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <TimingControlShell
        title="Magic Mouth Beat"
        subtitle="Movement timing"
        skills="✨ OPEN, pause, CLOSE"
        gradient={['#E0F2FE', '#F5F3FF']}
        accent="#0284C7"
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
          <Text style={styles.magic}>✨</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Beat try! ✨</Text>
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
  magic: { fontSize: 62 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#075985', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#0284C7', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
