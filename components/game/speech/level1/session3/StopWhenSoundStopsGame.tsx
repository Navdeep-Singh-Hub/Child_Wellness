import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { createGlowLoop } from '@/utils/animatedGlowLoop';
import { getSoundAsset } from '@/utils/soundAssets';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Ionicons } from '@expo/vector-icons';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  clearScheduledSpeech,
  speak as speakTTS,
  DEFAULT_TTS_RATE,
  stopTTS,
} from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
  requiredTrials?: number;
};

const BALL_SIZE = 100;

export const StopWhenSoundStopsGame: React.FC<Props> = ({
  onBack,
  onComplete,
  requiredTrials = 5,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [trials, setTrials] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameState, setGameState] = useState<'moving' | 'stopped' | 'feedback'>('moving');
  const [gameFinished, setGameFinished] = useState(false);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    totalTrials: number;
    correctTrials: number;
    accuracy: number;
  } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [currentTrialResult, setCurrentTrialResult] = useState<'correct' | 'incorrect' | null>(null);
  const stopBallCalledRef = useRef(false); // Guard to prevent double execution
  const gameStateRef = useRef<'moving' | 'stopped' | 'feedback'>('moving');
  const gameActiveRef = useRef(true);
  const gameTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleGameTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      if (!gameActiveRef.current) return;
      fn();
    }, delay);
    gameTimersRef.current.push(id);
    return id;
  }, []);

  const clearGameTimeouts = useCallback(() => {
    gameTimersRef.current.forEach(t => clearTimeout(t));
    gameTimersRef.current = [];
  }, []);

  const speakGame = useCallback((text: string, rate = DEFAULT_TTS_RATE) => {
    if (!gameActiveRef.current) return;
    try {
      clearScheduledSpeech();
      speakTTS(text, rate);
    } catch (e) {
      console.warn('speak error', e);
    }
  }, []);

  const ballX = useRef(new Animated.Value(0)).current;
  const ballY = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const ballGlow = useRef(new Animated.Value(0.5)).current;
  const movementAnim = useRef<Animated.CompositeAnimation | null>(null);
  const stopTimer = useRef<NodeJS.Timeout | null>(null);
  const soundTimer = useRef<NodeJS.Timeout | null>(null);
  const continuousSoundRef = useRef<ExpoAudio.Sound | HTMLAudioElement | null>(null);

  const ballGlowLoop = useMemo(
    () => createGlowLoop(ballGlow, { min: 0, max: 1, duration: 600, useNativeDriver: false }),
    [ballGlow],
  );
  const ballScaleLoop = useMemo(
    () => createGlowLoop(ballScale, { min: 1, max: 1.15, duration: 500, useNativeDriver: false }),
    [ballScale],
  );

  const stopPulseAnimations = useCallback(() => {
    ballGlowLoop.stop();
    ballScaleLoop.stop();
  }, [ballGlowLoop, ballScaleLoop]);

  const setGameStateSafe = useCallback((state: 'moving' | 'stopped' | 'feedback') => {
    gameStateRef.current = state;
    setGameState(state);
  }, []);

  // Helper function to stop continuous sound
  const stopContinuousSound = useCallback(async () => {
    if (continuousSoundRef.current) {
      try {
        if (Platform.OS === 'web') {
          const audio = continuousSoundRef.current as HTMLAudioElement;
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false;
        } else {
          const sound = continuousSoundRef.current as ExpoAudio.Sound;
          await sound.stopAsync();
          await sound.setIsLoopingAsync(false);
          await sound.unloadAsync();
        }
        continuousSoundRef.current = null;
      } catch (e) {
        console.warn('Error stopping continuous sound:', e);
        continuousSoundRef.current = null;
      }
    }
  }, []);

  const shutdownGame = useCallback(() => {
    gameActiveRef.current = false;
    clearGameTimeouts();
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    if (soundTimer.current) {
      clearTimeout(soundTimer.current);
      soundTimer.current = null;
    }
    movementAnim.current?.stop();
    stopPulseAnimations();
    void stopContinuousSound();
    clearScheduledSpeech();
    stopTTS();
    stopAllSpeech();
    cleanupSounds();
  }, [clearGameTimeouts, stopContinuousSound, stopPulseAnimations]);

  const finishGame = useCallback(async () => {
    if (gameFinished || !gameActiveRef.current) return;
    
    const stats = {
      totalTrials: requiredTrials,
      correctTrials: correct,
      accuracy: Math.round((correct / requiredTrials) * 100),
    };
    setFinalStats(stats);
    setGameFinished(true);
    speakGame('Amazing! You completed all the trials!');

    try {
      const xpAwarded = correct * 10;
      const result = await logGameAndAward({
        type: 'stop-when-sound-stops',
        correct: correct,
        total: requiredTrials,
        accuracy: stats.accuracy,
        xpAwarded,
        skillTags: ['sound-movement-integration', 'listening-for-changes', 'self-control', 'auditory-focus'],
        meta: {
          totalTrials: requiredTrials,
          correctTrials: correct,
        },
      });
      setLogTimestamp(result?.last?.at ?? null);
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }, [correct, requiredTrials, gameFinished, speakGame]);

  const handleTimeoutRef = useRef<() => void>(() => {});
  const startTrialRef = useRef<() => Promise<void>>(async () => {});

  const stopBall = useCallback(async () => {
    if (stopBallCalledRef.current) return;
    stopBallCalledRef.current = true;

    if (soundTimer.current) {
      clearTimeout(soundTimer.current);
      soundTimer.current = null;
    }

    movementAnim.current?.stop();
    await stopContinuousSound();
    setGameStateSafe('stopped');

    ballGlow.setValue(0);
    ballScale.setValue(1);
    stopPulseAnimations();
    ballGlowLoop.start();
    ballScaleLoop.start();

    speakGame('Sound stopped! Tap now!');

    stopTimer.current = scheduleGameTimeout(() => {
      if (gameStateRef.current === 'stopped') {
        handleTimeoutRef.current();
      }
    }, 3000) as unknown as NodeJS.Timeout;
  }, [
    ballGlow,
    ballScale,
    ballGlowLoop,
    ballScaleLoop,
    setGameStateSafe,
    stopContinuousSound,
    stopPulseAnimations,
    speakGame,
    scheduleGameTimeout,
  ]);

  const startTrial = useCallback(async () => {
    if (!gameActiveRef.current) return;
    // Stop any previous continuous sound
    await stopContinuousSound();
    stopPulseAnimations();
    
    // Reset guard
    stopBallCalledRef.current = false;
    
    // Clear any existing timers
    if (stopTimer.current) clearTimeout(stopTimer.current);
    if (soundTimer.current) clearTimeout(soundTimer.current);
    
    // Stop any existing animations
    movementAnim.current?.stop();
    
    // Reset animation values
    ballScale.setValue(1);
    ballGlow.setValue(0.5);
    
    // Reset trial result
    setCurrentTrialResult(null);
    setGameStateSafe('moving');

    // Random starting position
    const startX = 80 + Math.random() * (SCREEN_WIDTH - 160);
    const startY = 150 + Math.random() * (SCREEN_HEIGHT - 400);
    ballX.setValue(startX);
    ballY.setValue(startY);

    // Random end position
    const endX = 80 + Math.random() * (SCREEN_WIDTH - 160);
    const endY = 150 + Math.random() * (SCREEN_HEIGHT - 400);

    // Start continuous sound
    const playContinuousSound = async () => {
      const soundAsset = getSoundAsset('beep-continuous');
      if (!soundAsset) {
        // No sound available, continue without sound
        return;
      }

      try {
        if (Platform.OS === 'web') {
          const audio = new Audio();
          const audioSrc = typeof soundAsset === 'string' 
            ? soundAsset 
            : (soundAsset as any).default || (soundAsset as any).uri || '';
          audio.src = audioSrc;
          audio.loop = true;
          audio.volume = 0.7;
          await audio.play();
          continuousSoundRef.current = audio;
        } else {
          await ExpoAudio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });
          const { sound } = await ExpoAudio.Sound.createAsync(
            soundAsset,
            { volume: 0.7, shouldPlay: true, isLooping: true },
          );
          continuousSoundRef.current = sound;
        }
      } catch (e) {
        console.warn('Error playing continuous sound:', e);
        // No sound available, continue without sound
      }
    };
    
    playContinuousSound();

    // Move duration: 2-4 seconds
    const moveDuration = 2000 + Math.random() * 2000;

    // Sound should stop BEFORE or DURING movement, not after
    // Sound stop time: 1.5 to (moveDuration - 500ms) to ensure it stops during movement
    const maxSoundStopTime = Math.max(1500, moveDuration - 500);
    const soundStopTime = 1500 + Math.random() * (maxSoundStopTime - 1500);

    movementAnim.current = Animated.parallel([
      Animated.timing(ballX, {
        toValue: endX,
        duration: moveDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(ballY, {
        toValue: endY,
        duration: moveDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]);

    // Set timer to stop sound (this is the primary trigger)
    soundTimer.current = scheduleGameTimeout(() => {
      if (!stopBallCalledRef.current) {
        void stopBall();
      }
    }, soundStopTime) as unknown as NodeJS.Timeout;

    movementAnim.current.start(({ finished }) => {
      if (finished && !stopBallCalledRef.current) {
        void stopBall();
      }
    });
  }, [
    ballX,
    ballY,
    ballGlow,
    ballScale,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    stopBall,
    stopContinuousSound,
    stopPulseAnimations,
    setGameStateSafe,
    scheduleGameTimeout,
  ]);

  startTrialRef.current = startTrial;

  useEffect(() => {
    if (SCREEN_WIDTH < 100 || SCREEN_HEIGHT < 100) return;

    speakGame('Watch the ball! When the sound stops, tap it!');
    scheduleGameTimeout(() => {
      void startTrialRef.current();
    }, 2000);
  }, [SCREEN_WIDTH, SCREEN_HEIGHT, speakGame, scheduleGameTimeout]);

  useEffect(() => {
    gameActiveRef.current = true;
    return () => {
      shutdownGame();
    };
  }, [shutdownGame]);

  useEffect(() => {
    if (trials >= requiredTrials && !gameFinished) {
      void finishGame();
    }
  }, [trials, requiredTrials, gameFinished, finishGame]);

  const handleBallTap = () => {
    const state = gameStateRef.current;
    if (state === 'moving') {
      handleEarlyTap();
    } else if (state === 'stopped') {
      handleCorrectTap();
    }
  };

  const handleEarlyTap = () => {
    // Stop any pending timers
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    if (soundTimer.current) {
      clearTimeout(soundTimer.current);
      soundTimer.current = null;
    }
    
    stopPulseAnimations();
    void stopContinuousSound();
    movementAnim.current?.stop();
    
    // Mark as incorrect
    setCurrentTrialResult('incorrect');
    setGameStateSafe('feedback');
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    speakGame('Wait! The sound is still playing!');

    scheduleGameTimeout(() => {
      const nextTrials = trials + 1;
      setTrials(nextTrials);
      if (nextTrials < requiredTrials) {
        scheduleGameTimeout(() => {
          speakGame('Watch the ball! When the sound stops, tap it!');
          void startTrialRef.current();
        }, 2000);
      }
    }, 2000);
  };

  const handleCorrectTap = () => {
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    stopPulseAnimations();

    setCurrentTrialResult('correct');
    setCorrect(prev => prev + 1);
    setGameStateSafe('feedback');
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    // Show success animation instead of TTS
    setShowRoundSuccess(true);

    // Success animation
    Animated.sequence([
      Animated.spring(ballScale, {
        toValue: 1.5,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      Animated.spring(ballScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
    ]).start();

    scheduleGameTimeout(() => {
      setShowRoundSuccess(false);
      const nextTrials = trials + 1;
      setTrials(nextTrials);
      if (nextTrials < requiredTrials) {
        scheduleGameTimeout(() => {
          void startTrialRef.current();
        }, 500);
      }
    }, 2500);
  };

  const handleTimeout = useCallback(() => {
    stopPulseAnimations();
    setCurrentTrialResult('incorrect');
    setGameStateSafe('feedback');
    speakGame('Time\'s up! Try again!');

    scheduleGameTimeout(() => {
      const nextTrials = trials + 1;
      setTrials(nextTrials);
      if (nextTrials < requiredTrials) {
        scheduleGameTimeout(() => {
          speakGame('Watch the ball! When the sound stops, tap it!');
          void startTrialRef.current();
        }, 2000);
      }
    }, 2000);
  }, [requiredTrials, setGameStateSafe, stopPulseAnimations, trials, speakGame, scheduleGameTimeout]);

  handleTimeoutRef.current = handleTimeout;

  const progressDots = Array.from({ length: requiredTrials }, (_, i) => i < trials);

  if (gameFinished && finalStats) {
    const accuracyPct = finalStats.accuracy;
    return (
      <CongratulationsScreen
        message="Excellent Timing!"
        showButtons={true}
        correct={finalStats.correctTrials}
        total={finalStats.totalTrials}
        accuracy={accuracyPct}
        xpAwarded={finalStats.correctTrials * 10}
        onContinue={async () => {
          await stopContinuousSound();
          clearScheduledSpeech();
          stopTTS();
          onComplete?.();
        }}
        onHome={async () => {
          await stopContinuousSound();
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
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              shutdownGame();
              onBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Stop When Sound Stops</Text>
            <Text style={styles.headerSubtitle}>Listen and wait!</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.gameArea}>
          <Animated.View
            style={[
              styles.ball,
              {
                transform: [
                  { translateX: Animated.subtract(ballX, BALL_SIZE / 2) },
                  { translateY: Animated.subtract(ballY, BALL_SIZE / 2) },
                  { scale: ballScale },
                ],
                shadowColor: gameState === 'stopped' ? '#22C55E' : '#3B82F6',
                shadowOpacity: ballGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
                shadowRadius: 40,
                shadowOffset: { width: 0, height: 0 },
                elevation: 20,
              },
            ]}
          >
            <Pressable
              onPress={handleBallTap}
              style={styles.ballPressable}
              hitSlop={24}
            >
              <LinearGradient
                colors={gameState === 'stopped' ? ['#22C55E', '#16A34A'] : ['#3B82F6', '#2563EB']}
                style={styles.ballGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.ballEmoji}>⚽</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {gameState === 'stopped' && (
            <View style={styles.instructionBadge}>
              <Text style={styles.instructionText}>Sound stopped! Tap now! 👆</Text>
            </View>
          )}

          {gameState === 'feedback' && currentTrialResult && (
            <View style={styles.feedbackBadge}>
              <Text style={styles.feedbackText}>
                {currentTrialResult === 'correct' ? 'Great job! ✅' : 'Try again! 💪'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔊 Sound–Movement Integration • 👂 Listening for Changes • 🛑 Self-Control
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
            {trials >= requiredTrials
              ? '🎊 Amazing! You did it! 🎊'
              : `Trials: ${trials} / ${requiredTrials}`}
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
    borderBottomColor: '#64748B',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
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
    position: 'relative',
  },
  ballPressable: {
    width: '100%',
    height: '100%',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    overflow: 'hidden',
  },
  ballGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballEmoji: {
    fontSize: 60,
  },
  instructionBadge: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#FBBF24',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#92400E',
  },
  feedbackBadge: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    borderWidth: 3,
    borderColor: '#22C55E',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#065F46',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#64748B',
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
    color: '#1E293B',
    textAlign: 'center',
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

