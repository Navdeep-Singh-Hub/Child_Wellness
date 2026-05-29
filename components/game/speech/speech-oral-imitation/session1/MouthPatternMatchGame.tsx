import {
  SPEECH_ORAL_INTERACTIONS_PER_ROUND,
  SpeechOralImitationOverlays,
  SpeechOralImitationShell,
  speakSpeechOralImitation,
  useSpeechOralImitationSession,
} from '@/components/game/speech/speech-oral-imitation/shared/speechOralImitationShared';
import { PATTERN_SEQUENCES, SHAPE_EMOJI } from '@/components/game/speech/speech-oral-imitation/session1/speechMouthShapes';
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

export function MouthPatternMatchGame({ onBack, onComplete }: Props) {
  const session = useSpeechOralImitationSession('mouth-pattern-match', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useSpeechOralImitation(canPlay, 'mouth-pattern-match', session.round);

  const pattern = useMemo(
    () => PATTERN_SEQUENCES[(session.round + hits) % PATTERN_SEQUENCES.length] ?? PATTERN_SEQUENCES[0],
    [session.round, hits],
  );

  const stepIdx = Math.min(sense.sequenceStep, pattern.shapes.length - 1);
  const currentShape = pattern.shapes[stepIdx] ?? pattern.shapes[0];
  const { mouth, target } = useSpeechShapeCameraMatch(sense, canPlay, hits, currentShape);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechOralImitation(`Pattern: ${pattern.label}. Tap for each step — no wrong answers.`);
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
        title="Mouth Pattern Match"
        subtitle="Short speech mouth sequences"
        skills="🔁 Simple sequences"
        gradient={['#FEF9C3', '#E0F2FE']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${pattern.label} — step ${stepIdx + 1}. Tap to copy.`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Level6CameraLayer sense={mouth} active={canPlay} />
          <Level6MirrorPreview sense={mouth} active={canPlay} />
          <Level6StatusPill sense={mouth} target={target} accent="#CA8A04" />
          <Text style={styles.title}>{pattern.label}</Text>
          <View style={styles.row}>
            {pattern.shapes.map((s, i) => (
              <View key={`${s}-${i}`} style={[styles.step, i <= stepIdx && styles.stepOn]}>
                <Text style={styles.stepEmoji}>{SHAPE_EMOJI[s]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.now}>Now: {SHAPE_EMOJI[currentShape]}</Text>
          <Pressable style={styles.btn} onPress={() => sense.imitate()}>
            <Text style={styles.btnText}>Next step ⭐</Text>
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
  stage: { minHeight: 360, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '900', color: '#713F12', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  step: { width: 72, height: 72, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 2, borderColor: '#FDE68A', alignItems: 'center', justifyContent: 'center' },
  stepOn: { backgroundColor: '#FEF9C3', borderColor: '#CA8A04' },
  stepEmoji: { fontSize: 40 },
  now: { fontSize: 48, marginBottom: 12 },
  btn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, backgroundColor: '#CA8A04' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
