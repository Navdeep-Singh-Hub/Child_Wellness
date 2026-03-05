// Game 4: Which is Bigger?
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakQuestion, speakFeedback, stopAllAudio } from '../utils/audio';
import { MEASUREMENT_COMPARISONS } from '../utils/gameData';

interface WhichIsBiggerGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 4;

export default function WhichIsBiggerGame({ onComplete, onBack }: WhichIsBiggerGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentComparison, setCurrentComparison] = useState<typeof MEASUREMENT_COMPARISONS[0] | null>(null);
  const [selectedObject, setSelectedObject] = useState<1 | 2 | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentComparison) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakQuestion(currentComparison.question).catch(() => {});
        soundTimeoutRef.current = null;
      }, 600);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [currentComparison]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'which-is-bigger',
      });
      return;
    }

    const comparison = MEASUREMENT_COMPARISONS[round % MEASUREMENT_COMPARISONS.length];
    
    setCurrentComparison(comparison);
    setSelectedObject(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
    shakeX.value = 0;
  };

  const handleObjectSelect = async (objectNum: 1 | 2) => {
    if (!canSelect || !currentComparison) return;

    setCanSelect(false);
    setSelectedObject(objectNum);
    const correct = objectNum === currentComparison.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedObject(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateX: shakeX.value },
    ],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentComparison) return null;

  const getObjectSize = (size: string) => {
    switch (size) {
      case 'big':
      case 'long':
      case 'heavy':
        return 100;
      case 'small':
      case 'short':
      case 'light':
        return 60;
      default:
        return 80;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>{currentComparison.question}</Text>
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        <Pressable
          onPress={() => handleObjectSelect(1)}
          disabled={!canSelect}
          style={styles.objectWrapper}
        >
          <Animated.View
            style={[
              styles.objectCard,
              cardAnimatedStyle,
              selectedObject === 1 && isCorrect === true && styles.objectCardCorrect,
              selectedObject === 1 && isCorrect === false && styles.objectCardIncorrect,
            ]}
          >
            <LinearGradient
              colors={selectedObject === 1 && isCorrect === true ? ['#A7F3D0', '#6EE7B7'] : selectedObject === 1 && isCorrect === false ? ['#FBCFE8', '#F9A8D4'] : ['#FFFFFF', '#F8F9FA']}
              style={styles.objectGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.objectEmoji, { fontSize: getObjectSize(currentComparison.object1.size) }]}>
                {currentComparison.object1.emoji}
              </Text>
              <Text style={styles.objectName}>{currentComparison.object1.name}</Text>
              {selectedObject === 1 && isCorrect === true && (
                <View style={styles.feedbackIcon}>
                  <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                </View>
              )}
              {selectedObject === 1 && isCorrect === false && (
                <View style={styles.feedbackIcon}>
                  <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={() => handleObjectSelect(2)}
          disabled={!canSelect}
          style={styles.objectWrapper}
        >
          <Animated.View
            style={[
              styles.objectCard,
              cardAnimatedStyle,
              selectedObject === 2 && isCorrect === true && styles.objectCardCorrect,
              selectedObject === 2 && isCorrect === false && styles.objectCardIncorrect,
            ]}
          >
            <LinearGradient
              colors={selectedObject === 2 && isCorrect === true ? ['#A7F3D0', '#6EE7B7'] : selectedObject === 2 && isCorrect === false ? ['#FBCFE8', '#F9A8D4'] : ['#FFFFFF', '#F8F9FA']}
              style={styles.objectGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.objectEmoji, { fontSize: getObjectSize(currentComparison.object2.size) }]}>
                {currentComparison.object2.emoji}
              </Text>
              <Text style={styles.objectName}>{currentComparison.object2.name}</Text>
              {selectedObject === 2 && isCorrect === true && (
                <View style={styles.feedbackIcon}>
                  <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                </View>
              )}
              {selectedObject === 2 && isCorrect === false && (
                <View style={styles.feedbackIcon}>
                  <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
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
    shadowColor: '#FDE68A',
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
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  objectsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  objectWrapper: {
    flex: 1,
  },
  objectCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  objectCardCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  objectCardIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  objectGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    position: 'relative',
  },
  objectEmoji: {
    marginBottom: 12,
  },
  objectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
