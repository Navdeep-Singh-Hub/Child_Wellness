import {
  MultiStepCoordinationShell,
  MultiStepOverlays,
  speakMultiStep,
  useMultiStepHits,
  useMultiStepSession,
} from '@/components/game/speech/multi-step-coordination/shared/multiStepCoordinationShared';
import { RHYTHM_STEPS } from '@/components/game/speech/multi-step-coordination/session6/multiStepCues';
import { useMultiStepCoordination } from '@/hooks/useMultiStepCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingAdventureRhythmGame({ onBack, onComplete }: Props) {
  const session = useMultiStepSession('talking-adventure-rhythm', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMultiStepCoordination(canPlay, 'talking-adventure-rhythm', session.round);
  const cue = useMemo(() => RHYTHM_STEPS[hits % RHYTHM_STEPS.length] ?? RHYTHM_STEPS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMultiStep('Talking adventure rhythm. Move, pause, move.');
  }, [canPlay, session.round]);

  useMultiStepHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <MultiStepCoordinationShell
        title="Talking Adventure Rhythm"
        subtitle="Timing and sequencing"
        skills="🥁 Move, pause, move"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#059669"
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
          <Text style={styles.face}>😊</Text>
          <Text style={styles.beat}>👉 · ⏸️ · 👉</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Rhythm try! 🎵</Text>
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
  face: { fontSize: 76 },
  beat: { fontSize: 20, color: '#047857', marginTop: 8, letterSpacing: 3 },
  btn: { marginTop: 14, backgroundColor: '#059669', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
