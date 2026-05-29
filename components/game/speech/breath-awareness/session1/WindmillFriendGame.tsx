import {
  BREATH_INTERACTIONS_PER_ROUND,
  BreathGameFrame,
  BreathGameOverlays,
  DEFAULT_BREATH_ROUNDS,
  clearBreathSpeech,
  speakBreath,
  useBreathGameSession,
  useBreathInteractionCounter,
} from '@/components/game/speech/breath-awareness/shared/breathAwarenessShared';
import type { BreathAwarenessSense } from '@/hooks/useBreathAwareness';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function WindmillFriendGame({ onBack, onComplete }: Props) {
  const session = useBreathGameSession('windmill-friend', DEFAULT_BREATH_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakBreath('Windmill Friend! Your breath makes the windmill spin.');
    return () => clearBreathSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakBreath('Blow and spin the windmill!');
  }, [session.round, canPlay]);

  const onInteraction = useCallback(
    (intensity: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(intensity);
      if (next >= BREATH_INTERACTIONS_PER_ROUND) {
        speakBreath('The windmill friend is smiling!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakBreath('It spins!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathGameFrame
        title="Windmill Friend"
        subtitle="Breath spins the toy"
        skills="🌀 Air power • 🙂 Friendly play"
        gradient={['#FEFCE8', '#FEF08A']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <WindmillPlay breath={breath} canPlay={canPlay} hits={hits} onInteraction={onInteraction} />
        )}
      </BreathGameFrame>
      <BreathGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function WindmillPlay({
  breath,
  canPlay,
  hits,
  onInteraction,
}: {
  breath: BreathAwarenessSense;
  canPlay: boolean;
  hits: number;
  onInteraction: (intensity: number) => void;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  const [smile, setSmile] = useState(false);

  useBreathInteractionCounter(breath, canPlay, (intensity) => {
    setSmile(true);
    setTimeout(() => setSmile(false), 600);
    Animated.timing(spin, {
      toValue: 1,
      duration: 800 + (1 - intensity) * 400,
      useNativeDriver: true,
    }).start(() => spin.setValue(0));
    onInteraction(intensity);
  });

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.center}>
      <Animated.Text style={[styles.windmill, { transform: [{ rotate }] }]}>🌬️</Animated.Text>
      <Text style={styles.friend}>{smile || hits >= BREATH_INTERACTIONS_PER_ROUND ? '🙂✨' : '🙂'}</Text>
      <Text style={styles.hint}>Breath makes it spin slowly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  windmill: { fontSize: 88, marginBottom: 8 },
  friend: { fontSize: 48 },
  hint: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#A16207' },
});
