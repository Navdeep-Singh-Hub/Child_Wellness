import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { speak as speakTTS, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredChoices?: number;
};

const ITEM_SIZE = 160;
let scheduledSpeechTimers: Array<ReturnType<typeof setTimeout>> = [];

function clearScheduledSpeech() {
  scheduledSpeechTimers.forEach(t => clearTimeout(t));
  scheduledSpeechTimers = [];
  try {
    stopTTS();
  } catch {}
}

function speak(text: string, rate = DEFAULT_TTS_RATE) {
  try {
    clearScheduledSpeech();
    speakTTS(text, rate);
  } catch (e) {
    console.warn('speak error', e);
  }
}

type ChoicePair = {
  left: {
    emoji: string;
    name: string;
    color: string[];
    sound: string;
  };
  right: {
    emoji: string;
    name: string;
    color: string[];
    sound: string;
  };
};

const CHOICE_PAIRS: ChoicePair[] = [
  {
    left: { emoji: '⚽', name: 'ball', color: ['#22C55E', '#16A34A'], sound: 'bounce' },
    right: { emoji: '🫧', name: 'bubbles', color: ['#06B6D4', '#0891B2'], sound: 'pop' },
  },
  {
    left: { emoji: '🎈', name: 'balloon', color: ['#EF4444', '#DC2626'], sound: 'float' },
    right: { emoji: '🎨', name: 'crayon', color: ['#8B5CF6', '#7C3AED'], sound: 'draw' },
  },
  {
    left: { emoji: '🧸', name: 'teddy', color: ['#F59E0B', '#D97706'], sound: 'hug' },
    right: { emoji: '🚗', name: 'car', color: ['#3B82F6', '#2563EB'], sound: 'vroom' },
  },
  {
    left: { emoji: '⭐', name: 'star', color: ['#FCD34D', '#FBBF24'], sound: 'twinkle' },
    right: { emoji: '🌙', name: 'moon', color: ['#6366F1', '#4F46E5'], sound: 'glow' },
  },
  {
    left: { emoji: '🐶', name: 'dog', color: ['#EC4899', '#DB2777'], sound: 'woof' },
    right: { emoji: '🐱', name: 'cat', color: ['#F59E0B', '#D97706'], sound: 'meow' },
  },
];

export const TapWhatYouLikeGame: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredChoices = 5,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [choices, setChoices] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<'left' | 'right' | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const isAnimatingRef = useRef(false);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    totalChoices: number;
    choicesMade: number;
    accuracy: number;
  } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);

  // Animations for left item
  const leftScale = useRef(new Animated.Value(1)).current;
  const leftRotation = useRef(new Animated.Value(0)).current;
  const leftGlow = useRef(new Animated.Value(0.5)).current;
  const leftSparkles = useRef(new Animated.Value(0)).current;
  const leftBounce = useRef(new Animated.Value(1)).current;

  // Animations for right item
  const rightScale = useRef(new Animated.Value(1)).current;
  const rightRotation = useRef(new Animated.Value(0)).current;
  const rightGlow = useRef(new Animated.Value(0.5)).current;
  const rightSparkles = useRef(new Animated.Value(0)).current;
  const rightBounce = useRef(new Animated.Value(1)).current;

  // Sparkle positions
  const leftSparklePositions = useRef<Array<{ x: Animated.Value; y: Animated.Value; opacity: Animated.Value }>>([]).current;
  const rightSparklePositions = useRef<Array<{ x: Animated.Value; y: Animated.Value; opacity: Animated.Value }>>([]).current;

  const currentPair = CHOICE_PAIRS[currentPairIndex];

  useEffect(() => {
    startGlowAnimation();
    speak('Choose the one you like!');
    return () => {
      clearScheduledSpeech();
    };
  }, []);

  useEffect(() => {
    if (choices >= requiredChoices && !gameFinished) {
      finishGame();
    }
  }, [choices, requiredChoices, gameFinished]);

  const finishGame = useCallback(async () => {
    if (gameFinished) return;
    
    const stats = {
      totalChoices: requiredChoices,
      choicesMade: choices,
      accuracy: 100, // Always 100% since there's no wrong answer
    };
    setFinalStats(stats);
    setGameFinished(true);
    speak('Amazing! You made great choices!');

    try {
      const xpAwarded = choices * 10;
      const result = await logGameAndAward({
        type: 'tap',
        correct: choices,
        total: requiredChoices,
        accuracy: 100,
        xpAwarded,
        skillTags: ['active-selection', 'preference-expression', 'reward-predictability', 'confidence-building'],
        meta: {
          gameType: 'tap-what-you-like',
          totalChoices: requiredChoices,
          choicesMade: choices,
        },
      });
      setLogTimestamp(result?.last?.at ?? null);
      onComplete?.();
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }, [choices, requiredChoices, gameFinished, onComplete]);

  const startGlowAnimation = () => {
    // Left item glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(leftGlow, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Right item glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(rightGlow, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Gentle bounce for both items
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftBounce, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leftBounce, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rightBounce, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rightBounce, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const createSparkles = (count: number) => {
    const newSparkles = [];
    for (let i = 0; i < count; i++) {
      newSparkles.push({
        x: new Animated.Value(ITEM_SIZE / 2),
        y: new Animated.Value(ITEM_SIZE / 2),
        opacity: new Animated.Value(1),
      });
    }
    return newSparkles;
  };

  const animateSparkles = (sparkles: Array<{ x: Animated.Value; y: Animated.Value; opacity: Animated.Value }>) => {
    const animations = sparkles.map((sparkle) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 100 + Math.random() * 80;
      return Animated.parallel([
        Animated.timing(sparkle.x, {
          toValue: ITEM_SIZE / 2 + Math.cos(angle) * distance,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(sparkle.y, {
          toValue: ITEM_SIZE / 2 + Math.sin(angle) * distance,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(sparkle.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(sparkle.opacity, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ]);
    });
    return Animated.parallel(animations);
  };

  const handleChoice = useCallback((side: 'left' | 'right') => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    setSelectedItem(side);

    const scaleAnim = side === 'left' ? leftScale : rightScale;
    const rotationAnim = side === 'left' ? leftRotation : rightRotation;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const sparkles = createSparkles(12);
    if (side === 'left') {
      leftSparklePositions.splice(0, leftSparklePositions.length, ...sparkles);
    } else {
      rightSparklePositions.splice(0, rightSparklePositions.length, ...sparkles);
    }

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (sparkles.length > 0) {
      animateSparkles(sparkles).start();
    }

    setShowRoundSuccess(true);

    setTimeout(() => {
      setShowRoundSuccess(false);
      setChoices((prev) => {
        const nextChoices = prev + 1;
        if (nextChoices < requiredChoices) {
          setCurrentPairIndex((idx) => (idx + 1) % CHOICE_PAIRS.length);
        }
        return nextChoices;
      });
      setSelectedItem(null);
      scaleAnim.setValue(1);
      rotationAnim.setValue(0);
      isAnimatingRef.current = false;
    }, 1800);
  }, [requiredChoices, leftScale, rightScale, leftRotation, rightRotation, leftSparklePositions, rightSparklePositions]);

  if (gameFinished && finalStats) {
    return (
      <CongratulationsScreen
        message="Amazing Work!"
        showButtons={true}
        correct={finalStats.choicesMade}
        total={finalStats.totalChoices}
        accuracy={finalStats.accuracy}
        xpAwarded={finalStats.choicesMade * 10}
        onContinue={() => {
          clearScheduledSpeech();
          stopTTS();
          onComplete?.();
        }}
        onHome={onBack}
      />
    );
  }

  const progressDots = Array.from({ length: requiredChoices }, (_, i) => i < choices);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              clearScheduledSpeech();
              stopTTS();
              onBack();
            }}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Tap What You Like</Text>
            <Text style={styles.subtitle}>Choose the one you like!</Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          {/* Instruction */}
          {choices === 0 && (
            <View style={styles.instructionBadge} pointerEvents="none">
              <Text style={styles.instructionText}>👆 Choose the one you like!</Text>
            </View>
          )}

          <View style={styles.choiceContainer}>
            <Pressable
              onPress={() => handleChoice('left')}
              hitSlop={24}
              style={({ pressed }) => [
                styles.choicePressable,
                pressed && styles.choicePressablePressed,
              ]}
            >
              <Animated.View
                style={[
                  styles.choiceItem,
                  {
                    transform: [
                      { scale: Animated.multiply(leftScale, leftBounce) },
                      {
                        rotate: leftRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '12deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.itemGlow,
                    {
                      backgroundColor: currentPair.left.color[0],
                      opacity: leftGlow.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [0.35, 0.7],
                      }),
                    },
                  ]}
                />
                <LinearGradient
                  colors={currentPair.left.color}
                  style={styles.itemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.itemEmoji}>{currentPair.left.emoji}</Text>
                  {selectedItem === 'left' && leftSparklePositions.map((sparkle, idx) => (
                    <Animated.View
                      key={idx}
                      pointerEvents="none"
                      style={[
                        styles.sparkle,
                        {
                          left: sparkle.x,
                          top: sparkle.y,
                          opacity: sparkle.opacity,
                        },
                      ]}
                    >
                      <Text style={styles.sparkleText}>✨</Text>
                    </Animated.View>
                  ))}
                </LinearGradient>
              </Animated.View>
              <Text style={styles.itemLabel}>{currentPair.left.name}</Text>
            </Pressable>

            <View style={styles.vsBadge} pointerEvents="none">
              <Text style={styles.vsText}>VS</Text>
            </View>

            <Pressable
              onPress={() => handleChoice('right')}
              hitSlop={24}
              style={({ pressed }) => [
                styles.choicePressable,
                pressed && styles.choicePressablePressed,
              ]}
            >
              <Animated.View
                style={[
                  styles.choiceItem,
                  {
                    transform: [
                      { scale: Animated.multiply(rightScale, rightBounce) },
                      {
                        rotate: rightRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '-12deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.itemGlow,
                    {
                      backgroundColor: currentPair.right.color[0],
                      opacity: rightGlow.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [0.35, 0.7],
                      }),
                    },
                  ]}
                />
                <LinearGradient
                  colors={currentPair.right.color}
                  style={styles.itemGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.itemEmoji}>{currentPair.right.emoji}</Text>
                  {selectedItem === 'right' && rightSparklePositions.map((sparkle, idx) => (
                    <Animated.View
                      key={idx}
                      pointerEvents="none"
                      style={[
                        styles.sparkle,
                        {
                          left: sparkle.x,
                          top: sparkle.y,
                          opacity: sparkle.opacity,
                        },
                      ]}
                    >
                      <Text style={styles.sparkleText}>✨</Text>
                    </Animated.View>
                  ))}
                </LinearGradient>
              </Animated.View>
              <Text style={styles.itemLabel}>{currentPair.right.name}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎯 Active Selection • 💝 Preference Expression • 🎁 Reward Predictability
          </Text>
          <View style={styles.progressRow}>
            {progressDots.map((filled, idx) => (
              <View
                key={idx}
                style={[styles.progressDot, filled && styles.progressDotFilled]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {choices >= requiredChoices
              ? '🎊 Amazing! You made great choices! 🎊'
              : `Choices: ${choices} / ${requiredChoices}`}
          </Text>
        </View>
      </LinearGradient>

      {/* Round Success Animation */}
      <RoundSuccessAnimation
        visible={showRoundSuccess}
        stars={3}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
  choiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    minHeight: ITEM_SIZE + 48,
  },
  choicePressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    zIndex: 2,
  },
  choicePressablePressed: {
    opacity: 0.85,
  },
  choiceItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    overflow: 'visible',
    position: 'relative',
  },
  itemGlow: {
    position: 'absolute',
    width: ITEM_SIZE + 20,
    height: ITEM_SIZE + 20,
    borderRadius: (ITEM_SIZE + 20) / 2,
    top: -10,
    left: -10,
  },
  itemGradient: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
  },
  itemEmoji: {
    fontSize: 88,
    textAlign: 'center',
  },
  itemLabel: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 24,
  },
  vsBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    zIndex: 1,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#475569',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#FCD34D',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  progressDotFilled: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    transform: [{ scale: 1.2 }],
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  completionScroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});


