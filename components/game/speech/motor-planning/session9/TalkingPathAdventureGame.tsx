import {
  MotorPlanningShell,
  PlanningOverlays,
  speakPlanning,
  usePlanningHits,
  usePlanningSession,
} from '@/components/game/speech/motor-planning/shared/motorPlanningShared';
import { PATH_ADVENTURE_CUES } from '@/components/game/speech/motor-planning/session9/motorPlanningCues';
import { useMotorPlanning } from '@/hooks/useMotorPlanning';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingPathAdventureGame({ onBack, onComplete }: Props) {
  const session = usePlanningSession('talking-path-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMotorPlanning(canPlay, 'talking-path-adventure', session.round);
  const cue = PATH_ADVENTURE_CUES[0];

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakPlanning('Talking path adventure. Movement, pause, movement. Slow and calm.');
  }, [canPlay, session.round]);

  usePlanningHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MotorPlanningShell
        title="Talking Path Adventure"
        subtitle="Planning and timing"
        skills="🛤️ Movement, pause, movement"
        gradient={['#FEFCE8', '#E0F2FE']}
        accent="#CA8A04"
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
          <Text style={styles.emoji}>🛤️</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Path try! 🛤️</Text>
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
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#713F12', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#CA8A04', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
