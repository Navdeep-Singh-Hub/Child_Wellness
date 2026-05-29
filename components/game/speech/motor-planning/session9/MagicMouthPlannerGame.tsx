import {
  MotorPlanningShell,
  PlanningOverlays,
  speakPlanning,
  usePlanningHits,
  usePlanningSession,
} from '@/components/game/speech/motor-planning/shared/motorPlanningShared';
import { MAGIC_PLANNER_CUES } from '@/components/game/speech/motor-planning/session9/motorPlanningCues';
import { useMotorPlanning } from '@/hooks/useMotorPlanning';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthPlannerGame({ onBack, onComplete }: Props) {
  const session = usePlanningSession('magic-mouth-planner', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMotorPlanning(canPlay, 'magic-mouth-planner', session.round);
  const cue = useMemo(() => MAGIC_PLANNER_CUES[hits % MAGIC_PLANNER_CUES.length] ?? MAGIC_PLANNER_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakPlanning('Magic mouth planner. Watch first, prepare, then copy.');
  }, [canPlay, session.round]);

  usePlanningHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MotorPlanningShell
        title="Magic Mouth Planner"
        subtitle="Movement planning"
        skills="✨ Watch, prepare, copy"
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
            <Text style={styles.btnText}>Plan try! ✨</Text>
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
  magic: { fontSize: 62 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#075985', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#0284C7', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
