import GameInfoScreen from '@/components/game/GameInfoScreen';
import ResultCard from '@/components/game/ResultCard';
import { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_SIZE = 80;
const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const BUBBLE_FRAGMENT_COLORS = ['#BAE6FD', '#7DD3FC', '#38BDF8', '#E0F2FE', '#FFFFFF', '#0EA5E9'];

interface Bubble {
  id: string;
  x: number;
  y: number;
}

type PopBurst = { id: string; x: number; y: number; key: number };

function BubbleFragment({
  on,
  i,
  n,
  color,
}: {
  on: boolean;
  i: number;
  n: number;
  color: string;
}) {
  const t = useSharedValue(0);
  const size = 10 + (i % 3) * 6;

  useEffect(() => {
    if (!on) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
  }, [on, t]);

  const style = useAnimatedStyle(() => {
    if (t.value === 0) return { opacity: 0 };
    const angle = (i / n) * Math.PI * 2 + (i % 2) * 0.35;
    const r = 8 + 52 * t.value;
    return {
      transform: [
        { translateX: Math.cos(angle) * r },
        { translateY: Math.sin(angle) * r - 6 * t.value },
        { scale: 1.1 - t.value * 0.75 },
      ],
      opacity: (1 - t.value) * 0.95,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.85)',
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.fragment, style]} />;
}

function BubblePopBurst({ x, y, burstKey }: { x: number; y: number; burstKey: number }) {
  const fragments = Array.from({ length: 14 });
  return (
    <View
      pointerEvents="none"
      style={[styles.burstWrap, { left: x - BUBBLE_SIZE / 2, top: y - BUBBLE_SIZE / 2 }]}
      key={burstKey}
    >
      {fragments.map((_, i) => (
        <BubbleFragment
          key={i}
          on
          i={i}
          n={fragments.length}
          color={BUBBLE_FRAGMENT_COLORS[i % BUBBLE_FRAGMENT_COLORS.length]!}
        />
      ))}
    </View>
  );
}

function BubbleItem({
  bubble,
  onPopComplete,
}: {
  bubble: Bubble;
  onPopComplete: (bubble: Bubble) => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const popping = useRef(false);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const finishPop = useCallback(() => {
    onPopComplete(bubble);
  }, [bubble, onPopComplete]);

  const handlePress = useCallback(() => {
    if (popping.current) return;
    popping.current = true;
    scale.value = withSequence(
      withTiming(1.12, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(1.65, { duration: 180, easing: Easing.out(Easing.cubic) }),
    );
    opacity.value = withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }, () => {
      runOnJS(finishPop)();
    });
  }, [finishPop, opacity, scale]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.bubbleHit,
        {
          left: bubble.x - BUBBLE_SIZE / 2,
          top: bubble.y - BUBBLE_SIZE / 2,
        },
      ]}
    >
      <Animated.View style={[styles.bubble, bubbleStyle]}>
        <View style={styles.bubbleShine} />
        <Text style={styles.bubbleEmoji}>🫧</Text>
      </Animated.View>
    </Pressable>
  );
}

const PopTheBubbleGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playPop = useTraceSound(POP_SOUND);
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popBursts, setPopBursts] = useState<PopBurst[]>([]);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const hasSpokenRef = useRef(false);
  const advancingRef = useRef(false);

  const generateBubble = useCallback(() => {
    advancingRef.current = false;
    const newBubble: Bubble = {
      id: `bubble-${Date.now()}`,
      x: Math.random() * (screenWidth.current - BUBBLE_SIZE) + BUBBLE_SIZE / 2,
      y: Math.random() * (screenHeight.current - BUBBLE_SIZE - 200) + BUBBLE_SIZE / 2 + 100,
    };
    setBubbles([newBubble]);
  }, []);

  const removeBurst = useCallback((key: number) => {
    setPopBursts((prev) => prev.filter((b) => b.key !== key));
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 15;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);

      try {
        await logGameAndAward({
          type: 'pop-the-bubble',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['tap-accuracy', 'hand-eye-coordination', 'precision'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [router],
  );

  const handleBubblePopComplete = useCallback(
    (bubble: Bubble) => {
      if (done || advancingRef.current) return;
      advancingRef.current = true;

      const burstKey = Date.now();
      setPopBursts((prev) => [...prev, { id: bubble.id, x: bubble.x, y: bubble.y, key: burstKey }]);
      setBubbles([]);

      playPop();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Pop!', 0.9, 'en-US');

      setTimeout(() => removeBurst(burstKey), 560);

      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= TOTAL_ROUNDS) {
          setTimeout(() => endGame(newScore), 700);
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            generateBubble();
          }, 750);
        }
        return newScore;
      });
    },
    [done, endGame, generateBubble, playPop, removeBurst],
  );

  useEffect(() => {
    if (!showInfo && !done) {
      stopTTS();
      if (round === 1) {
        hasSpokenRef.current = false;
      }
      generateBubble();
      setTimeout(() => {
        if (!hasSpokenRef.current) {
          hasSpokenRef.current = true;
          speakTTS('Tap the bubble to pop it!', 0.8, 'en-US');
        }
      }, 500);
    }
  }, [showInfo, round, done, generateBubble]);

  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch {
        // Ignore errors
      }
      cleanupSounds();
    };
  }, []);

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Pop the Bubble"
        emoji="🫧"
        description="Tap the bubble to pop it! Build your tap accuracy."
        skills={['Tap accuracy']}
        suitableFor="Children learning precise tapping and hand-eye coordination"
        onStart={() => {
          setShowInfo(false);
        }}
        onBack={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }

  if (done && finalStats) {
    return (
      <SafeAreaView style={styles.container}>
        <ResultCard
          correct={finalStats.correct}
          total={finalStats.total}
          xpAwarded={finalStats.xp}
          onHome={() => {
            stopAllSpeech();
            cleanupSounds();
            onBack?.();
          }}
          onPlayAgain={() => {
            setRound(1);
            setScore(0);
            setDone(false);
            setFinalStats(null);
            setPopBursts([]);
            generateBubble();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Pop the Bubble</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🫧 Score: {score}
        </Text>
        <Text style={styles.instruction}>Tap the bubble to pop it!</Text>
      </View>

      <View
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {popBursts.map((burst) => (
          <BubblePopBurst key={burst.key} burstKey={burst.key} x={burst.x} y={burst.y} />
        ))}
        {bubbles.map((bubble) => (
          <BubbleItem key={bubble.id} bubble={bubble} onPopComplete={handleBubblePopComplete} />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Skills: Tap accuracy</Text>
        <Text style={styles.footerSubtext}>Tap the bubble to pop it!</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginVertical: 40,
    overflow: 'hidden',
  },
  bubbleHit: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    zIndex: 2,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: 'rgba(224, 242, 254, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#38BDF8',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    overflow: 'hidden',
  },
  bubbleShine: {
    position: 'absolute',
    top: 10,
    left: 14,
    width: 22,
    height: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    transform: [{ rotate: '-24deg' }],
  },
  bubbleEmoji: {
    fontSize: 40,
  },
  burstWrap: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  fragment: {
    position: 'absolute',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default PopTheBubbleGame;
