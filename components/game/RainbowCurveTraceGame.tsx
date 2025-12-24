import { logGameAndAward } from '@/utils/api';
import { generateArcPath, isPointOnPath, Point } from '@/utils/pathUtils';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import ResultCard from './ResultCard';
import { SparkleBurst, ResultToast } from './FX';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredRounds?: number;
};

const DEFAULT_TTS_RATE = 0.75;
const TOTAL_ROUNDS = 5;

// Difficulty progression: path thickness and tolerance
const DIFFICULTY_CONFIG = [
  { pathThickness: 40, tolerance: 50, curveLength: 0.6 }, // Level 1: Very thick, easy
  { pathThickness: 35, tolerance: 45, curveLength: 0.65 }, // Level 2
  { pathThickness: 30, tolerance: 40, curveLength: 0.7 }, // Level 3
  { pathThickness: 25, tolerance: 35, curveLength: 0.75 }, // Level 4
  { pathThickness: 20, tolerance: 30, curveLength: 0.8 }, // Level 5: Thinner, harder
];

// Responsive sizing
const getResponsiveSize = (baseSize: number, isTablet: boolean, isMobile: boolean) => {
  if (isTablet) return baseSize * 1.3;
  if (isMobile) return baseSize * 0.9;
  return baseSize;
};

let scheduledSpeechTimers: Array<ReturnType<typeof setTimeout>> = [];

function clearScheduledSpeech() {
  scheduledSpeechTimers.forEach(t => clearTimeout(t));
  scheduledSpeechTimers = [];
  try {
    Speech.stop();
  } catch {}
}

function speak(text: string, rate = DEFAULT_TTS_RATE) {
  try {
    clearScheduledSpeech();
    Speech.speak(text, { rate });
  } catch (e) {
    console.warn('speak error', e);
  }
}

export const RainbowCurveTraceGame: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredRounds = TOTAL_ROUNDS,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const isTablet = SCREEN_WIDTH >= 768;
  const isMobile = SCREEN_WIDTH < 600;

  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    totalRounds: number;
    successfulTraces: number;
    averageAccuracy: number;
    totalTime: number;
    xpAwarded: number;
  } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);

  // Game state
  const [currentRound, setCurrentRound] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0); // 0-1
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [glowPosition, setGlowPosition] = useState<Point | null>(null);
  const [isOnPath, setIsOnPath] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'success' | 'error' | null>(null);
  const [sparkleVisible, setSparkleVisible] = useState(false);

  // Scoring
  const [successfulTraces, setSuccessfulTraces] = useState(0);
  const [totalAccuracy, setTotalAccuracy] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(0);

  // Animations
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const [pathHighlightVisible, setPathHighlightVisible] = useState(false);
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (roundComplete) return;
        const { locationX, locationY } = evt.nativeEvent;
        handleTraceStart({ x: locationX, y: locationY });
      },
      onPanResponderMove: (evt) => {
        if (roundComplete || !isTracing) return;
        const { locationX, locationY } = evt.nativeEvent;
        handleTraceMove({ x: locationX, y: locationY });
      },
      onPanResponderRelease: () => {
        handleTraceEnd();
      },
    })
  ).current;

  // Generate curve path for current round
  const generatePath = useCallback((roundIndex: number): Point[] => {
    const config = DIFFICULTY_CONFIG[Math.min(roundIndex, DIFFICULTY_CONFIG.length - 1)];
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT * 0.5;
    const radius = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.3 * config.curveLength;
    const startAngle = Math.PI * 0.3;
    const endAngle = Math.PI * 0.7;
    
    return generateArcPath(
      { x: centerX, y: centerY },
      radius,
      startAngle,
      endAngle,
      100
    );
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  // Convert path to SVG path string
  const pathToSvgString = useCallback((path: Point[]): string => {
    if (path.length === 0) return '';
    let d = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
      d += ` L ${path[i].x} ${path[i].y}`;
    }
    return d;
  }, []);

  const handleTraceStart = (point: Point) => {
    setIsTracing(true);
    setGlowPosition(point);
    setTraceProgress(0);
    glowOpacity.setValue(1);
    
    Animated.parallel([
      Animated.spring(glowScale, {
        toValue: 1.2,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTraceMove = (point: Point) => {
    if (!currentPath.length) return;

    setGlowPosition(point);
    
    const config = DIFFICULTY_CONFIG[Math.min(currentRound, DIFFICULTY_CONFIG.length - 1)];
    const onPath = isPointOnPath(point, currentPath, config.tolerance);
    setIsOnPath(onPath);

    if (onPath) {
      // Calculate progress along path
      let minDist = Infinity;
      let closestIndex = 0;
      for (let i = 0; i < currentPath.length; i++) {
        const dx = point.x - currentPath[i].x;
        const dy = point.y - currentPath[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = i;
        }
      }
      const progress = closestIndex / currentPath.length;
      setTraceProgress(progress);

      // Update progress bar
      Animated.timing(progressBarWidth, {
        toValue: progress * 100,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Check if completed
      if (progress >= 0.95 && !roundComplete) {
        handleRoundComplete();
      }
    } else {
      // Off path - gentle feedback
      setPathHighlightVisible(true);
      setTimeout(() => setPathHighlightVisible(false), 400);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const handleTraceEnd = () => {
    setIsTracing(false);
    Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(glowScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRoundComplete = () => {
    setRoundComplete(true);
    setIsTracing(false);
    setSuccessfulTraces(prev => prev + 1);
    
    // Calculate accuracy (percentage of time on path)
    const accuracy = traceProgress * 100;
    setTotalAccuracy(prev => prev + accuracy);

    // Celebration
    setSparkleVisible(true);
    setShowFeedback('success');
    speak('Good tracing!');
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setTimeout(() => {
      setSparkleVisible(false);
      setShowFeedback(null);
    }, 1500);

    // Move to next round after delay
    setTimeout(() => {
      if (currentRound < requiredRounds - 1) {
        startNextRound();
      } else {
        finishGame();
      }
    }, 2000);
  };

  const startNextRound = () => {
    setCurrentRound(prev => prev + 1);
    setTraceProgress(0);
    setRoundComplete(false);
    setGlowPosition(null);
    setIsOnPath(true);
    progressBarWidth.setValue(0);
    
    const newPath = generatePath(currentRound + 1);
    setCurrentPath(newPath);
    setRoundStartTime(Date.now());
  };

  const startRound = useCallback(() => {
    const path = generatePath(currentRound);
    setCurrentPath(path);
    setRoundStartTime(Date.now());
    setRoundComplete(false);
    setTraceProgress(0);
    progressBarWidth.setValue(0);
    
    speak('Trace the rainbow curve!');
  }, [currentRound, generatePath]);

  const finishGame = useCallback(async () => {
    const totalTime = Date.now() - roundStartTime;
    const avgAccuracy = totalAccuracy / requiredRounds;
    const xp = successfulTraces * 50;

    setFinalStats({
      totalRounds: requiredRounds,
      successfulTraces,
      averageAccuracy: avgAccuracy,
      totalTime,
      xpAwarded: xp,
    });

    clearScheduledSpeech();

    try {
      await logGameAndAward({
        type: 'rainbow-curve-trace',
        correct: successfulTraces,
        total: requiredRounds,
        accuracy: avgAccuracy,
        xpAwarded: xp,
        mode: 'therapy',
        skillTags: ['wrist-rotation', 'fine-motor-control', 'curve-tracing', 'occupational-therapy'],
        incorrectAttempts: requiredRounds - successfulTraces,
        meta: {
          totalTime,
          averageAccuracy: avgAccuracy,
        },
      });
      setGameFinished(true);
      onComplete?.();
    } catch (e) {
      console.warn('Failed to save game log:', e instanceof Error ? e.message : 'Unknown error');
      setGameFinished(true);
    }
  }, [successfulTraces, requiredRounds, totalAccuracy, roundStartTime, onComplete]);

  useEffect(() => {
    startRound();
  }, []);

  if (gameFinished && finalStats) {
    return (
      <ResultCard
        correct={finalStats.successfulTraces}
        total={finalStats.totalRounds}
        accuracy={finalStats.averageAccuracy}
        xpAwarded={finalStats.xpAwarded}
        logTimestamp={logTimestamp}
        onHome={onBack}
        onPlayAgain={() => {
          setGameFinished(false);
          setFinalStats(null);
          setCurrentRound(0);
          setSuccessfulTraces(0);
          setTotalAccuracy(0);
          setTraceProgress(0);
          setRoundComplete(false);
          progressBarWidth.setValue(0);
          startRound();
        }}
      />
    );
  }

  const config = DIFFICULTY_CONFIG[Math.min(currentRound, DIFFICULTY_CONFIG.length - 1)];
  const pathString = pathToSvgString(currentPath);
  const glowSize = getResponsiveSize(40, isTablet, isMobile);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>Rainbow Curve Trace</Text>
            <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
              Round {currentRound + 1} / {requiredRounds}
            </Text>
          </View>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea} {...panResponder.panHandlers}>
          <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
            {/* Path highlight when off-path */}
            {pathHighlightVisible && (
              <Path
                d={pathString}
                stroke="#F59E0B"
                strokeWidth={config.pathThickness + 10}
                strokeOpacity={0.3}
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Main rainbow path */}
            <Path
              d={pathString}
              stroke="url(#rainbowGradient)"
              strokeWidth={config.pathThickness}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <Defs>
              <SvgLinearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FF0000" />
                <Stop offset="16.66%" stopColor="#FF7F00" />
                <Stop offset="33.33%" stopColor="#FFFF00" />
                <Stop offset="50%" stopColor="#00FF00" />
                <Stop offset="66.66%" stopColor="#0000FF" />
                <Stop offset="83.33%" stopColor="#4B0082" />
                <Stop offset="100%" stopColor="#9400D3" />
              </SvgLinearGradient>
            </Defs>

            {/* Glow effect at finger position */}
            {glowPosition && (
              <>
                <Circle
                  cx={glowPosition.x}
                  cy={glowPosition.y}
                  r={glowSize}
                  fill={isOnPath ? '#22C55E' : '#EF4444'}
                  opacity={0.3}
                />
                <Circle
                  cx={glowPosition.x}
                  cy={glowPosition.y}
                  r={glowSize / 2}
                  fill={isOnPath ? '#22C55E' : '#EF4444'}
                  opacity={1}
                />
              </>
            )}
          </Svg>

          {/* Progress Bar */}
          <View style={[styles.progressContainer, isMobile && styles.progressContainerMobile]}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressBarWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, isMobile && styles.progressTextMobile]}>
              {Math.round(traceProgress * 100)}% Complete
            </Text>
          </View>

          {/* Instructions */}
          {!isTracing && !roundComplete && (
            <View style={styles.instructionContainer}>
              <Text style={[styles.instructionText, isMobile && styles.instructionTextMobile]}>
                👆 Drag your finger along the rainbow curve!
              </Text>
            </View>
          )}

          {/* Feedback */}
          <ResultToast
            text={showFeedback === 'success' ? 'Good tracing!' : 'Stay on the path!'}
            type={showFeedback === 'success' ? 'ok' : 'bad'}
            show={showFeedback !== null}
          />

          {/* Sparkle Effect */}
          <SparkleBurst visible={sparkleVisible} color="#FCD34D" count={15} size={8} />
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
          <Text style={[styles.statsText, isMobile && styles.statsTextMobile]}>
            Successful: {successfulTraces} / {currentRound + 1}
          </Text>
        </View>
      </LinearGradient>
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
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(224, 242, 254, 0.95)',
  },
  headerMobile: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  titleMobile: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  subtitleMobile: {
    fontSize: 12,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  progressContainerMobile: {
    top: 10,
    left: 10,
    right: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressTextMobile: {
    fontSize: 12,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    zIndex: 10,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  instructionTextMobile: {
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  statsContainerMobile: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  statsTextMobile: {
    fontSize: 14,
  },
});

