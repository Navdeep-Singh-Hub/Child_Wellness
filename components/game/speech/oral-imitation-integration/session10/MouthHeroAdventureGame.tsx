import {
  ORAL_IMITATION_INTERACTIONS_PER_ROUND,
  OralImitationOverlays,
  OralImitationShell,
  speakOralImitation,
  useOralImitationSession,
} from '@/components/game/speech/oral-imitation-integration/shared/oralImitationShared';
import type { MouthPoseTarget } from '@/components/game/speech/mouth-pose/modules/mouthPoseTypes';
import { POSE_EMOJI } from '@/components/game/speech/oral-imitation-integration/session10/copyMyMouthPrompts';
import { useOralImitationIntegration } from '@/hooks/useOralImitationIntegration';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HERO_STEPS = [
  { id: 'air', label: 'Soft air', emoji: '🌬️' },
  { id: 'lips', label: 'Lips', emoji: '👄' },
  { id: 'jaw', label: 'Open close', emoji: '😮' },
  { id: 'face', label: 'Funny face', emoji: '😜' },
  { id: 'tongue', label: 'Tongue', emoji: '👅' },
] as const;

export function MouthHeroAdventureGame({ onBack, onComplete }: Props) {
  const session = useOralImitationSession('mouth-hero-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralImitationIntegration(canPlay, 'mouth-hero-adventure', session.round);

  const step = useMemo(() => HERO_STEPS[Math.min(hits, HERO_STEPS.length - 1)] ?? HERO_STEPS[0], [hits]);
  const face = POSE_EMOJI[sense.prompt] ?? step.emoji;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralImitation('Mouth hero adventure! Watch, copy, tap, and explore — you are the hero!');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_IMITATION_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <OralImitationShell
        title="Mouth Hero Adventure"
        subtitle="Level 5 integration — watch, copy, tap"
        skills="🦸 Oral hero play"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Hero step: ${step.label}. No fail — celebrate every try!`}
        onGoodTry={sense.goodTry}
        sense={sense}
        poseTarget={heroTarget}
        onPoseMatch={sense.goodTry}
      >
        <View style={styles.stage}>
          <Text style={styles.hero}>🦸</Text>
          <Text style={styles.face}>{face}</Text>
          <View style={styles.badges}>
            {HERO_STEPS.map((s, i) => (
              <View key={s.id} style={[styles.badge, i <= hits && styles.badgeOn]}>
                <Text style={styles.badgeEmoji}>{s.emoji}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.action} onPress={() => sense.interact()}>
            <Text style={styles.actionText}>Hero try! ✨</Text>
          </Pressable>
          {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration! 🎉</Text>}
        </View>
      </OralImitationShell>
      <OralImitationOverlays
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
  stage: {
    minHeight: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    padding: 12,
  },
  hero: { fontSize: 52 },
  face: { fontSize: 76, marginVertical: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginVertical: 10 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: '#FFEDD5', borderColor: '#EA580C' },
  badgeEmoji: { fontSize: 22 },
  action: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EA580C',
  },
  actionText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  celebrate: { marginTop: 12, fontSize: 18, fontWeight: '900', color: '#C2410C' },
});
