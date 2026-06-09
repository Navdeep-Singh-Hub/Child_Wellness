/**
 * Shared polyline trace game core for OT Level 2 Session 3.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION3_PACING } from '@/components/game/occupational/level2/session3/session3Pacing';
import {
  buildPolylinePaths,
  distanceToPolyline,
  Point,
  progressOnPolyline,
  useTraceSound,
} from '@/components/game/occupational/level2/session3/traceUtils';
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

const P = SESSION3_PACING;
const PATH_STROKE = P.pathStroke + 4;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');

export type SceneId = 'mountain' | 'lightning' | 'saw' | 'robot' | 'race';

export type PolylineTraceTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  sceneId: SceneId;
  gradient: [string, string, string, string];
  trackStroke: string;
  progressStroke: string;
  pathGradient: [string, string, string];
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  progressFill: string;
  objColors: [string, string];
  objGlow: string;
  sparkleColor: string;
  traceHint: string;
};

export type PolylineTraceConfig = {
  theme: PolylineTraceTheme;
  generatePoints: () => Point[];
  ttsIntro: string;
  ttsComplete: string;
  ttsRetry: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const SceneDecor: React.FC<{ sceneId: SceneId }> = ({ sceneId }) => {
  switch (sceneId) {
    case 'mountain':
      return (
        <>
          <Path d="M 0 88 Q 25 78 50 88 T 100 88 L 100 100 L 0 100 Z" fill="rgba(22,163,74,0.4)" />
          <Path d="M 5 80 L 18 58 L 32 80 Z" fill="rgba(22,101,52,0.45)" />
          <Path d="M 68 82 L 82 55 L 96 82 Z" fill="rgba(21,128,61,0.5)" />
          <Ellipse cx="15" cy="20" rx="9" ry="5" fill="rgba(255,255,255,0.75)" />
          <Ellipse cx="78" cy="16" rx="12" ry="6" fill="rgba(255,255,255,0.8)" />
        </>
      );
    case 'lightning':
      return (
        <>
          {[[10, 12], [30, 8], [55, 15], [75, 10], [90, 18], [20, 28], [65, 25]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 1 : 0.7} fill="rgba(255,255,255,0.65)" />
          ))}
          <Ellipse cx="25" cy="18" rx="14" ry="7" fill="rgba(30,27,75,0.6)" />
          <Ellipse cx="70" cy="14" rx="16" ry="8" fill="rgba(49,46,129,0.55)" />
        </>
      );
    case 'saw':
      return (
        <>
          <Path d="M 0 88 L 100 88 L 100 100 L 0 100 Z" fill="rgba(180,83,9,0.35)" />
          {[10, 30, 50, 70, 90].map((x) => (
            <Path key={x} d={`M ${x - 8} 88 L ${x} 78 L ${x + 8} 88 Z`} fill="rgba(146,64,14,0.3)" />
          ))}
          <Path d="M 0 92 L 100 92" stroke="rgba(120,53,15,0.25)" strokeWidth="0.8" />
        </>
      );
    case 'robot':
      return (
        <>
          <Circle cx="50" cy="22" r="12" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8" />
          <Circle cx="46" cy="20" r="2" fill="rgba(37,99,235,0.35)" />
          <Circle cx="54" cy="20" r="2" fill="rgba(37,99,235,0.35)" />
          <Path d="M 44 26 Q 50 29 56 26" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8" fill="none" />
          {[15, 35, 55, 75, 95].map((x) => (
            <Path key={x} d={`M ${x} 10 L ${x} 90`} stroke="rgba(59,130,246,0.08)" strokeWidth="0.5" />
          ))}
          {[20, 40, 60, 80].map((y) => (
            <Path key={y} d={`M 5 ${y} L 95 ${y}`} stroke="rgba(59,130,246,0.08)" strokeWidth="0.5" />
          ))}
        </>
      );
    case 'race':
      return (
        <>
          <Path d="M 0 90 L 100 90 L 100 100 L 0 100 Z" fill="rgba(55,65,81,0.35)" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Path
              key={i}
              d={`M ${i * 10} 90 L ${i * 10 + 5} 90 L ${i * 10 + 5} 100 L ${i * 10} 100 Z`}
              fill={i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
            />
          ))}
          <Path d="M 92 78 L 92 88 L 98 83 Z" fill="#EF4444" />
        </>
      );
    default:
      return null;
  }
};

export const PolylineTraceGame: React.FC<
  PolylineTraceConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  generatePoints,
  ttsIntro,
  ttsComplete,
  ttsRetry,
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const TOTAL = P.totalRounds;

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

  const pointsRef = useRef<Point[]>([]);
  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const offTrackRef = useRef(false);
  const progressRef = useRef(0);
  const lastWarn = useRef(0);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const ox = useSharedValue(20);
  const oy = useSharedValue(70);
  const oScale = useSharedValue(1);

  const refreshPaths = useCallback((prog: number) => {
    const { full, progressPath } = buildPolylinePaths(pointsRef.current, prog);
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
    speakTTS(ttsComplete, 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router, ttsComplete, logType, skillTags]);

  const initRound = useCallback(() => {
    pointsRef.current = generatePoints();
    const start = pointsRef.current[0];
    const end = pointsRef.current[pointsRef.current.length - 1];
    ox.value = start.x;
    oy.value = start.y;
    progressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    setTraceProg(0);
    setMarkers({ sx: start.x, sy: start.y, ex: end.x, ey: end.y });
    refreshPaths(0);
    roundActiveRef.current = true;
  }, [generatePoints, refreshPaths]);

  useEffect(() => { if (!doneRef.current) initRound(); }, [round]);
  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, [ttsIntro]);

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
      const pts = pointsRef.current;
      const dist = distanceToPolyline(nx, ny, pts);
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
      ox.value = nx;
      oy.value = ny;
      const prog = Math.max(progressRef.current, progressOnPolyline(nx, ny, pts));
      if (prog > progressRef.current) {
        progressRef.current = prog;
        setTraceProg(prog);
        refreshPaths(prog);
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      oScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      const last = pointsRef.current[pointsRef.current.length - 1];
      const distEnd = Math.hypot(ox.value - last.x, oy.value - last.y);
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
        const start = pointsRef.current[0];
        ox.value = withSpring(start.x, { damping: 12 });
        oy.value = withSpring(start.y, { damping: 12 });
        progressRef.current = 0;
        setTraceProg(0);
        refreshPaths(0);
        offTrackRef.current = false;
        setIsOffTrack(false);
        speakTTS(ttsRetry, 0.78).catch(() => {});
      }
    });

  const objStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`,
    top: `${oy.value}%`,
    transform: [{ translateX: -P.objectSize / 2 }, { translateY: -P.objectSize / 2 }, { scale: oScale.value }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message={congratsMessage} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn}>
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>{T.emoji} {T.title}</Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{round}/{TOTAL}</Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
      </View>
      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(traceProg * 100)}%`, backgroundColor: T.progressFill }]} />
        </View>
        <GestureDetector gesture={pan}>
          <Animated.View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              <Defs>
                <SvgLinearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={T.pathGradient[0]} />
                  <Stop offset="50%" stopColor={T.pathGradient[1]} />
                  <Stop offset="100%" stopColor={T.pathGradient[2]} />
                </SvgLinearGradient>
              </Defs>
              <SceneDecor sceneId={T.sceneId} />
              {pathFull ? (
                <>
                  <Path d={pathFull} stroke={T.trackStroke} strokeWidth={PATH_STROKE + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d={pathFull} stroke="rgba(255,255,255,0.45)" strokeWidth={PATH_STROKE + 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d={pathFull} stroke="url(#pathGrad)" strokeWidth={PATH_STROKE} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : null}
              {pathProg ? (
                <>
                  <Path d={pathProg} stroke="rgba(255,255,255,0.85)" strokeWidth={PATH_STROKE + 3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d={pathProg} stroke={T.progressStroke} strokeWidth={PATH_STROKE + 1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : null}
              <Circle cx={markers.sx} cy={markers.sy} r="3.5" fill="#22C55E" stroke="#fff" strokeWidth="1.2" />
              <Circle cx={markers.ex} cy={markers.ey} r="4.5" fill="#FBBF24" stroke="#fff" strokeWidth="1.2" />
            </Svg>
            <Animated.View style={[styles.objWrap, objStyle]}>
              <LinearGradient
                colors={isOffTrack ? ['#EF4444', '#DC2626'] : T.objColors}
                style={[styles.obj, !isOffTrack && { shadowColor: T.objGlow, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10 }]}
              >
                <Text style={styles.emoji}>{T.emoji}</Text>
              </LinearGradient>
            </Animated.View>
            {traceProg > 0 && traceProg < 0.95 && !isOffTrack && (
              <View style={styles.traceHint}><Text style={[styles.traceHintText, { color: T.titleColor }]}>{T.traceHint}</Text></View>
            )}
            {isOffTrack && <View style={styles.warnPill}><Text style={styles.warnText}>Stay on the path!</Text></View>}
            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={18} size={10} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.25)', borderColor: 'rgba(251,191,36,0.45)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1.5, overflow: 'hidden' },
  progressTrack: { height: 6, marginHorizontal: 12, marginTop: 10, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  gestureArea: { flex: 1, position: 'relative' },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  objWrap: { position: 'absolute', zIndex: 3 },
  obj: { width: P.objectSize, height: P.objectSize, borderRadius: P.objectSize / 2, justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 3, borderColor: '#fff' },
  emoji: { fontSize: 26 },
  traceHint: { position: 'absolute', top: '6%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.88)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  traceHintText: { fontSize: 13, fontWeight: '800' },
  warnPill: { position: 'absolute', top: '10%', alignSelf: 'center', left: '20%', right: '20%', backgroundColor: 'rgba(239,68,68,0.9)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  warnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
