import {
  SPEECH_ORAL_INTERACTIONS_PER_ROUND,
  SpeechOralImitationOverlays,
  SpeechOralImitationShell,
  speakSpeechOralImitation,
  useSpeechOralImitationSession,
} from '@/components/game/speech/speech-oral-imitation/shared/speechOralImitationShared';
import { COPY_SHAPES, SHAPE_EMOJI } from '@/components/game/speech/speech-oral-imitation/session1/speechMouthShapes';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useSpeechShapeCameraMatch,
} from '@/components/game/speech/speech-oral-imitation/session1/useSpeechShapeCameraMatch';
import { useSpeechOralImitation } from '@/hooks/useSpeechOralImitation';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

/**
 * Optional posture encouragement is text-only (no camera required).
 * Tap always progresses — never strict validation.
 */
export function MirrorSpeechPlayGame({ onBack, onComplete }: Props) {
  const session = useSpeechOralImitationSession('mirror-speech-play', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [softHints, setSoftHints] = useState(false);
  const sense = useSpeechOralImitation(canPlay, 'mirror-speech-play', session.round);

  const pose = useMemo(
    () => COPY_SHAPES[(hits + sense.imitationAttempts) % COPY_SHAPES.length] ?? COPY_SHAPES[0],
    [hits, sense.imitationAttempts],
  );
  const { mouth, target } = useSpeechShapeCameraMatch(sense, canPlay, hits, pose.shape);

  const encouragementNote =
    softHints && sense.encouragementPosture
      ? `Gentle hint: try a ${sense.encouragementPosture.toLowerCase()} feeling — any try is great!`
      : null;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechOralImitation('Mirror speech play! Copy the mouth model — sparkles for every try.');
  }, [canPlay, session.round]);

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
        title="Mirror Speech Play"
        subtitle="Speech-style imitation in the mirror"
        skills="🪞 Mirror sparkles"
        gradient={['#EDE9FE', '#E0F2FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Mirror shows ${pose.label}. Copy when ready.`}
        onGoodTry={sense.goodTry}
        sense={sense}
        encouragementNote={encouragementNote}
      >
        <View style={styles.stage}>
          <Level6CameraLayer sense={mouth} active={canPlay} />
          <Level6MirrorPreview sense={mouth} active={canPlay} />
          <Level6StatusPill sense={mouth} target={target} accent="#7C3AED" />
          <View style={styles.mirror}>
            <Text style={styles.mirrorTag}>Speech mirror</Text>
            <Text style={styles.face}>{SHAPE_EMOJI[pose.shape]}</Text>
            <Text style={styles.pose}>{pose.label}</Text>
          </View>
          {Platform.OS === 'web' && (
            <Pressable style={styles.hintToggle} onPress={() => setSoftHints((v) => !v)}>
              <Text style={styles.hintToggleText}>
                {softHints ? 'Soft hints on ✓' : 'Optional soft hints'}
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.btn} onPress={() => sense.imitate()}>
            <Text style={styles.btnText}>Mirror copy ✨</Text>
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
  stage: { minHeight: 360, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', padding: 12 },
  mirror: { width: '88%', maxWidth: 340, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 3, borderColor: 'rgba(124,58,237,0.35)', alignItems: 'center', paddingVertical: 18 },
  mirrorTag: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
  face: { fontSize: 100, marginVertical: 6 },
  pose: { fontSize: 18, fontWeight: '900', color: '#4C1D95' },
  hintToggle: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 12 },
  hintToggleText: { fontSize: 13, fontWeight: '700', color: '#6D28D9' },
  btn: { marginTop: 10, paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#7C3AED' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
