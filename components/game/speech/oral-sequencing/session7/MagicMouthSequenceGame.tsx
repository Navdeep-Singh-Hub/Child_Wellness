import {
  OralSequenceOverlays,
  OralSequencingShell,
  speakOralSequence,
  useOralSequenceHits,
  useOralSequenceSession,
} from '@/components/game/speech/oral-sequencing/shared/oralSequencingShared';
import { MAGIC_SEQUENCE_CUES } from '@/components/game/speech/oral-sequencing/session7/oralSequenceCues';
import { useOralSequencing } from '@/hooks/useOralSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthSequenceGame({ onBack, onComplete }: Props) {
  const session = useOralSequenceSession('magic-mouth-sequence', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSequencing(canPlay, 'magic-mouth-sequence', session.round);
  const cue = useMemo(
    () => MAGIC_SEQUENCE_CUES[hits % MAGIC_SEQUENCE_CUES.length] ?? MAGIC_SEQUENCE_CUES[0],
    [hits],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralSequence('Magic mouth sequence. Try mouth movements in order, any effort counts.');
  }, [canPlay, session.round]);

  useOralSequenceHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <OralSequencingShell
        title="Magic Mouth Sequence"
        subtitle="Movement order"
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
            <Text style={styles.btnText}>Sequence try! ✨</Text>
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
  magic: { fontSize: 52 },
  emoji: { fontSize: 72, marginTop: 10 },
  label: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#075985', textAlign: 'center' },
  btn: { marginTop: 14, backgroundColor: '#0284C7', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
