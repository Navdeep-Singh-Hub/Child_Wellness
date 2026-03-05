// Game 3: Coin Recognition
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
import { playSoundEffect, speakCoinValue, speakFeedback, stopAllAudio } from '../utils/audio';
import { COINS, CoinValue, getCoinOptions } from '../utils/gameData';

interface CoinRecognitionGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Coin component
function CoinDisplay({ value, size = 80 }: { value: CoinValue; size?: number }) {
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

export default function CoinRecognitionGame({ onComplete, onBack }: CoinRecognitionGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentCoin, setCurrentCoin] = useState<CoinValue | null>(null);
  const [options, setOptions] = useState<CoinValue[]>([]);
  const [selectedValue, setSelectedValue] = useState<CoinValue | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const coinScale = useSharedValue(1);
  const coinGlow = useSharedValue(0);
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

    if (currentCoin) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakCoinValue(currentCoin).catch(() => {});
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
  }, [currentCoin]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'coin-recognition',
      });
      return;
    }

    const coinValues: CoinValue[] = [1, 2, 5, 10];
    const targetCoin = coinValues[round % coinValues.length];
    const opts = getCoinOptions(targetCoin);
    
    setCurrentCoin(targetCoin);
    setOptions(opts);
    setSelectedValue(null);
    setIsCorrect(null);
    setCanSelect(true);
    coinScale.value = 1;
    coinGlow.value = 0;
    shakeX.value = 0;
  };

  const handleCoinSelect = async (value: CoinValue) => {
    if (!canSelect || !currentCoin) return;

    setCanSelect(false);
    setSelectedValue(value);
    const correct = value === currentCoin;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      coinGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakCoinValue(value);
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
        setSelectedValue(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (currentCoin) {
      speakCoinValue(currentCoin);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const coinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: coinScale.value },
      { translateX: shakeX.value },
    ],
    shadowOpacity: coinGlow.value * 0.5,
  }));

  if (!currentCoin) return null;

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
        <Text style={styles.instructionsText}>Listen and tap the correct coin value</Text>
      </View>

      {/* Coin Display */}
      <View style={styles.coinDisplayContainer}>
        <Animated.View style={coinAnimatedStyle}>
          <CoinDisplay value={currentCoin} size={120} />
        </Animated.View>
      </View>

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#FDE68A', '#FCD34D']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Coin Options */}
      <View style={styles.optionsContainer}>
        {options.map((value, index) => {
          const isSelected = selectedValue === value;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => handleCoinSelect(value)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.coinOptionButton,
                  coinAnimatedStyle,
                  showCorrect && styles.coinOptionButtonCorrect,
                  showIncorrect && styles.coinOptionButtonIncorrect,
                ]}
              >
                <LinearGradient
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FDE68A', '#FCD34D']}
                  style={styles.coinOptionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <CoinDisplay value={value} size={80} />
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
  coinDisplayContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  optionWrapper: {
    width: '45%',
    marginBottom: 16,
  },
  coinOptionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  coinOptionButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  coinOptionButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  coinOptionGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
