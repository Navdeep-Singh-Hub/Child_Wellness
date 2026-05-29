import {
  MultiStepCoordinationShell,
  MultiStepOverlays,
  speakMultiStep,
  useMultiStepHits,
  useMultiStepSession,
} from '@/components/game/speech/multi-step-coordination/shared/multiStepCoordinationShared';
import { MAGIC_STEPS } from '@/components/game/speech/multi-step-coordination/session6/multiStepCues';
import { useMultiStepCoordination } from '@/hooks/useMultiStepCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthStepsGame({ onBack, onComplete }: Props) {
  const session = useMultiStepSession('magic-mouth-steps', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMultiStepCoordination(canPlay, 'magic-mouth-steps', session.round);
  const cue = useMemo(() => MAGIC_STEPS[hits % MAGIC_STEPS.length] ?? MAGIC_STEPS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMultiStep('Magic mouth steps. Try each step in your own way.');
  }, [canPlay, session.round]);

  useMultiStepHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MultiStepCoordinationShell
        title="Magic Mouth Steps"
        subtitle="Simple oral sequences"
        skills="🪄 OPEN, SMILE, ROUND, CLOSE"
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
          <Text style={styles.magic}>🪄</Text>
          <Text style={styles.emoji}>{cue.emoji}</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Step try! ✨</Text>
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
  magic: { fontSize: 52 },
  emoji: { fontSize: 72, marginTop: 10 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#075985' },
  btn: { marginTop: 14, backgroundColor: '#0284C7', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
