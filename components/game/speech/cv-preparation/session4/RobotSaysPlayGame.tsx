import {
  CVPreparationOverlays,
  CVPreparationShell,
  speakCVPreparation,
  useCVPreparationSession,
} from '@/components/game/speech/cv-preparation/shared/cvPreparationShared';
import { CORE_CV, ROBOT_STEPS } from '@/components/game/speech/cv-preparation/session4/cvPatternAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useCVPatternAttempt,
} from '@/components/game/speech/cv-preparation/session4/useCVPatternAttempt';
import type { CVPreparationSessionManager } from '@/components/game/speech/cv-preparation/modules/CVPreparationSessionManager';
import type { CVPreparationSense } from '@/hooks/useCVPreparation';
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
  sense: CVPreparationSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: CVPreparationSessionManager;
  onRoundComplete: () => void;
}) {
  const step = ROBOT_STEPS[Math.min(hits, ROBOT_STEPS.length - 1)] ?? ROBOT_STEPS[0];
  const cv = useMemo(() => CORE_CV[hits % CORE_CV.length] ?? CORE_CV[0], [hits]);
  const { tryPattern, mouth, target } = useCVPatternAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    cv.pattern,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#4F46E5" />
      <Text style={styles.robot}>🤖</Text>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.pattern}>{cv.label}</Text>
      <Pressable style={styles.btn} onPress={tryPattern}>
        <Text style={styles.btnText}>Robot copy! 💃</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.dance}>Robot dance!</Text>}
    </View>
  );
}

export function RobotSaysPlayGame({ onBack, onComplete }: Props) {
  const session = useCVPreparationSession('robot-says-play', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakCVPreparation('Robot says play! Open mouth, close lips, try a sound — slow and calm.');
  }, [canPlay, session.round]);

  return (
    <>
      <CVPreparationShell
        gameId="robot-says-play"
        title="Robot Says Ma–Pa Play"
        subtitle="Mouth + sound sequence"
        skills="🤖 Slow pacing • 🗣️ CV sequence"
        gradient={['#EEF2FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Follow the robot step by step — any try counts"
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
      </CVPreparationShell>
      <CVPreparationOverlays
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
  step: { fontSize: 18, fontWeight: '900', color: '#3730A3', marginTop: 8 },
  pattern: { fontSize: 26, fontWeight: '900', color: '#4F46E5', marginVertical: 10 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4F46E5' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dance: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#4338CA' },
});
