/**
 * OT Level 1 · Session 5 · Game 2 — Follow The Line
 * Theme: "Neon Trail" — drag the glow orb along the neon path.
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
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION5_PACING.followLine;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

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

const FollowTheLineGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const progressRef = useRef(0);
  const isOffTrackRef = useRef(false);
  const screenW = useRef(400);
  const screenH = useRef(600);
  const lastWarn = useRef(0);

  const lineStartX = useSharedValue(18);
  const lineStartY = useSharedValue(50);
  const lineEndX = useSharedValue(82);
  const lineEndY = useSharedValue(50);
  const objectX = useSharedValue(18);
  const objectY = useSharedValue(50);
  const objectScale = useSharedValue(1);
  const progressSV = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Neon trail complete! Line master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'followTheLine',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['early-tracing-precursor', 'spatial-accuracy', 'hand-eye-integration'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const initLine = useCallback(() => {
    const dir = Math.floor(Math.random() * 3);
    if (dir === 0) {
      lineStartX.value = 18; lineStartY.value = 38 + Math.random() * 24;
      lineEndX.value = 82; lineEndY.value = lineStartY.value;
    } else if (dir === 1) {
      lineStartX.value = 38 + Math.random() * 24; lineStartY.value = 22;
      lineEndX.value = lineStartX.value; lineEndY.value = 78;
    } else {
      lineStartX.value = 18; lineStartY.value = 28;
      lineEndX.value = 82; lineEndY.value = 72;
    }
    objectX.value = lineStartX.value;
    objectY.value = lineStartY.value;
    progressRef.current = 0;
    progressSV.value = 0;
    isOffTrackRef.current = false;
    setIsOffTrack(false);
  }, []);

  useEffect(() => {
    initLine();
    roundActiveRef.current = true;
  }, [round]);

  useEffect(() => {
    speakTTS('Drag the glow orb along the neon path from start to end!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(true);
      objectScale.value = withSpring(1.2, { damping: 10, stiffness: 220 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      objectX.value = Math.max(4, Math.min(96, (e.x / screenW.current) * 100));
      objectY.value = Math.max(6, Math.min(94, (e.y / screenH.current) * 100));

      const dist = distToSegment(objectX.value, objectY.value, lineStartX.value, lineStartY.value, lineEndX.value, lineEndY.value);
      const off = dist > P.lineTolerance;
      isOffTrackRef.current = off;
      setIsOffTrack(off);

      if (off) {
        const now = Date.now();
        if (now - lastWarn.current > 600) {
          lastWarn.current = now;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
      } else {
        const total = Math.hypot(lineEndX.value - lineStartX.value, lineEndY.value - lineStartY.value);
        const cur = Math.hypot(objectX.value - lineStartX.value, objectY.value - lineStartY.value);
        const prog = Math.min(1, Math.max(0, cur / total));
        progressRef.current = prog;
        progressSV.value = prog;
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(false);
      objectScale.value = withSpring(1, { damping: 12, stiffness: 180 });

      const distEnd = Math.hypot(objectX.value - lineEndX.value, objectY.value - lineEndY.value);
      const prog = progressRef.current;

      if (distEnd <= P.endTolerance && prog >= P.minProgress && !isOffTrackRef.current) {
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
        objectX.value = withSpring(lineStartX.value, { damping: 12, stiffness: 140 });
        objectY.value = withSpring(lineStartY.value, { damping: 12, stiffness: 140 });
        progressRef.current = 0;
        progressSV.value = 0;
        isOffTrackRef.current = false;
        setIsOffTrack(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
        speakTTS('Follow the line to the end!', 0.78).catch(() => {});
      }
    });

  const objectStyle = useAnimatedStyle(() => ({
    left: `${objectX.value}%`,
    top: `${objectY.value}%`,
    transform: [{ translateX: -P.objectSize / 2 }, { translateY: -P.objectSize / 2 }, { scale: objectScale.value }],
  }));

  const lineStyle = useAnimatedStyle(() => {
    const dx = lineEndX.value - lineStartX.value;
    const dy = lineEndY.value - lineStartY.value;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const length = Math.hypot(dx, dy);
    return {
      left: `${lineStartX.value}%`,
      top: `${lineStartY.value}%`,
      width: `${length}%`,
      transform: [{ rotate: `${angle}deg` }, { translateY: -P.lineWidth / 2 }],
    };
  });

  const progressLineStyle = useAnimatedStyle(() => {
    const dx = lineEndX.value - lineStartX.value;
    const dy = lineEndY.value - lineStartY.value;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const total = Math.hypot(dx, dy);
    return {
      left: `${lineStartX.value}%`,
      top: `${lineStartY.value}%`,
      width: `${total * progressSV.value}%`,
      transform: [{ rotate: `${angle}deg` }, { translateY: -P.lineWidth / 2 }],
    };
  });

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Neon Navigator!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F0A2E', '#1E1B4B', '#312E81']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>✨ Neon Trail</Text>
        <Text style={styles.subtitle}>Stay on the glowing path</Text>
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
            <Animated.View style={[styles.lineBg, lineStyle]} />
            <Animated.View style={[styles.lineGlow, progressLineStyle]} />

            <View style={[styles.marker, { left: `${lineStartX.value}%`, top: `${lineStartY.value}%`, transform: [{ translateX: -30 }, { translateY: -14 }] }]}>
              <Text style={styles.markerText}>START</Text>
            </View>
            <View style={[styles.marker, styles.endMarker, { left: `${lineEndX.value}%`, top: `${lineEndY.value}%`, transform: [{ translateX: -30 }, { translateY: -14 }] }]}>
              <Text style={styles.markerText}>END</Text>
            </View>

            <Animated.View style={[styles.orbWrap, objectStyle]}>
              <LinearGradient colors={isOffTrack ? ['#EF4444', '#DC2626'] : ['#22D3EE', '#06B6D4', '#0891B2']}
                style={styles.orb}>
                <View style={styles.orbShine} />
              </LinearGradient>
            </Animated.View>

            {isOffTrack && (
              <View style={styles.warnPill}><Text style={styles.warnText}>Stay on the line!</Text></View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#22D3EE" count={14} size={8} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1B4B' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#CFFAFE', textShadowColor: 'rgba(34,211,238,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  subtitle: { fontSize: 14, color: 'rgba(207,250,254,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 12, paddingVertical: 20 },
  gestureArea: { flex: 1, position: 'relative' },
  lineBg: { position: 'absolute', height: SESSION5_PACING.followLine.lineWidth, backgroundColor: 'rgba(148,163,184,0.25)', borderRadius: SESSION5_PACING.followLine.lineWidth / 2 },
  lineGlow: { position: 'absolute', height: SESSION5_PACING.followLine.lineWidth, backgroundColor: '#22D3EE', borderRadius: SESSION5_PACING.followLine.lineWidth / 2, shadowColor: '#22D3EE', shadowOpacity: 0.8, shadowRadius: 12 },
  marker: { position: 'absolute', backgroundColor: '#6366F1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, zIndex: 5 },
  endMarker: { backgroundColor: '#06B6D4' },
  markerText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  orbWrap: { position: 'absolute', zIndex: 4 },
  orb: { width: SESSION5_PACING.followLine.objectSize, height: SESSION5_PACING.followLine.objectSize, borderRadius: SESSION5_PACING.followLine.objectSize / 2, shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16, elevation: 12 },
  orbShine: { position: 'absolute', top: 10, left: 12, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.5)' },
  warnPill: { position: 'absolute', top: '12%', alignSelf: 'center', left: '22%', right: '22%', backgroundColor: 'rgba(239,68,68,0.9)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  warnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});

export default FollowTheLineGame;
