import { logGameAndAward, recordGame } from '@/utils/api';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    View,
} from 'react-native';
import { SparkleBurst } from './FX';
import ResultCard from './ResultCard';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const BLINK_INTERVAL = 400; // 0.4 seconds - rapid blinking
const TOTAL_TAPS_REQUIRED = 20; // Total taps to complete game
const CIRCLE_SIZE = 180;
const RESPONSE_WINDOW = 600; // 600ms window to tap after blink

const useSoundEffect = (uri: string) => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri },
        { volume: 0.6, shouldPlay: false },
      );
      soundRef.current = sound;
    } catch {
      console.warn('Failed to load sound:', uri);
    }
  }, [uri]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const play = useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      await ensureSound();
      if (soundRef.current) await soundRef.current.replayAsync();
    } catch {}
  }, [ensureSound]);

  return play;
};

const TapFastGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const playSuccess = useSoundEffect(SUCCESS_SOUND);

  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [isLit, setIsLit] = useState(false);
  const [lastBlinkTime, setLastBlinkTime] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  // Animation values
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Rapid blink animation loop
  useEffect(() => {
    if (done) return;

    const blinkLoop = () => {
      const now = Date.now();
      setLastBlinkTime(now);
      
      // Turn on (light up)
      setIsLit(true);
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: BLINK_INTERVAL - 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => {
        setIsLit(false);
      });
    };

    // Start rapid blinking
    blinkLoop();
    const interval = setInterval(blinkLoop, BLINK_INTERVAL);

    return () => clearInterval(interval);
  }, [done, glowAnim]);

  // Handle circle tap
  const handleTap = useCallback(async () => {
    if (done) return;

    const now = Date.now();
    const timeSinceBlink = now - lastBlinkTime;
    const wasJustLit = isLit || timeSinceBlink < RESPONSE_WINDOW;

    if (wasJustLit) {
      // Correct tap - fast response
      const responseTime = timeSinceBlink;
      setResponseTimes((prev) => [...prev, responseTime]);

      setScore((s) => {
        const newScore = s + 1;

        // Success animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();

        if (newScore >= TOTAL_TAPS_REQUIRED) {
          setTimeout(() => {
            endGame(newScore);
          }, 500);
        }

        return newScore;
      });

      try {
        await playSuccess();
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  }, [done, isLit, lastBlinkTime, scaleAnim, playSuccess]);

  // End game
  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_TAPS_REQUIRED;
      const xp = finalScore * 10; // 10 XP per tap
      const accuracy = (finalScore / total) * 100;
      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'tapFast',
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['fast-motor-activation', 'quick-reaction', 'proprioceptive-timing'],
          meta: { avgResponseTime },
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log tap fast game:', e);
      }

      Speech.speak('Great speed!', { rate: 0.78 });
    },
    [router, responseTimes],
  );

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // Glow animation style
  const glowStyle = {
    opacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.8],
    }),
  };

  // Result screen
  if (done && finalStats) {
    const accuracyPct = Math.round((finalStats.correct / finalStats.total) * 100);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={handleBack} style={styles.backChip}>
          <Text style={styles.backChipText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>⚡</Text>
            <Text style={styles.resultTitle}>Lightning fast!</Text>
            <Text style={styles.resultSubtitle}>
              You tapped {finalStats.correct} out of {finalStats.total} times quickly.
            </Text>
            {avgResponseTime > 0 && (
              <Text style={styles.resultSubtitle}>
                Average response: {avgResponseTime}ms
              </Text>
            )}
            <ResultCard
              correct={finalStats.correct}
              total={finalStats.total}
              xpAwarded={finalStats.xp}
              accuracy={accuracyPct}
              logTimestamp={logTimestamp}
              onPlayAgain={() => {
                setScore(0);
                setDone(false);
                setFinalStats(null);
                setLogTimestamp(null);
                setIsLit(false);
                setResponseTimes([]);
                glowAnim.setValue(0);
              }}
            />
            <Text style={styles.savedText}>Saved! XP updated ✅</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backChip}>
        <Text style={styles.backChipText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerBlock}>
        <Text style={styles.title}>Tap Fast</Text>
        <Text style={styles.subtitle}>
          Taps: {score}/{TOTAL_TAPS_REQUIRED} • ⚡ Fast pace!
        </Text>
        <Text style={styles.helper}>
          The circle blinks rapidly. Tap quickly to match the pace!
        </Text>
      </View>

      <View style={styles.playArea}>
        <Pressable onPress={handleTap} style={styles.tapArea}>
          <Animated.View
            style={[
              styles.circleContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  width: CIRCLE_SIZE + 60,
                  height: CIRCLE_SIZE + 60,
                  borderRadius: (CIRCLE_SIZE + 60) / 2,
                },
                glowStyle,
              ]}
            />

            {/* Main circle */}
            <View
              style={[
                styles.circle,
                {
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  borderRadius: CIRCLE_SIZE / 2,
                  backgroundColor: isLit ? '#F59E0B' : '#EF4444',
                },
              ]}
            >
              <View style={styles.circleInner} />
              {isLit && (
                <Text style={styles.tapText}>TAP!</Text>
              )}
            </View>
          </Animated.View>

          {/* Sparkle burst on tap */}
          {score > 0 && isLit && (
            <View style={styles.sparkleContainer} pointerEvents="none">
              <SparkleBurst />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: fast motor activation • quick reaction • proprioceptive timing
        </Text>
        <Text style={styles.footerSub}>
          React quickly! This builds fast motor responses and timing control.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  backChip: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  headerBlock: {
    marginTop: 72,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 6,
  },
  helper: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  playArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tapArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  circleInner: {
    width: '50%',
    height: '50%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tapText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sparkleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  footerBox: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  footerMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
  },
  savedText: {
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default TapFastGame;

