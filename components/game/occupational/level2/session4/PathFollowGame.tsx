/**
 * Shared path-following game core for OT Level 2 Session 4.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION4_PACING } from '@/components/game/occupational/level2/session4/session4Pacing';
import {
  buildPolylinePaths,
  distanceToDots,
  distanceToPolyline,
  dotsFromPolyline,
  Point,
  progressOnPolyline,
  useTraceSound,
} from '@/components/game/occupational/level2/session4/traceUtils';
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const P = SESSION4_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');

export type PathFollowTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  trackStroke: string;
  progressStroke: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  objColors: [string, string];
  sparkleColor: string;
};

export type PathRenderMode = 'line' | 'wide' | 'dots' | 'river';

export type PathFollowConfig = {
  theme: PathFollowTheme;
  generatePoints: () => Point[];
  pathMode?: PathRenderMode;
  lineTolerance?: number;
  rotateObject?: boolean;
  ttsIntro: string;
  ttsComplete: string;
  ttsRetry: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const PathFollowGame: React.FC<
  PathFollowConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  generatePoints,
  pathMode = 'line',
  lineTolerance,
  rotateObject = false,
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

  const tol = lineTolerance ?? (
    pathMode === 'dots' ? P.dotTolerance :
    pathMode === 'wide' || pathMode === 'river' ? P.wideTolerance :
    P.lineTolerance
  );
  const strokeW = pathMode === 'wide' || pathMode === 'river' ? P.widePathWidth : P.pathStroke;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [pathFull, setPathFull] = useState('');
  const [pathProg, setPathProg] = useState('');
  const [trailDots, setTrailDots] = useState<Point[]>([]);

  const pointsRef = useRef<Point[]>([]);
  const dotsRef = useRef<Point[]>([]);
  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const offTrackRef = useRef(false);
  const progressRef = useRef(0);
  const lastWarn = useRef(0);
  const lastPos = useRef({ x: 20, y: 50 });
  const screenW = useRef(400);
  const screenH = useRef(600);

  const ox = useSharedValue(20);
  const oy = useSharedValue(50);
  const oScale = useSharedValue(1);
  const oRot = useSharedValue(0);

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
    if (pathMode === 'dots') {
      dotsRef.current = dotsFromPolyline(pointsRef.current, P.dotSpacing);
      setTrailDots(dotsRef.current);
    }
    const start = pointsRef.current[0];
    ox.value = start.x;
    oy.value = start.y;
    lastPos.current = { x: start.x, y: start.y };
    progressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    refreshPaths(0);
    roundActiveRef.current = true;
  }, [generatePoints, pathMode, refreshPaths]);

  useEffect(() => { if (!doneRef.current) initRound(); }, [round]);
  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, [ttsIntro]);

  const checkOnPath = (nx: number, ny: number) => {
    if (pathMode === 'dots') return distanceToDots(nx, ny, dotsRef.current);
    return distanceToPolyline(nx, ny, pointsRef.current);
  };

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
      const dist = checkOnPath(nx, ny);
      const off = dist > tol;
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
      if (rotateObject) {
        const dx = nx - lastPos.current.x;
        const dy = ny - lastPos.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
          oRot.value = (Math.atan2(dy, dx) * 180) / Math.PI;
        }
      }
      lastPos.current = { x: nx, y: ny };
      ox.value = nx;
      oy.value = ny;
      const prog = Math.max(progressRef.current, progressOnPolyline(nx, ny, pointsRef.current));
      if (prog > progressRef.current) {
        progressRef.current = prog;
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
        refreshPaths(0);
        offTrackRef.current = false;
        setIsOffTrack(false);
        speakTTS(ttsRetry, 0.78).catch(() => {});
      }
    });

  const objStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`,
    top: `${oy.value}%`,
    transform: [
      { translateX: -P.objectSize / 2 },
      { translateY: -P.objectSize / 2 },
      { rotate: `${oRot.value}deg` },
      { scale: oScale.value },
    ],
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
        <GestureDetector gesture={pan}>
          <Animated.View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              {pathMode === 'wide' && <Rect x="0" y="0" width="100" height="100" fill="#86EFAC" opacity={0.25} />}
              {pathMode === 'river' && <Rect x="0" y="0" width="100" height="100" fill="#BFDBFE" opacity={0.35} />}
              {pathMode === 'dots' && trailDots.map((d, i) => (
                <Circle key={i} cx={d.x} cy={d.y} r={1.8} fill={T.trackStroke} opacity={0.85} />
              ))}
              {pathMode !== 'dots' && (
                <Path d={pathFull} stroke={T.trackStroke} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {pathMode !== 'dots' && pathProg ? (
                <Path d={pathProg} stroke={T.progressStroke} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </Svg>
            <Animated.View style={[styles.objWrap, objStyle]}>
              <LinearGradient colors={isOffTrack ? ['#EF4444', '#DC2626'] : T.objColors} style={styles.obj}>
                <Text style={styles.emoji}>{T.emoji}</Text>
              </LinearGradient>
            </Animated.View>
            {isOffTrack && <View style={styles.warnPill}><Text style={styles.warnText}>Stay on the path!</Text></View>}
            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={14} size={8} />
          </Animated.View>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1 },
  gestureArea: { flex: 1, position: 'relative' },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  objWrap: { position: 'absolute', zIndex: 3 },
  obj: { width: P.objectSize, height: P.objectSize, borderRadius: P.objectSize / 2, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  emoji: { fontSize: 26 },
  warnPill: { position: 'absolute', top: '10%', alignSelf: 'center', left: '20%', right: '20%', backgroundColor: 'rgba(239,68,68,0.9)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  warnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
