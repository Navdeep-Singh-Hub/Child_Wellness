import GameInfoScreen from '@/components/game/GameInfoScreen';
import PoseConfirmButton from '@/components/game/occupational/level3/session9/PoseConfirmButton';
import ResultCard from '@/components/game/ResultCard';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PATTERN_DISPLAY_TIME = 4000; // Time to show pattern (ms)

type Movement = 'up' | 'down' | 'left' | 'right' | 'tap';

const MOVEMENT_EMOJIS: Record<Movement, string> = {
  'up': '⬆️',
  'down': '⬇️',
  'left': '⬅️',
  'right': '➡️',
  'tap': '👆',
};

const PatternCopyGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showPattern, setShowPattern] = useState(false);
  const [pattern, setPattern] = useState<Movement[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [canCopy, setCanCopy] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const canCopyRef = useRef(false);
  const hasCopiedRef = useRef(false);
  const doneRef = useRef(false);
  const roundRef = useRef(1);

  const movementScale = useRef(new Animated.Value(1)).current;
  const movementOpacity = useRef(new Animated.Value(0)).current;
  const patternTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const generatePattern = useCallback((): Movement[] => {
    const movements: Movement[] = ['up', 'down', 'left', 'right', 'tap'];
    const patternLength = 3; // 3 movements in pattern
    const newPattern: Movement[] = [];
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(movements[Math.floor(Math.random() * movements.length)]);
    }
    return newPattern;
  }, []);

  const showPatternOnScreen = useCallback(() => {
    if (done) return;

    const newPattern = generatePattern();
    setPattern(newPattern);
    setCurrentStep(0);
    setShowPattern(true);
    setCanCopy(false);
    canCopyRef.current = false;
    setHasCopied(false);
    hasCopiedRef.current = false;
    movementOpacity.setValue(0);
    movementScale.setValue(0.5);
    
    // Show pattern step by step
    let stepIndex = 0;
    const showStep = () => {
      if (stepIndex < newPattern.length) {
        setCurrentStep(stepIndex);
        movementOpacity.setValue(0);
        movementScale.setValue(0.5);
        
        Animated.parallel([
          Animated.spring(movementScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(movementOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        stepTimeoutRef.current = setTimeout(() => {
          movementOpacity.setValue(0);
          stepIndex++;
          if (stepIndex < newPattern.length) {
            showStep();
          } else {
            // Pattern complete, now allow copying
            setCanCopy(true);
            canCopyRef.current = true;
            if (Platform.OS === 'web') {
              setTimeout(() => {
                speakTTS('Do the pattern, then tap the button!', 0.8, 'en-US');
              }, 300);
            } else {
              speakTTS('Do the pattern, then tap the button!', 0.8, 'en-US');
            }
          }
        }, 1000) as unknown as NodeJS.Timeout;
      }
    };
    
    setTimeout(() => {
      showStep();
    }, 500);

    patternTimeoutRef.current = setTimeout(() => {
      // Pattern display complete
    }, PATTERN_DISPLAY_TIME) as unknown as NodeJS.Timeout;
  }, [done, movementScale, movementOpacity, generatePattern]);

  const endGame = useCallback(async () => {
    const total = TOTAL_ROUNDS;
    const xp = score * 15;
    const accuracy = (score / total) * 100;

    setFinalStats({ correct: score, total, xp });
    setDone(true);
    setShowPattern(false);

    if (patternTimeoutRef.current) {
      clearTimeout(patternTimeoutRef.current);
    }
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
    }

    try {
      await logGameAndAward({
        type: 'pattern-copy',
        correct: score,
        total,
        accuracy,
        xpAwarded: xp,
        skillTags: ['memory', 'motor', 'pattern-recognition'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (error) {
      console.error('Failed to log game:', error);
    }
  }, [score, router]);

  const handleConfirmPattern = useCallback(() => {
    if (!canCopyRef.current || doneRef.current || hasCopiedRef.current) return;

    hasCopiedRef.current = true;
    setHasCopied(true);
    setCanCopy(false);
    canCopyRef.current = false;
    setScore((s) => s + 1);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Great job!', 0.9, 'en-US');

    Animated.sequence([
      Animated.timing(movementScale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(movementScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      if (roundRef.current < TOTAL_ROUNDS) {
        setRound((r) => r + 1);
        setShowPattern(false);
        hasCopiedRef.current = false;
        movementOpacity.setValue(0);
        movementScale.setValue(1);
      } else {
        endGame();
      }
    }, 800);
  }, [movementScale, endGame]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    setTimeout(() => {
      showPatternOnScreen();
    }, 500);
  }, [showPatternOnScreen]);

  useEffect(() => {
    if (!showInfo && !done && round <= TOTAL_ROUNDS) {
      startRound();
    }
  }, [showInfo, round, done, startRound]);

  useEffect(() => {
    return () => {
      try {
        stopTTS();
      } catch (e) {
        // Ignore errors
      }
      cleanupSounds();
      if (patternTimeoutRef.current) {
        clearTimeout(patternTimeoutRef.current);
      }
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current);
      }
    };
  }, []);

  if (showInfo) {
    return (
      <GameInfoScreen
        title="Pattern Copy"
        emoji="🔄"
        description="Watch the movement pattern and repeat it!"
        skills={['Memory', 'Motor', 'Pattern recognition']}
        suitableFor="Children learning memory and motor pattern recognition"
        onStart={() => {
          setShowInfo(false);
        }}
        onBack={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }

  if (done && finalStats) {
    return (
      <SafeAreaView style={styles.container}>
        <ResultCard
          correct={finalStats.correct}
          total={finalStats.total}
          xpAwarded={finalStats.xp}
          onHome={() => {
            stopAllSpeech();
            cleanupSounds();
            onBack?.();
          }}
          onPlayAgain={() => {
            setRound(1);
            setScore(0);
            setDone(false);
            setFinalStats(null);
            setShowPattern(false);
            setHasCopied(false);
            movementOpacity.setValue(0);
            movementScale.setValue(1);
          }}
        />
      </SafeAreaView>
    );
  }

  const currentMovement = pattern[currentStep] || null;
  const isShowingPattern = showPattern && !canCopy;
  const patternReminder = pattern.map((m) => MOVEMENT_EMOJIS[m]).join('  ');

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Pattern Copy</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🔄 Score: {score}
        </Text>
        <Text style={styles.instruction}>
          {isShowingPattern ? 'Watch the pattern...' : canCopy ? 'Do the pattern, then tap the button!' : 'Get ready...'}
        </Text>
      </View>

      <View style={styles.gameArea}>
        {showPattern && (
          <View style={styles.patternContainer}>
            {isShowingPattern && currentMovement && (
              <Animated.View
                style={[
                  styles.movementContainer,
                  {
                    transform: [{ scale: movementScale }],
                    opacity: movementOpacity,
                  },
                ]}
              >
                <Text style={styles.movementEmoji}>{MOVEMENT_EMOJIS[currentMovement]}</Text>
                <Text style={styles.movementLabel}>{currentMovement.toUpperCase()}</Text>
              </Animated.View>
            )}

            {canCopy && (
              <View style={styles.copyControls}>
                <Text style={styles.copyInstruction}>Remember this pattern:</Text>
                <Text style={styles.patternReminder}>{patternReminder}</Text>
                <PoseConfirmButton
                  visible={canCopy}
                  label="✓ I did the same pattern!"
                  onPress={handleConfirmPattern}
                  color="#6366F1"
                />
              </View>
            )}
          </View>
        )}

        {!showPattern && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Get ready...</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Skills: Memory • Motor • Pattern recognition
        </Text>
        <Text style={styles.footerSubtext}>
          Watch the pattern and repeat it in the same order!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 40,
  },
  patternContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  movementContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementEmoji: {
    fontSize: 120,
    marginBottom: 10,
  },
  movementLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  copyControls: {
    alignItems: 'center',
    marginTop: 40,
  },
  copyInstruction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  patternReminder: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  movementButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  movementButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  movementButtonEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  movementButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  waitingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default PatternCopyGame;
