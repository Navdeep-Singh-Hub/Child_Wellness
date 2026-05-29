import {
  ORAL_IMITATION_INTERACTIONS_PER_ROUND,
  OralImitationOverlays,
  OralImitationShell,
  speakOralImitation,
  useOralImitationSession,
} from '@/components/game/speech/oral-imitation-integration/shared/oralImitationShared';
import { oralPromptToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import { POSE_EMOJI } from '@/components/game/speech/oral-imitation-integration/session10/copyMyMouthPrompts';
import { useOralImitationIntegration } from '@/hooks/useOralImitationIntegration';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = [
  { id: 'watch', label: 'Watch face', emoji: '👀' },
  { id: 'copy', label: 'Copy mouth', emoji: '😛' },
  { id: 'tap', label: 'Tap funny thing', emoji: '🎈' },
] as const;

export function FunnyMouthAdventureGame({ onBack, onComplete }: Props) {
  const session = useOralImitationSession('funny-mouth-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [dancing, setDancing] = useState(false);
  const sense = useOralImitationIntegration(canPlay, 'funny-mouth-adventure', session.round);

  const step = useMemo(() => STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0], [hits]);
  const face = POSE_EMOJI[sense.prompt] ?? '😄';

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralImitation('Funny mouth adventure! Watch, copy, and tap.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    setDancing(true);
    setTimeout(() => setDancing(false), 900);
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_IMITATION_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <OralImitationShell
        title="Funny Mouth Adventure"
        subtitle="Watch, copy, and tap along"
        skills="🎈 Oral play adventure"
        gradient={['#FEF9C3', '#FCE7F3']}
        accent="#F59E0B"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Step: ${step.label}. Tap when ready.`}
        onGoodTry={sense.goodTry}
        sense={sense}
        poseTarget={
          step.id === 'copy' ? oralPromptToTarget(sense.prompt) : 'face_present'
        }
        onPoseMatch={sense.goodTry}
      >
        <View style={styles.stage}>
          <Text style={[styles.buddy, dancing && styles.buddyDance]}>🦊</Text>
          <Text style={styles.face}>{face}</Text>
          <Pressable style={styles.prop} onPress={() => sense.interact()}>
            <Text style={styles.propEmoji}>{step.emoji}</Text>
            <Text style={styles.propLabel}>{step.label}</Text>
          </Pressable>
          {dancing && <Text style={styles.dance}>Funny dance! 🎉</Text>}
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
    padding: 14,
  },
  buddy: { fontSize: 52 },
  buddyDance: { transform: [{ rotate: '6deg' }, { scale: 1.06 }] },
  face: { fontSize: 72, marginVertical: 8 },
  prop: {
    width: '86%',
    maxWidth: 320,
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propEmoji: { fontSize: 44 },
  propLabel: { marginTop: 6, fontSize: 16, fontWeight: '900', color: '#78350F' },
  dance: { marginTop: 12, fontSize: 18, fontWeight: '900', color: '#B45309' },
});
