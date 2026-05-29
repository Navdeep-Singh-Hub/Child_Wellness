import { OralShell, OralOverlays, ORAL_INTERACTIONS_PER_ROUND, speakOral, useOralGameSession } from '@/components/game/speech/oral-sensory-tolerance/shared/oralSensoryShared';
import { useOralSensoryTolerance } from '@/hooks/useOralSensoryTolerance';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function makeParticles(n: number) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `p${i}`,
    x: Math.random(),
    y: Math.random(),
    s: 0.7 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function MagicFaceBreezeGame({ onBack, onComplete }: Props) {
  const session = useOralGameSession('magic-face-breeze', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  const sense = useOralSensoryTolerance(canPlay, 'magic-face-breeze', session.round);
  const particles = useMemo(() => makeParticles(10), []);
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOral('Soft breeze play. Tap the sparkles. Watching is okay.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: 4200, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [canPlay, t]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    // reward pulse counts toward round participation
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_INTERACTIONS_PER_ROUND) {
      setTimeout(() => session.completeRound(), 700);
    }
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTap = () => {
    sense.interact(0.3);
  };

  const hint = sense.state === 'HELPING' ? 'Slow and safe. Tiny taps are great.' : 'Tap a sparkle — or just watch.';

  return (
    <>
      <OralShell
        title="Magic Face Breeze"
        subtitle="Soft sparkles near the face"
        skills="🌬️ Oral awareness · comfort"
        gradient={['#E0F2FE', '#E9D5FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={hint}
        startEmoji="🌬️"
        startTitle="Soft breeze is safe"
        startHint="Tap the gentle sparkles. Watching is okay. Every calm try counts."
        onGoodTry={sense.goodTry}
        onCalmDown={sense.calmDown}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.friend}>🙂</Text>
          <Text style={styles.caption}>Tap the breeze sparkles</Text>
          <View style={styles.particleLayer}>
            {particles.map((p) => {
              const dx = Animated.interpolateNode(t, {
                inputRange: [0, 1],
                outputRange: [0, 1],
              });
              // simple sine-ish wobble using rotate + translate
              const translateX = t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 18 * p.s * sense.sensoryIntensity],
              });
              const translateY = t.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -12 * p.s * sense.sensoryIntensity],
              });
              return (
                <Animated.View
                  key={p.id}
                  style={[
                    styles.particleWrap,
                    {
                      left: `${20 + p.x * 60}%`,
                      top: `${18 + p.y * 55}%`,
                      transform: [
                        { translateX },
                        { translateY },
                        { scale: 0.9 + 0.2 * p.s },
                      ],
                      opacity: 0.75,
                    },
                  ]}
                >
                  <Pressable onPress={onTap} style={styles.particleBtn}>
                    <Text style={styles.particle}>✨</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
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
    borderColor: 'rgba(124,58,237,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  friend: { fontSize: 84, marginBottom: 6 },
  caption: { fontSize: 16, fontWeight: '800', color: '#334155' },
  particleLayer: { ...StyleSheet.absoluteFillObject },
  particleWrap: { position: 'absolute' },
  particleBtn: { padding: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.75)' },
  particle: { fontSize: 22 },
});

