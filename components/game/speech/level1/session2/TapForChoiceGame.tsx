import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { speak as speakTTS, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGlowLoop } from '@/utils/animatedGlowLoop';
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredChoices?: number;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_SIZE = 180;
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
    glow: string;
  };
  right: {
    emoji: string;
    name: string;
    color: string[];
    glow: string;
  };
};

const CHOICE_PAIRS: ChoicePair[] = [
  {
    left: { emoji: '⚽', name: 'ball', color: ['#22C55E', '#16A34A'], glow: '#86EFAC' },
    right: { emoji: '🚗', name: 'car', color: ['#3B82F6', '#2563EB'], glow: '#93C5FD' },
  },
  {
    left: { emoji: '🐶', name: 'dog', color: ['#F59E0B', '#D97706'], glow: '#FDE68A' },
    right: { emoji: '🐱', name: 'cat', color: ['#EC4899', '#DB2777'], glow: '#F9A8D4' },
  },
  {
    left: { emoji: '🍎', name: 'apple', color: ['#EF4444', '#DC2626'], glow: '#FCA5A5' },
    right: { emoji: '🍌', name: 'banana', color: ['#FBBF24', '#F59E0B'], glow: '#FDE68A' },
  },
  {
    left: { emoji: '⭐', name: 'star', color: ['#8B5CF6', '#7C3AED'], glow: '#C4B5FD' },
    right: { emoji: '🌙', name: 'moon', color: ['#06B6D4', '#0891B2'], glow: '#67E8F9' },
  },
  {
    left: { emoji: '🎈', name: 'balloon', color: ['#F43F5E', '#E11D48'], glow: '#FCA5A5' },
    right: { emoji: '🎁', name: 'gift', color: ['#10B981', '#059669'], glow: '#6EE7B7' },
  },
];

export const TapForChoiceGame: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredChoices = 5,
}) => {
  const [choices, setChoices] = useState(0);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<'left' | 'right' | null>(null);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const isAnimatingRef = useRef(false);

  // Animations for left item
  const leftScale = useRef(new Animated.Value(1)).current;
  const leftRotation = useRef(new Animated.Value(0)).current;
  const leftGlow = useRef(new Animated.Value(0.5)).current;
  const leftSparkles = useRef(new Animated.Value(0)).current;

  // Animations for right item
  const rightScale = useRef(new Animated.Value(1)).current;
  const rightRotation = useRef(new Animated.Value(0)).current;
  const rightGlow = useRef(new Animated.Value(0.5)).current;
  const rightSparkles = useRef(new Animated.Value(0)).current;

  // Sparkle positions - separate for left and right
  const leftSparklePositions = useRef<Array<{ x: Animated.Value; y: Animated.Value; opacity: Animated.Value }>>([]).current;
  const rightSparklePositions = useRef<Array<{ x: Animated.Value; y: Animated.Value; opacity: Animated.Value }>>([]).current;

  const currentPair = CHOICE_PAIRS[currentPairIndex];

  const leftGlowLoop = useMemo(() => createGlowLoop(leftGlow), [leftGlow]);
  const rightGlowLoop = useMemo(() => createGlowLoop(rightGlow), [rightGlow]);

  useEffect(() => {
    leftGlowLoop.start();
    rightGlowLoop.start();
    speak('Tap what you like!');
    return () => {
      leftGlowLoop.stop();
      rightGlowLoop.stop();
      clearScheduledSpeech();
    };
  }, [leftGlowLoop, rightGlowLoop]);

  useEffect(() => {
    if (choices >= requiredChoices && !gameFinished) {
      setGameFinished(true);
      setShowRoundSuccess(false);
    }
  }, [choices, requiredChoices, gameFinished]);

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
      const distance = 80 + Math.random() * 60;
      return Animated.parallel([
        Animated.timing(sparkle.x, {
          toValue: ITEM_SIZE / 2 + Math.cos(angle) * distance,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(sparkle.y, {
          toValue: ITEM_SIZE / 2 + Math.sin(angle) * distance,
          duration: 800,
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
            duration: 600,
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

    const sparkles = createSparkles(8);
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
      isAnimatingRef.current = false;
    }, 1800);
  }, [requiredChoices, leftScale, rightScale, leftRotation, rightRotation, leftSparklePositions, rightSparklePositions]);

  const progressDots = Array.from({ length: requiredChoices }, (_, i) => i < choices);

  // Show completion screen with stats when game finishes
  if (gameFinished) {
    const accuracyPct = choices >= requiredChoices ? 100 : Math.round((choices / requiredChoices) * 100);
    const xpAwarded = choices * 10;
    return (
      <CongratulationsScreen
        message="Great Choices!"
        showButtons={true}
        correct={choices}
        total={requiredChoices}
        accuracy={accuracyPct}
        xpAwarded={xpAwarded}
        onContinue={() => {
          clearScheduledSpeech();
          stopTTS();
          onComplete?.();
        }}
        onHome={() => {
          clearScheduledSpeech();
          stopTTS();
          stopAllSpeech();
          cleanupSounds();
          onBack();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              clearScheduledSpeech();
              stopAllSpeech();
              cleanupSounds();
              onBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Tap for Choice</Text>
            <Text style={styles.headerSubtitle}>Choose what you like!</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          {/* Instruction */}
          {choices === 0 && (
            <View style={styles.instructionBadge} pointerEvents="none">
              <Text style={styles.instructionText}>👆 Tap what you like!</Text>
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
                      { scale: leftScale },
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
                  style={[
                    styles.itemGlow,
                    {
                      backgroundColor: currentPair.left.glow,
                      opacity: leftGlow.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [0.35, 0.7],
                      }),
                    },
                  ]}
                  pointerEvents="none"
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
                      { scale: rightScale },
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
                  style={[
                    styles.itemGlow,
                    {
                      backgroundColor: currentPair.right.glow,
                      opacity: rightGlow.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [0.35, 0.7],
                      }),
                    },
                  ]}
                  pointerEvents="none"
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎯 Early Choice-Making • 🎨 Builds Preference • 🚀 Prepares for Functional Choices
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerRight: {
    width: 80,
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
    color: '#1E40AF',
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
    overflow: 'hidden',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  progressDotFilled: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
});

