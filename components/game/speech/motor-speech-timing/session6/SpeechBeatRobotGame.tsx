import {
  MotorSpeechTimingOverlays,
  MotorSpeechTimingShell,
  speakMotorSpeechTiming,
  useMotorSpeechTimingSession,
} from '@/components/game/speech/motor-speech-timing/shared/motorSpeechTimingShared';
import { CORE_RHYTHMS } from '@/components/game/speech/motor-speech-timing/session6/rhythmBeatAssets';
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

function RobotPlay({
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
  const item = useMemo(() => CORE_RHYTHMS[hits % CORE_RHYTHMS.length] ?? CORE_RHYTHMS[0], [hits]);
  const { tryRhythm, mouth, target } = useRhythmBeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.rhythm,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#4F46E5" />
      <Text style={[styles.robot, sense.state === 'RHYTHM_ACTIVE' && styles.robotBeat]}>🤖</Text>
      <Text style={styles.slow}>Slow speaking rhythm</Text>
      <Text style={styles.label}>{item.label}</Text>
      <View style={[styles.beatBar, sense.rhythmPulse && styles.beatBarOn]} />
      <Pressable style={styles.btn} onPress={tryRhythm}>
        <Text style={styles.btnText}>Beat with robot! 💃</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.dance}>Robot dance!</Text>}
    </View>
  );
}

export function SpeechBeatRobotGame({ onBack, onComplete }: Props) {
  const session = useMotorSpeechTimingSession('speech-beat-robot', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMotorSpeechTiming('Speech beat robot! Slow rhythm — copy any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <MotorSpeechTimingShell
        gameId="speech-beat-robot"
        title="Speech Beat Robot"
        subtitle="Slow speech timing"
        skills="🤖 Motor timing • 🎵 Rhythm play"
        gradient={['#EEF2FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Copy the robot beat — approximate rhythm counts!"
        startEmoji="🤖"
      >
        {(sense) => (
          <RobotPlay
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
  stage: { minHeight: 340, alignItems: 'center', padding: 12 },
  robot: { fontSize: 92 },
  robotBeat: { transform: [{ scale: 1.06 }] },
  slow: { fontSize: 15, fontWeight: '700', color: '#6366F1', marginTop: 6 },
  label: { fontSize: 28, fontWeight: '900', color: '#4338CA', marginVertical: 10 },
  beatBar: {
    width: 120,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(99,102,241,0.25)',
    marginBottom: 12,
  },
  beatBarOn: { backgroundColor: '#6366F1' },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4F46E5' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dance: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#4338CA' },
});
