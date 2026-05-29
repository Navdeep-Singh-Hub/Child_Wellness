import {
  SPEECH_ORAL_INTERACTIONS_PER_ROUND,
  SpeechOralImitationOverlays,
  SpeechOralImitationShell,
  speakSpeechOralImitation,
  useSpeechOralImitationSession,
} from '@/components/game/speech/speech-oral-imitation/shared/speechOralImitationShared';
import { ROBOT_SHAPES, SHAPE_EMOJI } from '@/components/game/speech/speech-oral-imitation/session1/speechMouthShapes';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useSpeechShapeCameraMatch,
} from '@/components/game/speech/speech-oral-imitation/session1/useSpeechShapeCameraMatch';
import { useSpeechOralImitation } from '@/hooks/useSpeechOralImitation';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingRobotFaceGame({ onBack, onComplete }: Props) {
  const session = useSpeechOralImitationSession('talking-robot-face', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [dancing, setDancing] = useState(false);
  const sense = useSpeechOralImitation(canPlay, 'talking-robot-face', session.round);

  const step = useMemo(
    () => ROBOT_SHAPES[hits % ROBOT_SHAPES.length] ?? ROBOT_SHAPES[0],
    [hits],
  );
  const { mouth, target } = useSpeechShapeCameraMatch(sense, canPlay, hits, step.shape);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechOralImitation(`Robot says ${step.label}. Copy slowly — robot dance for tries!`);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    setDancing(true);
    setTimeout(() => setDancing(false), 900);
    const next = hits + 1;
    setHits(next);
    session.manager.recordImitation(sense.sequenceProgress);
    if (next >= SPEECH_ORAL_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SpeechOralImitationShell
        title="Talking Robot Face"
        subtitle="Copy robot speech mouth actions"
        skills="🤖 Slow robot copy"
        gradient={['#E0E7FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Robot: ${step.label}. Tap when you copy.`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Level6CameraLayer sense={mouth} active={canPlay} />
          <Level6MirrorPreview sense={mouth} active={canPlay} />
          <Level6StatusPill sense={mouth} target={target} accent="#4F46E5" />
          <Text style={[styles.robot, dancing && styles.robotDance]}>🤖</Text>
          <Text style={styles.mouth}>{SHAPE_EMOJI[step.shape]}</Text>
          <Text style={styles.say}>{step.label}</Text>
          <Pressable style={styles.btn} onPress={() => sense.imitate()}>
            <Text style={styles.btnText}>Robot copy! ✨</Text>
          </Pressable>
        </View>
      </SpeechOralImitationShell>
      <SpeechOralImitationOverlays
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
  stage: { minHeight: 360, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', padding: 14 },
  robot: { fontSize: 72 },
  robotDance: { transform: [{ rotate: '5deg' }, { scale: 1.05 }] },
  mouth: { fontSize: 64, marginVertical: 6 },
  say: { fontSize: 22, fontWeight: '900', color: '#312E81', marginBottom: 12 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4F46E5' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
