import GameInfoScreen from '@/components/game/GameInfoScreen';
import ResultCard from '@/components/game/ResultCard';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS, DEFAULT_TTS_RATE, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TOTAL_ROUNDS = 8;
const SLOW_BEAT_INTERVAL = 3000; // Very slow - 3 seconds between beats
const SOUND_DURATION = 600;
const TAP_WINDOW = 2500; // 2.5 seconds to tap (generous for calm mode)

const SlowBeatCalmModeGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [isDrumPlaying, setIsDrumPlaying] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const [hasTapped, setHasTapped] = useState(false);

  const drumScale = useRef(new Animated.Value(1)).current;
  const beatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapWindowRef = useRef<NodeJS.Timeout | null>(null);
  const hasTappedRef = useRef(false);
  const canTapRef = useRef(false);
  const doneRef = useRef(false);
  const roundRef = useRef(1);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const clearTapTimer = useCallback(() => {
    if (tapWindowRef.current) {
      clearTimeout(tapWindowRef.current);
      tapWindowRef.current = null;
    }
  }, []);

  const playBeat = useCallback(() => {
    if (doneRef.current) return;

    clearTapTimer();
    setIsDrumPlaying(true);
    setCanTap(false);
    canTapRef.current = false;
    setHasTapped(false);
    hasTappedRef.current = false;
    
    // Play drum sound (softer for calm mode)
    playSound('drum', 0.6, 0.9);
    
    // Gentle animation
    Animated.sequence([
      Animated.timing(drumScale, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(drumScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Stop sound after duration
    setTimeout(() => {
      setIsDrumPlaying(false);
      setCanTap(true);
      canTapRef.current = true;

      tapWindowRef.current = setTimeout(() => {
        setCanTap(false);
        canTapRef.current = false;
        if (!hasTappedRef.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          speakTTS('Tap gently when you are ready.', 0.7).catch(() => {});
          setTimeout(() => playBeat(), 1000);
        }
      }, TAP_WINDOW) as unknown as NodeJS.Timeout;
    }, SOUND_DURATION);
  }, [clearTapTimer, drumScale]);

  const endGame = useCallback(async () => {
    const total = TOTAL_ROUNDS;
    const xp = score * 10;
    const accuracy = (score / total) * 100;

    setFinalStats({ correct: score, total, xp });
    setDone(true);
    doneRef.current = true;
    setCanTap(false);
    canTapRef.current = false;
    clearTapTimer();

    if (beatTimeoutRef.current) {
      clearTimeout(beatTimeoutRef.current);
      beatTimeoutRef.current = null;
    }

    try {
      await logGameAndAward({
        type: 'slow-beat-calm-mode',
        correct: score,
        total,
        accuracy,
        xpAwarded: xp,
        skillTags: ['calmness', 'controlled-movement'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (error) {
      console.error('Failed to log game:', error);
    }
  }, [score, router, clearTapTimer]);

  const handleTap = useCallback(() => {
    if (!canTapRef.current || hasTappedRef.current || doneRef.current) return;

    hasTappedRef.current = true;
    setHasTapped(true);
    setCanTap(false);
    canTapRef.current = false;
    setScore((s) => s + 1);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    clearTapTimer();

    setTimeout(() => {
      if (roundRef.current < TOTAL_ROUNDS) {
        setRound((r) => r + 1);
        setHasTapped(false);
        hasTappedRef.current = false;
      } else {
        endGame();
      }
    }, 1000);
  }, [clearTapTimer, endGame]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    setTimeout(() => {
      playBeat();
    }, 1000);
  }, [playBeat]);

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
      if (beatTimeoutRef.current) {
        clearTimeout(beatTimeoutRef.current);
      }
      if (tapWindowRef.current) {
        clearTimeout(tapWindowRef.current);
      }
    };
  }, []);

  // Show info screen
  if (showInfo) {
    return (
      <GameInfoScreen
        title="Slow Beat Calm Mode"
        emoji="🧘🥁"
        description="Very slow drum beats"
        skills={['Calmness', 'Controlled movement']}
        suitableFor="Children who want to develop calmness and controlled movement"
        onStart={() => {
          setShowInfo(false);
          if (Platform.OS === 'web') {
            setTimeout(() => {
              speakTTS('Slow, calm beats. Take your time and tap gently.', { rate: 0.7 });
            }, 300);
          } else {
            speakTTS('Slow, calm beats. Take your time and tap gently.', { rate: 0.7 });
          }
        }}
        onBack={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }

  // Result screen
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
            setHasTapped(false);
            setCanTap(false);
            setIsDrumPlaying(false);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ECFDF5', '#D1FAE5', '#A7F3D0']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <TouchableOpacity
        onPress={() => {
          try {
            stopTTS();
          } catch (e) {
            // Ignore errors
          }
          stopAllSpeech();
          cleanupSounds();
          if (onBack) onBack();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🧘🥁 Slow Beat Calm Mode</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Round: {round}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.gameArea}>
          <Text style={styles.instructionText}>
            {isDrumPlaying
              ? canTap
                ? '🧘 Tap gently...'
                : '👂 Listen...'
              : canTap
              ? '👆 Take your time...'
              : '⏳ Wait for the beat...'}
          </Text>

          <TouchableOpacity
            style={styles.drumContainer}
            onPress={handleTap}
            activeOpacity={0.8}
            disabled={!canTap}
            pointerEvents={canTap ? 'auto' : 'none'}
          >
            <Animated.View
              style={[
                styles.drum,
                isDrumPlaying && canTap && styles.drumActive,
                { transform: [{ scale: drumScale }] },
              ]}
            >
              <Text style={styles.drumEmoji}>🥁</Text>
              {canTap && (
                <View style={styles.drumGlow}>
                  <Text style={styles.drumGlowText}>✨</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>

          {canTap && (
            <Text style={styles.tapHint}>Calmly tap when ready 🧘</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  backText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  header: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gameArea: {
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 40,
    textAlign: 'center',
  },
  drumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  drum: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 4,
    borderColor: '#059669',
  },
  drumActive: {
    backgroundColor: '#34D399',
    borderColor: '#10B981',
    shadowColor: '#34D399',
  },
  drumEmoji: {
    fontSize: 80,
  },
  drumGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  drumGlowText: {
    fontSize: 40,
  },
  tapHint: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
});

export default SlowBeatCalmModeGame;

