/**
 * OT Level 2 · Session 2 · Game 1 — Snake Slide
 * Theme: "Serpent Slide" — trace the smooth S-curve path.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION2_PACING } from '@/components/game/occupational/level2/session2/session2Pacing';
import { buildBezierPaths, distanceToBezier, useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const P = SESSION2_PACING;
const PATH_STROKE = P.pathStroke + 4;
const TOTAL = P.totalRounds;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');

const SnakeSlideGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [pathFull, setPathFull] = useState('');
  const [pathProg, setPathProg] = useState('');
  const [traceProg, setTraceProg] = useState(0);
  const [markers, setMarkers] = useState({ sx: 15, sy: 50, ex: 85, ey: 50 });

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const offTrackRef = useRef(false);
  const progressRef = useRef(0);
  const lastWarn = useRef(0);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const sx = useSharedValue(15); const sy = useSharedValue(50);
  const c1x = useSharedValue(35); const c1y = useSharedValue(30);
  const c2x = useSharedValue(65); const c2y = useSharedValue(70);
  const ex = useSharedValue(85); const ey = useSharedValue(50);
  const ox = useSharedValue(15); const oy = useSharedValue(50);
  const oScale = useSharedValue(1);

  const refreshPaths = useCallback((prog: number) => {
    const { full, progressPath } = buildBezierPaths(sx.value, sy.value, c1x.value, c1y.value, c2x.value, c2y.value, ex.value, ey.value, prog);
    setPathFull(full);
    setPathProg(progressPath);
  }, []);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Serpent slide complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'snakeSlide', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['smooth-wrist-movement', 'curved-tracking', 'smooth-curved-motion'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const initRound = useCallback(() => {
    sy.value = 38 + Math.random() * 24;
    c1y.value = sy.value - 12 - Math.random() * 8;
    c2y.value = sy.value + 12 + Math.random() * 8;
    ey.value = sy.value;
    ox.value = sx.value; oy.value = sy.value;
    progressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    setTraceProg(0);
    setMarkers({ sx: sx.value, sy: sy.value, ex: ex.value, ey: ey.value });
    refreshPaths(0);
    roundActiveRef.current = true;
  }, [refreshPaths]);

  useEffect(() => { if (!doneRef.current) initRound(); }, [round]);
  useEffect(() => {
    speakTTS('Slide along the smooth serpent curve!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const pan = Gesture.Pan().runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      oScale.value = withSpring(1.15, { damping: 12, stiffness: 220 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      const nx = Math.max(4, Math.min(96, (e.x / screenW.current) * 100));
      const ny = Math.max(6, Math.min(94, (e.y / screenH.current) * 100));
      const { dist, t } = distanceToBezier(nx, ny, sx.value, sy.value, c1x.value, c1y.value, c2x.value, c2y.value, ex.value, ey.value);
      const off = dist > P.lineTolerance;
      offTrackRef.current = off;
      setIsOffTrack(off);
      if (off) {
        const now = Date.now();
        if (now - lastWarn.current > P.warnIntervalMs) {
          lastWarn.current = now;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
        return;
      }
      ox.value = nx; oy.value = ny;
      const prog = Math.max(progressRef.current, Math.min(1, t));
      if (prog > progressRef.current) {
        progressRef.current = prog;
        setTraceProg(prog);
        refreshPaths(prog);
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      oScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      const distEnd = Math.hypot(ox.value - ex.value, oy.value - ey.value);
      if (distEnd <= P.endTolerance && progressRef.current >= P.minProgress && !offTrackRef.current) {
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;
        setScore((prev) => {
          const next = prev + 1;
          setTimeout(() => {
            if (next >= TOTAL) endGame(next);
            else { setRound((r) => r + 1); roundActiveRef.current = true; }
          }, P.nextRoundDelayMs);
          return next;
        });
      } else {
        ox.value = withSpring(sx.value, { damping: 12 }); oy.value = withSpring(sy.value, { damping: 12 });
        progressRef.current = 0; setTraceProg(0); refreshPaths(0);
        offTrackRef.current = false; setIsOffTrack(false);
        speakTTS('Follow the curve to the end!', 0.78).catch(() => {});
      }
    });

  const objStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`, top: `${oy.value}%`,
    transform: [{ translateX: -P.objectSize / 2 }, { translateY: -P.objectSize / 2 }, { scale: oScale.value }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Serpent Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ECFDF5', '#D1FAE5', '#6EE7B7', '#34D399']} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>🐍 Serpent Slide</Text>
        <Text style={styles.subtitle}>Trace the smooth S-curve</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL}</Text></View>
          <View style={[styles.statPill, styles.starPill]}><Image source={STAR} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text></View>
        </View>
      </View>
      <View style={styles.playArea} onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(traceProg * 100)}%` }]} />
        </View>
        <GestureDetector gesture={pan}>
          <Animated.View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              <Defs>
                <SvgLinearGradient id="snakePath" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#34D399" /><Stop offset="50%" stopColor="#059669" /><Stop offset="100%" stopColor="#047857" />
                </SvgLinearGradient>
              </Defs>
              <Path d="M 0 85 Q 20 78 40 85 T 80 85 L 100 85 L 100 100 L 0 100 Z" fill="rgba(22,163,74,0.4)" />
              <Path d="M 0 90 Q 25 82 50 90 T 100 90 L 100 100 L 0 100 Z" fill="rgba(21,128,61,0.5)" />
              <Ellipse cx="12" cy="22" rx="8" ry="12" fill="rgba(22,101,52,0.35)" />
              <Ellipse cx="88" cy="20" rx="9" ry="13" fill="rgba(22,101,52,0.35)" />
              <Ellipse cx="50" cy="12" rx="10" ry="14" fill="rgba(22,101,52,0.3)" />
              {pathFull ? (
                <>
                  <Path d={pathFull} stroke="rgba(16,185,129,0.2)" strokeWidth={PATH_STROKE + 8} fill="none" strokeLinecap="round" />
                  <Path d={pathFull} stroke="rgba(255,255,255,0.5)" strokeWidth={PATH_STROKE + 2} fill="none" strokeLinecap="round" />
                  <Path d={pathFull} stroke="url(#snakePath)" strokeWidth={PATH_STROKE} fill="none" strokeLinecap="round" />
                </>
              ) : null}
              {pathProg ? (
                <>
                  <Path d={pathProg} stroke="rgba(255,255,255,0.85)" strokeWidth={PATH_STROKE + 3} fill="none" strokeLinecap="round" />
                  <Path d={pathProg} stroke="#34D399" strokeWidth={PATH_STROKE + 1} fill="none" strokeLinecap="round" />
                </>
              ) : null}
              <Circle cx={markers.sx} cy={markers.sy} r="3.5" fill="#22C55E" stroke="#fff" strokeWidth="1.2" />
              <Circle cx={markers.ex} cy={markers.ey} r="4.5" fill="#FBBF24" stroke="#fff" strokeWidth="1.2" />
            </Svg>
            <Animated.View style={[styles.objWrap, objStyle]}>
              <LinearGradient colors={isOffTrack ? ['#EF4444', '#DC2626'] : ['#6EE7B7', '#059669']} style={[styles.obj, !isOffTrack && styles.objGlow]}>
                <Text style={styles.emoji}>🐍</Text>
              </LinearGradient>
            </Animated.View>
            {traceProg > 0 && traceProg < 0.95 && !isOffTrack && (
              <View style={styles.traceHint}><Text style={styles.traceHintText}>Slide along!</Text></View>
            )}
            {isOffTrack && <View style={styles.warnPill}><Text style={styles.warnText}>Stay on the path!</Text></View>}
            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#34D399" count={18} size={10} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  backText: { color: '#047857', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#047857' },
  subtitle: { fontSize: 14, color: '#059669', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, color: '#059669', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#047857' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(167,243,208,0.5)', overflow: 'hidden' },
  progressTrack: { height: 6, marginHorizontal: 12, marginTop: 10, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#059669' },
  gestureArea: { flex: 1, position: 'relative' },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  objWrap: { position: 'absolute', zIndex: 3 },
  obj: { width: P.objectSize, height: P.objectSize, borderRadius: P.objectSize / 2, justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 3, borderColor: '#fff' },
  objGlow: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  emoji: { fontSize: 26 },
  traceHint: { position: 'absolute', top: '6%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.85)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  traceHintText: { color: '#047857', fontSize: 13, fontWeight: '800' },
  warnPill: { position: 'absolute', top: '10%', alignSelf: 'center', left: '20%', right: '20%', backgroundColor: 'rgba(239,68,68,0.9)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  warnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});

export default SnakeSlideGame;
