import {
  OralSequenceOverlays,
  OralSequencingShell,
  speakOralSequence,
  useOralSequenceHits,
  useOralSequenceSession,
} from '@/components/game/speech/oral-sequencing/shared/oralSequencingShared';
import { HERO_SEQUENCE_CUES } from '@/components/game/speech/oral-sequencing/session7/oralSequenceCues';
import { useOralSequencing } from '@/hooks/useOralSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const QUEST_STEPS = ['Watch sequence', 'Copy movement', 'Repeat playfully'] as const;

export function SequenceHeroAdventureGame({ onBack, onComplete }: Props) {
  const session = useOralSequenceSession('sequence-hero-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSequencing(canPlay, 'sequence-hero-adventure', session.round);
  const cue = useMemo(
    () => HERO_SEQUENCE_CUES[hits % HERO_SEQUENCE_CUES.length] ?? HERO_SEQUENCE_CUES[0],
    [hits],
  );
  const step = QUEST_STEPS[Math.min(hits, QUEST_STEPS.length - 1)] ?? QUEST_STEPS[0];

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralSequence('Sequence hero adventure. Watch, copy, repeat. No fail state.');
  }, [canPlay, session.round]);

  useOralSequenceHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <OralSequencingShell
        title="Sequence Hero Adventure"
        subtitle="Integrated oral sequencing"
        skills="🦸 Jaw, lips, tongue, airflow, timing"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${step} — ${sense.currentStepLabel}`}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.hero}>🦸</Text>
          <Text style={styles.step}>{step}</Text>
          <Text style={styles.label}>{cue.label}</Text>
          <Pressable style={styles.btn} onPress={sense.coordinate}>
            <Text style={styles.btnText}>Hero try! ⭐</Text>
          </Pressable>
          {sense.rewardState === 'HERO' ? <Text style={styles.celebrate}>Hero celebration!</Text> : null}
        </View>
      </OralSequencingShell>
      <OralSequenceOverlays
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
  hero: { fontSize: 64 },
  step: { fontSize: 18, fontWeight: '900', color: '#5B21B6', marginTop: 6 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#6D28D9', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#7C3AED', paddingHorizontal: 26, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#7C3AED' },
});
