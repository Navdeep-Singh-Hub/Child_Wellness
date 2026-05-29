import {
  DEFAULT_LIP_ROUNDS,
  LIP_INTERACTIONS_PER_ROUND,
  LipAwarenessGameFrame,
  LipGameOverlays,
  LipTapTarget,
  clearLipSpeech,
  hapticLipSuccess,
  speakLip,
  useLipAwarenessGameSession,
} from '@/components/game/speech/lip-awareness/shared/lipAwarenessShared';
import type { LipAwarenessSense } from '@/hooks/useLipAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipTapFriendGame({ onBack, onComplete }: Props) {
  const session = useLipAwarenessGameSession('lip-tap-friend', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakLip('Lip Tap Friend says: Tap my lips!');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakLip('Tap the glowing lips!');
  }, [session.round, canPlay]);

  const onTap = useCallback(() => {
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction('tap-lips');
    hapticLipSuccess();
    if (next >= LIP_INTERACTIONS_PER_ROUND) {
      speakLip('Giggle giggle! Thank you for tapping!');
      setTimeout(() => session.completeRound(), 900);
    } else {
      speakLip('He he! Tap again!');
    }
  }, [hits, session]);

  return (
    <>
      <LipAwarenessGameFrame
        title="Lip Tap Friend"
        subtitle="Tap the friendly lips"
        skills="👆 Big tap • 😊 Giggles • 💚 No fail"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🧸"
        startHint="Tap the big glowing lips. Your friend loves every tap!"
      >
        {(lip) => <LipTapPlay lip={lip} hits={hits} onTap={onTap} />}
      </LipAwarenessGameFrame>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} message="Lip tap champion!" />
    </>
  );
}

function LipTapPlay({
  lip,
  hits,
  onTap,
}: {
  lip: LipAwarenessSense;
  hits: number;
  onTap: () => void;
}) {
  const [giggle, setGiggle] = useState(false);

  const handleTap = () => {
    lip.registerTap();
    setGiggle(true);
    setTimeout(() => setGiggle(false), 400);
    onTap();
  };

  return (
    <View style={styles.center}>
      <Text style={styles.friend}>{giggle ? '🧸😂' : '🧸'}</Text>
      <Text style={styles.speech}>Tap my lips!</Text>
      <LipTapTarget
        accent="#059669"
        label="Tap here!"
        glow={giggle}
        onTap={handleTap}
      />
      <Text style={styles.count}>{hits} / {LIP_INTERACTIONS_PER_ROUND} taps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  friend: { fontSize: 56, marginBottom: 8 },
  speech: { fontSize: 22, fontWeight: '800', color: '#047857', marginBottom: 16 },
  count: { marginTop: 16, fontSize: 14, color: '#64748B', fontWeight: '600' },
});
