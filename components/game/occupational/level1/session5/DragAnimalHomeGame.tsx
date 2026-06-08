/**
 * OT Level 1 · Session 5 · Game 3 — Drag Animal Home
 * Theme: "Homeward Meadow" — guide each animal to its home.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION5_PACING } from '@/components/game/occupational/level1/session5/session5Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION5_PACING.dragAnimal;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type AnimalType = 'cat' | 'bee' | 'turtle' | 'bird' | 'frog';
type HomeType = 'house' | 'hive' | 'pond' | 'nest' | 'lily';

const ANIMALS: Record<AnimalType, { emoji: string; home: HomeType; homeEmoji: string; homeColor: [string, string]; label: string }> = {
  cat: { emoji: '🐱', home: 'house', homeEmoji: '🏠', homeColor: ['#FDE68A', '#F59E0B'], label: 'Cat → House' },
  bee: { emoji: '🐝', home: 'hive', homeEmoji: '🍯', homeColor: ['#FCD34D', '#D97706'], label: 'Bee → Hive' },
  turtle: { emoji: '🐢', home: 'pond', homeEmoji: '🌊', homeColor: ['#67E8F9', '#0891B2'], label: 'Turtle → Pond' },
  bird: { emoji: '🐦', home: 'nest', homeEmoji: '🪺', homeColor: ['#D9F99D', '#65A30D'], label: 'Bird → Nest' },
  frog: { emoji: '🐸', home: 'lily', homeEmoji: '🪷', homeColor: ['#86EFAC', '#16A34A'], label: 'Frog → Lily' },
};

const ROUND_ANIMALS: AnimalType[] = ['cat', 'bee', 'turtle', 'bird', 'frog', 'cat', 'bee', 'turtle'];

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.55 });
          ref.current = sound;
        }
        await ref.current.replayAsync();
      } catch { /* noop */ }
    })();
  }, [uri]);
};

const DragAnimalHomeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const animalType = ROUND_ANIMALS[(round - 1) % ROUND_ANIMALS.length];
  const animalInfo = ANIMALS[animalType];

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const animalX = useSharedValue(18);
  const animalY = useSharedValue(55);
  const animalScale = useSharedValue(1);
  const homeX = useSharedValue(78);
  const homeY = useSharedValue(42);
  const startX = useSharedValue(18);
  const startY = useSharedValue(55);
  const homePulse = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Every animal is home safe! Wonderful!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'dragAnimalHome',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['directional-drag', 'sequencing', 'visual-motor-matching', 'spatial-planning'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => {
    const hx = 68 + Math.random() * 22;
    const hy = 25 + Math.random() * 50;
    const sx = 8 + Math.random() * 16;
    const sy = 30 + Math.random() * 40;
    homeX.value = hx;
    homeY.value = hy;
    startX.value = sx;
    startY.value = sy;
    animalX.value = sx;
    animalY.value = sy;
    homePulse.value = withRepeat(withSequence(withTiming(1.1, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
    roundActiveRef.current = true;
    speakTTS(`Drag the ${animalType} to its home!`, 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, [round, animalType]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(true);
      animalScale.value = withSpring(1.25, { damping: 10, stiffness: 220 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      animalX.value = Math.max(4, Math.min(96, (e.x / screenW.current) * 100));
      animalY.value = Math.max(8, Math.min(92, (e.y / screenH.current) * 100));
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(false);
      animalScale.value = withSpring(1, { damping: 12, stiffness: 180 });

      const dist = Math.hypot(animalX.value - homeX.value, animalY.value - homeY.value);
      if (dist <= P.homeTolerance) {
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;

        setScore((prev) => {
          const next = prev + 1;
          setTimeout(() => {
            if (next >= TOTAL_ROUNDS) endGame(next);
            else { setRound((r) => r + 1); roundActiveRef.current = true; }
          }, P.nextRoundDelayMs);
          return next;
        });
      } else {
        animalX.value = withSpring(startX.value, { damping: 12, stiffness: 140 });
        animalY.value = withSpring(startY.value, { damping: 12, stiffness: 140 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(`Take the ${animalType} to its home!`, 0.78).catch(() => {});
      }
    });

  const animalStyle = useAnimatedStyle(() => ({
    left: `${animalX.value}%`,
    top: `${animalY.value}%`,
    transform: [{ translateX: -P.animalSize / 2 }, { translateY: -P.animalSize / 2 }, { scale: animalScale.value }],
  }));

  const homeStyle = useAnimatedStyle(() => ({
    left: `${homeX.value}%`,
    top: `${homeY.value}%`,
    transform: [{ translateX: -P.homeSize / 2 }, { translateY: -P.homeSize / 2 }, { scale: homePulse.value }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Meadow Guide!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FEF9C3', '#BBF7D0', '#86EFAC', '#4ADE80']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <View style={styles.flower1} /><View style={styles.flower2} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.titleDark}>🌿 Homeward Meadow</Text>
        <Text style={styles.subtitleDark}>{animalInfo.label}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPillLight}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPillLight, styles.starPillLight]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea} onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Animated.View style={[styles.homeWrap, homeStyle]}>
              <LinearGradient colors={animalInfo.homeColor} style={styles.home}>
                <Text style={styles.homeEmoji}>{animalInfo.homeEmoji}</Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View style={[styles.animalWrap, animalStyle]}>
              <View style={styles.animalCircle}>
                <Text style={styles.animalEmoji}>{animalInfo.emoji}</Text>
              </View>
            </Animated.View>

            {!isDragging && (
              <View style={styles.hintPill}><Text style={styles.hintText}>Drag {animalInfo.emoji} home 👆</Text></View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={animalInfo.homeColor[0]} count={14} size={8} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flower1: { position: 'absolute', top: '22%', right: '8%', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(251,191,36,0.35)' },
  flower2: { position: 'absolute', bottom: '30%', left: '6%', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(244,114,182,0.35)' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(22,163,74,0.25)' },
  backTextDark: { color: '#166534', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#166534' },
  subtitleDark: { fontSize: 14, color: '#15803D', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPillLight: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(22,163,74,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPillLight: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#15803D', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#166534' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8 },
  gestureArea: { flex: 1, position: 'relative' },
  homeWrap: { position: 'absolute', zIndex: 2 },
  home: { width: SESSION5_PACING.dragAnimal.homeSize, height: SESSION5_PACING.dragAnimal.homeSize, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  homeEmoji: { fontSize: 44 },
  animalWrap: { position: 'absolute', zIndex: 3 },
  animalCircle: { width: SESSION5_PACING.dragAnimal.animalSize, height: SESSION5_PACING.dragAnimal.animalSize, borderRadius: SESSION5_PACING.dragAnimal.animalSize / 2, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  animalEmoji: { fontSize: 40 },
  hintPill: { position: 'absolute', bottom: '8%', alignSelf: 'center', left: '20%', right: '20%', backgroundColor: 'rgba(22,163,74,0.88)', paddingVertical: 12, borderRadius: 22, alignItems: 'center' },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default DragAnimalHomeGame;
