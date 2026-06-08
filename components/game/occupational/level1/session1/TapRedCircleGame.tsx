/**
 * OT Level 1 · Session 1 · Game 2 — Tap the Big Red Circle
 * Theme: "Ruby Spotlight Arena" — warm stage where the glowing ruby beats the sapphire.
 * UX focus: strong red-vs-blue hierarchy, gentle wrong-tap feedback, choice clarity.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type ShapePosition = 'left' | 'right';
const TOTAL_ROUNDS = 8;
const RED_SIZE = 156;
const BLUE_SIZE = 118;
const STAR_ICON = require('@/assets/icons/star.png');
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/coin.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/slide_whistle_down.ogg';

const useSoundEffect = (uri: string) => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);
  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.45, shouldPlay: false });
      soundRef.current = sound;
    } catch { /* noop */ }
  }, [uri]);
  useEffect(() => () => { soundRef.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      await ensureSound();
      await soundRef.current?.replayAsync();
    } catch { /* noop */ }
  }, [ensureSound]);
};

function SpotlightRing({ active }: { active: boolean }) {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    if (!active) { pulse.value = 0; return; }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [active]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.85,
    transform: [{ scale: 0.92 + pulse.value * 0.14 }],
  }));
  if (!active) return null;
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.spotlightRing, styles.spotlightRingOuter, ringStyle]} />
      <Animated.View pointerEvents="none" style={[styles.spotlightRing, styles.spotlightRingInner, ringStyle]} />
    </>
  );
}

function RoundProgress({ round, total }: { round: number; total: number }) {
  return (
    <View style={styles.roundProgress}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.roundDot, i < round && styles.roundDotDone, i === round - 1 && styles.roundDotCurrent]} />
      ))}
    </View>
  );
}

function FeedbackBanner({ type, visible }: { type: 'correct' | 'wrong'; visible: boolean }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(-8);
  useEffect(() => {
    if (!visible) return;
    opacity.value = 0;
    y.value = -8;
    opacity.value = withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 400 }));
    y.value = withSpring(0, { damping: 12 });
  }, [visible, type]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  if (!visible) return null;
  const isCorrect = type === 'correct';
  return (
    <Animated.View style={[styles.feedbackBanner, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong, style]}>
      <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextLight : styles.feedbackTextDark]}>
        {isCorrect ? '✓ Ruby found!' : 'Try the red one!'}
      </Text>
    </Animated.View>
  );
}

const TapRedCircleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const isTablet = screenW >= 768;

  const [round, setRound] = useState(1);
  const [stars, setStars] = useState(0);
  const [redPosition, setRedPosition] = useState<ShapePosition>('left');
  const [isDisabled, setIsDisabled] = useState(false);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; key: number } | null>(null);

  const shakeX = useSharedValue(0);
  const leftEnter = useSharedValue(0);
  const rightEnter = useSharedValue(0);
  const redBounce = useSharedValue(1);
  const blueDim = useSharedValue(1);

  const playSuccessSound = useSoundEffect(SUCCESS_SOUND);
  const playErrorSound = useSoundEffect(ERROR_SOUND);

  const animateEntrance = useCallback((pos: ShapePosition) => {
    leftEnter.value = pos === 'left' ? -120 : 0;
    rightEnter.value = pos === 'right' ? 120 : 0;
    leftEnter.value = withSpring(0, { damping: 14, stiffness: 90 });
    rightEnter.value = withSpring(0, { damping: 14, stiffness: 90 });
    redBounce.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.97, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    blueDim.value = withSequence(withTiming(0.6, { duration: 100 }), withTiming(1, { duration: 300 }));
  };

  const nextRound = useCallback((newPos: ShapePosition) => {
    setRedPosition(newPos);
    setRound((r) => r + 1);
    setIsDisabled(false);
    animateEntrance(newPos);
    speakTTS('Find the big red circle!', 0.78).catch(() => {});
  }, [animateEntrance]);

  const handleTap = async (shape: 'red' | 'blue') => {
    if (isDisabled) return;
    setIsDisabled(true);
    const isCorrect = shape === 'red';

    if (isCorrect) {
      setStars((s) => s + 1);
      playSuccessSound();
      setSparkleKey(Date.now());
      setFeedback({ type: 'correct', key: Date.now() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      triggerShake();
      playErrorSound();
      setFeedback({ type: 'wrong', key: Date.now() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }

    if (round >= TOTAL_ROUNDS) {
      const finalCorrect = stars + (isCorrect ? 1 : 0);
      const xp = finalCorrect * 15;
      const stats = { correct: finalCorrect, total: TOTAL_ROUNDS, xp };
      setFinalStats(stats);
      setDone(true);
      setShowCongratulations(true);
      speakTTS('Amazing! You found all the red circles!', 0.78).catch(() => {});
      try {
        await recordGame(xp);
        await logGameAndAward({
          type: 'tapRedCircle' as any,
          correct: finalCorrect,
          total: TOTAL_ROUNDS,
          accuracy: (finalCorrect / TOTAL_ROUNDS) * 100,
          xpAwarded: xp,
          skillTags: ['shape-discrimination', 'motor-control', 'attention'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log game:', e);
      }
      return;
    }

    setTimeout(() => {
      const newPos: ShapePosition = Math.random() > 0.5 ? 'left' : 'right';
      nextRound(newPos);
    }, isCorrect ? 380 : 520);
  };

  useEffect(() => {
    speakTTS('Tap the big red circle! Look for the glowing red one!', 0.78).catch(() => {});
    animateEntrance('left');
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftEnter.value }, { scale: redPosition === 'left' ? redBounce.value : 1 }],
    opacity: redPosition === 'left' ? 1 : blueDim.value,
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightEnter.value }, { scale: redPosition === 'right' ? redBounce.value : 1 }],
    opacity: redPosition === 'right' ? 1 : blueDim.value,
  }));

  const handleBack = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    onBack?.();
  }, [onBack]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Color Champion!"
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const redSize = isTablet ? RED_SIZE + 20 : RED_SIZE;
  const blueSize = isTablet ? BLUE_SIZE + 10 : BLUE_SIZE;

  const renderRedCircle = (side: 'left' | 'right') => (
    <Animated.View style={side === 'left' ? leftStyle : rightStyle}>
      <View style={[styles.pedestal, styles.redPedestal]}>
        <SpotlightRing active />
        <Pressable onPress={() => handleTap('red')} style={[styles.shapeTouch, { width: redSize + 32, height: redSize + 32 }]}>
          <LinearGradient colors={['#FCA5A5', '#EF4444', '#B91C1C', '#7F1D1D']} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} style={[styles.redShape, { width: redSize, height: redSize, borderRadius: redSize / 2 }]}>
            <View style={styles.redHighlight} />
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>★</Text>
            </View>
          </LinearGradient>
        </Pressable>
        <Text style={styles.pedestalLabel}>RED</Text>
      </View>
    </Animated.View>
  );

  const renderBlueCircle = (side: 'left' | 'right') => (
    <Animated.View style={side === 'left' ? leftStyle : rightStyle}>
      <View style={[styles.pedestal, styles.bluePedestal]}>
        <Pressable onPress={() => handleTap('blue')} style={[styles.shapeTouch, { width: blueSize + 24, height: blueSize + 24 }]}>
          <LinearGradient colors={['#93C5FD', '#3B82F6', '#1D4ED8']} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} style={[styles.blueShape, { width: blueSize, height: blueSize, borderRadius: blueSize / 2 }]}>
            <View style={styles.blueHighlight} />
          </LinearGradient>
        </Pressable>
        <Text style={[styles.pedestalLabel, styles.blueLabel]}>blue</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#450A0A', '#7F1D1D', '#991B1B', '#B45309']} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(251,191,36,0.12)', 'transparent', 'rgba(0,0,0,0.2)']} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.85}>
        <View style={styles.backButtonInner}>
          <Text style={styles.backButtonText}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Find the Ruby</Text>
        <Text style={styles.subtitle}>Tap the big glowing RED circle</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Round</Text>
            <Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{stars}</Text>
          </View>
        </View>
        <RoundProgress round={round} total={TOTAL_ROUNDS} />
      </View>

      {feedback && <FeedbackBanner type={feedback.type} visible key={feedback.key} />}

      <Animated.View style={[styles.arena, shakeStyle]}>
        <View style={styles.arenaStage}>
          <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.15)']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.arenaDivider} />
          {redPosition === 'left' ? (
            <>
              {renderRedCircle('left')}
              {renderBlueCircle('right')}
            </>
          ) : (
            <>
              {renderBlueCircle('left')}
              {renderRedCircle('right')}
            </>
          )}
        </View>
      </Animated.View>

      <View style={styles.footerHint}>
        <Text style={styles.footerText}>The red circle is bigger and glowing ✨</Text>
        <Text style={styles.footerSub}>Wrong taps just wiggle — keep trying!</Text>
      </View>

      <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#EF4444" count={14} size={8} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7F1D1D' },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, borderRadius: 24, overflow: 'hidden' },
  backButtonInner: {
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 24,
  },
  backButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FEF2F2', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  subtitle: { fontSize: 14, color: 'rgba(254,202,202,0.9)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
  },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundProgress: { flexDirection: 'row', gap: 6, marginTop: 4 },
  roundDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  roundDotDone: { backgroundColor: '#FBBF24', borderColor: '#FDE68A' },
  roundDotCurrent: { width: 14, height: 14, borderRadius: 7, marginTop: -2, borderWidth: 2, borderColor: '#fff' },
  feedbackBanner: {
    position: 'absolute', top: 200, alignSelf: 'center', zIndex: 20,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999,
  },
  feedbackCorrect: { backgroundColor: 'rgba(34,197,94,0.92)' },
  feedbackWrong: { backgroundColor: 'rgba(255,255,255,0.9)' },
  feedbackText: { fontSize: 17, fontWeight: '900' },
  feedbackTextLight: { color: '#fff' },
  feedbackTextDark: { color: '#7F1D1D' },
  arena: { flex: 1, justifyContent: 'center', paddingHorizontal: 8 },
  arenaStage: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    marginHorizontal: 8, borderRadius: 28, overflow: 'hidden', minHeight: 280,
    borderWidth: 2, borderColor: 'rgba(251,191,36,0.35)',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  arenaDivider: {
    position: 'absolute', left: '50%', top: '10%', bottom: '10%', width: 2,
    backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: -1,
  },
  pedestal: { alignItems: 'center', paddingVertical: 16 },
  redPedestal: { transform: [{ scale: 1.05 }] },
  bluePedestal: { opacity: 0.85 },
  shapeTouch: { justifyContent: 'center', alignItems: 'center' },
  redShape: {
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#EF4444', shadowOpacity: 0.8, shadowRadius: 28, shadowOffset: { width: 0, height: 0 }, elevation: 16,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  blueShape: {
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1D4ED8', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  redHighlight: {
    position: 'absolute', top: '14%', left: '20%', width: '35%', height: '25%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '-20deg' }],
  },
  blueHighlight: {
    position: 'absolute', top: '16%', left: '22%', width: '30%', height: '22%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)', transform: [{ rotate: '-20deg' }],
  },
  targetBadge: {
    position: 'absolute', bottom: '12%', right: '12%',
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FBBF24', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  targetBadgeText: { fontSize: 14, color: '#7F1D1D', fontWeight: '900' },
  pedestalLabel: { marginTop: 10, fontSize: 13, fontWeight: '900', color: '#FCA5A5', letterSpacing: 2 },
  blueLabel: { color: 'rgba(147,197,253,0.7)', fontWeight: '600', letterSpacing: 1 },
  spotlightRing: { position: 'absolute', alignSelf: 'center', borderRadius: 999, borderWidth: 3 },
  spotlightRingOuter: { width: RED_SIZE + 48, height: RED_SIZE + 48, borderColor: 'rgba(251,191,36,0.5)' },
  spotlightRingInner: { width: RED_SIZE + 24, height: RED_SIZE + 24, borderColor: 'rgba(255,255,255,0.35)' },
  footerHint: { alignItems: 'center', paddingBottom: 24, paddingHorizontal: 20 },
  footerText: { fontSize: 15, fontWeight: '800', color: 'rgba(254,242,242,0.95)', textAlign: 'center' },
  footerSub: { fontSize: 13, color: 'rgba(254,202,202,0.7)', marginTop: 4, textAlign: 'center' },
});

export default TapRedCircleGame;
