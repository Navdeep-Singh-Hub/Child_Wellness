/**
 * Shared mirror-drawing game core for OT Level 2 Session 10.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION10_PACING } from '@/components/game/occupational/level2/session10/session10Pacing';
import {
  HalfShapeKind,
  MazeRound,
  Point,
  generateMaze,
  halfShapePath,
  mazePathSvg,
  mirrorPath,
  mirrorX,
  pathToSvg,
  randomHalfShape,
  useTraceSound,
} from '@/components/game/occupational/level2/session10/mirrorUtils';
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
import Svg, { Circle, Line, Path } from 'react-native-svg';

const P = SESSION10_PACING;
const MX = P.mirrorLineX;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type MirrorMode = 'line' | 'butterfly' | 'half' | 'maze' | 'face';

export type MirrorTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  strokeColor: string;
  guideStroke: string;
  accentColor: string;
  objectColor: string;
  goalColor: string;
  faceStroke: string;
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
};

export type MirrorGameConfig = {
  theme: MirrorTheme;
  mode: MirrorMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsIncomplete: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

type Eye = { x: number; y: number };
type Mouth = { x: number; y: number; width: number };

export const MirrorGame: React.FC<
  MirrorGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
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

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);

  const [leftPath, setLeftPath] = useState<Point[]>([]);
  const [rightPath, setRightPath] = useState<Point[]>([]);
  const [userPath, setUserPath] = useState<Point[]>([]);
  const [halfShape, setHalfShape] = useState<HalfShapeKind>('circle');
  const [maze, setMaze] = useState<MazeRound | null>(null);

  const [leftEye, setLeftEye] = useState<Eye | null>(null);
  const [rightEye, setRightEye] = useState<Eye | null>(null);
  const [mouth, setMouth] = useState<Mouth | null>(null);
  const [faceStep, setFaceStep] = useState<'eye' | 'mouth'>('eye');
  const [faceHint, setFaceHint] = useState('');

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const pathRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const leftX = useSharedValue(20);
  const leftY = useSharedValue(20);
  const rightX = useSharedValue(80);
  const rightY = useSharedValue(20);

  const syncPaths = useCallback((pts: Point[]) => {
    pathRef.current = pts;
    if (mode === 'half') {
      setUserPath(pts);
      return;
    }
    setLeftPath(pts);
    setRightPath(mirrorPath(pts));
  }, [mode]);

  const initRound = useCallback(() => {
    pathRef.current = [];
    drawingRef.current = false;
    roundActiveRef.current = true;
    setLeftPath([]);
    setRightPath([]);
    setUserPath([]);
    setLeftEye(null);
    setRightEye(null);
    setMouth(null);
    setFaceStep('eye');
    setFaceHint(T.hintText);

    if (mode === 'half') setHalfShape(randomHalfShape());
    if (mode === 'maze') {
      const m = generateMaze();
      setMaze(m);
      leftX.value = m.startX;
      leftY.value = m.startY;
      rightX.value = mirrorX(m.startX);
      rightY.value = m.startY;
    }
  }, [mode, T.hintText, leftX, leftY, rightX, rightY]);

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
    if (!doneRef.current) initRound();
  }, [round]);

  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, [ttsIntro]);

  useEffect(() => {
    if (mode === 'face' && faceStep === 'mouth') {
      speakTTS('Tap to place the mouth, centered!', 0.78).catch(() => {});
      setFaceHint('Tap to place the mouth on the face center line');
    }
  }, [faceStep, mode]);

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

  const failAttempt = useCallback(() => {
    if (mode !== 'face') syncPaths([]);
    setWarnVisible(true);
    setTimeout(() => setWarnVisible(false), 900);
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS(ttsIncomplete, 0.78).catch(() => {});
  }, [playWarn, syncPaths, ttsIncomplete]);

  const addPoint = useCallback(
    (x: number, y: number) => {
      if (mode === 'half') {
        if (x <= MX) return;
        syncPaths([...pathRef.current, { x, y }]);
        return;
      }
      if (mode === 'line' || mode === 'butterfly') {
        if (x >= MX) return;
        syncPaths([...pathRef.current, { x, y }]);
      }
    },
    [mode, syncPaths],
  );

  const drawGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      if (mode === 'face' || mode === 'maze') return;
      drawingRef.current = true;
      const x = (e.x / screenW.current) * 100;
      const y = (e.y / screenH.current) * 100;
      syncPaths([]);
      addPoint(x, y);
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current || !drawingRef.current) return;
      if (mode === 'face' || mode === 'maze') return;
      addPoint((e.x / screenW.current) * 100, (e.y / screenH.current) * 100);
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      if (mode === 'face' || mode === 'maze') return;
      drawingRef.current = false;
      if (pathRef.current.length >= P.minPathPoints) completeRound();
      else failAttempt();
    });

  const mazeGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current || !maze) return;
      const x = (e.x / screenW.current) * 100;
      const y = (e.y / screenH.current) * 100;
      if (x >= MX) return;
      leftX.value = Math.max(5, Math.min(MX - 2, x));
      leftY.value = Math.max(10, Math.min(90, y));
      rightX.value = Math.max(MX + 2, Math.min(95, mirrorX(leftX.value)));
      rightY.value = leftY.value;
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current || !maze) return;
      const dist = Math.hypot(leftX.value - maze.goalX, leftY.value - maze.goalY);
      if (dist < P.goalTolerance) {
        completeRound();
        return;
      }
      leftX.value = withSpring(maze.startX, { damping: 12, stiffness: 120 });
      leftY.value = withSpring(maze.startY, { damping: 12, stiffness: 120 });
      rightX.value = withSpring(mirrorX(maze.startX), { damping: 12, stiffness: 120 });
      rightY.value = withSpring(maze.startY, { damping: 12, stiffness: 120 });
      failAttempt();
    });

  const faceGesture = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      const x = (e.x / screenW.current) * 100;
      const y = (e.y / screenH.current) * 100;

      if (faceStep === 'eye' && !leftEye && x < MX) {
        setLeftEye({ x, y });
        setRightEye({ x: mirrorX(x), y });
        setFaceStep('mouth');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }

      if (faceStep === 'mouth' && !mouth && Math.abs(y - P.faceCenterY) < 15) {
        const width = Math.abs(x - MX) * 2;
        setMouth({ x: MX, y, width: Math.max(8, width) });
        completeRound();
        return;
      }

      failAttempt();
    });

  const gesture = mode === 'maze' ? mazeGesture : mode === 'face' ? faceGesture : drawGesture;

  const leftObjStyle = useAnimatedStyle(() => ({
    left: `${leftX.value}%`,
    top: `${leftY.value}%`,
    transform: [{ translateX: -P.objectSize / 2 }, { translateY: -P.objectSize / 2 }],
  }));

  const rightObjStyle = useAnimatedStyle(() => ({
    left: `${rightX.value}%`,
    top: `${rightY.value}%`,
    transform: [{ translateX: -P.objectSize / 2 }, { translateY: -P.objectSize / 2 }],
  }));

  const hint = mode === 'face' ? faceHint : T.hintText;

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
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{hint}</Text>
      </View>

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          screenW.current = e.nativeEvent.layout.width;
          screenH.current = e.nativeEvent.layout.height;
        }}
      >
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              <Line x1={MX} y1={8} x2={MX} y2={92} stroke={T.guideStroke} strokeWidth={1} strokeDasharray="2 2" />

              {mode === 'butterfly' && (
                <Line x1={MX} y1={35} x2={MX} y2={65} stroke={T.accentColor} strokeWidth={2} strokeLinecap="round" />
              )}

              {mode === 'half' && (
                <Path d={halfShapePath(halfShape)} fill="none" stroke={T.guideStroke} strokeWidth={3} strokeLinecap="round" />
              )}

              {mode === 'maze' && maze && (
                <>
                  <Path d={mazePathSvg(maze.path)} fill="none" stroke={T.guideStroke} strokeWidth={2} strokeLinecap="round" />
                  <Path d={mazePathSvg(mirrorPath(maze.path))} fill="none" stroke={T.guideStroke} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
                  <Circle cx={maze.goalX} cy={maze.goalY} r={4} fill={T.goalColor} opacity={0.7} />
                  <Circle cx={mirrorX(maze.goalX)} cy={maze.goalY} r={4} fill={T.goalColor} opacity={0.7} />
                </>
              )}

              {mode === 'face' && (
                <Circle cx={MX} cy={P.faceCenterY} r={P.faceRadius} fill="none" stroke={T.faceStroke} strokeWidth={2} strokeDasharray="2 2" />
              )}

              {(mode === 'line' || mode === 'butterfly') && leftPath.length > 0 && (
                <Path d={pathToSvg(leftPath)} stroke={T.strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {(mode === 'line' || mode === 'butterfly') && rightPath.length > 0 && (
                <Path d={pathToSvg(rightPath)} stroke={T.strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {mode === 'half' && userPath.length > 0 && (
                <Path d={pathToSvg(userPath)} stroke={T.strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {leftEye && <Circle cx={leftEye.x} cy={leftEye.y} r={3} fill="#0F172A" />}
              {rightEye && <Circle cx={rightEye.x} cy={rightEye.y} r={3} fill="#0F172A" />}
              {mouth && (
                <Line
                  x1={mouth.x - mouth.width / 2}
                  y1={mouth.y}
                  x2={mouth.x + mouth.width / 2}
                  y2={mouth.y}
                  stroke="#0F172A"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )}
            </Svg>

            {mode === 'maze' && (
              <>
                <Animated.View style={[styles.obj, leftObjStyle, { backgroundColor: T.objectColor }]} />
                <Animated.View style={[styles.obj, rightObjStyle, { backgroundColor: T.objectColor }]} />
              </>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={14} size={8} />
          </View>
        </GestureDetector>

        {warnVisible && (
          <View style={styles.warnPill} pointerEvents="none">
            <Text style={styles.warnText}>Try again!</Text>
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
  obj: {
    position: 'absolute',
    width: P.objectSize,
    height: P.objectSize,
    borderRadius: P.objectSize / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
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

export default MirrorGame;
