import {
  MotorPlanningShell,
  PlanningOverlays,
  speakPlanning,
  usePlanningHits,
  usePlanningSession,
} from '@/components/game/speech/motor-planning/shared/motorPlanningShared';
import { MONSTER_MISSION_CUES } from '@/components/game/speech/motor-planning/session9/motorPlanningCues';
import { useMotorPlanning } from '@/hooks/useMotorPlanning';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyMonsterMissionGame({ onBack, onComplete }: Props) {
  const session = usePlanningSession('funny-monster-mission', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMotorPlanning(canPlay, 'funny-monster-mission', session.round);
  const cue = useMemo(() => MONSTER_MISSION_CUES[hits % MONSTER_MISSION_CUES.length] ?? MONSTER_MISSION_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakPlanning('Funny monster mission. Prepare your mouth, then copy slowly.');
  }, [canPlay, session.round]);

  usePlanningHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MotorPlanningShell
        title="Funny Monster Mission"
        subtitle="Oral planning practice"
        skills="👾 Open, round, smile, blow"
        gradient={['#FDF2F8', '#E0E7FF']}
        accent="#9333EA"
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
            <Text style={styles.btnText}>Monster try! 👾</Text>
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
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#581C87', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#9333EA', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
