import {
  OralShell,
  OralOverlays,
  ORAL_INTERACTIONS_PER_ROUND,
  speakOral,
  useOralGameSession,
} from '@/components/game/speech/oral-sensory-tolerance/shared/oralSensoryShared';
import { useOralSensoryTolerance } from '@/hooks/useOralSensoryTolerance';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Bubble = { id: string; x: number; y: number; size: number; drift: number };

function makeBubbles(n: number): Bubble[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: `b${i}`,
    x: 0.1 + Math.random() * 0.8,
    y: 0.15 + Math.random() * 0.75,
    size: 34 + Math.random() * 42,
    drift: (Math.random() - 0.5) * 40,
  }));
}

export function BubbleNoseTicklesGame({ onBack, onComplete }: Props) {
  const session = useOralGameSession('bubble-nose-tickles', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSensoryTolerance(canPlay, 'bubble-nose-tickles', session.round);

  const bubbles = useMemo(() => makeBubbles(9), []);
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOral('Bubble tickles. Tap bubbles gently. Watching is okay.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 5200, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [canPlay, t]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_INTERACTIONS_PER_ROUND) {
      setTimeout(() => session.completeRound(), 700);
    }
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTapBubble = () => {
    sense.interact(0.32);
    sense.engine.triggerReward('SMILE');
  };

  const hint = sense.state === 'HELPING' ? 'Slow bubbles now. Tiny taps are great.' : 'Tap a bubble to make it smile.';

  return (
    <>
      <OralShell
        title="Bubble Nose Tickles"
        subtitle="Funny bubbles float softly"
        skills="🫧 Sensory visuals · comfort"
        gradient={['#DCFCE7', '#BAE6FD']}
        accent="#0EA5E9"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={hint}
        startEmoji="🫧"
        startTitle="Bubbles are gentle"
        startHint="Tap the bubbles. They will smile. Watching is okay."
        onGoodTry={sense.goodTry}
        onCalmDown={sense.calmDown}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.friend}>😊</Text>
          <View style={styles.bubbleLayer}>
            {bubbles.map((b) => {
              const drift = t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, b.drift * sense.sensoryIntensity],
              });
              const float = t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -55 * sense.sensoryIntensity],
              });
              return (
                <Animated.View
                  key={b.id}
                  style={[
                    styles.bubbleWrap,
                    {
                      left: `${b.x * 100}%`,
                      top: `${b.y * 100}%`,
                      transform: [{ translateX: drift }, { translateY: float }],
                    },
                  ]}
                >
                  <Pressable onPress={onTapBubble} style={[styles.bubbleBtn, { width: b.size, height: b.size, borderRadius: b.size / 2 }]}>
                    <Text style={styles.bubble}>🫧</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
          <Text style={styles.caption}>Tap bubbles</Text>
        </View>
      </OralShell>
      <OralOverlays
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
    height: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(14,165,233,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  friend: { fontSize: 78, marginBottom: 10 },
  caption: { fontSize: 16, fontWeight: '800', color: '#334155' },
  bubbleLayer: { ...StyleSheet.absoluteFillObject },
  bubbleWrap: { position: 'absolute' },
  bubbleBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.75)' },
  bubble: { fontSize: 22 },
});

