/**
 * OT Level 1 · Session 2 · Game 2 — Tap Only Small Target
 * Theme: "Gem vs Boulder" — glowing gem among dull boulders in a crystal cave.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const ROUND_HANDOFF_MS = 340;
const STAR_ICON = require('@/assets/icons/star.png');

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.45 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, [uri]);
};

function FeedbackChip({ text, type, show }: { text: string; type: 'ok' | 'bad'; show: boolean }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(8);
  useEffect(() => {
    if (!show) return;
    opacity.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 350 }));
    y.value = withSpring(0, { damping: 12 });
  }, [show, text]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  if (!show) return null;
  return (
    <Animated.View style={[styles.feedback, type === 'ok' ? styles.feedbackOk : styles.feedbackBad, style]}>
      <Text style={[styles.feedbackText, type === 'bad' && styles.feedbackTextDark]}>{text}</Text>
    </Animated.View>
  );
}

const TapOnlySmallTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const largeSize = Math.min(width * 0.38, 168);
  const smallSize = Math.min(width * 0.17, 76);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [roundActive, setRoundActive] = useState(true);
  const [positions, setPositions] = useState<{ small: { x: number; y: number }; large: { x: number; y: number }; smallSide: 'left' | 'right' } | null>(null);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: 'ok' | 'bad'; key: number } | null>(null);

  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const shakeX = useSharedValue(0);
  const smallScale = useSharedValue(0);
  const largeScale = useSharedValue(0);
  const gemGlow = useSharedValue(0.5);
  const smallEnter = useSharedValue(0);
  const largeEnter = useSharedValue(0);

  const generatePositions = useCallback(() => {
    const margin = 22;
    const minDist = 28;
    let lx = 0, ly = 0, sx = 0, sy = 0;
    for (let i = 0; i < 50; i++) {
      lx = margin + Math.random() * (100 - margin * 2);
      ly = margin + Math.random() * (100 - margin * 2);
      sx = margin + Math.random() * (100 - margin * 2);
      sy = margin + Math.random() * (100 - margin * 2);
      if (Math.hypot(lx - sx, ly - sy) >= minDist) break;
    }
    const smallSide: 'left' | 'right' = sx < lx ? 'left' : 'right';
    return { small: { x: sx, y: sy }, large: { x: lx, y: ly }, smallSide };
  }, []);

  const startRound = useCallback(() => {
    const pos = generatePositions();
    setPositions(pos);
    setRoundActive(true);
    smallScale.value = 0;
    largeScale.value = 0;
    smallEnter.value = pos.smallSide === 'left' ? -80 : 80;
    largeEnter.value = pos.smallSide === 'left' ? 80 : -80;
    smallScale.value = withSpring(1, { damping: 12, stiffness: 140 });
    largeScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    smallEnter.value = withSpring(0, { damping: 14, stiffness: 100 });
    largeEnter.value = withSpring(0, { damping: 14, stiffness: 90 });
    gemGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.45, { duration: 600 })),
      -1,
      true,
    );
  }, [generatePositions]);

  const endGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TOTAL_ROUNDS, xp: finalScore * 15 };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Perfect targeting! You found every gem!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'tapOnlySmall',
        correct: finalScore,
        total: TOTAL_ROUNDS,
        accuracy: (finalScore / TOTAL_ROUNDS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['selective-targeting', 'inhibition', 'visual-discrimination'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log tap only small game:', e);
    }
  }, [router]);

  const nextRound = useCallback((newScore: number) => {
    if (roundRef.current >= TOTAL_ROUNDS) {
      endGame(newScore);
    } else {
      roundRef.current += 1;
      setRound(roundRef.current);
      setTimeout(startRound, ROUND_HANDOFF_MS);
    }
  }, [endGame, startRound]);

  const handleTap = useCallback((which: 'small' | 'large') => {
    if (!roundActive || done) return;
    const isCorrect = which === 'small';

    if (isCorrect) {
      setRoundActive(false);
      playSuccess();
      setSparkleKey(Date.now());
      setFeedback({ text: '✓ Gem found!', type: 'ok', key: Date.now() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      smallScale.value = withSequence(withTiming(1.2, { duration: 70 }), withTiming(0, { duration: 120 }));
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      setTimeout(() => nextRound(newScore), ROUND_HANDOFF_MS);
    } else {
      playError();
      setFeedback({ text: 'Tap the small gem!', type: 'bad', key: Date.now() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      shakeX.value = withSequence(
        withTiming(-10, { duration: 45 }), withTiming(10, { duration: 45 }),
        withTiming(-6, { duration: 45 }), withTiming(0, { duration: 45 }),
      );
      speakTTS('Tap the small one!', 0.78).catch(() => {});
    }
  }, [roundActive, done, nextRound, playSuccess, playError]);

  useEffect(() => {
    speakTTS('Find the small glowing gem. Ignore the big boulder!', 0.78);
    startRound();
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const arenaStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const smallStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: smallEnter.value }, { scale: smallScale.value }],
  }));
  const largeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: largeEnter.value }, { scale: largeScale.value }],
    opacity: 0.75,
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: gemGlow.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Gem Hunter!"
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

  const renderGem = () => (
    <Animated.View style={smallStyle}>
      <Animated.View pointerEvents="none" style={[styles.gemGlow, { width: smallSize + 36, height: smallSize + 36, borderRadius: (smallSize + 36) / 2 }, glowStyle]} />
      <Pressable onPress={() => handleTap('small')} style={{ width: smallSize + 20, height: smallSize + 20, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient colors={['#FDE68A', '#F59E0B', '#B45309']} style={[styles.gem, { width: smallSize, height: smallSize, borderRadius: smallSize / 2 }]}>
          <View style={styles.gemShine} />
          <Text style={styles.gemStar}>★</Text>
        </LinearGradient>
      </Pressable>
      <Text style={styles.gemLabel}>GEM</Text>
    </Animated.View>
  );

  const renderBoulder = () => (
    <Animated.View style={largeStyle}>
      <Pressable onPress={() => handleTap('large')} style={{ width: largeSize + 16, height: largeSize + 16, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient colors={['#78716C', '#57534E', '#44403C']} style={[styles.boulder, { width: largeSize, height: largeSize, borderRadius: largeSize * 0.35 }]}>
          <View style={styles.boulderCrack} />
        </LinearGradient>
      </Pressable>
      <Text style={styles.boulderLabel}>boulder</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1C1917', '#292524', '#44403C', '#57534E']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Gem vs Boulder</Text>
        <Text style={styles.subtitle}>Tap only the small glowing gem</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      {feedback && <FeedbackChip text={feedback.text} type={feedback.type} show key={feedback.key} />}

      <Animated.View style={[styles.arena, arenaStyle]}>
        <LinearGradient colors={['rgba(255,255,255,0.04)', 'rgba(0,0,0,0.2)']} style={StyleSheet.absoluteFillObject} />
        {positions && (
          <>
            <View style={[styles.shapePos, { left: `${positions.small.x}%`, top: `${positions.small.y}%` }]}>{renderGem()}</View>
            <View style={[styles.shapePos, { left: `${positions.large.x}%`, top: `${positions.large.y}%` }]}>{renderBoulder()}</View>
          </>
        )}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F59E0B" count={12} size={7} />
      </Animated.View>

      <Text style={styles.footer}>The gem is small and glowing — ignore the big boulder</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1917' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#FDE68A' },
  subtitle: { fontSize: 13, color: 'rgba(253,230,138,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  feedback: { position: 'absolute', top: 188, alignSelf: 'center', zIndex: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  feedbackOk: { backgroundColor: 'rgba(34,197,94,0.92)' },
  feedbackBad: { backgroundColor: 'rgba(255,255,255,0.92)' },
  feedbackText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  feedbackTextDark: { color: '#44403C' },
  arena: { flex: 1, marginHorizontal: 14, marginBottom: 10, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(253,230,138,0.25)' },
  shapePos: { position: 'absolute', transform: [{ translateX: -40 }, { translateY: -40 }], alignItems: 'center' },
  gemGlow: { position: 'absolute', alignSelf: 'center', backgroundColor: '#F59E0B' },
  gem: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#F59E0B', shadowOpacity: 0.7, shadowRadius: 18, elevation: 14 },
  gemShine: { position: 'absolute', top: '12%', left: '18%', width: '38%', height: '28%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '-20deg' }] },
  gemStar: { fontSize: 16, color: '#78350F', fontWeight: '900' },
  gemLabel: { marginTop: 6, fontSize: 11, fontWeight: '900', color: '#FDE68A', letterSpacing: 2 },
  boulder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  boulderCrack: { width: '60%', height: 3, backgroundColor: 'rgba(0,0,0,0.3)', transform: [{ rotate: '-15deg' }] },
  boulderLabel: { marginTop: 6, fontSize: 11, color: 'rgba(168,162,158,0.6)', fontWeight: '600' },
  footer: { textAlign: 'center', color: 'rgba(214,211,209,0.75)', fontSize: 13, fontWeight: '600', paddingBottom: 18, paddingHorizontal: 20 },
});

export default TapOnlySmallTargetGame;
