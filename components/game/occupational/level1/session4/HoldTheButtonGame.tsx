/**
 * OT Level 1 · Session 4 · Game 1 — Hold The Button
 * Theme: "Forge Press" — fill the power ring, release on the green flash.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION4_PACING } from '@/components/game/occupational/level1/session4/session4Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const P = SESSION4_PACING.holdButton;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const BREAK_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

const HoldTheButtonGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const btnSize = Math.min(width * 0.42, 200);
  const ringSize = btnSize + 40;
  const strokeW = 11;
  const radius = (ringSize - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;

  const playSuccess = useSound(SUCCESS_SOUND);
  const playBreak = useSound(BREAK_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'holding' | 'ready' | 'broken' | 'transition'>('idle');
  const [holdPct, setHoldPct] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = useSharedValue(0);
  const btnScale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const ringRotation = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 16;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Perfect holds! You forged them all!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'holdTheButton',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['sustained-finger-pressure', 'proprioception', 'timing-control', 'finger-stability'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const resetRound = useCallback((instant = false) => {
    cancelAnimation(progress);
    holdingRef.current = false;
    progressRef.current = 0;
    if (tickRef.current) clearInterval(tickRef.current);
    if (instant) {
      progress.value = 0;
      btnScale.value = 1;
      ringScale.value = 1;
      flashOpacity.value = 0;
      ringRotation.value = 0;
    } else {
      progress.value = withTiming(0, { duration: 200 });
      btnScale.value = withSpring(1, { damping: 14 });
      flashOpacity.value = withTiming(0, { duration: 200 });
    }
    setHoldPct(0);
    setPhase('idle');
  }, []);

  const onSuccess = useCallback(() => {
    setPhase('transition');
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    btnScale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 12 }));
    flashOpacity.value = withTiming(0, { duration: 150 });

    setScore((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_ROUNDS) {
        setTimeout(() => endGame(next), P.nextRoundDelayMs);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          resetRound(true);
        }, P.nextRoundDelayMs);
      }
      return next;
    });
  }, [endGame, resetRound, playSuccess]);

  const onPressIn = useCallback(() => {
    if (doneRef.current || phase === 'broken' || phase === 'transition' || holdingRef.current) return;
    holdingRef.current = true;
    setPhase('holding');
    setHoldPct(0);
    progressRef.current = 0;
    cancelAnimation(progress);
    progress.value = 0;
    btnScale.value = withSpring(0.92, { damping: 16, stiffness: 260 });

    progress.value = withTiming(1, { duration: P.holdDurationMs, easing: Easing.linear });
    ringRotation.value = withTiming(360, { duration: P.holdDurationMs, easing: Easing.linear });

    tickRef.current = setInterval(() => {
      if (!holdingRef.current) return;
      progressRef.current = Math.min(1, progressRef.current + 50 / P.holdDurationMs);
      setHoldPct(Math.round(progressRef.current * 100));
      if (progressRef.current >= 1 && holdingRef.current) {
        setPhase('ready');
        flashOpacity.value = withSequence(
          withTiming(1, { duration: 180 }),
          withTiming(0.35, { duration: 400 }),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Release now!', 0.85).catch(() => {});
        if (tickRef.current) clearInterval(tickRef.current);
      }
    }, 50);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [phase]);

  const onPressOut = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);
    cancelAnimation(progress);
    cancelAnimation(ringRotation);

    const p = progressRef.current;

    if (p >= P.perfectThreshold) {
      onSuccess();
    } else if (p < P.breakThreshold) {
      setPhase('broken');
      playBreak();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS('Hold longer!', 0.78).catch(() => {});
      ringScale.value = withSequence(
        withTiming(1.25, { duration: 180 }),
        withTiming(0.85, { duration: 280 }),
      );
      setTimeout(() => resetRound(true), P.breakResetMs);
    } else {
      progress.value = withTiming(0, { duration: 220 });
      btnScale.value = withSpring(1, { damping: 12 });
      flashOpacity.value = withTiming(0, { duration: 180 });
      setPhase('idle');
      setHoldPct(0);
      progressRef.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      speakTTS('Hold until the ring is full!', 0.78).catch(() => {});
    }
  }, [onSuccess, resetRound, playBreak]);

  useEffect(() => {
    speakTTS('Press and hold until the ring fills. Release on the green flash!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }, { rotate: `${ringRotation.value}deg` }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Forge Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const phaseLabel = phase === 'ready' ? 'RELEASE!' : phase === 'holding' ? 'HOLDING…' : phase === 'broken' ? 'Too soon!' : 'PRESS & HOLD';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1C0A00', '#431407', '#7C2D12', '#9A3412']} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🔥 Forge Press</Text>
        <Text style={styles.subtitle}>Fill the ring · release on green flash</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={[styles.stage, { width: ringSize + 24, height: ringSize + 24 }]}>
          <Animated.View style={[styles.flashRing, { width: ringSize + 16, height: ringSize + 16, borderRadius: (ringSize + 16) / 2 }, flashStyle]} />

          <Animated.View style={ringStyle}>
            <Svg width={ringSize} height={ringSize}>
              <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeW} fill="none" />
              <AnimatedCircle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="#F97316" strokeWidth={strokeW} fill="none"
                strokeLinecap="round" strokeDasharray={circumference} animatedProps={ringProps} rotation={-90} origin={`${ringSize / 2}, ${ringSize / 2}`} />
            </Svg>
          </Animated.View>

          <Animated.View style={btnStyle}>
            <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut}
              disabled={phase === 'transition' || phase === 'broken'} style={[styles.button, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}>
              <LinearGradient colors={phase === 'ready' ? ['#22C55E', '#16A34A'] : ['#EA580C', '#C2410C', '#7C2D12']}
                style={[StyleSheet.absoluteFillObject, { borderRadius: btnSize / 2 }]}>
                <View style={styles.btnShine} />
              </LinearGradient>
              <Text style={styles.btnLabel}>{phaseLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.pctLabel}>{phase === 'holding' || phase === 'ready' ? `${holdPct}%` : 'Ready'}</Text>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F97316" count={12} size={7} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#431407' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FED7AA', textShadowColor: 'rgba(249,115,22,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(254,215,170,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stage: { justifyContent: 'center', alignItems: 'center' },
  flashRing: { position: 'absolute', borderWidth: 4, borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.15)' },
  button: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#EA580C', shadowOpacity: 0.55, shadowRadius: 20, elevation: 14 },
  btnShine: { position: 'absolute', top: '12%', left: '15%', width: '38%', height: '22%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
  btnLabel: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.5, zIndex: 2 },
  pctLabel: { marginTop: 18, fontSize: 16, fontWeight: '800', color: 'rgba(254,215,170,0.85)' },
});

export default HoldTheButtonGame;
