/**
 * Shared small-shape trace game core for OT Level 2 Session 8.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION8_PACING } from '@/components/game/occupational/level2/session8/session8Pacing';
import {
  Point,
  DotShapeKind,
  advanceTraceProgress,
  buildFullCirclePaths,
  buildPolygonStrokePath,
  circleTraceProgress,
  distanceToFullCircle,
  distanceToPolygon,
  makeRegularPolygonPoints,
  makeSquarePoints,
  polygonTraceProgress,
  shrinkRadiusForRound,
  sidesForDotShape,
  toleranceForCircle,
  useTraceSound,
} from '@/components/game/occupational/level2/session8/traceUtils';
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

const P = SESSION8_PACING;
const STROKE = P.pathStroke;

const RectDecor = () => (
  <Path d="M 38 38 L 62 38 L 62 62 L 38 62 Z" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="0.8" />
);

const SceneDecor: React.FC<{ mode: 'circle' | 'square' | 'dots'; dotBorder: boolean; shrinkMode: boolean; round: number; total: number }> = ({
  mode, dotBorder, shrinkMode, round, total,
}) => {
  if (shrinkMode) {
    const r0 = shrinkRadiusForRound(round, total, P.shrinkInitialRadius, P.shrinkMinRadius);
    return (
      <>
        <Circle cx="50" cy="50" r={P.shrinkInitialRadius + 4} fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="1" />
        <Circle cx="50" cy="50" r={r0 + 6} fill="rgba(239,68,68,0.06)" />
      </>
    );
  }
  switch (mode) {
    case 'circle':
      return (
        <>
          <Circle cx="50" cy="50" r="28" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.15)" strokeWidth="0.8" />
          <Ellipse cx="22" cy="20" rx="8" ry="4.5" fill="rgba(255,255,255,0.7)" />
          <Ellipse cx="76" cy="18" rx="9" ry="5" fill="rgba(255,255,255,0.65)" />
        </>
      );
    case 'square':
      return (
        <>
          <RectDecor />
          <Circle cx="50" cy="32" r="4" fill="rgba(99,102,241,0.2)" />
        </>
      );
    case 'dots':
      return (
        <>
          {dotBorder && [[30, 30], [70, 30], [70, 70], [30, 70]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r="1.2" fill="rgba(139,92,246,0.35)" />
          ))}
          <Circle cx="18" cy="18" r="3" fill="rgba(139,92,246,0.2)" />
          <Circle cx="82" cy="18" r="3" fill="rgba(139,92,246,0.2)" />
        </>
      );
    default:
      return null;
  }
};

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type SmallTraceMode = 'circle' | 'square' | 'dots';

export type SmallTraceTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  guideStroke: string;
  progressStroke: string;
  objectColor: string;
  objectOffColor: string;
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

export type SmallShapeTraceConfig = {
  theme: SmallTraceTheme;
  mode: SmallTraceMode;
  dotBorder?: boolean;
  shrinkMode?: boolean;
  circleRadius?: number;
  squareSize?: number;
  dotShapeSize?: number;
  dotPool?: DotShapeKind[];
  tolerance?: number;
  strokeWidth?: number;
  ttsIntro: string;
  ttsComplete: string;
  ttsIncomplete: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const SmallShapeTraceGame: React.FC<
  SmallShapeTraceConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  dotBorder = false,
  shrinkMode = false,
  circleRadius = P.tinyCircleRadius,
  squareSize = P.miniSquareSize,
  dotShapeSize = P.dotShapeSize,
  dotPool = ['triangle', 'pentagon', 'hexagon'],
  tolerance = P.lineTolerance,
  strokeWidth = P.guideStrokeWidth,
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
  const TOTAL = P.totalRounds;
  const guideStroke = strokeWidth || P.guideStrokeWidth;
  const progStroke = STROKE + 1;
  const refCircleRadius = shrinkMode ? P.shrinkInitialRadius : circleRadius;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [pathFull, setPathFull] = useState('');
  const [pathProg, setPathProg] = useState('');
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [dotShape, setDotShape] = useState<DotShapeKind>('triangle');
  const [traceProg, setTraceProg] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const offTrackRef = useRef(false);
  const pathPointsRef = useRef<Point[]>([]);
  const progressRef = useRef(0);
  const lastProgressRef = useRef(0);
  const lastWarnRef = useRef(0);
  const screenW = useRef(400);
  const screenH = useRef(600);
  const dotPoolRef = useRef(dotPool);
  const roundRef = useRef(1);

  const cx = useSharedValue(50);
  const cy = useSharedValue(50);
  const radius = useSharedValue(circleRadius);
  const startAngle = useSharedValue(0);
  const ox = useSharedValue(50 + circleRadius);
  const oy = useSharedValue(50);
  const oScale = useSharedValue(1);
  const progress = useSharedValue(0);

  const resolveCircleRadius = useCallback(
    (roundNum: number) =>
      shrinkMode
        ? shrinkRadiusForRound(roundNum, TOTAL, P.shrinkInitialRadius, P.shrinkMinRadius)
        : circleRadius,
    [circleRadius, shrinkMode],
  );

  const refreshPaths = useCallback(
    (prog: number) => {
      if (mode === 'circle') {
        const { full, progressPath } = buildFullCirclePaths(cx.value, cy.value, radius.value, startAngle.value, prog);
        setPathFull(full);
        setPathProg(progressPath);
        return;
      }
      const { full, progressPath } = buildPolygonStrokePath(pathPointsRef.current, prog);
      setPathFull(full);
      setPathProg(progressPath);
    },
    [mode],
  );

  const resetObjectToStart = useCallback(() => {
    if (mode === 'circle') {
      ox.value = cx.value + radius.value * Math.cos(startAngle.value);
      oy.value = cy.value + radius.value * Math.sin(startAngle.value);
      return;
    }
    const p0 = pathPointsRef.current[0];
    if (p0) {
      ox.value = p0.x;
      oy.value = p0.y;
    }
  }, [mode, cx, cy, radius, startAngle, ox, oy]);

  const initRound = useCallback(() => {
    progress.value = 0;
    progressRef.current = 0;
    lastProgressRef.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    setTraceProg(0);
    roundActiveRef.current = true;

    if (mode === 'circle') {
      cx.value = 50;
      cy.value = 50;
      radius.value = resolveCircleRadius(roundRef.current);
      startAngle.value = 0;
      pathPointsRef.current = [];
    } else if (mode === 'square') {
      pathPointsRef.current = makeSquarePoints(50, 50, squareSize);
    } else {
      const kind = dotPoolRef.current[Math.floor(Math.random() * dotPoolRef.current.length)] ?? 'triangle';
      setDotShape(kind);
      pathPointsRef.current = makeRegularPolygonPoints(50, 50, dotShapeSize, sidesForDotShape(kind));
    }

    resetObjectToStart();
    refreshPaths(0);
  }, [mode, refreshPaths, resetObjectToStart, resolveCircleRadius, squareSize, dotShapeSize, cx, cy, radius, startAngle, progress]);

  const endGame = useCallback(
    (finalScore: number) => {
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
    },
    [router, skillTags, logType, ttsComplete],
  );

  useEffect(() => {
    roundRef.current = round;
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
    setTraceProg(0);
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
      oScale.value = withSpring(1.12, { damping: 10, stiffness: 200 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      ox.value = Math.max(5, Math.min(95, (e.x / screenW.current) * 100));
      oy.value = Math.max(10, Math.min(90, (e.y / screenH.current) * 100));

      let onTrack = false;
      let current = 0;

      const hitTol = mode === 'circle'
        ? toleranceForCircle(tolerance, radius.value, refCircleRadius, P.minTolerance)
        : tolerance;

      if (mode === 'circle') {
        onTrack = distanceToFullCircle(ox.value, oy.value, cx.value, cy.value, radius.value) <= hitTol;
        if (onTrack) current = circleTraceProgress(ox.value, oy.value, cx.value, cy.value, startAngle.value);
      } else {
        onTrack = distanceToPolygon(ox.value, oy.value, pathPointsRef.current) <= hitTol;
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
      setTraceProg(next);
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

  const dotEmoji = dotShape === 'triangle' ? '🔺' : dotShape === 'pentagon' ? '⬟' : '⬡';
  const currentCircleR = mode === 'circle' ? resolveCircleRadius(round) : 0;

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
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(traceProg * 100)}%`, backgroundColor: T.progressStroke }]} />
        </View>
        {shrinkMode && (
          <Text style={[styles.sizeHint, { color: T.subtitleColor }]}>
            Size: {Math.round(currentCircleR)} — round {round}/{TOTAL}
          </Text>
        )}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              <Defs>
                <SvgLinearGradient id="smallTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={T.progressStroke} stopOpacity="0.95" />
                  <Stop offset="100%" stopColor={T.objectColor} stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <SceneDecor mode={mode} dotBorder={dotBorder} shrinkMode={shrinkMode} round={round} total={TOTAL} />
              {mode === 'circle' && (
                <Circle cx="50" cy="50" r={currentCircleR + 5} fill="none" stroke={T.guideStroke} strokeWidth="1" opacity={0.2} />
              )}
              {pathFull ? (
                <>
                  <Path
                    d={pathFull}
                    stroke={T.guideStroke}
                    strokeWidth={STROKE + 5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.2}
                    strokeDasharray={dotBorder ? '2 3' : undefined}
                  />
                  <Path
                    d={pathFull}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth={STROKE + 1}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={dotBorder ? '2 3' : undefined}
                  />
                  <Path
                    d={pathFull}
                    stroke={T.guideStroke}
                    strokeWidth={guideStroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.7}
                    strokeDasharray={dotBorder ? '3 2.5' : undefined}
                  />
                </>
              ) : null}
              {pathProg ? (
                <>
                  <Path d={pathProg} stroke="rgba(255,255,255,0.9)" strokeWidth={progStroke + 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d={pathProg} stroke="url(#smallTraceGrad)" strokeWidth={progStroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : null}
            </Svg>

            <Animated.View style={[styles.objectWrap, objectStyle]}>
              <View
                style={[
                  styles.object,
                  { backgroundColor: isOffTrack ? T.objectOffColor : T.objectColor },
                  !isOffTrack && { shadowColor: T.progressStroke, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 8 },
                ]}
              >
                <Text style={styles.objectEmoji}>{mode === 'dots' ? dotEmoji : T.objectEmoji}</Text>
              </View>
            </Animated.View>

            {traceProg > 0.05 && traceProg < P.completeThreshold - 0.05 && !isOffTrack && (
              <View style={styles.traceHint} pointerEvents="none">
                <Text style={[styles.traceHintText, { color: T.titleColor }]}>Keep tracing!</Text>
              </View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={18} size={9} />
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
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1.5, position: 'relative', overflow: 'hidden' },
  progressTrack: { height: 6, marginHorizontal: 12, marginTop: 10, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  sizeHint: { textAlign: 'center', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  gestureArea: { flex: 1 },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  objectWrap: { position: 'absolute', zIndex: 5 },
  object: {
    width: P.objectSize,
    height: P.objectSize,
    borderRadius: P.objectSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 8,
  },
  objectEmoji: { fontSize: 22 },
  traceHint: { position: 'absolute', top: '8%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, zIndex: 4 },
  traceHintText: { fontSize: 12, fontWeight: '800' },
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

export default SmallShapeTraceGame;
