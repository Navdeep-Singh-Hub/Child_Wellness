import {
  TONGUE_AWARENESS_INTERACTIONS_PER_ROUND,
  TongueAwarenessOverlays,
  TongueAwarenessShell,
  speakTongueAwareness,
  useTongueAwarenessSession,
} from '@/components/game/speech/tongue-awareness/shared/tongueAwarenessShared';
import { useTongueAwareness } from '@/hooks/useTongueAwareness';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES = [
  { id: 'out', label: 'Tongue out', emoji: '😛' },
  { id: 'in', label: 'Tongue in', emoji: '🙂' },
  { id: 'funny', label: 'Funny face', emoji: '😜' },
] as const;

export function MagicTongueMirrorGame({ onBack, onComplete }: Props) {
  const session = useTongueAwarenessSession('magic-tongue-mirror', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTongueAwareness(canPlay, 'magic-tongue-mirror', session.round);

  const pose = useMemo(() => POSES[(hits + sense.interactionCount) % POSES.length] ?? POSES[0], [hits, sense.interactionCount]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTongueAwareness(`Watch the mirror. Try ${pose.label}, or tap Good try.`);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    session.manager.recordExploration(`mirror:${pose.id}`);
    if (next >= TONGUE_AWARENESS_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TongueAwarenessShell
        title="Magic Tongue Mirror"
        subtitle="Watch and copy playful tongue faces"
        skills="🪞 Playful imitation"
        gradient={['#E0E7FF', '#FCE7F3']}
        accent="#6366F1"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Mirror shows: ${pose.label}. Copy if you want — no pressure!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <View style={styles.mirror}>
            <Text style={styles.mirrorLabel}>Magic mirror</Text>
            <Text style={styles.avatar}>{pose.emoji}</Text>
            <Text style={styles.poseText}>{pose.label}</Text>
          </View>
          <Pressable style={styles.copyBtn} onPress={() => sense.interact()}>
            <Text style={styles.copyText}>I tried! ✨</Text>
          </Pressable>
        </View>
      </TongueAwarenessShell>
      <TongueAwarenessOverlays
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
  mirror: {
    width: '88%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(99,102,241,0.35)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mirrorLabel: { fontSize: 14, fontWeight: '800', color: '#4338CA' },
  avatar: { fontSize: 110, marginVertical: 8 },
  poseText: { fontSize: 18, fontWeight: '900', color: '#312E81' },
  copyBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#6366F1',
  },
  copyText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
