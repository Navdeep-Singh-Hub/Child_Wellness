import {
  OralSequenceOverlays,
  OralSequencingShell,
  speakOralSequence,
  useOralSequenceHits,
  useOralSequenceSession,
} from '@/components/game/speech/oral-sequencing/shared/oralSequencingShared';
import { MONSTER_SEQUENCE_CUES } from '@/components/game/speech/oral-sequencing/session7/oralSequenceCues';
import { useOralSequencing } from '@/hooks/useOralSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function FunnyMonsterStepsGame({ onBack, onComplete }: Props) {
  const session = useOralSequenceSession('funny-monster-steps', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSequencing(canPlay, 'funny-monster-steps', session.round);
  const cue = useMemo(
    () => MONSTER_SEQUENCE_CUES[hits % MONSTER_SEQUENCE_CUES.length] ?? MONSTER_SEQUENCE_CUES[0],
    [hits],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralSequence('Funny monster steps. Wrong order or partial steps still count.');
  }, [canPlay, session.round]);

  useOralSequenceHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <OralSequencingShell
        title="Funny Monster Steps"
        subtitle="Oral sequence imitation"
        skills="👾 Open, round, tongue, smile"
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
  monster: { fontSize: 86 },
  label: { marginTop: 10, fontSize: 18, fontWeight: '900', color: '#166534', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#16A34A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
