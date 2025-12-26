import { useHandDetectionWeb } from '@/hooks/useHandDetectionWeb';
import { logGameAndAward } from '@/utils/api';
import { generateArcPath, getPathProgress, isPointOnPath, Point } from '@/utils/pathUtils';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import Svg, { Circle, Defs, Line, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { SparkleBurst } from '@/components/game/FX';
import ResultCard from '@/components/game/ResultCard';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredRounds?: number;
};

const DEFAULT_TTS_RATE = 0.75;
const TOTAL_ROUNDS = 5;
const COMPLETION_THRESHOLD = 0.9; // 90% completion required

// Difficulty progression: path thickness and curve length
const DIFFICULTY_CONFIG = [
  { pathThickness: 50, tolerance: 60, curveLength: 0.5 }, // Round 1: Very thick, short curve
  { pathThickness: 40, tolerance: 50, curveLength: 0.6 }, // Round 2: Thick, medium curve
  { pathThickness: 30, tolerance: 40, curveLength: 0.7 }, // Round 3: Medium, longer curve
  { pathThickness: 25, tolerance: 35, curveLength: 0.8 }, // Round 4: Thinner, longer curve
  { pathThickness: 20, tolerance: 30, curveLength: 0.9 }, // Round 5: Thin, longest curve
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

  // Simple state management
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    totalRounds: number;
    successfulTraces: number;
    averageAccuracy: number;
    totalTime: number;
    xpAwarded: number;
  } | null>(null);

  const [currentRound, setCurrentRound] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1 progress along curve
  const [maxProgress, setMaxProgress] = useState(0); // Forward-only tracking
  const [isOnPath, setIsOnPath] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [glowPosition, setGlowPosition] = useState<Point | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [pathHighlight, setPathHighlight] = useState(false);
  const [canPlay, setCanPlay] = useState(true);

  // Hand detection hook
  const handDetection = useHandDetectionWeb(canPlay && !gameFinished);
  const previewRef = useRef<View>(null);

  // Scoring
  const [successfulTraces, setSuccessfulTraces] = useState(0);
  const [totalAccuracy, setTotalAccuracy] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [timeOnPath, setTimeOnPath] = useState(0);

  // Animations
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const sparkleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearScheduledSpeech();
      if (sparkleTimerRef.current) {
        clearInterval(sparkleTimerRef.current);
      }
    };
  }, []);

  // Generate single smooth rainbow arc
  const generateRainbowArc = useCallback((roundIndex: number): Point[] => {
    const config = DIFFICULTY_CONFIG[Math.min(roundIndex, DIFFICULTY_CONFIG.length - 1)];
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT * 0.5;
    
    // Calculate radius based on curve length
    const baseRadius = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.25;
    const radius = baseRadius * config.curveLength;
    
    // Create smooth arc from left to right (like a rainbow)
    const startAngle = Math.PI * 0.2; // Start angle
    const endAngle = Math.PI * 0.8;   // End angle
    
    return generateArcPath(
      { x: centerX, y: centerY },
      radius,
      startAngle,
      endAngle,
      100 // Smooth curve with 100 points
    );
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  // Convert path to SVG string
  const pathToSvgString = useCallback((path: Point[]): string => {
    if (path.length === 0) return '';
    let d = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
      d += ` L ${path[i].x} ${path[i].y}`;
    }
    return d;
  }, []);

  // Convert hand landmark (normalized 0-1) to screen coordinates
  const convertHandToScreenCoords = useCallback((handPos: { x: number; y: number } | null): Point | null => {
    if (!handPos) return null;
    // MediaPipe returns normalized coordinates (0-1), convert to screen pixels
    return {
      x: handPos.x * SCREEN_WIDTH,
      y: handPos.y * SCREEN_HEIGHT,
    };
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  // Convert normalized landmark to screen coordinates
  // MediaPipe landmarks are normalized (0-1) relative to video feed dimensions
  // We need to account for video display scaling (objectFit: cover)
  const convertLandmarkToScreen = useCallback((landmark: { x: number; y: number }): Point => {
    // Get the video element to check its actual dimensions
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const video = document.querySelector('video[data-hand-preview-video]') as HTMLVideoElement;
      if (video && video.videoWidth && video.videoHeight && video.offsetWidth && video.offsetHeight) {
        const videoWidth = video.videoWidth;  // Native video width
        const videoHeight = video.videoHeight; // Native video height
        const displayWidth = video.offsetWidth;  // Displayed width
        const displayHeight = video.offsetHeight; // Displayed height
        
        const videoAspect = videoWidth / videoHeight;
        const displayAspect = displayWidth / displayHeight;
        
        let scaledWidth = displayWidth;
        let scaledHeight = displayHeight;
        let offsetX = 0;
        let offsetY = 0;
        
        // Calculate how video is scaled (objectFit: cover)
        if (videoAspect > displayAspect) {
          // Video is wider - scale to fit height, crop sides
          scaledHeight = displayHeight;
          scaledWidth = displayHeight * videoAspect;
          offsetX = (displayWidth - scaledWidth) / 2;
        } else {
          // Video is taller - scale to fit width, crop top/bottom
          scaledWidth = displayWidth;
          scaledHeight = displayWidth / videoAspect;
          offsetY = (displayHeight - scaledHeight) / 2;
        }
        
        // Get video container position
        const container = video.parentElement;
        const containerRect = container?.getBoundingClientRect();
        const containerX = containerRect?.left || 0;
        const containerY = containerRect?.top || 0;
        
        // Convert normalized video coordinates (0-1) to screen coordinates
        // MediaPipe coordinates are relative to videoWidth x videoHeight
        const x = landmark.x * scaledWidth + offsetX + containerX;
        const y = landmark.y * scaledHeight + offsetY + containerY;
        
        return { x, y };
      }
    }
    
    // Fallback: direct conversion (assumes video fills screen exactly)
    return {
      x: landmark.x * SCREEN_WIDTH,
      y: landmark.y * SCREEN_HEIGHT,
    };
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  // Hand skeleton connections (MediaPipe hand landmarks structure)
  const handConnections = [
    // Wrist to finger bases
    [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],
    // Thumb
    [1, 2], [2, 3], [3, 4],
    // Index finger
    [5, 6], [6, 7], [7, 8],
    // Middle finger
    [9, 10], [10, 11], [11, 12],
    // Ring finger
    [13, 14], [14, 15], [15, 16],
    // Pinky
    [17, 18], [18, 19], [19, 20],
  ];

  const handleTraceStart = useCallback((point: Point) => {
    setIsTracing(true);
    setGlowPosition(point);
    setMaxProgress(0);
    setProgress(0);
    setTimeOnPath(0);
    
    // Animate glow appearance
    Animated.spring(glowScale, {
      toValue: 1.2,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [glowScale]);

  const startNextRound = useCallback(() => {
    setCurrentRound(prev => prev + 1);
    setProgress(0);
    setMaxProgress(0);
    setRoundComplete(false);
    setGlowPosition(null);
    setTimeOnPath(0);
    progressBarWidth.setValue(0);
    
    const nextRound = currentRound + 1;
    const newPath = generateRainbowArc(nextRound);
    setCurrentPath(newPath);
    
    speak(`Round ${nextRound + 1}! Point your finger at the rainbow!`);
  }, [currentRound, generateRainbowArc]);

  const finishGame = useCallback(async () => {
    const totalTime = Date.now() - gameStartTime;
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
  }, [successfulTraces, requiredRounds, totalAccuracy, gameStartTime, onComplete]);

  const handleRoundComplete = useCallback(() => {
    setRoundComplete(true);
    setIsTracing(false);
    setShowSparkles(false);
    
    if (sparkleTimerRef.current) {
      clearInterval(sparkleTimerRef.current);
      sparkleTimerRef.current = null;
    }

    setSuccessfulTraces(prev => prev + 1);
    
    // Calculate accuracy
    const roundTime = Date.now() - gameStartTime;
    const accuracy = timeOnPath > 0 ? Math.min(100, (timeOnPath / (roundTime / 50)) * 100) : 0;
    setTotalAccuracy(prev => prev + accuracy);

    // Celebration: sparkles + "Good tracing!"
    setShowSparkles(true);
    speak('Good tracing!');
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setTimeout(() => {
      setShowSparkles(false);
    }, 2000);

    // Move to next round
    setTimeout(() => {
      if (currentRound < requiredRounds - 1) {
        startNextRound();
      } else {
        finishGame();
      }
    }, 2500);
  }, [currentRound, requiredRounds, gameStartTime, timeOnPath, startNextRound, finishGame]);

  const handleTraceMove = useCallback((point: Point) => {
    if (!currentPath.length || roundComplete) return;

    // Glow follows finger - always update position during drag
    setGlowPosition(point);

    const config = DIFFICULTY_CONFIG[Math.min(currentRound, DIFFICULTY_CONFIG.length - 1)];
    const onPath = isPointOnPath(point, currentPath, config.tolerance);
    setIsOnPath(onPath);

    if (onPath) {
      // Calculate progress using distance-based method
      const newProgress = getPathProgress(point, currentPath, config.tolerance);
      
      // Forward-only progress (can't go backward)
      setMaxProgress(prev => {
        if (newProgress > prev) {
          setProgress(newProgress);
          setTimeOnPath(time => time + 1);

          // Update progress bar
          Animated.timing(progressBarWidth, {
            toValue: newProgress * 100,
            duration: 50,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();

          // Continuous sparkles while tracing correctly
          if (!sparkleTimerRef.current) {
            setShowSparkles(true);
            sparkleTimerRef.current = setInterval(() => {
              setShowSparkles(true);
              setTimeout(() => setShowSparkles(false), 300);
            }, 500);
          }

          // Check completion
          if (newProgress >= COMPLETION_THRESHOLD && !roundComplete) {
            handleRoundComplete();
          }
          return newProgress;
        }
        return prev;
      });
    } else {
      // Off-path: gentle vibration + path highlights
      setShowSparkles(false);
      if (sparkleTimerRef.current) {
        clearInterval(sparkleTimerRef.current);
        sparkleTimerRef.current = null;
      }

      // Path highlights to guide back
      setPathHighlight(true);
      setTimeout(() => setPathHighlight(false), 400);

      // Gentle vibration
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  }, [currentPath, currentRound, roundComplete, progressBarWidth, handleRoundComplete]);

  const handleTraceEnd = useCallback(() => {
    setIsTracing(false);
    setShowSparkles(false);
    
    if (sparkleTimerRef.current) {
      clearInterval(sparkleTimerRef.current);
      sparkleTimerRef.current = null;
    }

    // Animate glow disappearance
    Animated.spring(glowScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [glowScale]);

  const startRound = useCallback(() => {
    const path = generateRainbowArc(currentRound);
    setCurrentPath(path);
    setGameStartTime(Date.now());
    setRoundComplete(false);
    setProgress(0);
    setMaxProgress(0);
    setTimeOnPath(0);
    progressBarWidth.setValue(0);
    
    speak('Point your finger at the rainbow!');
  }, [currentRound, generateRainbowArc]);

  // Debug: Log landmarks when they change
  useEffect(() => {
    if (handDetection.landmarks?.allLandmarks) {
      console.log('🎯 Landmarks detected:', {
        count: handDetection.landmarks.allLandmarks.length,
        isDetecting: handDetection.isDetecting,
        hasIndexFinger: !!handDetection.landmarks.indexFingerTip,
        firstLandmark: handDetection.landmarks.allLandmarks[0],
      });
    } else {
      console.log('⚠️ No landmarks available:', {
        hasLandmarks: !!handDetection.landmarks,
        isDetecting: handDetection.isDetecting,
      });
    }
  }, [handDetection.landmarks, handDetection.isDetecting]);

  // Watch hand position and update tracing
  useEffect(() => {
    if (roundComplete || !currentPath.length) {
      return;
    }

    if (!handDetection.handPosition) {
      // Hand lost - stop tracing
      if (isTracing) {
        setIsTracing(false);
        handleTraceEnd();
      }
      return;
    }

    const screenPoint = convertHandToScreenCoords(handDetection.handPosition);
    if (!screenPoint) return;

    // Start tracing if hand detected
    if (!isTracing) {
      handleTraceStart(screenPoint);
    } else {
      handleTraceMove(screenPoint);
    }
  }, [handDetection.handPosition, handDetection.isDetecting, roundComplete, currentPath.length, isTracing, convertHandToScreenCoords, handleTraceStart, handleTraceMove, handleTraceEnd]);

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
        logTimestamp={null}
        onHome={onBack}
        onPlayAgain={() => {
          setGameFinished(false);
          setFinalStats(null);
          setCurrentRound(0);
          setSuccessfulTraces(0);
          setTotalAccuracy(0);
          setProgress(0);
          setMaxProgress(0);
          setRoundComplete(false);
          progressBarWidth.setValue(0);
          startRound();
        }}
      />
    );
  }

  const config = DIFFICULTY_CONFIG[Math.min(currentRound, DIFFICULTY_CONFIG.length - 1)];
  const pathString = pathToSvgString(currentPath);
  const glowSize = getResponsiveSize(45, isTablet, isMobile);
  const startPoint = currentPath[0];
  const endPoint = currentPath[currentPath.length - 1];

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
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>

        {/* Camera Preview Container - Always render so hook can find it */}
        <View
          ref={previewRef}
          style={[
            StyleSheet.absoluteFill,
            styles.cameraContainer,
          ]}
          nativeID={handDetection.previewContainerId || 'hand-preview-container'}
          {...(Platform.OS === 'web' && { 
            'data-native-id': handDetection.previewContainerId || 'hand-preview-container',
            'data-hand-preview-container': 'true',
            // Also set the hardcoded ID the hook looks for
            'data-native-id-backup': 'hand-preview-container'
          })}
          collapsable={false}
        >
          {Platform.OS === 'web' && (
            <>
              {(!handDetection.hasCamera || !handDetection.isDetecting) && (
                <View style={styles.cameraLoading}>
                  <Text style={styles.cameraLoadingText}>
                    {!handDetection.hasCamera ? 'Requesting camera access...' : 'Show your hand to the camera'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Error Message */}
        {handDetection.error && (
          <View style={[styles.errorBanner, isMobile && styles.errorBannerMobile]}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{handDetection.error}</Text>
          </View>
        )}

        {/* Game Area */}
        <View 
          style={styles.gameArea} 
          collapsable={false}
        >
          <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
            <Defs>
              {/* Rainbow gradient */}
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

            {/* Path highlight when off-path */}
            {pathHighlight && (
              <Path
                d={pathString}
                stroke="#F59E0B"
                strokeWidth={config.pathThickness + 15}
                strokeOpacity={0.4}
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Main rainbow path - big smooth curve */}
            <Path
              d={pathString}
              stroke="url(#rainbowGradient)"
              strokeWidth={config.pathThickness}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Start marker (green circle) */}
            {startPoint && !isTracing && (
              <Circle
                cx={startPoint.x}
                cy={startPoint.y}
                r={getResponsiveSize(18, isTablet, isMobile)}
                fill="#22C55E"
                opacity={0.9}
              />
            )}

            {/* End marker (yellow circle/star) */}
            {endPoint && (
              <Circle
                cx={endPoint.x}
                cy={endPoint.y}
                r={getResponsiveSize(15, isTablet, isMobile)}
                fill="#FCD34D"
                stroke="#F59E0B"
                strokeWidth={2}
                opacity={progress >= COMPLETION_THRESHOLD ? 1 : 0.7}
              />
            )}

            {/* Hand skeleton overlay - draw landmarks and connections */}
            {handDetection.landmarks?.allLandmarks && handDetection.landmarks.allLandmarks.length > 0 && (
              <>
                {/* Draw skeleton connections (white lines) */}
                {handConnections.map(([fromIdx, toIdx], idx) => {
                  const fromLandmark = handDetection.landmarks?.allLandmarks?.[fromIdx];
                  const toLandmark = handDetection.landmarks?.allLandmarks?.[toIdx];
                  if (!fromLandmark || !toLandmark) return null;
                  
                  const fromPoint = convertLandmarkToScreen({ x: fromLandmark.x, y: fromLandmark.y });
                  const toPoint = convertLandmarkToScreen({ x: toLandmark.x, y: toLandmark.y });
                  
                  return (
                    <Line
                      key={`connection-${idx}`}
                      x1={fromPoint.x}
                      y1={fromPoint.y}
                      x2={toPoint.x}
                      y2={toPoint.y}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.8}
                    />
                  );
                })}
                
                {/* Draw all 21 landmarks as red dots */}
                {handDetection.landmarks.allLandmarks.map((landmark, idx) => {
                  const point = convertLandmarkToScreen({ x: landmark.x, y: landmark.y });
                  // Make landmarks more visible
                  return (
                    <Circle
                      key={`landmark-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r={6}
                      fill="#FF0000"
                      opacity={1}
                      stroke="#FFFFFF"
                      strokeWidth={1}
                    />
                  );
                })}
                
                {/* Blue dot at index finger tip (drawing point) */}
                {handDetection.landmarks.indexFingerTip && (
                  <Circle
                    cx={convertLandmarkToScreen(handDetection.landmarks.indexFingerTip).x}
                    cy={convertLandmarkToScreen(handDetection.landmarks.indexFingerTip).y}
                    r={8}
                    fill="#3B82F6"
                    opacity={1}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
              </>
            )}

            {/* Glow effect - follows finger */}
            {glowPosition && (
              <>
                <Circle
                  cx={glowPosition.x}
                  cy={glowPosition.y}
                  r={glowSize}
                  fill={isOnPath ? '#22C55E' : '#EF4444'}
                  opacity={0.4}
                />
                <Circle
                  cx={glowPosition.x}
                  cy={glowPosition.y}
                  r={glowSize / 2}
                  fill={isOnPath ? '#22C55E' : '#EF4444'}
                  opacity={0.9}
                />
              </>
            )}
          </Svg>

          {/* Instructions */}
          {!isTracing && !roundComplete && (
            <View style={styles.instructionContainer}>
              <Text style={[styles.instructionText, isMobile && styles.instructionTextMobile]}>
                {handDetection.isDetecting 
                  ? '👆 Point your finger at the rainbow!' 
                  : '👋 Show your hand to the camera'}
              </Text>
            </View>
          )}

          {/* Mode indicator (like in the reference image) */}
          {handDetection.isDetecting && (
            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>Mode: DRAW</Text>
              <Text style={styles.modeSubtext}>Index: Draw | Point at rainbow to trace</Text>
            </View>
          )}

          {/* Sparkle effects */}
          <SparkleBurst visible={showSparkles} color="#FCD34D" count={12} size={8} />
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  progressContainerMobile: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 7,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressTextMobile: {
    fontSize: 12,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    zIndex: 1,
    pointerEvents: 'none',
  },
  cameraLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cameraLoadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    padding: 12,
    borderRadius: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorBannerMobile: {
    top: 80,
    left: 12,
    right: 12,
    padding: 10,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  modeIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 20,
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
});
