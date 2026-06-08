/**
 * Shared right-to-left path drag core for OT Level 4 Session 2.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { distPx, useTraceSound } from '@/components/game/occupational/level4/session2/reverseDragUtils';
import { SESSION4_2_PACING } from '@/components/game/occupational/level4/session2/session2Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const P = SESSION4_2_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type ReversePathMode = 'reversePath' | 'patternDrag';

type ReversePathVariant = 'straight' | 'curve' | 'zigzag' | 'wave' | 'steps';

export type ReversePathDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  pathColor: string;
  draggableEmoji: string;
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
};

export type ReversePathDragGameConfig = {
  theme: ReversePathDragTheme;
  mode: ReversePathMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const pickVariant = (mode: ReversePathMode): ReversePathVariant => {
  if (mode === 'reversePath') {
    const opts: ReversePathVariant[] = ['straight', 'curve', 'zigzag'];
    return opts[Math.floor(Math.random() * opts.length)]!;
  }
  const opts: ReversePathVariant[] = ['zigzag', 'wave', 'steps'];
  return opts[Math.floor(Math.random() * opts.length)]!;
};

const buildPath = (
  variant: ReversePathVariant,
  w: number,
  h: number,
): { path: string; sx: number; sy: number; ex: number; ey: number } => {
  const sx = w * P.startXPct;
  const sy = h * P.objectYPct;
  const ex = w * P.targetXPct;
  const ey = h * P.objectYPct;

  switch (variant) {
    case 'straight':
      return { path: `M ${sx} ${sy} L ${ex} ${ey}`, sx, sy, ex, ey };
    case 'curve': {
      const midX = (sx + ex) / 2;
      const midY = sy - h * 0.15;
      return { path: `M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`, sx, sy, ex, ey };
    }
    case 'zigzag': {
      const z1x = (sx + ex) / 2;
      const z1y = sy - h * 0.12;
      const z2x = (sx + ex) / 2;
      const z2y = sy + h * 0.12;
      return { path: `M ${sx} ${sy} L ${z1x} ${z1y} L ${z2x} ${z2y} L ${ex} ${ey}`, sx, sy, ex, ey };
    }
    case 'wave': {
      const w1x = sx - (sx - ex) * 0.33;
      const w1y = sy - h * 0.1;
      const w2x = sx - (sx - ex) * 0.66;
      const w2y = sy + h * 0.1;
      return {
        path: `M ${sx} ${sy} Q ${w1x} ${w1y} ${(sx + ex) / 2} ${sy} Q ${w2x} ${w2y} ${ex} ${ey}`,
        sx,
        sy,
        ex,
        ey,
      };
    }
    case 'steps': {
      const s1x = sx - (sx - ex) * 0.5;
      const s2y = sy - h * 0.1;
      return { path: `M ${sx} ${sy} L ${s1x} ${sy} L ${s1x} ${s2y} L ${ex} ${ey}`, sx, sy, ex, ey };
    }
    default:
      return { path: `M ${sx} ${sy} L ${ex} ${ey}`, sx, sy, ex, ey };
  }
};

export const ReversePathDragGame: React.FC<
  ReversePathDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Follow the path from right to left!',
  ttsMiss = 'Follow the path to the left target!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [pathString, setPathString] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [progressPct, setProgressPct] = useState(0);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const progressRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(288);
  const startY = useRef(200);
  const endX = useRef(72);
  const endY = useRef(200);

  const objX = useSharedValue(288);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const objStyle = useAnimatedStyle(() => ({
    left: objX.value - 25,
    top: objY.value - 25,
    transform: [{ scale: objScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(objX);
    cancelAnimation(objY);
  }, [objX, objY]);

  const applyPath = useCallback((): string => {
    const variant = pickVariant(mode);
    const label = variant.toUpperCase();
    setVariantLabel(label);
    const { path, sx, sy, ex, ey } = buildPath(variant, playW.current, playH.current);
    setPathString(path);
    startX.current = sx;
    startY.current = sy;
    endX.current = ex;
    endY.current = ey;
    objX.value = sx;
    objY.value = sy;
    setProgressPct(0);
    progressRef.current = 0;
    return label;
  }, [mode, objX, objY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
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
    [clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const resetObject = useCallback(() => {
    objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    objScale.value = withTiming(1, { duration: 120 });
    setProgressPct(0);
    progressRef.current = 0;
  }, [objScale, objX, objY]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    bumpScore();
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, objScale]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    const label = applyPath();
    setStatusHint(mode === 'patternDrag' ? `Pattern: ${label}` : 'Follow the path!');
    speakTTS(ttsDrag, 0.78).catch(() => {});
  }, [applyPath, mode, ttsDrag]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      objScale.value = withTiming(1.15, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const half = 25;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));
      if (mode === 'patternDrag') {
        const totalDist = Math.abs(startX.current - endX.current);
        const currentDist = Math.abs(objX.value - startX.current);
        const pct = Math.min(100, (currentDist / totalDist) * 100);
        progressRef.current = pct;
        setProgressPct(pct);
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      objScale.value = withTiming(1, { duration: 100 });
      const d = distPx(objX.value, objY.value, endX.current, endY.current);
      const progressOk = mode !== 'patternDrag' || progressRef.current >= P.pathProgressMinPct;
      if (d <= P.pathTolerancePx && progressOk) {
        completeRound();
        return;
      }
      showWarn(ttsMiss);
      resetObject();
    });

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
          clearTimers();
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
              {round}/{P.rounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
        {mode === 'patternDrag' && roundActive && (
          <View style={[styles.progressTrack, { borderColor: T.accent }]}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            if (roundActive) applyPath();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && pathString ? (
            <Svg style={StyleSheet.absoluteFill} width={playW.current} height={playH.current}>
              <Path
                d={pathString}
                stroke={T.pathColor}
                strokeWidth={mode === 'reversePath' ? 8 : 10}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={mode === 'reversePath' ? '6,6' : undefined}
              />
            </Svg>
          ) : null}

          {roundActive && (
            <View style={[styles.endMarker, { left: endX.current - 20, top: endY.current - 20 }]}>
              <Text style={styles.markerEmoji}>🎯</Text>
            </View>
          )}

          {roundActive && (
            <Animated.View style={[styles.draggable, objStyle]}>
              <Text style={styles.dragEmoji}>{T.draggableEmoji}</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again!</Text>
        </View>
      )}
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
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 14, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  progressTrack: { width: '70%', height: 8, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  progressFill: { height: '100%', borderRadius: 8 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  endMarker: { position: 'absolute', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  markerEmoji: { fontSize: 36 },
  draggable: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dragEmoji: { fontSize: 28 },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  warnText: { fontSize: 15, fontWeight: '800', color: '#B91C1C' },
});

export default ReversePathDragGame;
