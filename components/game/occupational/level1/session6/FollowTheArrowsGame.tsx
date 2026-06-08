/**
 * OT Level 1 · Session 6 · Game 3 — Follow The Arrows
 * Theme: "Compass Quest" — memorize and repeat the arrow sequence.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION6_PACING } from '@/components/game/occupational/level1/session6/session6Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION6_PACING;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type Dir = 'up' | 'down' | 'left' | 'right';

const ARROWS: Record<Dir, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };

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

const FollowTheArrowsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sequence, setSequence] = useState<Dir[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSequence, setShowSequence] = useState(true);
  const [sparkleKey, setSparkleKey] = useState(0);

  const indexRef = useRef(0);
  const sequenceRef = useRef<Dir[]>([]);
  const shakingRef = useRef(false);
  const roundActiveRef = useRef(false);
  const showingRef = useRef(true);
  const doneRef = useRef(false);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glows = { up: useSharedValue(0), down: useSharedValue(0), left: useSharedValue(0), right: useSharedValue(0) };
  const scales = { up: useSharedValue(1), down: useSharedValue(1), left: useSharedValue(1), right: useSharedValue(1) };
  const shakes = { up: useSharedValue(0), down: useSharedValue(0), left: useSharedValue(0), right: useSharedValue(0) };

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Compass master! Perfect directions!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'followTheArrows',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['early-spatial-sequencing', 'directional-recall', 'writing-directionality'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const generateSequence = useCallback((r: number): Dir[] => {
    const dirs: Dir[] = ['up', 'down', 'left', 'right'];
    const len = Math.min(P.arrows.maxLength, P.arrows.startLength + Math.floor(r / 3));
    return Array.from({ length: len }, () => dirs[Math.floor(Math.random() * 4)]);
  }, []);

  const playDemo = useCallback((seq: Dir[]) => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setShowSequence(true);
    showingRef.current = true;
    roundActiveRef.current = false;
    (['up', 'down', 'left', 'right'] as Dir[]).forEach((d) => { glows[d].value = 0; scales[d].value = 1; });

    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setShowSequence(false);
        showingRef.current = false;
        roundActiveRef.current = true;
        speakTTS('Your turn! Tap the arrows in order.', 0.78).catch(() => {});
        return;
      }
      const d = seq[i];
      glows[d].value = withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 250 }));
      scales[d].value = withSequence(withTiming(1.25, { duration: 200 }), withTiming(1, { duration: 200 }));
      i += 1;
      demoTimerRef.current = setTimeout(step, P.sequenceStepMs);
    };
    demoTimerRef.current = setTimeout(step, P.sequenceStartDelayMs);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    const seq = generateSequence(round);
    setSequence(seq);
    setCurrentIndex(0);
    indexRef.current = 0;
    sequenceRef.current = seq;
    playDemo(seq);
  }, [round]);

  useEffect(() => {
    speakTTS('Watch the arrow sequence, then tap them in the same order!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (demoTimerRef.current) clearTimeout(demoTimerRef.current); };
  }, []);

  const handleTap = useCallback((dir: Dir) => {
    if (!roundActiveRef.current || doneRef.current || shakingRef.current || showingRef.current) return;

    const expected = sequenceRef.current[indexRef.current];
    if (dir === expected) {
      scales[dir].value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 12 }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const next = indexRef.current + 1;
      indexRef.current = next;
      setCurrentIndex(next);

      if (next >= sequenceRef.current.length) {
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;
        setScore((prev) => {
          const newScore = prev + 1;
          setTimeout(() => {
            if (newScore >= TOTAL_ROUNDS) endGame(newScore);
            else setRound((r) => r + 1);
          }, P.nextRoundDelayMs);
          return newScore;
        });
      }
    } else {
      shakingRef.current = true;
      shakes[dir].value = withSequence(withTiming(-8, { duration: 45 }), withTiming(8, { duration: 45 }), withTiming(0, { duration: 45 }));
      indexRef.current = 0;
      setCurrentIndex(0);
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Watch again!', 0.78).catch(() => {});
      setTimeout(() => {
        shakingRef.current = false;
        playDemo(sequenceRef.current);
      }, P.replayDelayMs);
    }
  }, [endGame, playSuccess, playError, playDemo]);

  const upStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.up.value + glows.up.value * 0.2 }, { translateX: shakes.up.value }], opacity: 0.6 + glows.up.value * 0.4 }));
  const downStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.down.value + glows.down.value * 0.2 }, { translateX: shakes.down.value }], opacity: 0.6 + glows.down.value * 0.4 }));
  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.left.value + glows.left.value * 0.2 }, { translateX: shakes.left.value }], opacity: 0.6 + glows.left.value * 0.4 }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.right.value + glows.right.value * 0.2 }, { translateX: shakes.right.value }], opacity: 0.6 + glows.right.value * 0.4 }));

  const expected = sequence[currentIndex];

  const renderBtn = (dir: Dir, style: object) => (
    <Animated.View style={style}>
      <Pressable onPress={() => handleTap(dir)} disabled={showSequence || shakingRef.current}>
        <LinearGradient
          colors={dir === expected && !showSequence ? ['#22C55E', '#16A34A'] : ['#1E3A5F', '#0F2847']}
          style={styles.arrowBtn}>
          <Text style={styles.arrowEmoji}>{ARROWS[dir]}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Compass Captain!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C4A6E', '#075985', '#0369A1', '#0284C7']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🧭 Compass Quest</Text>
        <Text style={styles.subtitle}>Watch · remember · navigate</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.compass}>
          {renderBtn('up', upStyle)}
          <View style={styles.midRow}>
            {renderBtn('left', leftStyle)}
            <View style={styles.compassCore}><Text style={styles.compassN}>N</Text></View>
            {renderBtn('right', rightStyle)}
          </View>
          {renderBtn('down', downStyle)}
        </View>

        <View style={[styles.statusPill, showSequence && styles.statusWatch]}>
          <Text style={styles.statusText}>
            {showSequence ? '👀 Watch the arrows!' : `Tap ${currentIndex + 1} of ${sequence.length}`}
          </Text>
        </View>

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#38BDF8" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#075985' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0F2FE', textShadowColor: 'rgba(56,189,248,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(224,242,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  compass: { alignItems: 'center', gap: 14 },
  midRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  compassCore: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(251,191,36,0.9)', justifyContent: 'center', alignItems: 'center' },
  compassN: { fontSize: 18, fontWeight: '900', color: '#78350F' },
  arrowBtn: { width: P.arrows.size, height: P.arrows.size, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  arrowEmoji: { fontSize: 48 },
  statusPill: { marginTop: 36, backgroundColor: 'rgba(14,116,144,0.9)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22 },
  statusWatch: { backgroundColor: 'rgba(251,191,36,0.88)' },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default FollowTheArrowsGame;
