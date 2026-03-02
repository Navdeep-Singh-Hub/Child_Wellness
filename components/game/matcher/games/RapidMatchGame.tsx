// Game 5: Rapid Sound Match Challenge
import { playPhoneme, playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { SOUND_PICTURE_DATA, shuffleArray } from '../utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RapidMatchGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 10;
const ROUND_TIME = 5000; // 5 seconds per round
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MovingObject {
  id: number;
  image: string;
  sound: string;
  word: string;
  x: number;
  y: number;
  speed: number;
}

export default function RapidMatchGame({ onComplete, onBack }: RapidMatchGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [objects, setObjects] = useState<MovingObject[]>([]);
  const [correctObjectId, setCorrectObjectId] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTime = useRef<number>(0);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (timeLeft > 0 && currentSound) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 100) {
            handleTimeUp();
            return 0;
          }
          return t - 100;
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, currentSound]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'rapid-match',
      });
      return;
    }

    const item = SOUND_PICTURE_DATA[round % SOUND_PICTURE_DATA.length];
    const allItems = shuffleArray(SOUND_PICTURE_DATA.slice(0, 4));
    const correctItem = allItems.find((i) => i.sound === item.sound) || item;

    const newObjects: MovingObject[] = allItems.map((it, idx) => ({
      id: idx,
      image: it.correctImage,
      sound: it.sound,
      word: it.word,
      x: Math.random() * (SCREEN_WIDTH - 100),
      y: 100 + Math.random() * 300,
      speed: 0.5 + Math.random() * 0.5,
    }));

    setObjects(newObjects);
    setCurrentSound(item.phoneme);
    setCorrectObjectId(newObjects.findIndex((o) => o.sound === correctItem.sound));
    setTimeLeft(ROUND_TIME);
    roundStartTime.current = Date.now();

    // Play sound
    setTimeout(() => {
      playPhoneme(item.phoneme);
    }, 300);

    // Animate objects
    animateObjects(newObjects);
  };

  const animateObjects = (objs: MovingObject[]) => {
    const animate = () => {
      setObjects((prev) =>
        prev.map((obj) => {
          let newX = obj.x + obj.speed;
          if (newX > SCREEN_WIDTH - 100) {
            newX = -100;
          }
          return { ...obj, x: newX };
        })
      );
    };

    const interval = setInterval(animate, 16);
    setTimeout(() => clearInterval(interval), ROUND_TIME);
  };

  const handleTimeUp = () => {
    setCombo(0);
    setTimeout(() => {
      setRound((r) => r + 1);
    }, 1000);
  };

  const handleObjectTap = async (objectId: number) => {
    if (!currentSound || correctObjectId === null) return;

    const isCorrect = objectId === correctObjectId;
    const reactionTime = Date.now() - roundStartTime.current;
    setReactionTimes((prev) => [...prev, reactionTime]);

    if (isCorrect) {
      setScore((s) => s + 1);
      setCombo((c) => {
        const newCombo = c + 1;
        if (newCombo > maxCombo) {
          setMaxCombo(newCombo);
        }
        return newCombo;
      });
      await playSoundEffect('correct');
      await speakFeedback(true);
    } else {
      setCombo(0);
      await playSoundEffect('incorrect');
      await speakFeedback(false);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const progress = (timeLeft / ROUND_TIME) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <View style={styles.headerStats}>
            <Text style={styles.headerSubtitle}>Score: {score}</Text>
            <Text style={styles.headerSubtitle}>Combo: {combo}x</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <View style={styles.timerBar}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={[styles.timerProgress, { width: `${progress}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.timerText}>{Math.ceil(timeLeft / 1000)}s</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Tap the object that starts with the sound!</Text>
        {currentSound && (
          <Pressable
            onPress={() => playPhoneme(currentSound)}
            style={styles.replayButton}
          >
            <Ionicons name="volume-high" size={20} color="#6366F1" />
            <Text style={styles.replayText}>Replay Sound</Text>
          </Pressable>
        )}
      </View>

      {/* Moving Objects */}
      <View style={styles.objectsContainer}>
        {objects.map((obj) => (
          <MovingObjectComponent
            key={obj.id}
            object={obj}
            onTap={() => handleObjectTap(obj.id)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

function MovingObjectComponent({
  object,
  onTap,
}: {
  object: MovingObject;
  onTap: () => void;
}) {
  const translateX = useSharedValue(object.x);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withTiming(object.x, { duration: 100 });
  }, [object.x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
    onTap();
  };

  return (
    <Animated.View
      style={[
        styles.objectContainer,
        {
          left: 0,
          top: object.y,
        },
        animatedStyle,
      ]}
    >
      <Pressable onPress={handlePress} style={styles.objectPressable}>
        <Image source={{ uri: object.image }} style={styles.objectImage} resizeMode="cover" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  headerRight: {
    width: 40,
  },
  timerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timerBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timerProgress: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  replayText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  objectsContainer: {
    flex: 1,
    position: 'relative',
  },
  objectContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  objectPressable: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  objectImage: {
    width: '100%',
    height: '100%',
  },
});
