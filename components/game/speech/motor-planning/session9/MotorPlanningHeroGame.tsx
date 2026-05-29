import {
  MotorPlanningShell,
  PlanningOverlays,
  speakPlanning,
  usePlanningHits,
  usePlanningSession,
} from '@/components/game/speech/motor-planning/shared/motorPlanningShared';
import { HERO_PLANNING_CUES } from '@/components/game/speech/motor-planning/session9/motorPlanningCues';
import { useMotorPlanning } from '@/hooks/useMotorPlanning';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MotorPlanningHeroGame({ onBack, onComplete }: Props) {
  const session = usePlanningSession('motor-planning-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMotorPlanning(canPlay, 'motor-planning-hero', session.round);
  const cue = useMemo(() => HERO_PLANNING_CUES[hits % HERO_PLANNING_CUES.length] ?? HERO_PLANNING_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakPlanning('Motor planning hero. Watch sequence, prepare movement, then copy playfully.');
  }, [canPlay, session.round]);

  usePlanningHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MotorPlanningShell
        title="Motor Planning Hero"
        subtitle="Integrated planning challenge"
        skills="🦸 Timing, jaw, lips, tongue, airflow"
        gradient={['#F0F9FF', '#F5F3FF']}
        accent="#7C3AED"
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
            <Text style={styles.btnText}>Hero try! 🦸</Text>
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
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#4C1D95', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#7C3AED', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
