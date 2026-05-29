import {
  SPEECH_ORAL_INTERACTIONS_PER_ROUND,
  SpeechOralImitationOverlays,
  SpeechOralImitationShell,
  speakSpeechOralImitation,
  useSpeechOralImitationSession,
} from '@/components/game/speech/speech-oral-imitation/shared/speechOralImitationShared';
import { SHAPE_EMOJI } from '@/components/game/speech/speech-oral-imitation/session1/speechMouthShapes';
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

const HERO_STEPS = [
  { shape: 'open' as const, label: 'Open' },
  { shape: 'closed' as const, label: 'Closed' },
  { shape: 'round' as const, label: 'Round' },
  { shape: 'smile' as const, label: 'Smile' },
];

export function SpeechHeroWarmupGame({ onBack, onComplete }: Props) {
  const session = useSpeechOralImitationSession('speech-hero-warmup', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useSpeechOralImitation(canPlay, 'speech-hero-warmup', session.round);

  const step = useMemo(() => HERO_STEPS[Math.min(hits, HERO_STEPS.length - 1)] ?? HERO_STEPS[0], [hits]);
  const { mouth, target } = useSpeechShapeCameraMatch(sense, canPlay, hits, step.shape);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSpeechOralImitation('Speech hero warm-up! Watch, copy, tap — hero celebration for every try.');
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
        title="Speech Hero Warm-Up"
        subtitle="Level 6 integration — watch, copy, explore"
        skills="🦸 Speech hero"
        gradient={['#FEF3C7', '#FCE7F3']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Hero step: ${step.label}. No fail — celebrate tries!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Level6CameraLayer sense={mouth} active={canPlay} />
          <Level6MirrorPreview sense={mouth} active={canPlay} />
          <Level6StatusPill sense={mouth} target={target} accent="#EA580C" />
          <Text style={styles.hero}>🦸</Text>
          <View style={styles.badges}>
            {HERO_STEPS.map((s, i) => (
              <View key={s.shape} style={[styles.badge, i <= hits && styles.badgeOn]}>
                <Text style={styles.badgeEmoji}>{SHAPE_EMOJI[s.shape]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.face}>{SHAPE_EMOJI[step.shape]}</Text>
          <Pressable style={styles.btn} onPress={() => sense.imitate()}>
            <Text style={styles.btnText}>Hero try! 🎉</Text>
          </Pressable>
          {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
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
  hero: { fontSize: 52 },
  badges: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  badge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 2, borderColor: '#FED7AA', alignItems: 'center', justifyContent: 'center' },
  badgeOn: { backgroundColor: '#FFEDD5', borderColor: '#EA580C' },
  badgeEmoji: { fontSize: 24 },
  face: { fontSize: 80, marginVertical: 8 },
  btn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EA580C' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  celebrate: { marginTop: 12, fontSize: 18, fontWeight: '900', color: '#C2410C' },
});
