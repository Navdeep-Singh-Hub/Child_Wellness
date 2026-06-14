import GameInfoScreen from '@/components/game/GameInfoScreen';
import ResultCard from '@/components/game/ResultCard';
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
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const TOTAL_ROUNDS = 8;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 72;
const MIN_GAP = 78;
const SHOW_ALL_MS = 650;
const FLASH_MS = 2400;

const OBJECTS = ['🔴', '🔵', '🟢', '🟡', '🟣', '⭐', '💎', '🎈', '🎁', '🎀', '🌙', '🔶'];

type Phase = 'show_all' | 'flashing' | 'recall';

interface MemoryItem {
  id: string;
  x: number;
  y: number;
  emoji: string;
  isTarget: boolean;
}

const getObjectCount = (round: number) => (round <= 3 ? 4 : round <= 6 ? 5 : 6);

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

function MemoryObjectTile({
  item,
  phase,
  onPress,
}: {
  item: MemoryItem;
  phase: Phase;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (phase === 'flashing' && item.isTarget) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0.15, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        4,
        false,
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.28, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        4,
        false,
      );
      ring.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        4,
        false,
      );
      return;
    }

    cancelAnimation(scale);
    cancelAnimation(glow);
    cancelAnimation(ring);
    scale.value = withTiming(1, { duration: 120 });
    glow.value = withTiming(0, { duration: 120 });
    ring.value = withTiming(0, { duration: 120 });
  }, [phase, item.isTarget, glow, ring, scale]);

  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: item.isTarget && phase === 'flashing'
      ? `rgba(252, 211, 77, ${0.55 + glow.value * 0.45})`
      : '#FFFFFF',
    borderColor: item.isTarget && phase === 'flashing'
      ? `rgba(245, 158, 11, ${0.65 + glow.value * 0.35})`
      : '#E2E8F0',
    borderWidth: item.isTarget && phase === 'flashing' ? 4 + glow.value * 2 : 3,
    shadowOpacity: item.isTarget && phase === 'flashing' ? 0.25 + glow.value * 0.45 : 0.2,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value * 0.85,
    transform: [{ scale: 1 + ring.value * 0.35 }],
  }));

  const dimmed = phase === 'flashing' && !item.isTarget;

  return (
    <Pressable
      onPress={onPress}
      disabled={phase !== 'recall'}
      style={[
        styles.tilePress,
        {
          left: item.x - OBJECT_SIZE / 2,
          top: item.y - OBJECT_SIZE / 2,
          opacity: dimmed ? 0.72 : 1,
        },
      ]}
    >
      {item.isTarget && phase === 'flashing' && (
        <Animated.View pointerEvents="none" style={[styles.flashRing, ringStyle]} />
      )}
      <Animated.View style={[styles.objectTile, tileStyle]}>
        <Text style={styles.objectEmoji}>{item.emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

const MemoryFlashGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [phase, setPhase] = useState<Phase>('show_all');

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const placeItems = useCallback((count: number, targetEmoji: string) => {
    const w = screenWidth.current;
    const h = screenHeight.current;
    const used: { x: number; y: number }[] = [];
    const emojis = shuffle(OBJECTS.filter((e) => e !== targetEmoji)).slice(0, count - 1);

    const placeOne = (): { x: number; y: number } => {
      let attempts = 0;
      while (attempts < 50) {
        const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
        const y = Math.random() * (h - OBJECT_SIZE - 200) + OBJECT_SIZE / 2 + 100;
        const ok = used.every((pos) => Math.hypot(pos.x - x, pos.y - y) >= MIN_GAP);
        if (ok) {
          used.push({ x, y });
          return { x, y };
        }
        attempts++;
      }
      const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
      const y = Math.random() * (h - OBJECT_SIZE - 200) + OBJECT_SIZE / 2 + 100;
      used.push({ x, y });
      return { x, y };
    };

    const targetPos = placeOne();
    const newItems: MemoryItem[] = [
      {
        id: `target-${Date.now()}`,
        x: targetPos.x,
        y: targetPos.y,
        emoji: targetEmoji,
        isTarget: true,
      },
    ];

    emojis.forEach((emoji, i) => {
      const pos = placeOne();
      newItems.push({
        id: `item-${i}-${Date.now()}`,
        x: pos.x,
        y: pos.y,
        emoji,
        isTarget: false,
      });
    });

    return shuffle(newItems);
  }, []);

  const startFlashSequence = useCallback(() => {
    clearPhaseTimer();
    setPhase('show_all');

    const roundNum = roundRef.current;
    const targetEmoji = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!;
    const roundItems = placeItems(getObjectCount(roundNum), targetEmoji);
    setItems(roundItems);

    stopTTS();
    speakTTS('Look at all the objects!', 0.8, 'en-US');

    phaseTimerRef.current = setTimeout(() => {
      setPhase('flashing');
      speakTTS('Watch which one flashes!', 0.8, 'en-US');

      phaseTimerRef.current = setTimeout(() => {
        setPhase('recall');
        speakTTS('Which object flashed?', 0.8, 'en-US');
      }, FLASH_MS);
    }, SHOW_ALL_MS);
  }, [clearPhaseTimer, placeItems]);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 15;
      const accuracy = (finalScore / total) * 100;

      clearPhaseTimer();
      doneRef.current = true;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);

      try {
        await logGameAndAward({
          type: 'memory-flash',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['visual-memory', 'attention', 'recall'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearPhaseTimer, router],
  );

  const advanceRound = useCallback(() => {
    if (advancingRef.current || doneRef.current) return;
    advancingRef.current = true;

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    if (newScore >= TOTAL_ROUNDS) {
      setTimeout(() => endGame(newScore), 800);
      return;
    }

    setTimeout(() => {
      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;
      advancingRef.current = false;
      setRound(nextRound);
    }, 900);
  }, [endGame]);

  const handleItemTap = useCallback(
    (item: MemoryItem) => {
      if (doneRef.current || phase !== 'recall' || advancingRef.current) return;

      if (item.isTarget) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Correct!', 0.9, 'en-US');
        advanceRound();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Try again! Pick the one that flashed.', 0.8, 'en-US');
      }
    },
    [advanceRound, phase],
  );

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    if (!showInfo && !done) {
      advancingRef.current = false;
      startFlashSequence();
      return clearPhaseTimer;
    }
  }, [showInfo, round, done, startFlashSequence, clearPhaseTimer]);

  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch {
        // Ignore errors
      }
      cleanupSounds();
      clearPhaseTimer();
    };
  }, [clearPhaseTimer]);

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Memory Flash"
        emoji="💫"
        description="All objects appear together. Watch which one flashes, then tap it from memory!"
        skills={['Visual memory']}
        suitableFor="Children learning visual memory and recall skills"
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
            doneRef.current = false;
            advancingRef.current = false;
            scoreRef.current = 0;
            roundRef.current = 1;
            setRound(1);
            setScore(0);
            setDone(false);
            setFinalStats(null);
            setItems([]);
            setPhase('show_all');
          }}
        />
      </SafeAreaView>
    );
  }

  const instruction =
    phase === 'show_all'
      ? 'Look at all the objects!'
      : phase === 'flashing'
        ? 'Watch which object flashes!'
        : 'Tap the object that flashed!';

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearPhaseTimer();
          onBack?.();
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Memory Flash</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 💫 Score: {score}
        </Text>
        <Text style={styles.instruction}>{instruction}</Text>
        {phase === 'flashing' && (
          <View style={styles.flashHintPill}>
            <Text style={styles.flashHintText}>✨ Target flashing now</Text>
          </View>
        )}
      </View>

      <View
        style={styles.gameArea}
        pointerEvents="box-none"
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {items.map((item) => (
          <MemoryObjectTile
            key={item.id}
            item={item}
            phase={phase}
            onPress={() => handleItemTap(item)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Skills: Visual memory</Text>
        <Text style={styles.footerSubtext}>
          All objects show together, then one flashes brightly.
        </Text>
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
  flashHintPill: {
    marginTop: 8,
    backgroundColor: 'rgba(252,211,77,0.45)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  flashHintText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginVertical: 40,
  },
  tilePress: {
    position: 'absolute',
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    zIndex: 5,
  },
  flashRing: {
    position: 'absolute',
    width: OBJECT_SIZE + 18,
    height: OBJECT_SIZE + 18,
    borderRadius: (OBJECT_SIZE + 18) / 2,
    borderWidth: 4,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(251,191,36,0.18)',
    top: -9,
    left: -9,
  },
  objectTile: {
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: OBJECT_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    shadowColor: '#F59E0B',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  objectEmoji: {
    fontSize: 36,
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

export default MemoryFlashGame;
