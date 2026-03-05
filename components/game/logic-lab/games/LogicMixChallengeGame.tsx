// Game 5: Logic Mix Mini Challenge
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
import { PLACEMENT_DATA, PICTURE_CHOICE_DATA, PATTERN_DATA, PrepositionPlacement, PictureChoice, Pattern, Preposition } from '../utils/gameData';

interface LogicMixChallengeGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6; // 2 placement + 2 pattern + 2 picture

type RoundType = 'placement' | 'picture' | 'pattern';

export default function LogicMixChallengeGame({ onComplete, onBack }: LogicMixChallengeGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>('placement');
  const [currentPlacement, setCurrentPlacement] = useState<PrepositionPlacement | null>(null);
  const [currentPicture, setCurrentPicture] = useState<PictureChoice | null>(null);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Preposition | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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

    if (roundType === 'placement' && currentPlacement) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        const instruction = `Put the ${currentPlacement.object} ${currentPlacement.preposition} the ${currentPlacement.target}`;
        await speakInstruction(instruction).catch(() => {});
        soundTimeoutRef.current = null;
      }, 600);
    } else if (roundType === 'picture' && currentPicture) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakInstruction(currentPicture.instruction).catch(() => {});
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
  }, [roundType, currentPlacement, currentPicture]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'logic-mix-challenge',
      });
      return;
    }

    // Alternate: placement, picture, pattern, placement, picture, pattern
    const types: RoundType[] = ['placement', 'picture', 'pattern', 'placement', 'picture', 'pattern'];
    const type = types[round];
    setRoundType(type);

    if (type === 'placement') {
      const item = PLACEMENT_DATA[Math.floor(round / 3) % PLACEMENT_DATA.length];
      setCurrentPlacement(item);
      setCurrentPicture(null);
      setCurrentPattern(null);
    } else if (type === 'picture') {
      const item = PICTURE_CHOICE_DATA[Math.floor(round / 3) % PICTURE_CHOICE_DATA.length];
      setCurrentPicture(item);
      setCurrentPlacement(null);
      setCurrentPattern(null);
    } else {
      const item = PATTERN_DATA[Math.floor(round / 3) % PATTERN_DATA.length];
      setCurrentPattern(item);
      setCurrentPlacement(null);
      setCurrentPicture(null);
    }

    setSelectedPosition(null);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handlePlacementSelect = async (position: Preposition) => {
    if (!canSelect || !currentPlacement) return;

    setCanSelect(false);
    setSelectedPosition(position);
    const correct = position === currentPlacement.preposition;
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

  const handlePictureSelect = async (optionId: string) => {
    if (!canSelect || !currentPicture) return;

    setCanSelect(false);
    setSelectedOption(optionId);
    const option = currentPicture.options.find(opt => opt.id === optionId);
    const correct = option?.correct || false;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Great choice!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedOption(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handlePatternSelect = async (answer: string) => {
    if (!canSelect || !currentPattern) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentPattern.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Excellent pattern!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Look again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (roundType === 'placement' && currentPlacement) {
      const instruction = `Put the ${currentPlacement.object} ${currentPlacement.preposition} the ${currentPlacement.target}`;
      speakInstruction(instruction);
    } else if (roundType === 'picture' && currentPicture) {
      speakInstruction(currentPicture.instruction);
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

  const getRoundTitle = () => {
    if (roundType === 'placement') return 'Round ' + (round + 1) + ': Place It';
    if (roundType === 'picture') return 'Round ' + (round + 1) + ': Choose Picture';
    return 'Round ' + (round + 1) + ': Complete Pattern';
  };

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
          <Text style={styles.headerTitle}>{getRoundTitle()}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Placement Round */}
      {roundType === 'placement' && currentPlacement && (
        <>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>Listen and place the object correctly</Text>
          </View>

          <View style={styles.replayContainer}>
            <Pressable onPress={handleReplay} style={styles.replayButton}>
              <LinearGradient
                colors={['#93C5FD', '#60A5FA']}
                style={styles.replayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                <Text style={styles.replayText}>Replay</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.sceneContainer}>
            <View style={styles.sceneBox}>
              <Text style={styles.sceneEmoji}>{currentPlacement.targetEmoji}</Text>
              <Text style={styles.sceneLabel}>{currentPlacement.target}</Text>
            </View>
            <View style={styles.objectBox}>
              <Text style={styles.objectEmoji}>{currentPlacement.objectEmoji}</Text>
              <Text style={styles.objectLabel}>{currentPlacement.object}</Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.positionsRow}>
              {positions.map((pos) => {
                const isSelected = selectedPosition === pos.preposition;
                const showCorrect = isSelected && isCorrect === true;
                const showIncorrect = isSelected && isCorrect === false;

                return (
                  <Pressable
                    key={pos.preposition}
                    onPress={() => handlePlacementSelect(pos.preposition)}
                    disabled={!canSelect}
                    style={styles.positionWrapper}
                  >
                    <Animated.View
                      style={[
                        styles.positionButton,
                        cardAnimatedStyle,
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
                      </LinearGradient>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      )}

      {/* Picture Round */}
      {roundType === 'picture' && currentPicture && (
        <>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>Tap the picture that matches</Text>
          </View>

          <View style={styles.replayContainer}>
            <Pressable onPress={handleReplay} style={styles.replayButton}>
              <LinearGradient
                colors={['#93C5FD', '#60A5FA']}
                style={styles.replayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                <Text style={styles.replayText}>Replay</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.optionsContainer}>
            {currentPicture.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const showCorrect = isSelected && isCorrect === true;
              const showIncorrect = isSelected && isCorrect === false;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handlePictureSelect(option.id)}
                  disabled={!canSelect}
                  style={styles.optionWrapper}
                >
                  <Animated.View
                    style={[
                      styles.pictureCard,
                      cardAnimatedStyle,
                      showCorrect && styles.correctCard,
                      showIncorrect && styles.incorrectCard,
                    ]}
                  >
                    <LinearGradient
                      colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FFFFFF', '#F8F9FA']}
                      style={styles.pictureGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.pictureContent}>
                        <Text style={styles.pictureEmoji}>{option.emoji}</Text>
                        <Text style={styles.pictureDescription}>{option.description}</Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Pattern Round */}
      {roundType === 'pattern' && currentPattern && (
        <>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>Complete the pattern</Text>
          </View>

          <View style={styles.patternContainer}>
            <View style={styles.patternBox}>
              <View style={styles.patternRow}>
                {currentPattern.sequence.map((item, index) => (
                  <View key={index} style={styles.patternItem}>
                    <Text style={styles.patternEmoji}>{item}</Text>
                  </View>
                ))}
                <View style={[styles.patternItem, styles.patternItemEmpty]}>
                  <Text style={styles.patternEmoji}>?</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              {currentPattern.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = isSelected && isCorrect === true;
                const showIncorrect = isSelected && isCorrect === false;

                return (
                  <Pressable
                    key={index}
                    onPress={() => handlePatternSelect(option)}
                    disabled={!canSelect}
                    style={styles.optionWrapper}
                  >
                    <Animated.View
                      style={[
                        styles.answerButton,
                        cardAnimatedStyle,
                        showCorrect && styles.correctButton,
                        showIncorrect && styles.incorrectButton,
                      ]}
                    >
                      <LinearGradient
                        colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#93C5FD', '#60A5FA']}
                        style={styles.answerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.answerEmoji}>{option}</Text>
                      </LinearGradient>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      )}
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
    gap: 16,
  },
  optionWrapper: {
    marginBottom: 16,
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
  pictureCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  pictureGradient: {
    padding: 24,
  },
  pictureContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pictureEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  pictureDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  patternContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  patternBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: '100%',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  patternItem: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  patternItemEmpty: {
    backgroundColor: '#F3F4F6',
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
  },
  patternEmoji: {
    fontSize: 36,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  answerButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  correctButton: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  incorrectButton: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  answerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  answerEmoji: {
    fontSize: 48,
  },
});
