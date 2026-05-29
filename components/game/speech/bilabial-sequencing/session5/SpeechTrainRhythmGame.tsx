import {
  BilabialSequencingOverlays,
  BilabialSequencingShell,
  speakBilabialSequencing,
  useBilabialSequencingSession,
} from '@/components/game/speech/bilabial-sequencing/shared/bilabialSequencingShared';
import { TRAIN_RHYTHMS } from '@/components/game/speech/bilabial-sequencing/session5/bilabialRepeatAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useBilabialRepeatAttempt,
} from '@/components/game/speech/bilabial-sequencing/session5/useBilabialRepeatAttempt';
import type { BilabialSequencingSessionManager } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingSessionManager';
import type { BilabialSequencingSense } from '@/hooks/useBilabialSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function TrainPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: BilabialSequencingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: BilabialSequencingSessionManager;
  onRoundComplete: () => void;
}) {
  const rhythm = useMemo(() => TRAIN_RHYTHMS[hits % TRAIN_RHYTHMS.length] ?? TRAIN_RHYTHMS[0], [hits]);
  const { tryRepeat, mouth, target } = useBilabialRepeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    rhythm.repeat,
  );
  const trainOffset = Math.min(hits * 28, 140);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#CA8A04" />
      <Text style={styles.train}>🚂</Text>
      <View style={styles.track}>
        <View style={[styles.trainCar, { marginLeft: trainOffset }]}>
          <Text style={styles.carText}>{rhythm.label}</Text>
        </View>
      </View>
      <Pressable style={styles.btn} onPress={tryRepeat}>
        <Text style={styles.btnText}>Choo-choo repeat! 🎉</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.party}>Train party!</Text>}
    </View>
  );
}

export function SpeechTrainRhythmGame({ onBack, onComplete }: Props) {
  const session = useBilabialSequencingSession('speech-train-rhythm', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBilabialSequencing('Speech train rhythm! MA to MA, PA to PA — repeat any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <BilabialSequencingShell
        gameId="speech-train-rhythm"
        title="Speech Train Rhythm"
        subtitle="Repeated movement play"
        skills="🚂 Rhythm • 🗣️ Bilabial sequencing"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Each try moves the train — every repeat counts!"
        startEmoji="🚂"
      >
        {(sense) => (
          <TrainPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </BilabialSequencingShell>
      <BilabialSequencingOverlays
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
  stage: { minHeight: 340, alignItems: 'center', padding: 10 },
  train: { fontSize: 52 },
  track: {
    width: '90%',
    maxWidth: 320,
    height: 56,
    marginVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#FDE047',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trainCar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#CA8A04',
    alignSelf: 'flex-start',
  },
  carText: { fontSize: 18, fontWeight: '900', color: '#854D0E' },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#CA8A04',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  party: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#A16207' },
});
