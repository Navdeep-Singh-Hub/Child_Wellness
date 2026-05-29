import {
  BilabialSequencingOverlays,
  BilabialSequencingShell,
  speakBilabialSequencing,
  useBilabialSequencingSession,
} from '@/components/game/speech/bilabial-sequencing/shared/bilabialSequencingShared';
import { ROBOT_REPEATS } from '@/components/game/speech/bilabial-sequencing/session5/bilabialRepeatAssets';
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

function RobotPlay({
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
  const item = useMemo(() => ROBOT_REPEATS[hits % ROBOT_REPEATS.length] ?? ROBOT_REPEATS[0], [hits]);
  const { tryRepeat, mouth, target } = useBilabialRepeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.repeat,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#4F46E5" />
      <Text style={styles.robot}>🤖</Text>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.slow}>Slow robot beats…</Text>
      <Pressable style={styles.btn} onPress={tryRepeat}>
        <Text style={styles.btnText}>Robot beat! 💃</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.dance}>Robot dance!</Text>}
    </View>
  );
}

export function TalkingRobotBeatsGame({ onBack, onComplete }: Props) {
  const session = useBilabialSequencingSession('talking-robot-beats', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBilabialSequencing('Talking robot beats! MA MA, PA PA, MMM — slow and calm.');
  }, [canPlay, session.round]);

  return (
    <>
      <BilabialSequencingShell
        gameId="talking-robot-beats"
        title="Talking Robot Beats"
        subtitle="Slow bilabial repeats"
        skills="🤖 Slow pacing • 🗣️ Bilabial repeats"
        gradient={['#EEF2FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Copy the robot beat — any try counts!"
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
  stage: { minHeight: 340, alignItems: 'center', padding: 12 },
  robot: { fontSize: 96 },
  label: { fontSize: 30, fontWeight: '900', color: '#4338CA', marginTop: 8 },
  slow: { fontSize: 15, fontWeight: '700', color: '#6366F1', marginVertical: 8 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4F46E5' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dance: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#4338CA' },
});
