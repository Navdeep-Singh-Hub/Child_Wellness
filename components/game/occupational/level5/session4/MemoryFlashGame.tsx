import { ThemedObjectTile } from '@/components/game/occupational/level5/session4/VisualFocusVisuals';
import { useVisualFocusExit, VisualFocusShell } from '@/components/game/occupational/level5/session4/VisualFocusShell';
import { SESSION5_4_PACING } from '@/components/game/occupational/level5/session4/session4Pacing';
import { MEMORY_FLASH_COPY, MEMORY_FLASH_THEME } from '@/components/game/occupational/level5/session4/visualFocusThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
    borderColor: item.isTarget && phase === 'flashing'
      ? `rgba(167,139,250,${0.65 + glow.value * 0.35})`
      : 'rgba(255,255,255,0.55)',
    borderWidth: item.isTarget && phase === 'flashing' ? 4 + glow.value * 2 : 2,
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
      <Animated.View style={tileStyle}>
        <ThemedObjectTile size={OBJECT_SIZE} highlight={item.isTarget && phase === 'flashing'} accentColor={MEMORY_FLASH_THEME.accent}>
          <Text style={styles.objectEmoji}>{item.emoji}</Text>
        </ThemedObjectTile>
      </Animated.View>
    </Pressable>
  );
}

const MemoryFlashGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const handleExit = useVisualFocusExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
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
        const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
        const ok = used.every((pos) => Math.hypot(pos.x - x, pos.y - y) >= MIN_GAP);
        if (ok) {
          used.push({ x, y });
          return { x, y };
        }
        attempts++;
      }
      const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
      const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
      used.push({ x, y });
      return { x, y };
    };

    const targetPos = placeOne();
    const newItems: MemoryItem[] = [
      { id: `target-${Date.now()}`, x: targetPos.x, y: targetPos.y, emoji: targetEmoji, isTarget: true },
    ];

    emojis.forEach((emoji, i) => {
      const pos = placeOne();
      newItems.push({ id: `item-${i}-${Date.now()}`, x: pos.x, y: pos.y, emoji, isTarget: false });
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
      const xp = finalScore * SESSION5_4_PACING.xpPerScore;
      const accuracy = (finalScore / total) * 100;

      clearPhaseTimer();
      doneRef.current = true;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);

      try {
        await logGameAndAward({
          type: MEMORY_FLASH_COPY.logType,
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: [...MEMORY_FLASH_COPY.skillTags],
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

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearPhaseTimer();
  }, [clearPhaseTimer]);

  const hint =
    phase === 'show_all'
      ? 'Look at all the objects!'
      : phase === 'flashing'
        ? '✨ Target flashing now!'
        : 'Tap the object that flashed!';

  return (
    <VisualFocusShell
      theme={MEMORY_FLASH_THEME}
      copy={MEMORY_FLASH_COPY}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint={hint}
      showHint
      onStart={() => setShowInfo(false)}
      onExit={() => { clearPhaseTimer(); handleExit(); }}
      onContinue={onComplete}
      onBack={onBack}
    >
      <View
        style={styles.gameArea}
        pointerEvents="box-none"
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {items.map((item) => (
          <MemoryObjectTile key={item.id} item={item} phase={phase} onPress={() => handleItemTap(item)} />
        ))}
      </View>
    </VisualFocusShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  tilePress: { position: 'absolute', width: OBJECT_SIZE, height: OBJECT_SIZE, zIndex: 5 },
  flashRing: {
    position: 'absolute',
    width: OBJECT_SIZE + 18,
    height: OBJECT_SIZE + 18,
    borderRadius: (OBJECT_SIZE + 18) / 2,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: 'rgba(167,139,250,0.18)',
    top: -9,
    left: -9,
  },
  objectEmoji: { fontSize: 34 },
});

export default MemoryFlashGame;
