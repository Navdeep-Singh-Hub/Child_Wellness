/**
 * OT Level 5 · Session 4 · Game 2 — Memory Flash
 * Watch-flash-recall visual memory in a cosmic nebula.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  MemoryCrystal,
  MemoryFlashHUD,
  MemoryFlashInfoScreen,
  NebulaBackdrop,
  PhaseBanner,
  RecallCelebration,
  WrongRecallRipple,
  type RippleData,
} from '@/components/game/occupational/level5/session4/memoryFlash/MemoryFlashVisuals';
import { MEMORY_FLASH_COPY as COPY } from '@/components/game/occupational/level5/session4/memoryFlash/memoryFlashTheme';
import { SESSION5_4_PACING as P } from '@/components/game/occupational/level5/session4/session4Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const MemoryFlashGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [phase, setPhase] = useState<Phase>('show_all');
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebratePos, setCelebratePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<RippleData[]>([]);

  const playW = useRef(SCREEN_WIDTH);
  const playH = useRef(SCREEN_HEIGHT);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const rippleIdRef = useRef(0);

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 550);
  }, []);

  const placeItems = useCallback((count: number, targetEmoji: string) => {
    const w = playW.current;
    const h = playH.current;
    const used: { x: number; y: number }[] = [];
    const emojis = shuffle(OBJECTS.filter((e) => e !== targetEmoji)).slice(0, count - 1);

    const placeOne = (): { x: number; y: number } => {
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
        const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
        if (used.every((p) => Math.hypot(p.x - x, p.y - y) >= MIN_GAP)) {
          used.push({ x, y });
          return { x, y };
        }
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
      newItems.push({ id: `item-${i}`, x: pos.x, y: pos.y, emoji, isTarget: false });
    });
    return shuffle(newItems);
  }, []);

  const startFlashSequence = useCallback(() => {
    clearPhaseTimer();
    setPhase('show_all');
    setShowCelebrate(false);

    const roundNum = roundRef.current;
    const targetEmoji = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!;
    setItems(placeItems(getObjectCount(roundNum), targetEmoji));

    stopTTS();
    speakTTS(COPY.ttsShowAll, 0.8).catch(() => {});

    phaseTimerRef.current = setTimeout(() => {
      setPhase('flashing');
      speakTTS(COPY.ttsFlashing, 0.8).catch(() => {});

      phaseTimerRef.current = setTimeout(() => {
        setPhase('recall');
        speakTTS(COPY.ttsRecall, 0.8).catch(() => {});
      }, FLASH_MS);
    }, SHOW_ALL_MS);
  }, [clearPhaseTimer, placeItems]);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * P.xpPerScore;
      clearPhaseTimer();
      doneRef.current = true;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      speakTTS(COPY.ttsComplete, 0.78).catch(() => {});
      try {
        await logGameAndAward({
          type: COPY.logType,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: [...COPY.skillTags],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error(e);
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
      roundRef.current += 1;
      advancingRef.current = false;
      setRound(roundRef.current);
    }, 900);
  }, [endGame]);

  const handleTap = useCallback(
    (item: MemoryItem) => {
      if (doneRef.current || phase !== 'recall' || advancingRef.current) return;

      if (item.isTarget) {
        setCelebratePos({ x: item.x, y: item.y });
        setShowCelebrate(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS(COPY.ttsCorrect, 0.9).catch(() => {});
        advanceRound();
      } else {
        addRipple(item.x, item.y);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(COPY.ttsWrong, 0.8).catch(() => {});
      }
    },
    [addRipple, advanceRound, phase],
  );

  useEffect(() => {
    scoreRef.current = score;
    roundRef.current = round;
  }, [score, round]);

  useEffect(() => {
    if (!showInfo && !done) {
      advancingRef.current = false;
      startFlashSequence();
      return clearPhaseTimer;
    }
  }, [showInfo, round, done, startFlashSequence, clearPhaseTimer]);

  useEffect(
    () => () => {
      stopTTS();
      cleanupSounds();
      clearPhaseTimer();
    },
    [clearPhaseTimer],
  );

  const handleExit = () => {
    clearPhaseTimer();
    stopTTS();
    cleanupSounds();
    onBack?.();
  };

  const hint =
    phase === 'show_all'
      ? COPY.hintObserve
      : phase === 'flashing'
        ? COPY.hintFlash
        : COPY.hintRecall;

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <MemoryFlashInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={handleExit}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <MemoryFlashHUD
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        phase={phase}
        hint={hint}
      />

      <View
        style={styles.nebula}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        <NebulaBackdrop />
        <PhaseBanner phase={phase} />

        {items.map((item) => (
          <MemoryCrystal
            key={item.id}
            item={item}
            phase={phase}
            size={OBJECT_SIZE}
            onPress={() => handleTap(item)}
          />
        ))}

        <RecallCelebration visible={showCelebrate} x={celebratePos.x} y={celebratePos.y} />
        <WrongRecallRipple ripples={ripples} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#312E81' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(30,27,75,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
  },
  backText: { color: '#F5F3FF', fontWeight: '800', fontSize: 14 },
  nebula: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.35)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default MemoryFlashGame;
