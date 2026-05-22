import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import ResultCard from '@/components/game/ResultCard';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { NATIVE_EFFECT, NATIVE_MOVE } from '@/utils/animation';
import { speak as speakTTS, clearScheduledSpeech, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    type GestureResponderEvent,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredTaps?: number;
};

const STAR_SIZE = 100;
/** Extra radius so taps register while the star is moving (native transform touch lag) */
const TAP_HIT_PADDING = Platform.select({ web: 36, default: 52 })!;
/** Slower on native — layout `left`/`top` + stacked loops caused jank/crashes on tablets */
const BOUNCE_DURATION_MS = Platform.select({
  web: { min: 1500, range: 1000 },
  default: { min: 2600, range: 1400 },
})!;

// Use shared TTS utility (speech-to-speech on web, expo-speech on native)
// Imported from @/utils/tts

// Wrapper function for backward compatibility
function speak(text: string, rate = DEFAULT_TTS_RATE) {
  speakTTS(text, rate);
}

export const CatchTheBouncingStar: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredTaps = 5,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [hits, setHits] = useState(0);
  const [round, setRound] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    totalTaps: number;
    successfulTaps: number;
    accuracy: number;
  } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const starX = useRef(new Animated.Value(0)).current;
  const starY = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const starRotation = useRef(new Animated.Value(0)).current;
  const starGlow = useRef(new Animated.Value(0.5)).current;
  const bounceAnim = useRef<Animated.CompositeAnimation | null>(null);
  const rotationAnim = useRef<Animated.CompositeAnimation | null>(null);
  const glowAnim = useRef<Animated.CompositeAnimation | null>(null);
  const gameFinishedRef = useRef(false);
  const bounceGenerationRef = useRef(0);
  const starPositionRef = useRef({ x: 0, y: 0 });
  const tapLockedRef = useRef(false);

  useEffect(() => {
    gameFinishedRef.current = gameFinished;
  }, [gameFinished]);

  useEffect(() => {
    const idX = starX.addListener(({ value }) => {
      starPositionRef.current.x = value;
    });
    const idY = starY.addListener(({ value }) => {
      starPositionRef.current.y = value;
    });
    return () => {
      starX.removeListener(idX);
      starY.removeListener(idY);
    };
  }, [starX, starY]);

  const getRandomPosition = useCallback(() => {
    const margin = STAR_SIZE / 2 + 40;
    const maxX = Math.max(margin + 1, SCREEN_WIDTH - margin * 2);
    const maxY = Math.max(80, SCREEN_HEIGHT - 300);
    return {
      x: margin + Math.random() * maxX,
      y: 80 + Math.random() * maxY,
    };
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  const stopAllAnimations = useCallback(() => {
    bounceGenerationRef.current += 1;
    bounceAnim.current?.stop();
    rotationAnim.current?.stop();
    glowAnim.current?.stop();
    bounceAnim.current = null;
    rotationAnim.current = null;
    glowAnim.current = null;
    starX.stopAnimation();
    starY.stopAnimation();
    starRotation.stopAnimation();
    starGlow.stopAnimation();
  }, [starX, starY, starRotation, starGlow]);

  const startBounce = useCallback(() => {
    stopAllAnimations();
    const generation = bounceGenerationRef.current;

    const margin = STAR_SIZE / 2 + 20;
    const startPos = getRandomPosition();
    starX.setValue(startPos.x);
    starY.setValue(startPos.y);
    starPositionRef.current = { x: startPos.x, y: startPos.y };
    starRotation.setValue(0);
    starGlow.setValue(0.5);

    rotationAnim.current = Animated.loop(
      Animated.timing(starRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: NATIVE_EFFECT,
      }),
    );
    rotationAnim.current.start();

    glowAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(starGlow, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_EFFECT,
        }),
        Animated.timing(starGlow, {
          toValue: 0.5,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_EFFECT,
        }),
      ]),
    );
    glowAnim.current.start();

    const runBounceStep = () => {
      if (gameFinishedRef.current || generation !== bounceGenerationRef.current) {
        return;
      }

      const nextX = margin + Math.random() * Math.max(1, SCREEN_WIDTH - margin * 2);
      const nextY = 80 + Math.random() * Math.max(1, SCREEN_HEIGHT - 200);
      const duration = BOUNCE_DURATION_MS.min + Math.random() * BOUNCE_DURATION_MS.range;

      bounceAnim.current = Animated.parallel([
        Animated.timing(starX, {
          toValue: nextX,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_MOVE,
        }),
        Animated.timing(starY, {
          toValue: nextY,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_MOVE,
        }),
      ]);

      bounceAnim.current.start(({ finished }) => {
        if (finished && !gameFinishedRef.current && generation === bounceGenerationRef.current) {
          runBounceStep();
        }
      });
    };

    runBounceStep();
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, getRandomPosition, stopAllAnimations, starX, starY]);

  useEffect(() => {
    startBounce();
    speak('Catch the bouncing star! Tap it when you see it!');
    return () => {
      stopAllAnimations();
      clearScheduledSpeech();
    };
  }, [startBounce, stopAllAnimations]);

  useEffect(() => {
    if (hits >= requiredTaps && !gameFinished) {
      finishGame();
    }
  }, [hits, requiredTaps, gameFinished]);

  const finishGame = useCallback(async () => {
    if (gameFinished) {
      console.log('🎮 CatchTheBouncingStar: finishGame called but gameFinished already true');
      return;
    }
    
    console.log('🎮 CatchTheBouncingStar: finishGame called', { hits, requiredTaps });
    
    const stats = {
      totalTaps: requiredTaps,
      successfulTaps: hits,
      accuracy: Math.round((hits / requiredTaps) * 100),
    };
    
    console.log('🎮 CatchTheBouncingStar: Setting states', { stats });

    stopAllAnimations();

    // Set all states first
    setFinalStats(stats);
    setGameFinished(true);
    setShowCongratulations(true);
    
    console.log('🎮 CatchTheBouncingStar: States set', { 
      gameFinished: true, 
      showCongratulations: true, 
      hasFinalStats: !!stats 
    });
    
    speak('Amazing! You caught all the stars!');

    // Log game in background (don't wait for it)
    try {
      const xpAwarded = hits * 10;
      const result = await logGameAndAward({
        type: 'catch-bouncing-star',
        correct: hits,
        total: requiredTaps,
        accuracy: stats.accuracy,
        xpAwarded,
        skillTags: ['visual-tracking', 'hand-eye-coordination', 'reaction-timing'],
        meta: {
          totalTaps: requiredTaps,
          successfulTaps: hits,
        },
      });
      setLogTimestamp(result?.last?.at ?? null);
    } catch (e) {
      console.error('Failed to save game:', e);
    }
    // Don't call onComplete here - let congratulations screen handle it
  }, [hits, requiredTaps, gameFinished, stopAllAnimations]);

  const handleStarTap = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
      speak('Catch the bouncing star! Tap it when you see it!');
    }
    if (gameFinished || tapLockedRef.current) return;
    tapLockedRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    stopAllAnimations();

    setHits((prev) => prev + 1);
    setRound((prev) => prev + 1);
    setShowFeedback(true);
    setFeedbackMessage('🌟 Great catch!');
    setShowRoundSuccess(true);

    const nextHits = hits + 1;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(starScale, {
          toValue: 1.5,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVE_EFFECT,
        }),
        Animated.timing(starGlow, {
          toValue: 1.5,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVE_EFFECT,
        }),
      ]),
      Animated.parallel([
        Animated.timing(starScale, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: NATIVE_EFFECT,
        }),
        Animated.timing(starGlow, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: NATIVE_EFFECT,
        }),
      ]),
    ]).start(() => {
      if (nextHits < requiredTaps) {
        setTimeout(() => {
          setShowRoundSuccess(false);
          setShowFeedback(false);
          starScale.setValue(1);
          starGlow.setValue(0.5);
          tapLockedRef.current = false;
          startBounce();
        }, 1200);
      } else {
        setTimeout(() => {
          setShowRoundSuccess(false);
          tapLockedRef.current = false;
        }, 1200);
      }
    });
  }, [gameFinished, hits, requiredTaps, startBounce, stopAllAnimations, starScale, starGlow, userInteracted]);

  const handlePlayAreaPress = useCallback(
    (event: GestureResponderEvent) => {
      if (gameFinished || tapLockedRef.current) return;

      const { locationX, locationY } = event.nativeEvent;
      const centerX = starPositionRef.current.x + STAR_SIZE / 2;
      const centerY = starPositionRef.current.y + STAR_SIZE / 2;
      const hitRadius = STAR_SIZE / 2 + TAP_HIT_PADDING;

      if (Math.hypot(locationX - centerX, locationY - centerY) <= hitRadius) {
        handleStarTap();
      }
    },
    [gameFinished, handleStarTap],
  );

  // Debug logging
  useEffect(() => {
    console.log('🎮 CatchTheBouncingStar: Render state', {
      showCongratulations,
      gameFinished,
      hasFinalStats: !!finalStats,
      hits,
      requiredTaps,
    });
  }, [showCongratulations, gameFinished, finalStats, hits, requiredTaps]);

  // Show completion screen with stats (single screen, no ResultCard)
  if (gameFinished && finalStats) {
    const accuracyPct = finalStats.accuracy;
    console.log('🎮 CatchTheBouncingStar: Rendering Completion Screen with stats');
    return (
      <CongratulationsScreen
        message="Amazing Work!"
        showButtons={true}
        correct={finalStats.successfulTaps}
        total={finalStats.totalTaps}
        accuracy={accuracyPct}
        xpAwarded={finalStats.successfulTaps * 10}
        onContinue={() => {
          clearScheduledSpeech();
          stopTTS();
          onComplete?.();
        }}
        onHome={() => {
          clearScheduledSpeech();
          stopTTS();
          onBack();
        }}
      />
    );
  }

  const progressDots = Array.from({ length: requiredTaps }, (_, i) => i < hits);
  const rotation = starRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const glowOpacity = starGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA', '#6366F1']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              clearScheduledSpeech();
              stopTTS();
              onBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Catch the Bouncing Star</Text>
            <Text style={styles.subtitle}>Tap the star as it bounces!</Text>
          </View>
        </View>

        <Pressable style={styles.playArea} onPress={handlePlayAreaPress}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.starContainer,
              { transform: [{ translateX: starX }, { translateY: starY }] },
            ]}
          >
            <Animated.View
              style={{
                transform: [{ scale: starScale }, { rotate: rotation }],
              }}
            >
              <Animated.View style={[styles.starGlow, { opacity: glowOpacity }]}>
                <LinearGradient
                  colors={['#FCD34D', '#FBBF24', '#F59E0B']}
                  style={styles.star}
                >
                  <Text style={styles.starEmoji}>⭐</Text>
                </LinearGradient>
              </Animated.View>
            </Animated.View>
          </Animated.View>

          {showFeedback && (
            <View pointerEvents="none" style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          )}

          {!showFeedback && (
            <View pointerEvents="none" style={styles.instructionBadge}>
              <Text style={styles.instructionText}>✨ Tap the bouncing star!</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            👀 Visual Tracking • 🎯 Hand-Eye Coordination • ⚡ Reaction Timing
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
            {hits >= requiredTaps ? '🎊 Amazing! You did it! 🎊' : `Round ${round} • Caught: ${hits} / ${requiredTaps}`}
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
  playArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  starContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: STAR_SIZE,
    height: STAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 10,
  },
  starGlow: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    borderRadius: STAR_SIZE / 2,
    shadowColor: '#FCD34D',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  star: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    borderRadius: STAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  starEmoji: {
    fontSize: 60,
  },
  instructionBadge: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(252, 211, 77, 0.95)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FBBF24',
    shadowColor: '#FCD34D',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderTopWidth: 2,
    borderTopColor: '#FCD34D',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FCD34D',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotFilled: {
    backgroundColor: '#FCD34D',
    shadowColor: '#FCD34D',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FCD34D',
    textAlign: 'center',
  },
});

