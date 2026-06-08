/**
 * Shared big vs small movement game core for OT Level 3 Session 2.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION2_PACING } from '@/components/game/occupational/level3/session2/session2Pacing';
import {
  ScaleTarget,
  randomTarget,
  swipeMatches,
  useTraceSound,
} from '@/components/game/occupational/level3/session2/scaleUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION2_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type ScaleMoveMode = 'tap' | 'swipe' | 'pinch' | 'throw' | 'path';

export type ScaleMoveTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  bigColor: string;
  smallColor: string;
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
  objectEmoji?: string;
};

export type ScaleMoveGameConfig = {
  theme: ScaleMoveTheme;
  mode: ScaleMoveMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsBig: string;
  ttsSmall: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const ScaleMoveGame: React.FC<
  ScaleMoveGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsBig,
  ttsSmall,
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const totalRounds = mode === 'tap' ? P.tapRounds : P.gestureRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);

  const [target, setTarget] = useState<ScaleTarget>('big');
  const [showCue, setShowCue] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [bigBarProgress, setBigBarProgress] = useState(0);
  const [smallBarProgress, setSmallBarProgress] = useState(0);
  const [isWidePath, setIsWidePath] = useState(true);
  const [pathProgress, setPathProgress] = useState(0);
  const [isTracing, setIsTracing] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const targetRef = useRef<ScaleTarget>('big');
  const isActiveRef = useRef(false);
  const isTracingRef = useRef(false);
  const pathProgressRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenW = useRef(400);
  const screenH = useRef(400);
  const panStartX = useRef(0);
  const panStartY = useRef(0);

  const objScale = useSharedValue(1);
  const pinchBase = useSharedValue(1);
  const ballX = useSharedValue(50);
  const ballY = useSharedValue(70);
  const throwStartX = useSharedValue(50);
  const throwStartY = useSharedValue(70);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const isDraggingRef = useRef(false);
  const pathDoneRef = useRef(false);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  useEffect(() => {
    isTracingRef.current = isTracing;
  }, [isTracing]);
  useEffect(() => {
    pathProgressRef.current = pathProgress;
  }, [pathProgress]);

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const objAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: objScale.value }],
  }));

  const ballAnimStyle = useAnimatedStyle(() => ({
    left: `${ballX.value}%`,
    top: `${ballY.value}%`,
    transform: [{ translateX: -25 }, { translateY: -25 }],
  }));

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const xp = Math.round(finalScore * (mode === 'pinch' ? 20 : 18));
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearRoundTimer();
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
    [clearRoundTimer, logType, mode, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    playSound('drum', 0.5, 1.0).catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess]);

  const failAttempt = useCallback(() => {
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setWarnVisible(true);
    setTimeout(() => setWarnVisible(false), 800);
  }, [playWarn]);

  const advanceRound = useCallback(() => {
    clearRoundTimer();
    setIsActive(false);
    setShowCue(false);
    setBigBarProgress(0);
    setSmallBarProgress(0);
    setPathProgress(0);
    setIsTracing(false);
    objScale.value = 1;

    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearRoundTimer, endGame, objScale, totalRounds]);

  const finishAttempt = useCallback(
    (correct: boolean) => {
      if (correct) bumpScore();
      else failAttempt();
      setIsActive(false);
      setShowCue(false);
      roundTimerRef.current = setTimeout(() => advanceRound(), mode === 'tap' ? 600 : P.nextRoundDelayMs);
    },
    [advanceRound, bumpScore, failAttempt, mode],
  );

  const setupRound = useCallback(() => {
    if (doneRef.current) return;
    clearRoundTimer();

    if (mode === 'path') {
      pathDoneRef.current = false;
      const wide = Math.random() > 0.5;
      setIsWidePath(wide);
      setPathProgress(0);
      setIsTracing(false);
      setIsActive(true);
      setShowCue(true);
      speakTTS(wide ? 'Trace the wide road!' : 'Trace the thin road!', 0.78).catch(() => {});
      return;
    }

    const nextTarget = randomTarget();
    setTarget(nextTarget);
    setShowCue(false);
    setBigBarProgress(0);
    setSmallBarProgress(0);
    setIsActive(mode !== 'tap');
    objScale.value = 1;
    ballX.value = 50;
    ballY.value = 70;
    throwStartX.value = 50;
    throwStartY.value = 70;

    roundTimerRef.current = setTimeout(() => {
      setShowCue(true);
      setIsActive(true);
      speakTTS(nextTarget === 'big' ? ttsBig : ttsSmall, 0.78).catch(() => {});
    }, mode === 'tap' ? P.cueDelayMs : 0);
  }, [ballX, ballY, clearRoundTimer, mode, objScale, throwStartX, throwStartY, ttsBig, ttsSmall]);

  useEffect(() => {
    if (round === 1 && !doneRef.current) speakTTS(ttsIntro, 0.78);
    setupRound();
    return clearRoundTimer;
  }, [round, setupRound, ttsIntro, clearRoundTimer]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearRoundTimer();
    },
    [clearRoundTimer],
  );

  const handleTapChoice = useCallback(
    (choice: ScaleTarget) => {
      if (!showCue || doneRef.current) return;
      finishAttempt(choice === targetRef.current);
    },
    [finishAttempt, showCue],
  );

  const panSwipe = Gesture.Pan()
    .runOnJS(true)
    .onStart((evt) => {
      if (!isActiveRef.current || doneRef.current) return;
      panStartX.current = evt.x;
      panStartY.current = evt.y;
    })
    .onUpdate((evt) => {
      if (!isActiveRef.current || doneRef.current) return;
      const dx = Math.abs(evt.x - panStartX.current);
      const dy = Math.abs(evt.y - panStartY.current);
      const dist = Math.sqrt(dx * dx + dy * dy);
      setBigBarProgress(Math.min(100, (dist / P.bigSwipeThreshold) * 100));
      setSmallBarProgress(Math.min(100, (dist / P.smallSwipeThreshold) * 100));
    })
    .onEnd((evt) => {
      if (!isActiveRef.current || doneRef.current) return;
      const dx = Math.abs(evt.x - panStartX.current);
      const dy = Math.abs(evt.y - panStartY.current);
      const dist = Math.sqrt(dx * dx + dy * dy);
      finishAttempt(swipeMatches(dist, targetRef.current, P.bigSwipeThreshold, P.smallSwipeThreshold));
    });

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onBegin(() => {
      pinchBase.value = objScale.value;
    })
    .onUpdate((evt) => {
      if (!isActiveRef.current || doneRef.current) return;
      objScale.value = Math.max(P.minScale, Math.min(P.maxScale, pinchBase.value * evt.scale));
    })
    .onEnd(() => {
      if (!isActiveRef.current || doneRef.current) return;
      const current = objScale.value;
      const ok =
        targetRef.current === 'big'
          ? current >= P.targetBigScale
          : current <= P.targetSmallScale;
      objScale.value = withSpring(1);
      finishAttempt(ok);
    });

  const panThrow = Gesture.Pan()
    .runOnJS(true)
    .onStart((evt) => {
      if (doneRef.current) return;
      isDraggingRef.current = true;
      dragStartX.value = (evt.x / screenW.current) * 100;
      dragStartY.value = (evt.y / screenH.current) * 100;
    })
    .onUpdate((evt) => {
      if (!isDraggingRef.current || doneRef.current) return;
      ballX.value = (evt.x / screenW.current) * 100;
      ballY.value = (evt.y / screenH.current) * 100;
    })
    .onEnd((evt) => {
      if (!isDraggingRef.current || doneRef.current) return;
      isDraggingRef.current = false;
      const endX = (evt.x / screenW.current) * 100;
      const endY = (evt.y / screenH.current) * 100;
      const dx = Math.abs(endX - dragStartX.value) * (screenW.current / 100);
      const dy = Math.abs(endY - dragStartY.value) * (screenH.current / 100);
      const dist = Math.sqrt(dx * dx + dy * dy);
      ballX.value = withSpring(throwStartX.value);
      ballY.value = withSpring(throwStartY.value);
      finishAttempt(swipeMatches(dist, targetRef.current, P.bigThrowThreshold, P.smallThrowThreshold));
    });

  const pathWidth = isWidePath ? P.widePathWidth : P.thinPathWidth;
  const pathWidthPct = isWidePath ? P.widePathWidthPct : P.thinPathWidthPct;

  const checkOnPath = useCallback(
    (x: number, y: number) => {
      const dist = Math.abs(y - P.pathStartY);
      return (
        dist < pathWidthPct / 2 + P.pathTolerance &&
        x >= Math.min(P.pathStartX, P.pathEndX) &&
        x <= Math.max(P.pathStartX, P.pathEndX)
      );
    },
    [pathWidthPct],
  );

  const calcPathProgress = useCallback((x: number) => {
    const total = Math.abs(P.pathEndX - P.pathStartX);
    const current = Math.abs(x - P.pathStartX);
    return Math.min(100, Math.max(0, (current / total) * 100));
  }, []);

  const completePath = useCallback(() => {
    if (pathDoneRef.current || doneRef.current) return;
    pathDoneRef.current = true;
    bumpScore();
    setIsTracing(false);
    setIsActive(false);
    roundTimerRef.current = setTimeout(() => advanceRound(), P.nextRoundDelayMs);
  }, [advanceRound, bumpScore]);

  const panPath = Gesture.Pan()
    .runOnJS(true)
    .onStart((evt) => {
      if (doneRef.current) return;
      const x = (evt.x / screenW.current) * 100;
      const y = (evt.y / screenH.current) * 100;
      if (checkOnPath(x, y)) {
        setIsTracing(true);
        setPathProgress(calcPathProgress(x));
      }
    })
    .onUpdate((evt) => {
      if (!isTracingRef.current || doneRef.current) return;
      const x = (evt.x / screenW.current) * 100;
      const y = (evt.y / screenH.current) * 100;
      if (checkOnPath(x, y)) {
        const prog = calcPathProgress(x);
        setPathProgress(prog);
        if (prog >= 95) completePath();
      } else {
        setIsTracing(false);
        setPathProgress(0);
        failAttempt();
      }
    })
    .onEnd(() => {
      if (pathProgressRef.current < 95) {
        setIsTracing(false);
        setPathProgress(0);
      }
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

  const cueLabel =
    mode === 'path'
      ? isWidePath
        ? 'WIDE'
        : 'THIN'
      : showCue
        ? target === 'big'
          ? 'BIG'
          : 'SMALL'
        : '…';

  const renderPlayArea = () => {
    if (mode === 'tap') {
      return (
        <View style={styles.tapRow}>
          <Pressable
            onPress={() => handleTapChoice('big')}
            style={[
              styles.bigCircle,
              { width: P.bigCircleSize, height: P.bigCircleSize, borderRadius: P.bigCircleSize / 2, backgroundColor: T.bigColor },
              showCue && target === 'big' && styles.highlight,
            ]}
          >
            <Text style={styles.circleLabel}>BIG</Text>
          </Pressable>
          <Pressable
            onPress={() => handleTapChoice('small')}
            style={[
              styles.smallCircle,
              { width: P.smallCircleSize, height: P.smallCircleSize, borderRadius: P.smallCircleSize / 2, backgroundColor: T.smallColor },
              showCue && target === 'small' && styles.highlight,
            ]}
          >
            <Text style={[styles.circleLabel, { fontSize: 10 }]}>S</Text>
          </Pressable>
        </View>
      );
    }

    if (mode === 'swipe') {
      return (
        <GestureDetector gesture={panSwipe}>
          <View style={styles.swipeArea}>
            <View style={styles.barWrap}>
              <Text style={[styles.barLabel, { color: T.titleColor }]}>BIG</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${bigBarProgress}%`, backgroundColor: target === 'big' ? T.accent : '#94A3B8' },
                  ]}
                />
              </View>
            </View>
            <View style={[styles.swipeZone, { borderColor: T.accent }]}>
              <Text style={[styles.swipeHint, { color: T.accentDark }]}>Swipe here!</Text>
            </View>
            <View style={styles.barWrap}>
              <Text style={[styles.barLabel, { color: T.titleColor }]}>SMALL</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${smallBarProgress}%`, backgroundColor: target === 'small' ? T.accent : '#94A3B8' },
                  ]}
                />
              </View>
            </View>
          </View>
        </GestureDetector>
      );
    }

    if (mode === 'pinch') {
      return (
        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={[styles.objectWrap, objAnimStyle]}>
            <View style={[styles.object, { backgroundColor: T.bigColor }]}>
              <Text style={styles.objectEmoji}>{T.objectEmoji ?? '🎈'}</Text>
            </View>
          </Animated.View>
        </GestureDetector>
      );
    }

    if (mode === 'throw') {
      return (
        <View
          style={styles.throwArea}
          onLayout={(e) => {
            screenW.current = e.nativeEvent.layout.width;
            screenH.current = e.nativeEvent.layout.height;
          }}
        >
          <GestureDetector gesture={panThrow}>
            <View style={StyleSheet.absoluteFill}>
              <View
                style={[
                  styles.startDot,
                  { left: `${throwStartX.value}%`, top: `${throwStartY.value}%`, backgroundColor: T.accent },
                ]}
              />
              <Animated.View style={[styles.ball, ballAnimStyle, { backgroundColor: T.smallColor }]}>
                <Text style={styles.objectEmoji}>{T.objectEmoji ?? '⚾'}</Text>
              </Animated.View>
            </View>
          </GestureDetector>
        </View>
      );
    }

    return (
      <View
        style={styles.pathArea}
        onLayout={(e) => {
          screenW.current = e.nativeEvent.layout.width;
          screenH.current = e.nativeEvent.layout.height;
        }}
      >
        <GestureDetector gesture={panPath}>
          <View style={StyleSheet.absoluteFill}>
            <View style={[styles.pathDot, { left: `${P.pathStartX}%`, top: `${P.pathStartY}%`, backgroundColor: '#22C55E' }]} />
            <View style={[styles.pathDot, { left: `${P.pathEndX}%`, top: `${P.pathEndY}%`, backgroundColor: '#EF4444' }]} />
            <View
              style={{
                position: 'absolute',
                left: `${P.pathStartX}%`,
                top: `${P.pathStartY - pathWidth / 2}%`,
                width: `${P.pathEndX - P.pathStartX}%`,
                height: pathWidth,
                backgroundColor: 'rgba(148,163,184,0.35)',
                borderRadius: pathWidth / 2,
              }}
            />
          </View>
        </GestureDetector>
        <View style={styles.pathProgressBg}>
          <View style={[styles.pathProgressFill, { width: `${pathProgress}%`, backgroundColor: T.accent }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearRoundTimer();
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
              {round}/{totalRounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {showCue && (
          <Text style={[styles.cueText, { color: T.accentDark }]}>
            {mode === 'path' ? `Trace the ${cueLabel} road!` : cueLabel}
          </Text>
        )}
        {!showCue && mode === 'tap' && (
          <Text style={[styles.hint, { color: T.subtitleColor }]}>{T.hintText}</Text>
        )}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {renderPlayArea()}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>

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
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  cueText: { fontSize: 40, fontWeight: '900', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  tapRow: { flexDirection: 'row', gap: 40, alignItems: 'center' },
  bigCircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  smallCircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
  highlight: { borderColor: '#10B981', transform: [{ scale: 1.08 }] },
  circleLabel: { fontSize: 14, fontWeight: '900', color: '#fff' },
  swipeArea: { width: '100%', height: 360, justifyContent: 'space-around' },
  barWrap: { width: '100%', alignItems: 'center' },
  barLabel: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  barBg: { width: '85%', height: 36, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 18, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 18 },
  swipeZone: { width: '100%', height: 120, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.35)' },
  swipeHint: { fontSize: 16, fontWeight: '800' },
  objectWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  object: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  objectEmoji: { fontSize: 72 },
  throwArea: { width: '100%', height: 360, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  ball: { position: 'absolute', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  startDot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, transform: [{ translateX: -9 }, { translateY: -9 }], borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  pathArea: { width: '100%', height: 360, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  pathDot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, transform: [{ translateX: -9 }, { translateY: -9 }], borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  pathProgressBg: { position: 'absolute', bottom: 12, left: 16, right: 16, height: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden' },
  pathProgressFill: { height: '100%', borderRadius: 4 },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  warnText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
});

export default ScaleMoveGame;
