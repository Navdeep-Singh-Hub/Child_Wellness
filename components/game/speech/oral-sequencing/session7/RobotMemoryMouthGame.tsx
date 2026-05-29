import {
  OralSequenceOverlays,
  OralSequencingShell,
  speakOralSequence,
  useOralSequenceHits,
  useOralSequenceSession,
} from '@/components/game/speech/oral-sequencing/shared/oralSequencingShared';
import { ROBOT_SEQUENCE_CUES } from '@/components/game/speech/oral-sequencing/session7/oralSequenceCues';
import { useOralSequencing } from '@/hooks/useOralSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RobotMemoryMouthGame({ onBack, onComplete }: Props) {
  const session = useOralSequenceSession('robot-memory-mouth', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSequencing(canPlay, 'robot-memory-mouth', session.round);
  const cue = useMemo(
    () => ROBOT_SEQUENCE_CUES[hits % ROBOT_SEQUENCE_CUES.length] ?? ROBOT_SEQUENCE_CUES[0],
    [hits],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralSequence('Robot memory mouth. Short chains with slow pacing.');
  }, [canPlay, session.round]);

  useOralSequenceHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <OralSequencingShell
        title="Robot Memory Mouth"
        subtitle="Movement memory sequencing"
        skills="🤖 OPEN, CLOSE, ROUND, SMILE"
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
      </OralSequencingShell>
      <OralSequenceOverlays
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
