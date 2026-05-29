import {
  SPEECH_ORAL_INTERACTIONS_PER_ROUND,
  SpeechOralImitationOverlays,
  SpeechOralImitationShell,
  speakSpeechOralImitation,
  useSpeechOralImitationSession,
} from '@/components/game/speech/speech-oral-imitation/shared/speechOralImitationShared';
import { COPY_SHAPES, SHAPE_EMOJI, SHAPE_LABEL } from '@/components/game/speech/speech-oral-imitation/session1/speechMouthShapes';
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

export function SpeechMouthCopyGame({ onBack, onComplete }: Props) {
  const session = useSpeechOralImitationSession('speech-mouth-copy', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useSpeechOralImitation(canPlay, 'speech-mouth-copy', session.round);

  const pose = useMemo(
    () => COPY_SHAPES[(hits + sense.imitationAttempts) % COPY_SHAPES.length] ?? COPY_SHAPES[0],
    [hits, sense.imitationAttempts],
  );
  const { mouth, target } = useSpeechShapeCameraMatch(sense, canPlay, hits, pose.shape);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechOralImitation(`Copy: ${pose.label}. Stars for every try!`);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordImitation(sense.sequenceProgress);
    if (next >= SPEECH_ORAL_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SpeechOralImitationShell
        title="Speech Mouth Copy"
        subtitle="Copy speech-ready mouth shapes"
        skills="🗣️ Speech mouth imitation"
        gradient={['#E0F2FE', '#FCE7F3']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Show: ${SHAPE_LABEL[pose.shape]}. Copy or tap I tried!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Level6CameraLayer sense={mouth} active={canPlay} />
          <Level6MirrorPreview sense={mouth} active={canPlay} />
          <Level6StatusPill sense={mouth} target={target} accent="#2563EB" />
          <View style={styles.card}>
            <Text style={styles.emoji}>{SHAPE_EMOJI[pose.shape]}</Text>
            <Text style={styles.label}>{SHAPE_LABEL[pose.shape]}</Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.imitate()}>
            <Text style={styles.btnText}>I tried! ⭐</Text>
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
  card: { width: '88%', maxWidth: 340, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 3, borderColor: 'rgba(37,99,235,0.3)', alignItems: 'center', paddingVertical: 22 },
  emoji: { fontSize: 110 },
  label: { marginTop: 10, fontSize: 20, fontWeight: '900', color: '#1E3A8A' },
  btn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, backgroundColor: '#2563EB' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
