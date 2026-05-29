import {
  OralSequenceOverlays,
  OralSequencingShell,
  speakOralSequence,
  useOralSequenceHits,
  useOralSequenceSession,
} from '@/components/game/speech/oral-sequencing/shared/oralSequencingShared';
import { RHYTHM_SEQUENCE_CUES } from '@/components/game/speech/oral-sequencing/session7/oralSequenceCues';
import { useOralSequencing } from '@/hooks/useOralSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingRhythmSequenceGame({ onBack, onComplete }: Props) {
  const session = useOralSequenceSession('talking-rhythm-sequence', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSequencing(canPlay, 'talking-rhythm-sequence', session.round);
  const cue = useMemo(
    () => RHYTHM_SEQUENCE_CUES[hits % RHYTHM_SEQUENCE_CUES.length] ?? RHYTHM_SEQUENCE_CUES[0],
    [hits],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralSequence('Talking rhythm sequence. Move, pause, move with calm timing.');
  }, [canPlay, session.round]);

  useOralSequenceHits({ canPlay, sense, hits, setHits, manager: session.manager, onRoundComplete: session.completeRound });

  return (
    <>
      <OralSequencingShell
        title="Talking Rhythm Sequence"
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
  face: { fontSize: 76 },
  beat: { fontSize: 20, color: '#047857', marginTop: 8, letterSpacing: 3 },
  btn: { marginTop: 14, backgroundColor: '#059669', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
