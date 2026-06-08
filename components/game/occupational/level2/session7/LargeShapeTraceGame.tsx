/**
 * Shared large-shape trace game core for OT Level 2 Session 7.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION7_PACING } from '@/components/game/occupational/level2/session7/session7Pacing';
import {
  Point,
  PaintShapeKind,
  advanceTraceProgress,
  buildFullCirclePaths,
  buildPaintFillPath,
  buildPolygonStrokePath,
  buildPaintShape,
  circleTraceProgress,
  distanceToFullCircle,
  distanceToPolygon,
  makeSquarePoints,
  makeTrianglePoints,
  polygonTraceProgress,
  useTraceSound,
} from '@/components/game/occupational/level2/session7/traceUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const P = SESSION7_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type LargeTraceMode = 'circle' | 'square' | 'triangle' | 'paint';

export type LargeTraceTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  guideStroke: string;
  progressStroke: string;
  fillColor: string;
  fillDoneColor: string;
  objectColor: string;
  objectOffColor: string;
  glowRing?: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  sparkleColor: string;
  hintText: string;
  objectEmoji: string;
};

export type LargeShapeTraceConfig = {
  theme: LargeTraceTheme;
  mode: LargeTraceMode;
  glowMode?: boolean;
  paintPool?: PaintShapeKind[];
  tolerance?: number;
  ttsIntro: string;
  ttsComplete: string;
  ttsIncomplete: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const LargeShapeTraceGame: React.FC<
  LargeShapeTraceConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  glowMode = false,
  paintPool = ['star', 'heart', 'pentagon'],
  tolerance,
  ttsIntro,
  ttsComplete,
  ttsIncomplete,
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const tol = tolerance ?? (glowMode ? P.glowTolerance : mode === 'paint' ? P.paintTolerance : P.lineTolerance);
  const TOTAL = P.totalRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [pathFull, setPathFull] = useState('');
  const [pathProg, setPathProg] = useState('');
  const [fillPath, setFillPath] = useState('');
  const [fillComplete, setFillComplete] = useState(false);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [paintShape, setPaintShape] = useState<PaintShapeKind>('star');

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const offTrackRef = useRef(false);
  const pathPointsRef = useRef<Point[]>([]);
  const progressRef = useRef(0);
  const lastProgressRef = useRef(0);
  const lastWarnRef = useRef(0);
  const screenW = useRef(400);
  const screenH = useRef(600);
  const paintPoolRef = useRef(paintPool);

  const cx = useSharedValue(50);
  const cy = useSharedValue(50);
  const radius = useSharedValue(P.circleRadius);
  const startAngle = useSharedValue(0);
  const ox = useSharedValue(50 + P.circleRadius);
  const oy = useSharedValue(50);
  const oScale = useSharedValue(1);
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (glowMode) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.85, { duration: 900 }), withTiming(0.35, { duration: 900 })),
        -1,
        false,
      );
    }
  }, [glowMode, glowOpacity]);

  const glowProps = useAnimatedProps(() => ({ opacity: glowOpacity.value }));

  const refreshPaths = useCallback((prog: number) => {
    if (mode === 'circle' || glowMode) {
      const { full, progressPath } = buildFullCirclePaths(cx.value, cy.value, radius.value, startAngle.value, prog);
      setPathFull(full);
      setPathProg(progressPath);
      setFillPath('');
      return;
    }
    const pts = pathPointsRef.current;
    if (mode === 'paint') {
      const { fillPath: fill } = buildPaintFillPath(pts, prog);
      setFillPath(fill);
      setFillComplete(prog >= 0.95);
      setPathProg('');
      return;
    }
    const { full, progressPath } = buildPolygonStrokePath(pts, prog);
    setPathFull(full);
    setPathProg(progressPath);
    setFillPath('');
  }, [glowMode, mode]);

  const resetObjectToStart = useCallback(() => {
    if (mode === 'circle' || glowMode) {
      ox.value = cx.value + radius.value * Math.cos(startAngle.value);
      oy.value = cy.value + radius.value * Math.sin(startAngle.value);
      return;
    }
    const p0 = pathPointsRef.current[0];
    if (p0) {
      ox.value = p0.x;
      oy.value = p0.y;
    }
  }, [glowMode, mode, cx, cy, radius, startAngle, ox, oy]);

  const initRound = useCallback(() => {
    progress.value = 0;
    progressRef.current = 0;
    lastProgressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    setFillComplete(false);
    roundActiveRef.current = true;

    if (mode === 'circle' || glowMode) {
      cx.value = 50;
      cy.value = 50;
      radius.value = P.circleRadius;
      startAngle.value = 0;
      pathPointsRef.current = [];
    } else if (mode === 'square') {
      pathPointsRef.current = makeSquarePoints(50, 50, P.squareSize);
    } else if (mode === 'triangle') {
      pathPointsRef.current = makeTrianglePoints(50, 50, P.triangleSize);
    } else {
      const kind = paintPoolRef.current[Math.floor(Math.random() * paintPoolRef.current.length)] ?? 'star';
      setPaintShape(kind);
      const { points, full } = buildPaintShape(kind, 50, 50, P.paintSize);
      pathPointsRef.current = points;
      setPathFull(full);
    }

    resetObjectToStart();
    refreshPaths(0);
  }, [glowMode, mode, refreshPaths, resetObjectToStart, cx, cy, radius, startAngle, progress]);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS(ttsComplete, 0.78);
    recordGame(xp)
      .then(() =>
        logGameAndAward({
          type: logType,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags,
        }),
      )
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [router, skillTags, logType, ttsComplete]);

  useEffect(() => {
    if (!doneRef.current) initRound();
  }, [round]);

  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, [ttsIntro]);

  const completeRound = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    roundActiveRef.current = false;
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        if (next >= TOTAL) endGame(next);
        else {
          setRound((r) => r + 1);
          roundActiveRef.current = true;
        }
      }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const failRound = useCallback(() => {
    progress.value = 0;
    progressRef.current = 0;
    lastProgressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    resetObjectToStart();
    refreshPaths(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    speakTTS(ttsIncomplete, 0.78).catch(() => {});
  }, [progress, refreshPaths, resetObjectToStart, ttsIncomplete]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      oScale.value = withSpring(1.15, { damping: 10, stiffness: 200 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      const nx = (e.x / screenW.current) * 100;
      const ny = (e.y / screenH.current) * 100;
      ox.value = Math.max(5, Math.min(95, nx));
      oy.value = Math.max(10, Math.min(90, ny));

      let onTrack = false;
      let current = 0;

      if (mode === 'circle' || glowMode) {
        const dist = distanceToFullCircle(ox.value, oy.value, cx.value, cy.value, radius.value);
        onTrack = dist <= tol;
        if (onTrack) current = circleTraceProgress(ox.value, oy.value, cx.value, cy.value, startAngle.value);
      } else {
        const dist = distanceToPolygon(ox.value, oy.value, pathPointsRef.current);
        onTrack = dist <= tol;
        if (onTrack) current = polygonTraceProgress(ox.value, oy.value, pathPointsRef.current);
      }

      if (!onTrack) {
        if (!offTrackRef.current) {
          offTrackRef.current = true;
          setIsOffTrack(true);
          const now = Date.now();
          if (now - lastWarnRef.current > P.warnCooldownMs) {
            lastWarnRef.current = now;
            playWarn();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          }
        }
        return;
      }

      offTrackRef.current = false;
      setIsOffTrack(false);
      const next = advanceTraceProgress(current, lastProgressRef.current, progressRef.current);
      lastProgressRef.current = current;
      progressRef.current = next;
      progress.value = next;
      refreshPaths(next);
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      oScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      if (progressRef.current >= P.completeThreshold) completeRound();
      else failRound();
    });

  const objectStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`,
    top: `${oy.value}%`,
    transform: [
      { translateX: -P.objectSize / 2 },
      { translateY: -P.objectSize / 2 },
      { scale: oScale.value },
    ],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{TOTAL}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{T.hintText}</Text>
      </View>

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          screenW.current = e.nativeEvent.layout.width;
          screenH.current = e.nativeEvent.layout.height;
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              {glowMode && (
                <AnimatedCircle
                  cx={50}
                  cy={50}
                  r={P.circleRadius + 2}
                  fill="none"
                  stroke={T.glowRing ?? T.guideStroke}
                  strokeWidth={8}
                  animatedProps={glowProps}
                />
              )}
              {mode === 'paint' ? (
                <>
                  <Path d={pathFull} fill="none" stroke={T.guideStroke} strokeWidth={3} opacity={0.45} />
                  {fillPath ? (
                    <Path
                      d={fillPath}
                      fill={fillComplete ? T.fillDoneColor : T.fillColor}
                      stroke={T.progressStroke}
                      strokeWidth={1.5}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  {glowMode && (
                    <Circle
                      cx={50}
                      cy={50}
                      r={P.circleRadius}
                      fill="none"
                      stroke={T.guideStroke}
                      strokeWidth={6}
                      strokeDasharray="4 4"
                      opacity={0.55}
                    />
                  )}
                  <Path
                    d={pathFull}
                    stroke={T.guideStroke}
                    strokeWidth={glowMode ? 6 : 4}
                    fill="none"
                    strokeLinecap="round"
                    opacity={glowMode ? 0.75 : 0.5}
                  />
                  {pathProg ? (
                    <Path d={pathProg} stroke={T.progressStroke} strokeWidth={glowMode ? 6 : 4} fill="none" strokeLinecap="round" />
                  ) : null}
                </>
              )}
            </Svg>

            <Animated.View style={[styles.objectWrap, objectStyle]}>
              <View
                style={[
                  styles.object,
                  { backgroundColor: isOffTrack ? T.objectOffColor : T.objectColor },
                ]}
              >
                <Text style={styles.objectEmoji}>{mode === 'paint' ? (paintShape === 'heart' ? '💖' : paintShape === 'star' ? '⭐' : '⬟') : T.objectEmoji}</Text>
              </View>
            </Animated.View>

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={14} size={8} />
          </Animated.View>
        </GestureDetector>

        {isOffTrack && (
          <View style={styles.warnPill} pointerEvents="none">
            <Text style={styles.warnText}>Stay on the line!</Text>
          </View>
        )}
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
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, position: 'relative', overflow: 'hidden' },
  gestureArea: { flex: 1 },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  objectWrap: { position: 'absolute', zIndex: 5 },
  object: {
    width: P.objectSize,
    height: P.objectSize,
    borderRadius: P.objectSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  objectEmoji: { fontSize: 18 },
  warnPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '12%',
    right: '12%',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  warnText: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#B91C1C' },
});

export default LargeShapeTraceGame;
