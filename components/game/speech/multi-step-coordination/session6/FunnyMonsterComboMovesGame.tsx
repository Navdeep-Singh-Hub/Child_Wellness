import {
  MultiStepCoordinationShell,
  MultiStepOverlays,
  speakMultiStep,
  useMultiStepHits,
  useMultiStepSession,
} from '@/components/game/speech/multi-step-coordination/shared/multiStepCoordinationShared';
import { MONSTER_STEPS } from '@/components/game/speech/multi-step-coordination/session6/multiStepCues';
import { useMultiStepCoordination } from '@/hooks/useMultiStepCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyMonsterComboMovesGame({ onBack, onComplete }: Props) {
  const session = useMultiStepSession('funny-monster-combo-moves', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMultiStepCoordination(canPlay, 'funny-monster-combo-moves', session.round);
  const cue = useMemo(() => MONSTER_STEPS[hits % MONSTER_STEPS.length] ?? MONSTER_STEPS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMultiStep('Funny monster combo moves! Partial sequence still counts.');
  }, [canPlay, session.round]);

  useMultiStepHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MultiStepCoordinationShell
        title="Funny Monster Combo Moves"
        subtitle="Multi-step coordination"
        skills="👾 Open, tongue, round, smile"
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
  monster: { fontSize: 86 },
  label: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#166534', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#16A34A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
