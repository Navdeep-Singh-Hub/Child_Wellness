import { logGameAndAward, recordGame } from '@/utils/api';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ResultCard from './ResultCard';

type ShapePosition = "left" | "right";

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/coin.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/slide_whistle_down.ogg';

const useSoundEffect = (uri: string) => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.5, shouldPlay: false });
      soundRef.current = sound;
    } catch {
      console.warn('Failed to load sound:', uri);
    }
  }, [uri]);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync().catch(() => {}); };
  }, []);

  const play = useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      await ensureSound();
      if (soundRef.current) await soundRef.current.replayAsync();
    } catch { }
  }, [ensureSound]);

  return play;
};

const TapRedCircleGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();
  const [round, setRound] = useState(1);
  const [stars, setStars] = useState(0);
  const [redPosition, setRedPosition] = useState<ShapePosition>("left");
  const [isDisabled, setIsDisabled] = useState(false);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);

  // Glow animation for red circle
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Shake animation for wrong tap
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const startGlow = useCallback(() => {
    glowAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    startGlow();
  }, [round, startGlow]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextRound = () => {
    // randomize red circle position
    const newPos: ShapePosition = Math.random() > 0.5 ? "left" : "right";
    setRedPosition(newPos);
    setRound((r) => r + 1);
    setIsDisabled(false);
  };

  const playSuccessSound = useSoundEffect(SUCCESS_SOUND);
  const playErrorSound = useSoundEffect(ERROR_SOUND);

  const handleTap = async (shape: "red" | "blue") => {
    if (isDisabled) return;
    setIsDisabled(true);

    const isCorrect = shape === "red";

    if (isCorrect) {
      setStars((s) => s + 1);
      playSuccessSound();
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { }
    } else {
      triggerShake();
      playErrorSound();
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch { }
    }

    // Check if we've reached round 8 (game end)
    if (round >= 8) {
      const finalCorrect = stars + (isCorrect ? 1 : 0);
      const xp = finalCorrect * 15;
      setFinalStats({ correct: finalCorrect, total: 8, xp });
      setDone(true);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'tapRedCircle' as any,
          correct: finalCorrect,
          total: 8,
          accuracy: (finalCorrect / 8) * 100,
          xpAwarded: xp,
          skillTags: ['shape-discrimination', 'motor-control', 'attention'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log game:', e);
      }
      return;
    }

    // small delay before next round
    setTimeout(() => {
      nextRound();
    }, 500);
  };

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-10, 10],
  });

  const renderShape = (type: "red" | "blue") => {
    const isRed = type === "red";
    const isRedTarget = isRed;

    const baseShape = (
      <View
        style={[
          styles.shape,
          isRed ? styles.redCircle : styles.blueSquare,
        ]}
      />
    );

    const content = isRedTarget ? (
      <Animated.View
        style={[
          styles.glowWrapper,
          {
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        {baseShape}
      </Animated.View>
    ) : (
      baseShape
    );

    return (
      <Pressable
        onPress={() => handleTap(type)}
        style={styles.shapeTouchArea}
      >
        {content}
      </Pressable>
    );
  };

  const leftShape = redPosition === "left" ? renderShape("red") : renderShape("blue");
  const rightShape = redPosition === "right" ? renderShape("red") : renderShape("blue");

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // Game finished screen
  if (done && finalStats) {
    const accuracyPct = Math.round((finalStats.correct / finalStats.total) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={handleBack}
          style={{
            position: 'absolute',
            top: 50,
            left: 16,
            zIndex: 10,
            backgroundColor: '#111827',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 400, borderRadius: 24, backgroundColor: '#fff', padding: 24, alignItems: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 8 }}>Game Complete!</Text>
            <Text style={{ fontSize: 16, color: '#475569', marginBottom: 16, textAlign: 'center' }}>
              You tapped correctly {finalStats.correct} out of {finalStats.total} times!
            </Text>
            <ResultCard
              correct={finalStats.correct}
              total={finalStats.total}
              xpAwarded={finalStats.xp}
              accuracy={accuracyPct}
              logTimestamp={logTimestamp}
              onPlayAgain={() => {
                setRound(1);
                setStars(0);
                setRedPosition('left');
                setDone(false);
                setFinalStats(null);
                setLogTimestamp(null);
              }}
            />
            <Text style={{ color: '#22C55E', fontWeight: '600', marginTop: 16, textAlign: 'center' }}>Saved! XP updated ✅</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={{
          position: 'absolute',
          top: 50,
          left: 16,
          zIndex: 10,
          backgroundColor: '#111827',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>← Back</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginTop: 70, marginBottom: 16 }}>
        <Text style={styles.title}>Tap the BIG RED CIRCLE</Text>
        <Text style={styles.subtitle}>Round: {round}/8 • ⭐ {stars}</Text>
      </View>

      <Animated.View
        style={[
          styles.shapesRow,
          { transform: [{ translateX: shakeTranslateX }] },
        ]}
      >
        {leftShape}
        {rightShape}
      </Animated.View>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          Look! The red circle is glowing. Tap the red circle!
        </Text>
        <Text style={styles.helperText}>
          Wrong taps will just gently shake the screen – no problem 🙂
        </Text>
      </View>
    </SafeAreaView>
  );
};

const SHAPE_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  shapesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
  },
  shapeTouchArea: {
    padding: 8,
  },
  shape: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  redCircle: {
    borderRadius: SHAPE_SIZE / 2,
    backgroundColor: "red",
  },
  blueSquare: {
    borderRadius: 20,
    backgroundColor: "blue",
  },
  glowWrapper: {
    shadowColor: "red",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8, // Android
  },
  instructionBox: {
    padding: 12,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 14,
    color: "#555",
  },
});

export default TapRedCircleGame;
