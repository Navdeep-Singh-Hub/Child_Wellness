import {
  MotorSpeechTimingOverlays,
  MotorSpeechTimingShell,
  speakMotorSpeechTiming,
  useMotorSpeechTimingSession,
} from '@/components/game/speech/motor-speech-timing/shared/motorSpeechTimingShared';
import { TRAIN_RHYTHMS } from '@/components/game/speech/motor-speech-timing/session6/rhythmBeatAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useRhythmBeatAttempt,
} from '@/components/game/speech/motor-speech-timing/session6/useRhythmBeatAttempt';
import type { MotorSpeechTimingSessionManager } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingSessionManager';
import type { MotorSpeechTimingSense } from '@/hooks/useMotorSpeechTiming';
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
  sense: MotorSpeechTimingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: MotorSpeechTimingSessionManager;
  onRoundComplete: () => void;
}) {
  const item = useMemo(() => TRAIN_RHYTHMS[hits % TRAIN_RHYTHMS.length] ?? TRAIN_RHYTHMS[0], [hits]);
  const { tryRhythm, mouth, target } = useRhythmBeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.rhythm,
  );
  const offset = Math.min(hits * 32 + (sense.rhythmPulse ? 8 : 0), 150);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#CA8A04" />
      <Text style={styles.train}>🚂</Text>
      <View style={styles.track}>
        <View style={[styles.car, { marginLeft: offset }]}>
          <Text style={styles.carText}>{item.label}</Text>
        </View>
      </View>
      <Pressable style={styles.btn} onPress={tryRhythm}>
        <Text style={styles.btnText}>Choo-choo rhythm! 🎉</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.party}>Train party!</Text>}
    </View>
  );
}

export function TalkingTrainTimingGame({ onBack, onComplete }: Props) {
  const session = useMotorSpeechTimingSession('talking-train-timing', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMotorSpeechTiming('Talking train timing! MA … MA, PA … PA — each try moves the train.');
  }, [canPlay, session.round]);

  return (
    <>
      <MotorSpeechTimingShell
        gameId="talking-train-timing"
        title="Talking Train Timing"
        subtitle="Rhythm moves the train"
        skills="🚂 Rhythm sequencing • 🎵 Timing play"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Each rhythm try chugs the train forward!"
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
      </MotorSpeechTimingShell>
      <MotorSpeechTimingOverlays
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
  car: {
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
