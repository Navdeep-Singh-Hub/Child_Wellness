import {
  MotorPlanningShell,
  PlanningOverlays,
  speakPlanning,
  usePlanningHits,
  usePlanningSession,
} from '@/components/game/speech/motor-planning/shared/motorPlanningShared';
import { ROBOT_COPY_CUES } from '@/components/game/speech/motor-planning/session9/motorPlanningCues';
import { useMotorPlanning } from '@/hooks/useMotorPlanning';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RobotCopyChallengeGame({ onBack, onComplete }: Props) {
  const session = usePlanningSession('robot-copy-challenge', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMotorPlanning(canPlay, 'robot-copy-challenge', session.round);
  const cue = useMemo(() => ROBOT_COPY_CUES[hits % ROBOT_COPY_CUES.length] ?? ROBOT_COPY_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakPlanning('Robot copy challenge. Watch robot first, pause, then copy.');
  }, [canPlay, session.round]);

  usePlanningHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MotorPlanningShell
        title="Robot Copy Challenge"
        subtitle="Movement anticipation"
        skills="🤖 Watch first, copy after pause"
        gradient={['#ECFEFF', '#E2E8F0']}
        accent="#0E7490"
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
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Robot copy! 🤖</Text>
          </Pressable>
        </View>
      </MotorPlanningShell>
      <PlanningOverlays
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
  emoji: { fontSize: 62 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#164E63', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#0E7490', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
