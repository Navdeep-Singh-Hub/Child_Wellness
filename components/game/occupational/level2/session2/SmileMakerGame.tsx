/**
 * OT Level 2 · Session 2 · Game 4 — Smile Maker
 * Theme: "Happy Curve" — trace the smile curve.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION2_PACING } from '@/components/game/occupational/level2/session2/session2Pacing';
import { arcProgress, buildArcPaths, distanceToArc, useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
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
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const P = SESSION2_PACING;
const PATH_STROKE = P.pathStroke + 4;
const TOTAL = P.totalRounds;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');

const SmileMakerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [markers, setMarkers] = useState({ sx: 0, sy: 0, ex: 0, ey: 0 });

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const offTrackRef = useRef(false);
  const progressRef = useRef(0);
  const lastWarn = useRef(0);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const cx = useSharedValue(50); const cy = useSharedValue(55);
  const r = useSharedValue(28); const sa = useSharedValue(Math.PI * 0.2); const ea = useSharedValue(Math.PI * 0.8);
  const ox = useSharedValue(50); const oy = useSharedValue(55);
  const oScale = useSharedValue(1);

  const refreshPaths = useCallback((prog: number) => {
    const { full, progressPath } = buildArcPaths(cx.value, cy.value, r.value, sa.value, ea.value, prog);
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
    speakTTS('Happy curve complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'smileMaker', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['smooth-wrist-movement', 'curved-tracking', 'smile-curve-tracing'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const initRound = useCallback(() => {
    r.value = 24 + Math.random() * 10;
    const startX = cx.value + r.value * Math.cos(sa.value);
    const startY = cy.value + r.value * Math.sin(sa.value);
    const endX = cx.value + r.value * Math.cos(ea.value);
    const endY = cy.value + r.value * Math.sin(ea.value);
    ox.value = startX; oy.value = startY;
    progressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    setTraceProg(0);
    setMarkers({ sx: startX, sy: startY, ex: endX, ey: endY });
    refreshPaths(0);
    roundActiveRef.current = true;
  }, [refreshPaths]);

  useEffect(() => { if (!doneRef.current) initRound(); }, [round]);
  useEffect(() => {
    speakTTS('Trace the smile curve from left to right!', 0.78);
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
      const dist = distanceToArc(nx, ny, cx.value, cy.value, r.value, sa.value, ea.value);
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
      const prog = Math.max(progressRef.current, arcProgress(nx, ny, cx.value, cy.value, sa.value, ea.value));
      if (prog > progressRef.current) { progressRef.current = prog; setTraceProg(prog); refreshPaths(prog); }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      oScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      const endX = cx.value + r.value * Math.cos(ea.value);
      const endY = cy.value + r.value * Math.sin(ea.value);
      const distEnd = Math.hypot(ox.value - endX, oy.value - endY);
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
        const startX = cx.value + r.value * Math.cos(sa.value);
        const startY = cy.value + r.value * Math.sin(sa.value);
        ox.value = withSpring(startX, { damping: 12 }); oy.value = withSpring(startY, { damping: 12 });
        progressRef.current = 0; setTraceProg(0); refreshPaths(0);
        offTrackRef.current = false; setIsOffTrack(false);
        speakTTS('Trace the smile curve!', 0.78).catch(() => {});
      }
    });

  const objStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`, top: `${oy.value}%`,
    transform: [{ translateX: -P.objectSize / 2 }, { translateY: -P.objectSize / 2 }, { scale: oScale.value }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Smile Artist!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FEF9C3', '#FDE68A', '#FBCFE8', '#F9A8D4']} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>😊 Happy Curve</Text>
        <Text style={styles.subtitle}>Trace the smile from corner to corner</Text>
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
                <SvgLinearGradient id="smilePath" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#F472B6" /><Stop offset="50%" stopColor="#EC4899" /><Stop offset="100%" stopColor="#DB2777" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx="50" cy="42" r="28" fill="rgba(253,224,71,0.25)" stroke="rgba(251,191,36,0.2)" strokeWidth="1" />
              <Circle cx="38" cy="38" r="4" fill="rgba(30,41,59,0.15)" />
              <Circle cx="62" cy="38" r="4" fill="rgba(30,41,59,0.15)" />
              <Circle cx="32" cy="48" r="5" fill="rgba(251,113,133,0.35)" />
              <Circle cx="68" cy="48" r="5" fill="rgba(251,113,133,0.35)" />
              <Circle cx="82" cy="14" r="8" fill="rgba(253,224,71,0.7)" />
              {pathFull ? (
                <>
                  <Path d={pathFull} stroke="rgba(236,72,153,0.2)" strokeWidth={PATH_STROKE + 8} fill="none" strokeLinecap="round" />
                  <Path d={pathFull} stroke="rgba(255,255,255,0.55)" strokeWidth={PATH_STROKE + 2} fill="none" strokeLinecap="round" />
                  <Path d={pathFull} stroke="url(#smilePath)" strokeWidth={PATH_STROKE} fill="none" strokeLinecap="round" />
                </>
              ) : null}
              {pathProg ? (
                <>
                  <Path d={pathProg} stroke="rgba(255,255,255,0.9)" strokeWidth={PATH_STROKE + 3} fill="none" strokeLinecap="round" />
                  <Path d={pathProg} stroke="#F472B6" strokeWidth={PATH_STROKE + 1} fill="none" strokeLinecap="round" />
                </>
              ) : null}
              <Circle cx={markers.sx} cy={markers.sy} r="3.5" fill="#22C55E" stroke="#fff" strokeWidth="1.2" />
              <Circle cx={markers.ex} cy={markers.ey} r="4.5" fill="#FBBF24" stroke="#fff" strokeWidth="1.2" />
            </Svg>
            <Animated.View style={[styles.objWrap, objStyle]}>
              <LinearGradient colors={isOffTrack ? ['#EF4444', '#DC2626'] : ['#FDE68A', '#F59E0B']} style={[styles.obj, !isOffTrack && styles.objGlow]}>
                <Text style={styles.emoji}>😊</Text>
              </LinearGradient>
            </Animated.View>
            {traceProg > 0 && traceProg < 0.95 && !isOffTrack && (
              <View style={styles.traceHint}><Text style={styles.traceHintText}>Draw the smile!</Text></View>
            )}
            {isOffTrack && <View style={styles.warnPill}><Text style={styles.warnText}>Stay on the path!</Text></View>}
            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F472B6" count={18} size={10} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)' },
  backText: { color: '#BE185D', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#BE185D' },
  subtitle: { fontSize: 14, color: '#DB2777', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, color: '#DB2777', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#BE185D' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(236,72,153,0.3)', backgroundColor: 'rgba(254,249,195,0.55)', overflow: 'hidden' },
  progressTrack: { height: 6, marginHorizontal: 12, marginTop: 10, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#EC4899' },
  gestureArea: { flex: 1, position: 'relative' },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  objWrap: { position: 'absolute', zIndex: 3 },
  obj: { width: P.objectSize, height: P.objectSize, borderRadius: P.objectSize / 2, justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 3, borderColor: '#fff' },
  objGlow: { shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  emoji: { fontSize: 26 },
  traceHint: { position: 'absolute', top: '6%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.85)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  traceHintText: { color: '#BE185D', fontSize: 13, fontWeight: '800' },
  warnPill: { position: 'absolute', top: '10%', alignSelf: 'center', left: '20%', right: '20%', backgroundColor: 'rgba(239,68,68,0.9)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  warnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});

export default SmileMakerGame;
