/**
 * OT Level 1 · Session 5 · Game 1 — Drag Ball To Goal
 * Theme: "Stadium Strike" — drag the ball into the net.
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

const P = SESSION5_PACING.dragBall;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const RESET_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

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

const DragBallToGoalGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playReset = useSound(RESET_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const ballX = useSharedValue(15);
  const ballY = useSharedValue(55);
  const ballScale = useSharedValue(1);
  const goalX = useSharedValue(82);
  const goalY = useSharedValue(45);
  const startX = useSharedValue(15);
  const startY = useSharedValue(55);
  const goalPulse = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Goal! You scored every round!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'dragBallToGoal',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['drag-initiation', 'directionality', 'start-finish-understanding', 'controlled-finger-travel'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const spawnRound = useCallback(() => {
    const gx = 72 + Math.random() * 18;
    const gy = 28 + Math.random() * 44;
    const sx = 8 + Math.random() * 14;
    const sy = 35 + Math.random() * 30;
    goalX.value = gx;
    goalY.value = gy;
    startX.value = sx;
    startY.value = sy;
    ballX.value = sx;
    ballY.value = sy;
    goalPulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true,
    );
  }, []);

  useEffect(() => { spawnRound(); }, [round]);

  useEffect(() => {
    speakTTS('Drag the ball into the goal net!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(true);
      ballScale.value = withSpring(1.18, { damping: 10, stiffness: 220 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      ballX.value = Math.max(4, Math.min(96, (e.x / screenW.current) * 100));
      ballY.value = Math.max(8, Math.min(92, (e.y / screenH.current) * 100));
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(false);
      ballScale.value = withSpring(1, { damping: 12, stiffness: 180 });

      const dist = Math.hypot(ballX.value - goalX.value, ballY.value - goalY.value);
      if (dist <= P.goalTolerance) {
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;

        setScore((prev) => {
          const next = prev + 1;
          setTimeout(() => {
            if (next >= TOTAL_ROUNDS) {
              endGame(next);
            } else {
              setRound((r) => r + 1);
              roundActiveRef.current = true;
            }
          }, P.nextRoundDelayMs);
          return next;
        });
      } else {
        ballX.value = withSpring(startX.value, { damping: 12, stiffness: 140 });
        ballY.value = withSpring(startY.value, { damping: 12, stiffness: 140 });
        playReset();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Drag the ball into the goal!', 0.78).catch(() => {});
      }
    });

  const ballStyle = useAnimatedStyle(() => ({
    left: `${ballX.value}%`,
    top: `${ballY.value}%`,
    transform: [{ translateX: -P.ballSize / 2 }, { translateY: -P.ballSize / 2 }, { scale: ballScale.value }],
  }));

  const goalStyle = useAnimatedStyle(() => ({
    left: `${goalX.value}%`,
    top: `${goalY.value}%`,
    transform: [{ translateX: -P.goalSize / 2 }, { translateY: -P.goalSize / 2 }, { scale: goalPulse.value }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Stadium Star!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#14532D', '#166534', '#15803D', '#22C55E']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      {/* Field stripes */}
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.stripe, { top: `${20 + i * 18}%`, opacity: i % 2 === 0 ? 0.06 : 0.03 }]} />
      ))}

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>⚽ Stadium Strike</Text>
        <Text style={styles.subtitle}>Drag the ball into the net</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea} onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Animated.View style={[styles.goalWrap, goalStyle]}>
              <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']} style={styles.goalNet}>
                <Text style={styles.goalLabel}>GOAL</Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View style={[styles.ballWrap, ballStyle]}>
              <LinearGradient colors={['#F8FAFC', '#E2E8F0', '#CBD5E1']} style={styles.ball}>
                <Text style={styles.ballEmoji}>⚽</Text>
              </LinearGradient>
            </Animated.View>

            {!isDragging && (
              <View style={styles.hintPill}><Text style={styles.hintText}>Drag to the net 👆</Text></View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FCD34D" count={14} size={8} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#166534' },
  stripe: { position: 'absolute', left: 0, right: 0, height: '14%', backgroundColor: '#fff' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#DCFCE7', textShadowColor: 'rgba(34,197,94,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(220,252,231,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8 },
  gestureArea: { flex: 1, position: 'relative' },
  goalWrap: { position: 'absolute', zIndex: 2 },
  goalNet: { width: SESSION5_PACING.dragBall.goalSize, height: SESSION5_PACING.dragBall.goalSize, borderRadius: 14, borderWidth: 3, borderColor: '#FCD34D', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  goalLabel: { color: '#FCD34D', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  ballWrap: { position: 'absolute', zIndex: 3 },
  ball: { width: SESSION5_PACING.dragBall.ballSize, height: SESSION5_PACING.dragBall.ballSize, borderRadius: SESSION5_PACING.dragBall.ballSize / 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  ballEmoji: { fontSize: 44 },
  hintPill: { position: 'absolute', bottom: '8%', alignSelf: 'center', left: '22%', right: '22%', backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 12, borderRadius: 22, alignItems: 'center' },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default DragBallToGoalGame;
