/**
 * OT Level 1 · Session 5 · Game 4 — Drag Slowly
 * Theme: "Zen Crawl Lane" — move the snail slowly along the garden path.
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

const P = SESSION5_PACING.dragSlowly;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
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

const DragSlowlyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [isTooFast, setIsTooFast] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const progressRef = useRef(0);
  const isTooFastRef = useRef(false);
  const screenW = useRef(400);
  const screenH = useRef(600);
  const lastPos = useRef({ x: 20, time: Date.now() });
  const smoothedSpeed = useRef(0);
  const lastWarn = useRef(0);

  const barX = useSharedValue(18);
  const barY = useSharedValue(50);
  const barScale = useSharedValue(1);
  const pathStartX = useSharedValue(18);
  const pathEndX = useSharedValue(82);
  const pathY = useSharedValue(50);
  const progressSV = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Slow and steady wins! Perfect control!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'dragSlowly',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['controlled-movement', 'proprioception', 'pacing', 'sustained-finger-contact'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => {
    pathStartX.value = 16;
    pathEndX.value = 84;
    pathY.value = 38 + Math.random() * 24;
    barX.value = pathStartX.value;
    barY.value = pathY.value;
    progressRef.current = 0;
    progressSV.value = 0;
    smoothedSpeed.current = 0;
    isTooFastRef.current = false;
    setSpeed(0);
    setIsTooFast(false);
    roundActiveRef.current = true;
  }, [round]);

  useEffect(() => {
    speakTTS('Drag the snail slowly along the path. Keep the speed in the green zone!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(true);
      barScale.value = withSpring(1.15, { damping: 10, stiffness: 220 });
      lastPos.current = { x: barX.value, time: Date.now() };
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      const clampedX = Math.max(pathStartX.value, Math.min(pathEndX.value, (e.x / screenW.current) * 100));
      barX.value = clampedX;
      barY.value = pathY.value;

      const now = Date.now();
      const dt = now - lastPos.current.time;
      if (dt >= P.minTimeDelta) {
        const dd = Math.abs(barX.value - lastPos.current.x);
        if (dd > 0.08) {
          const spd = (dd / dt) * 1000;
          smoothedSpeed.current = smoothedSpeed.current * 0.78 + spd * 0.22;
          setSpeed(smoothedSpeed.current);
          const fast = smoothedSpeed.current > P.maxSpeed;
          isTooFastRef.current = fast;
          setIsTooFast(fast);
          if (fast && now - lastWarn.current > 1800) {
            lastWarn.current = now;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          }
        } else {
          smoothedSpeed.current *= 0.88;
          setSpeed(smoothedSpeed.current);
          isTooFastRef.current = false;
          setIsTooFast(false);
        }
        lastPos.current = { x: barX.value, time: now };
      }

      const prog = (barX.value - pathStartX.value) / (pathEndX.value - pathStartX.value);
      progressRef.current = Math.min(1, Math.max(0, prog));
      progressSV.value = progressRef.current;
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setIsDragging(false);
      barScale.value = withSpring(1, { damping: 12, stiffness: 180 });

      const prog = progressRef.current;
      const fast = isTooFastRef.current;

      if (prog >= 0.92 && !fast) {
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
        barX.value = withSpring(pathStartX.value, { damping: 12, stiffness: 140 });
        progressRef.current = 0;
        progressSV.value = 0;
        smoothedSpeed.current = 0;
        isTooFastRef.current = false;
        setSpeed(0);
        setIsTooFast(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      }
    });

  const barStyle = useAnimatedStyle(() => ({
    left: `${barX.value}%`,
    top: `${barY.value}%`,
    transform: [{ translateX: -P.barSize / 2 }, { translateY: -P.barSize / 2 }, { scale: barScale.value }],
  }));

  const pathStyle = useAnimatedStyle(() => ({
    left: `${pathStartX.value}%`,
    top: `${pathY.value}%`,
    width: `${pathEndX.value - pathStartX.value}%`,
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    left: `${pathStartX.value}%`,
    top: `${pathY.value}%`,
    width: `${(pathEndX.value - pathStartX.value) * progressSV.value}%`,
  }));

  const speedColor = isTooFast ? '#EF4444' : speed > P.slowTarget ? '#F59E0B' : '#22C55E';
  const speedLabel = isTooFast ? 'TOO FAST!' : speed > P.slowTarget ? 'FAST' : 'PERFECT';

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Zen Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.titleDark}>🐌 Zen Crawl Lane</Text>
        <Text style={styles.subtitleDark}>Move slowly · stay in the green zone</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPillLight}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPillLight, styles.starPillLight]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.speedRow}>
        <Text style={styles.speedLabel}>Speed</Text>
        <View style={styles.speedTrack}>
          <View style={[styles.speedFill, { width: `${Math.min(100, (speed / P.maxSpeed) * 100)}%`, backgroundColor: speedColor }]} />
        </View>
        <Text style={[styles.speedStatus, { color: speedColor }]}>{speedLabel}</Text>
      </View>

      <View style={styles.playArea} onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Animated.View style={[styles.pathBg, pathStyle]} />
            <Animated.View style={[styles.pathFill, progressFillStyle]} />

            <View style={[styles.marker, { left: `${pathStartX.value}%`, top: `${pathY.value}%`, transform: [{ translateX: -28 }, { translateY: -36 }] }]}>
              <Text style={styles.markerText}>START</Text>
            </View>
            <View style={[styles.marker, styles.endMarker, { left: `${pathEndX.value}%`, top: `${pathY.value}%`, transform: [{ translateX: -28 }, { translateY: -36 }] }]}>
              <Text style={styles.markerText}>END</Text>
            </View>

            <Animated.View style={[styles.barWrap, barStyle]}>
              <LinearGradient colors={isTooFast ? ['#EF4444', '#DC2626'] : ['#059669', '#047857']} style={styles.bar}>
                <Text style={styles.barEmoji}>🐌</Text>
              </LinearGradient>
            </Animated.View>

            {isTooFast && (
              <View style={styles.warnPill}><Text style={styles.warnText}>Slow down! ⚠️</Text></View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#059669" count={12} size={7} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(5,150,105,0.25)' },
  backTextDark: { color: '#065F46', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#065F46' },
  subtitleDark: { fontSize: 14, color: '#047857', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPillLight: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(5,150,105,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPillLight: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#047857', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#065F46' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  speedRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8, gap: 10 },
  speedLabel: { fontSize: 13, fontWeight: '800', color: '#065F46' },
  speedTrack: { flex: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 9, overflow: 'hidden' },
  speedFill: { height: '100%', borderRadius: 9 },
  speedStatus: { fontSize: 12, fontWeight: '900', minWidth: 72, textAlign: 'right' },
  playArea: { flex: 1, marginHorizontal: 8 },
  gestureArea: { flex: 1, position: 'relative' },
  pathBg: { position: 'absolute', height: 22, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 11, transform: [{ translateY: -11 }] },
  pathFill: { position: 'absolute', height: 22, backgroundColor: '#059669', borderRadius: 11, transform: [{ translateY: -11 }] },
  marker: { position: 'absolute', backgroundColor: '#047857', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  endMarker: { backgroundColor: '#059669' },
  markerText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  barWrap: { position: 'absolute', zIndex: 3 },
  bar: { width: SESSION5_PACING.dragSlowly.barSize, height: SESSION5_PACING.dragSlowly.barSize, borderRadius: SESSION5_PACING.dragSlowly.barSize / 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#047857', shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  barEmoji: { fontSize: 36 },
  warnPill: { position: 'absolute', top: '15%', alignSelf: 'center', left: '25%', right: '25%', backgroundColor: 'rgba(239,68,68,0.9)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  warnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});

export default DragSlowlyGame;
