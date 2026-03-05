// Game 4: Count the Coins
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
import { playSoundEffect, speakTotal, countWithVoice, speakFeedback, stopAllAudio } from '../utils/audio';
import { COINS, CoinValue, COIN_COUNT_PROBLEMS, getCoinOptions } from '../utils/gameData';

interface CountCoinsGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Coin component
function CoinDisplay({ value, size = 60 }: { value: CoinValue; size?: number }) {
  const coin = COINS.find(c => c.value === value);
  return (
    <View style={[styles.coinCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={['#FDE68A', '#FCD34D']}
        style={[styles.coinGradient, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.coinSymbol, { fontSize: size * 0.3 }]}>{coin?.symbol}</Text>
      </LinearGradient>
    </View>
  );
}

export default function CountCoinsGame({ onComplete, onBack }: CountCoinsGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<typeof COIN_COUNT_PROBLEMS[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [isCounting, setIsCounting] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (currentProblem && !isCounting) {
      startCountingAnimation();
    }
  }, [currentProblem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'count-coins',
      });
      return;
    }

    const problem = COIN_COUNT_PROBLEMS[round % COIN_COUNT_PROBLEMS.length];
    const allOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const wrongOptions = allOptions.filter(n => n !== problem.answer);
    const shuffled = [problem.answer, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
    
    setCurrentProblem(problem);
    setOptions(shuffled);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    setIsCounting(false);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const startCountingAnimation = async () => {
    if (!currentProblem || isCounting) return;
    
    setIsCounting(true);
    setCanSelect(false);

    // Count coins one by one
    for (let i = 0; i < currentProblem.coins.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      await countWithVoice(currentProblem.coins[i]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await speakTotal(currentProblem.answer);
    await speakFeedback('What is the total?');
    
    setIsCounting(false);
    setCanSelect(true);
  };

  const handleAnswerSelect = async (answer: number) => {
    if (!canSelect || !currentProblem) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakTotal(answer);
      await speakFeedback('Perfect counting!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Let\'s count again!');
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
    if (currentProblem && !isCounting) {
      startCountingAnimation();
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

  if (!currentProblem) return null;

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
        <Text style={styles.instructionsText}>Count the coins and find the total value</Text>
      </View>

      {/* Coins Display */}
      <View style={styles.coinsContainer}>
        <View style={styles.coinsRow}>
          {currentProblem.coins.map((coinValue, index) => (
            <View key={index} style={styles.coinWrapper}>
              <CoinDisplay value={coinValue} size={70} />
            </View>
          ))}
        </View>
        <Text style={styles.totalLabel}>Total = ?</Text>
      </View>

      {/* Replay Button */}
      {!isCounting && (
        <View style={styles.replayContainer}>
          <Pressable onPress={handleReplay} style={styles.replayButton}>
            <LinearGradient
              colors={['#FDE68A', '#FCD34D']}
              style={styles.replayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="volume-high" size={24} color="#FFFFFF" />
              <Text style={styles.replayText}>Count Again</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Answer Options */}
      {!isCounting && (
        <View style={styles.optionsContainer}>
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const showCorrect = isSelected && isCorrect === true;
            const showIncorrect = isSelected && isCorrect === false;

            return (
              <Pressable
                key={index}
                onPress={() => handleAnswerSelect(option)}
                disabled={!canSelect}
                style={styles.optionWrapper}
              >
                <Animated.View
                  style={[
                    styles.answerButton,
                    cardAnimatedStyle,
                    showCorrect && styles.answerButtonCorrect,
                    showIncorrect && styles.answerButtonIncorrect,
                  ]}
                >
                  <LinearGradient
                    colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FDE68A', '#FCD34D']}
                    style={styles.answerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.answerText}>₹{option}</Text>
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
    paddingBottom: 16,
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  coinsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  coinsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  coinWrapper: {
    marginBottom: 8,
  },
  coinCircle: {
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  coinGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FCD34D',
  },
  coinSymbol: {
    fontWeight: '800',
    color: '#1E293B',
  },
  totalLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
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
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  optionWrapper: {
    flex: 1,
  },
  answerButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  answerButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  answerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  answerText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
