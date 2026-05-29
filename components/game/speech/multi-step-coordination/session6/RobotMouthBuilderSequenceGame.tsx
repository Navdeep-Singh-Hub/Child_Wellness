import {
  MultiStepCoordinationShell,
  MultiStepOverlays,
  speakMultiStep,
  useMultiStepHits,
  useMultiStepSession,
} from '@/components/game/speech/multi-step-coordination/shared/multiStepCoordinationShared';
import { ROBOT_STEPS } from '@/components/game/speech/multi-step-coordination/session6/multiStepCues';
import { useMultiStepCoordination } from '@/hooks/useMultiStepCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RobotMouthBuilderSequenceGame({ onBack, onComplete }: Props) {
  const session = useMultiStepSession('robot-mouth-builder-sequence', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMultiStepCoordination(canPlay, 'robot-mouth-builder-sequence', session.round);
  const cue = useMemo(() => ROBOT_STEPS[hits % ROBOT_STEPS.length] ?? ROBOT_STEPS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMultiStep('Robot mouth builder. Slow sequence changes.');
  }, [canPlay, session.round]);

  useMultiStepHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MultiStepCoordinationShell
        title="Robot Mouth Builder"
        subtitle="Movement sequencing"
        skills="🤖 OPEN, CLOSE, ROUND, TONGUE"
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
      </MultiStepCoordinationShell>
      <MultiStepOverlays
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
