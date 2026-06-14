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

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DOT_SIZE = 60;

const COLORS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444' },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6' },
  { name: 'Green', emoji: '🟢', color: '#10B981' },
  { name: 'Yellow', emoji: '🟡', color: '#FCD34D' },
  { name: 'Purple', emoji: '🟣', color: '#8B5CF6' },
] as const;

interface Dot {
  id: string;
  x: number;
  y: number;
  colorIndex: number;
  scale: number;
}

type RoundData = {
  targetColorIndex: number;
  dots: Dot[];
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

const ColorDotHitGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [roundData, setRoundData] = useState<RoundData | null>(null);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const colorDeckRef = useRef<number[]>([]);
  const advancingRef = useRef(false);

  const refillColorDeck = useCallback(() => {
    colorDeckRef.current = shuffle(COLORS.map((_, idx) => idx));
  }, []);

  const nextTargetColor = useCallback(() => {
    if (colorDeckRef.current.length === 0) {
      refillColorDeck();
    }
    return colorDeckRef.current.pop()!;
  }, [refillColorDeck]);

  const buildRound = useCallback((): RoundData => {
    const targetIdx = nextTargetColor();
    const dotCount = 3 + Math.floor(Math.random() * 2);
    const distractorPool = COLORS.map((_, idx) => idx).filter((idx) => idx !== targetIdx);
    const shuffledDistractors = shuffle(distractorPool);

    const randomPos = () => ({
      x: Math.random() * (screenWidth.current - DOT_SIZE) + DOT_SIZE / 2,
      y: Math.random() * (screenHeight.current - DOT_SIZE - 200) + DOT_SIZE / 2 + 100,
    });

    const targetPos = randomPos();
    const dots: Dot[] = [
      {
        id: `dot-target-${Date.now()}`,
        x: targetPos.x,
        y: targetPos.y,
        colorIndex: targetIdx,
        scale: 1,
      },
    ];

    for (let i = 1; i < dotCount; i++) {
      const colorIdx = shuffledDistractors[(i - 1) % shuffledDistractors.length]!;
      const pos = randomPos();
      dots.push({
        id: `dot-${i}-${Date.now()}-${Math.random()}`,
        x: pos.x,
        y: pos.y,
        colorIndex: colorIdx,
        scale: 1,
      });
    }

    return {
      targetColorIndex: targetIdx,
      dots: shuffle(dots),
    };
  }, [nextTargetColor]);

  const startRound = useCallback(() => {
    advancingRef.current = false;
    const data = buildRound();
    setRoundData(data);

    stopTTS();
    setTimeout(() => {
      speakTTS(`Tap the ${COLORS[data.targetColorIndex].name.toLowerCase()} dot!`, 0.8, 'en-US');
    }, 350);
  }, [buildRound]);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 15;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);

      try {
        await logGameAndAward({
          type: 'color-dot-hit',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['visual-discrimination', 'color-recognition', 'attention'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [router],
  );

  const handleDotTap = useCallback(
    (dotId: string, dotColorIndex: number) => {
      if (done || !roundData || advancingRef.current) return;

      const isCorrect = dotColorIndex === roundData.targetColorIndex;

      if (isCorrect) {
        advancingRef.current = true;

        setRoundData((prev) =>
          prev
            ? {
                ...prev,
                dots: prev.dots.map((d) => (d.id === dotId ? { ...d, scale: 1.5 } : d)),
              }
            : prev,
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS(`Correct! ${COLORS[roundData.targetColorIndex].name}!`, 0.9, 'en-US');

        setScore((s) => {
          const newScore = s + 1;
          if (newScore >= TOTAL_ROUNDS) {
            setTimeout(() => endGame(newScore), 900);
          } else {
            setTimeout(() => setRound((r) => r + 1), 900);
          }
          return newScore;
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Try the correct color!', 0.8, 'en-US');
      }
    },
    [done, endGame, roundData],
  );

  useEffect(() => {
    if (!showInfo && !done) {
      startRound();
    }
  }, [showInfo, round, done, startRound]);

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

  const targetColorIndex = roundData?.targetColorIndex ?? null;
  const dots = roundData?.dots ?? [];

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Color Dot Hit"
        emoji="🎨"
        description="Tap the correct color dot! Build your visual discrimination skills."
        skills={['Visual discrimination']}
        suitableFor="Children learning color recognition and visual discrimination"
        onStart={() => {
          refillColorDeck();
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
            refillColorDeck();
            advancingRef.current = false;
            setRound(1);
            setScore(0);
            setDone(false);
            setFinalStats(null);
            setRoundData(null);
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
        <Text style={styles.title}>Color Dot Hit</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🎨 Score: {score}
        </Text>
        {targetColorIndex !== null && (
          <>
            <Text style={styles.instruction}>
              Tap the {COLORS[targetColorIndex].emoji} {COLORS[targetColorIndex].name.toLowerCase()} dot!
            </Text>
            <View style={[styles.targetSwatch, { backgroundColor: COLORS[targetColorIndex].color }]}>
              <Text style={styles.targetSwatchEmoji}>{COLORS[targetColorIndex].emoji}</Text>
              <Text style={styles.targetSwatchLabel}>{COLORS[targetColorIndex].name}</Text>
            </View>
          </>
        )}
      </View>

      <View
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {dots.map((dot) => (
          <Pressable
            key={dot.id}
            onPress={() => handleDotTap(dot.id, dot.colorIndex)}
            style={[
              styles.dot,
              {
                left: dot.x - DOT_SIZE / 2,
                top: dot.y - DOT_SIZE / 2,
                backgroundColor: COLORS[dot.colorIndex].color,
                transform: [{ scale: dot.scale }],
                borderWidth: 2,
                borderColor: '#fff',
              },
            ]}
          >
            <Text style={styles.dotEmoji}>{COLORS[dot.colorIndex].emoji}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Skills: Visual discrimination</Text>
        <Text style={styles.footerSubtext}>Tap the correct color dot!</Text>
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
    marginBottom: 8,
  },
  targetSwatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  targetSwatchEmoji: {
    fontSize: 22,
  },
  targetSwatchLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginVertical: 40,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  dotEmoji: {
    fontSize: 30,
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

export default ColorDotHitGame;
