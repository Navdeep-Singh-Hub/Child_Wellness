// Game 1: Place It Right (Prepositions)
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
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { PLACEMENT_DATA, PrepositionPlacement } from '../utils/gameData';

interface PlaceItRightGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function PlaceItRightGame({ onComplete, onBack }: PlaceItRightGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<PrepositionPlacement | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Preposition | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentItem) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        const instruction = `Put the ${currentItem.object} ${currentItem.preposition} the ${currentItem.target}`;
        await speakInstruction(instruction).catch(() => {});
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
  }, [currentItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'place-it-right',
      });
      return;
    }

    const item = PLACEMENT_DATA[round % PLACEMENT_DATA.length];
    
    setCurrentItem(item);
    setSelectedPosition(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handlePositionSelect = async (position: Preposition) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedPosition(position);
    const correct = position === currentItem.preposition;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Perfect placement!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedPosition(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (currentItem) {
      const instruction = `Put the ${currentItem.object} ${currentItem.preposition} the ${currentItem.target}`;
      speakInstruction(instruction);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentItem) return null;

  const positions: Array<{ preposition: Preposition; label: string; emoji: string }> = [
    { preposition: 'on', label: 'On', emoji: '⬆️' },
    { preposition: 'under', label: 'Under', emoji: '⬇️' },
    { preposition: 'in', label: 'In', emoji: '📦' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#EFF6FF', '#F0F9FF']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Listen and place the object correctly</Text>
      </View>

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#93C5FD', '#60A5FA']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay Instruction</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Scene Display */}
      <View style={styles.sceneContainer}>
        <View style={styles.sceneBox}>
          <Text style={styles.sceneEmoji}>{currentItem.targetEmoji}</Text>
          <Text style={styles.sceneLabel}>{currentItem.target}</Text>
        </View>
        <View style={styles.objectBox}>
          <Text style={styles.objectEmoji}>{currentItem.objectEmoji}</Text>
          <Text style={styles.objectLabel}>{currentItem.object}</Text>
        </View>
      </View>

      {/* Position Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsLabel}>Where should it go?</Text>
        <View style={styles.positionsRow}>
          {positions.map((pos) => {
            const isSelected = selectedPosition === pos.preposition;
            const showCorrect = isSelected && isCorrect === true;
            const showIncorrect = isSelected && isCorrect === false;
            const isTarget = pos.preposition === currentItem.preposition;

            return (
              <Pressable
                key={pos.preposition}
                onPress={() => handlePositionSelect(pos.preposition)}
                disabled={!canSelect}
                style={styles.positionWrapper}
              >
                <Animated.View
                  style={[
                    styles.positionButton,
                    cardAnimatedStyle,
                    isTarget && styles.targetPosition,
                    showCorrect && styles.correctPosition,
                    showIncorrect && styles.incorrectPosition,
                  ]}
                >
                  <LinearGradient
                    colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#93C5FD', '#60A5FA']}
                    style={styles.positionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.positionEmoji}>{pos.emoji}</Text>
                    <Text style={styles.positionLabel}>{pos.label}</Text>
                    {showCorrect && (
                      <View style={styles.feedbackIcon}>
                        <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                      </View>
                    )}
                    {showIncorrect && (
                      <View style={styles.feedbackIcon}>
                        <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
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
    shadowColor: '#93C5FD',
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
    paddingBottom: 16,
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  replayContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  replayButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  replayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  replayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sceneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 24,
  },
  sceneBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 120,
  },
  sceneEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  sceneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  objectBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    minWidth: 120,
  },
  objectEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  objectLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  optionsLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  positionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  positionWrapper: {
    flex: 1,
  },
  positionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  targetPosition: {
    borderWidth: 3,
    borderColor: '#93C5FD',
  },
  correctPosition: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  incorrectPosition: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  positionGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  positionEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  positionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
