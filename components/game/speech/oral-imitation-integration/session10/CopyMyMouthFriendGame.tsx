import {
  ORAL_IMITATION_INTERACTIONS_PER_ROUND,
  OralImitationOverlays,
  OralImitationShell,
  PROMPT_LABELS,
  speakOralImitation,
  useOralImitationSession,
} from '@/components/game/speech/oral-imitation-integration/shared/oralImitationShared';
import { oralPromptToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import { FRIEND_POSES, POSE_EMOJI } from '@/components/game/speech/oral-imitation-integration/session10/copyMyMouthPrompts';
import { useOralImitationIntegration } from '@/hooks/useOralImitationIntegration';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function CopyMyMouthFriendGame({ onBack, onComplete }: Props) {
  const session = useOralImitationSession('copy-my-mouth-friend', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralImitationIntegration(canPlay, 'copy-my-mouth-friend', session.round);

  const pose = useMemo(
    () => FRIEND_POSES[(hits + sense.imitationAttempts) % FRIEND_POSES.length] ?? FRIEND_POSES[0],
    [hits, sense.imitationAttempts],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralImitation(`Copy my friend: ${pose.label}. Any try counts!`);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

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
        title="Copy My Mouth Friend"
        subtitle="Watch and copy simple mouth faces"
        skills="😊 Mouth imitation"
        gradient={['#FCE7F3', '#E0F2FE']}
        accent="#EC4899"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Friend shows: ${PROMPT_LABELS[pose.prompt] ?? pose.label}. Copy or tap I tried!`}
        onGoodTry={sense.goodTry}
        sense={sense}
        poseTarget={oralPromptToTarget(pose.prompt)}
        onPoseMatch={sense.goodTry}
      >
        <View style={styles.stage}>
          <Text style={styles.friend}>🧸</Text>
          <View style={styles.demoCard}>
            <Text style={styles.demoEmoji}>{POSE_EMOJI[pose.prompt]}</Text>
            <Text style={styles.demoLabel}>{pose.label}</Text>
          </View>
          <Pressable style={styles.tryBtn} onPress={() => sense.interact()}>
            <Text style={styles.tryText}>I tried! ⭐</Text>
          </Pressable>
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
    justifyContent: 'center',
    padding: 14,
  },
  friend: { fontSize: 56, marginBottom: 8 },
  demoCard: {
    width: '88%',
    maxWidth: 340,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 2,
    borderColor: 'rgba(236,72,153,0.35)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  demoEmoji: { fontSize: 96 },
  demoLabel: { marginTop: 8, fontSize: 18, fontWeight: '900', color: '#831843' },
  tryBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EC4899',
  },
  tryText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
