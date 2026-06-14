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
const OBJECT_SIZE = 50;
const MIN_GAP = 56;

const DISTRACTORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '⚫', '⚪', '🔶', '🔷', '💎', '🎈', '🌙', '🔺'];

const getStarsForRound = (round: number) => {
  if (round <= 2) return 2;
  if (round <= 5) return 3;
  return 4;
};

interface GameObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  isStar: boolean;
  found: boolean;
  scale: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

const FindTheStarGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [starsNeeded, setStarsNeeded] = useState(2);
  const [starsFound, setStarsFound] = useState(0);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const starsFoundRef = useRef(0);
  const starsNeededRef = useRef(2);

  const placeObject = useCallback((usedPositions: { x: number; y: number }[]) => {
    const w = screenWidth.current;
    const h = screenHeight.current;
    let attempts = 0;

    while (attempts < 40) {
      const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
      const y = Math.random() * (h - OBJECT_SIZE - 200) + OBJECT_SIZE / 2 + 100;
      const tooClose = usedPositions.some(
        (pos) => Math.hypot(pos.x - x, pos.y - y) < MIN_GAP,
      );
      if (!tooClose) {
        usedPositions.push({ x, y });
        return { x, y };
      }
      attempts++;
    }

    const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
    const y = Math.random() * (h - OBJECT_SIZE - 200) + OBJECT_SIZE / 2 + 100;
    usedPositions.push({ x, y });
    return { x, y };
  }, []);

  const generateObjects = useCallback(
    (roundNum: number) => {
      const starCount = getStarsForRound(roundNum);
      const distractorCount = 5 + starCount;
      const usedPositions: { x: number; y: number }[] = [];
      const newObjects: GameObject[] = [];

      for (let i = 0; i < starCount; i++) {
        const { x, y } = placeObject(usedPositions);
        newObjects.push({
          id: `star-${roundNum}-${i}-${Date.now()}`,
          x,
          y,
          emoji: '⭐',
          isStar: true,
          found: false,
          scale: 1,
        });
      }

      const distractorEmojis = shuffle(DISTRACTORS).slice(0, distractorCount);
      distractorEmojis.forEach((emoji, i) => {
        const { x, y } = placeObject(usedPositions);
        newObjects.push({
          id: `obj-${roundNum}-${i}-${Date.now()}`,
          x,
          y,
          emoji,
          isStar: false,
          found: false,
          scale: 1,
        });
      });

      setStarsNeeded(starCount);
      setStarsFound(0);
      starsNeededRef.current = starCount;
      starsFoundRef.current = 0;
      advancingRef.current = false;
      setObjects(shuffle(newObjects));

      stopTTS();
      setTimeout(() => {
        const starWord = starCount === 1 ? 'star' : 'stars';
        speakTTS(`Find all ${starCount} ${starWord}!`, 0.8, 'en-US');
      }, 400);
    },
    [placeObject],
  );

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * 15;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;

      try {
        await logGameAndAward({
          type: 'find-the-star',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['visual-scanning', 'attention', 'object-recognition'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [router],
  );

  const completeRound = useCallback(() => {
    if (advancingRef.current || doneRef.current) return;
    advancingRef.current = true;

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('All stars found!', 0.9, 'en-US');

    if (newScore >= TOTAL_ROUNDS) {
      setTimeout(() => endGame(newScore), 900);
      return;
    }

    setTimeout(() => {
      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;
      setRound(nextRound);
    }, 900);
  }, [endGame]);

  const handleObjectTap = useCallback(
    (obj: GameObject) => {
      if (doneRef.current || advancingRef.current || obj.found) return;

      if (obj.isStar) {
        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, scale: 1.45, found: true } : o)),
        );

        setTimeout(() => {
          setObjects((prev) =>
            prev.map((o) => (o.id === obj.id ? { ...o, scale: 1 } : o)),
          );
        }, 180);

        const foundAfterTap = starsFoundRef.current + 1;
        starsFoundRef.current = foundAfterTap;
        setStarsFound(foundAfterTap);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        const needed = starsNeededRef.current;
        if (foundAfterTap >= needed) {
          completeRound();
        } else {
          const remaining = needed - foundAfterTap;
          const remainingWord = remaining === 1 ? 'star' : 'stars';
          speakTTS(`${remaining} more ${remainingWord} to find!`, 0.85, 'en-US');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Find the stars, not that one!', 0.8, 'en-US');
      }
    },
    [completeRound],
  );

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    if (!showInfo && !done) {
      generateObjects(round);
    }
  }, [showInfo, round, done, generateObjects]);

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

  const visibleObjects = objects.filter((obj) => !(obj.isStar && obj.found));

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Find the Stars"
        emoji="⭐"
        description="Find every star hidden among the objects! Each round has more stars to spot."
        skills={['Visual scanning']}
        suitableFor="Children learning visual scanning and attention skills"
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
            setObjects([]);
            setStarsFound(0);
            setStarsNeeded(2);
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
        <Text style={styles.title}>Find the Stars</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • ⭐ Score: {score}
        </Text>
        <Text style={styles.instruction}>
          Find all {starsNeeded} stars hidden below!
        </Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>
            Stars found: {starsFound}/{starsNeeded}
          </Text>
        </View>
      </View>

      <View
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {visibleObjects.map((obj) => (
          <Pressable
            key={obj.id}
            onPress={() => handleObjectTap(obj)}
            style={[
              styles.object,
              obj.isStar && styles.starObject,
              {
                left: obj.x - OBJECT_SIZE / 2,
                top: obj.y - OBJECT_SIZE / 2,
                transform: [{ scale: obj.scale }],
              },
            ]}
          >
            <Text style={styles.objectEmoji}>{obj.emoji}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Skills: Visual scanning</Text>
        <Text style={styles.footerSubtext}>
          Tap every star. Wrong objects do not count.
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
    marginBottom: 8,
  },
  progressPill: {
    backgroundColor: 'rgba(252,211,77,0.35)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginVertical: 40,
  },
  object: {
    position: 'absolute',
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: OBJECT_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  starObject: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  objectEmoji: {
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

export default FindTheStarGame;
