import {
  EarlySyllableControlOverlays,
  EarlySyllableControlShell,
  speakEarlySyllable,
  useEarlySyllableControlSession,
} from '@/components/game/speech/early-syllable-control/shared/earlySyllableControlShared';
import { ROBOT_STEPS } from '@/components/game/speech/early-syllable-control/session8/syllableAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useSyllableAttempt,
} from '@/components/game/speech/early-syllable-control/session8/useSyllableAttempt';
import type { EarlySyllableControlSessionManager } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlSessionManager';
import type { EarlySyllableControlSense } from '@/hooks/useEarlySyllableControl';
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
  sense: EarlySyllableControlSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: EarlySyllableControlSessionManager;
  onRoundComplete: () => void;
}) {
  const step = useMemo(() => ROBOT_STEPS[hits % ROBOT_STEPS.length] ?? ROBOT_STEPS[0], [hits]);
  const { trySyllable, mouth, target } = useSyllableAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    step.syllable,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#4F46E5" />
      <Text style={styles.robot}>🤖</Text>
      <Text style={styles.step}>Step {Math.min(hits + 1, 3)}</Text>
      <Text style={styles.label}>{step.label}</Text>
      <Text style={styles.slow}>Slow speech steps…</Text>
      <Pressable style={styles.btn} onPress={trySyllable}>
        <Text style={styles.btnText}>Robot step! ⭐</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.celebrate}>Robot celebration!</Text>}
    </View>
  );
}

export function RobotSpeechStepsGame({ onBack, onComplete }: Props) {
  const session = useEarlySyllableControlSession('robot-speech-steps', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakEarlySyllable('Robot speech steps! MA, PA, OO — slow and calm, any try counts.');
  }, [canPlay, session.round]);

  return (
    <>
      <EarlySyllableControlShell
        gameId="robot-speech-steps"
        title="Robot Speech Steps"
        subtitle="Speech chunk confidence"
        skills="🤖 Slow steps • 🗣️ Syllable chunks"
        gradient={['#EEF2FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="One step at a time — mouth or sound counts!"
        startEmoji="🤖"
        progressLabel="steps"
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
      </EarlySyllableControlShell>
      <EarlySyllableControlOverlays
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
  step: { fontSize: 15, fontWeight: '800', color: '#6366F1', marginTop: 6 },
  label: { fontSize: 30, fontWeight: '900', color: '#4338CA', marginVertical: 8 },
  slow: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  btn: { marginTop: 14, paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4F46E5' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#4338CA' },
});
