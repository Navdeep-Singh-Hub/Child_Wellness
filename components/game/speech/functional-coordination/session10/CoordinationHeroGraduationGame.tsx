import {
  FunctionalCoordinationShell,
  FunctionalOverlays,
  speakFunctional,
  useFunctionalHits,
  useFunctionalSession,
} from '@/components/game/speech/functional-coordination/shared/functionalCoordinationShared';
import { HERO_GRADUATION_CUES } from '@/components/game/speech/functional-coordination/session10/functionalCoordinationCues';
import { useFunctionalCoordination } from '@/hooks/useFunctionalCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function CoordinationHeroGraduationGame({ onBack, onComplete }: Props) {
  const session = useFunctionalSession('coordination-hero-graduation', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useFunctionalCoordination(canPlay, 'coordination-hero-graduation', session.round);
  const cue = useMemo(() => HERO_GRADUATION_CUES[hits % HERO_GRADUATION_CUES.length] ?? HERO_GRADUATION_CUES[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctional('Coordination hero graduation. Watch, prepare, copy, and celebrate every try.');
  }, [canPlay, session.round]);

  useFunctionalHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <FunctionalCoordinationShell
        title="Coordination Hero Graduation"
        subtitle="Final Level 7 integration"
        skills="🎓 Jaw, lips, tongue, airflow, timing, sequencing"
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
            <Text style={styles.btnText}>Graduate try! 🎓</Text>
          </Pressable>
        </View>
      </FunctionalCoordinationShell>
      <FunctionalOverlays
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
