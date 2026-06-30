/**
 * Shared two-hand simultaneous drag core for OT Level 4 Session 9.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { BoxSortPlayArea } from '@/components/game/occupational/level4/session9/boxSort/BoxSortVisuals';
import { PairMatchPlayArea } from '@/components/game/occupational/level4/session9/pairMatch/PairMatchVisuals';
import { TwinDragPlayArea } from '@/components/game/occupational/level4/session9/twinDrag/TwinDragVisuals';
import {
  createObjectPanGesture,
  createSimultaneousDualPan,
  distPx,
  randomMatchShape,
  useTraceSound,
} from '@/components/game/occupational/level4/session9/shared/dualDragUtils';
import { SESSION4_9_PACING } from '@/components/game/occupational/level4/session9/shared/session9Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_9_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');
const HALF = P.objHalfPx;

export type DualDragMode = 'dualTarget' | 'matchCenter' | 'shapeSort';

export type DualDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
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
  zoneBorder: string;
};

export type DualDragGameConfig = {
  theme: DualDragTheme;
  mode: DualDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const DualDragGame: React.FC<
  DualDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Drag both at the same time!',
  ttsSuccess = 'Perfect!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [matchEmoji, setMatchEmoji] = useState('⭕');
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [twinKey, setTwinKey] = useState(0);
  const [pairKey, setPairKey] = useState(0);
  const [sortKey, setSortKey] = useState(0);
  const [zoneLayout, setZoneLayout] = useState({ left: { x: 72, y: 288 }, right: { x: 288, y: 288 }, center: { x: 180, y: 260 } });

  const isTwinDrag = mode === 'dualTarget';
  const isPairMatch = mode === 'matchCenter';
  const isBoxSort = mode === 'shapeSort';
  const isThemedDual = isTwinDrag || isPairMatch || isBoxSort;

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const leftInRef = useRef(false);
  const rightInRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const leftStart = useRef({ x: 72, y: 96 });
  const rightStart = useRef({ x: 288, y: 96 });
  const leftTarget = useRef({ x: 72, y: 288 });
  const rightTarget = useRef({ x: 288, y: 288 });
  const centerTarget = useRef({ x: 180, y: 260 });

  const leftX = useSharedValue(72);
  const leftY = useSharedValue(96);
  const leftScale = useSharedValue(1);
  const rightX = useSharedValue(288);
  const rightY = useSharedValue(96);
  const rightScale = useSharedValue(1);
  const playShake = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const leftStyle = useAnimatedStyle(() => ({
    left: leftX.value - HALF,
    top: leftY.value - HALF,
    transform: [{ scale: leftScale.value }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    left: rightX.value - HALF,
    top: rightY.value - HALF,
    transform: [{ scale: rightScale.value }],
  }));
  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));
  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    cancelAnimation(leftX);
    cancelAnimation(leftY);
    cancelAnimation(rightX);
    cancelAnimation(rightY);
    cancelAnimation(playShake);
    cancelAnimation(kickOffOpacity);
  }, [kickOffOpacity, leftX, leftY, playShake, rightX, rightY]);

  const layoutPositions = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    leftStart.current = { x: w * 0.22, y: h * 0.22 };
    rightStart.current = { x: w * 0.78, y: h * 0.22 };
    if (mode === 'matchCenter') {
      centerTarget.current = { x: w * 0.5, y: h * 0.58 };
      leftTarget.current = centerTarget.current;
      rightTarget.current = centerTarget.current;
    } else if (mode === 'shapeSort') {
      leftTarget.current = { x: w * 0.25, y: h * 0.72 };
      rightTarget.current = { x: w * 0.75, y: h * 0.72 };
    } else {
      leftTarget.current = { x: w * 0.22, y: h * 0.72 };
      rightTarget.current = { x: w * 0.78, y: h * 0.72 };
    }
    leftX.value = leftStart.current.x;
    leftY.value = leftStart.current.y;
    rightX.value = rightStart.current.x;
    rightY.value = rightStart.current.y;
    setZoneLayout({
      left: { ...leftTarget.current },
      right: { ...rightTarget.current },
      center: { ...centerTarget.current },
    });
  }, [leftX, leftY, mode, rightX, rightY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 20);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
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
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, ttsSuccess]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    leftInRef.current = false;
    rightInRef.current = false;
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
    if (isTwinDrag) {
      setSuccessToast(true);
      setTwinKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isPairMatch) {
      setSuccessToast(true);
      setPairKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isBoxSort) {
      setSuccessToast(true);
      setSortKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, isBoxSort, isPairMatch, isTwinDrag]);

  const checkCompletion = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    if (leftInRef.current && rightInRef.current) completeRound();
  }, [completeRound]);

  const updateInZone = useCallback(
    (side: 'left' | 'right') => {
      const tol = mode === 'shapeSort' ? P.sortTolerancePx : P.matchTolerancePx;
      const x = side === 'left' ? leftX.value : rightX.value;
      const y = side === 'left' ? leftY.value : rightY.value;
      const tx = side === 'left' ? leftTarget.current.x : rightTarget.current.x;
      const ty = side === 'left' ? leftTarget.current.y : rightTarget.current.y;
      const inZone = distPx(x, y, tx, ty) <= tol;
      if (side === 'left') leftInRef.current = inZone;
      else rightInRef.current = inZone;
      checkCompletion();
    },
    [checkCompletion, leftX, leftY, mode, rightX, rightY],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutPositions();
    if (mode === 'matchCenter') {
      const shape = randomMatchShape();
      setMatchEmoji(shape.emoji);
    }
    const hint =
      mode === 'shapeSort'
        ? 'Circle → left box, square → right box!'
        : mode === 'matchCenter'
          ? 'Drag both shapes to the center!'
          : 'Drag both objects to their targets!';
    setStatusHint(hint);
    if (isThemedDual) {
      setSuccessToast(false);
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 350 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    }
    speakTTS(ttsCue, 0.78).catch(() => {});
  }, [isThemedDual, kickOffOpacity, layoutPositions, mode, ttsCue]);

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

  const isDragActive = useCallback(
    () => roundActiveRef.current && !roundCompleteRef.current && !doneRef.current,
    [],
  );

  const leftPan = createObjectPanGesture({
    objX: leftX,
    objY: leftY,
    objScale: leftScale,
    playW,
    playH,
    half: HALF,
    isActive: isDragActive,
    onUpdate: () => updateInZone('left'),
  });

  const rightPan = createObjectPanGesture({
    objX: rightX,
    objY: rightY,
    objScale: rightScale,
    playW,
    playH,
    half: HALF,
    isActive: isDragActive,
    onUpdate: () => updateInZone('right'),
  });

  const dualGesture = createSimultaneousDualPan(leftPan, rightPan);

  const leftEmoji = mode === 'shapeSort' ? '⭕' : mode === 'matchCenter' ? matchEmoji : '🔵';
  const rightEmoji = mode === 'shapeSort' ? '⬜' : mode === 'matchCenter' ? matchEmoji : '🔴';

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
        {isThemedDual && (
          <View
            style={[
              styles.roundTrack,
              isTwinDrag && styles.twinRoundTrack,
              isPairMatch && styles.pairRoundTrack,
              isBoxSort && styles.sortRoundTrack,
              { borderColor: T.accent },
            ]}
          >
            <View style={[styles.roundFill, { width: `${(round / P.rounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isTwinDrag && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>🔵</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🤲</Text>
            <Text style={styles.decoEmoji}>🔴</Text>
          </View>
        )}
        {isPairMatch && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>{matchEmoji}</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🤝</Text>
            <Text style={styles.decoEmoji}>{matchEmoji}</Text>
          </View>
        )}
        {isBoxSort && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>⭕</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>📦</Text>
            <Text style={styles.decoEmoji}>⬜</Text>
          </View>
        )}
      </View>

      <GestureDetector gesture={dualGesture}>
        <Animated.View style={[styles.playAreaWrap, isThemedDual && playShakeStyle]}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, isThemedDual && styles.playAreaThemed]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutPositions();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {isTwinDrag && (
            <TwinDragPlayArea
              roundActive={roundActive}
              showGuide={isTwinDrag && round <= 2}
              twinKey={twinKey}
              leftZone={zoneLayout.left}
              rightZone={zoneLayout.right}
            />
          )}

          {isPairMatch && (
            <PairMatchPlayArea
              roundActive={roundActive}
              showGuide={isPairMatch && round <= 2}
              pairKey={pairKey}
              centerZone={zoneLayout.center}
            />
          )}

          {isBoxSort && (
            <BoxSortPlayArea
              roundActive={roundActive}
              showGuide={isBoxSort && round <= 2}
              sortKey={sortKey}
              leftZone={zoneLayout.left}
              rightZone={zoneLayout.right}
            />
          )}

          {roundActive && mode === 'matchCenter' && (
            <View
              style={[
                styles.zone,
                styles.centerZone,
                isPairMatch && styles.pairCenterZone,
                {
                  left: zoneLayout.center.x - 55,
                  top: zoneLayout.center.y - 55,
                  borderColor: T.zoneBorder,
                },
              ]}
            >
              {isPairMatch ? (
                <>
                  <Text style={styles.zoneEmoji}>{matchEmoji}</Text>
                  <Text style={styles.pairZoneLabel}>MERGE</Text>
                </>
              ) : (
                <Text style={styles.zoneLabel}>MATCH</Text>
              )}
            </View>
          )}

          {roundActive && mode !== 'matchCenter' && (
            <>
              <View
                style={[
                  styles.zone,
                  isTwinDrag && styles.twinZone,
                  isBoxSort && styles.sortZone,
                  isBoxSort && styles.circleSortZone,
                  {
                    left: zoneLayout.left.x - 48,
                    top: zoneLayout.left.y - 48,
                    borderColor: T.zoneBorder,
                  },
                ]}
              >
                {isBoxSort ? (
                  <>
                    <Text style={styles.zoneEmoji}>⭕</Text>
                    <Text style={styles.sortZoneLabel}>CIRCLE</Text>
                  </>
                ) : (
                  <Text style={styles.zoneEmoji}>{mode === 'shapeSort' ? '⭕' : '🎯'}</Text>
                )}
              </View>
              <View
                style={[
                  styles.zone,
                  isTwinDrag && styles.twinZone,
                  isBoxSort && styles.sortZone,
                  isBoxSort && styles.squareSortZone,
                  {
                    left: zoneLayout.right.x - 48,
                    top: zoneLayout.right.y - 48,
                    borderColor: T.zoneBorder,
                  },
                ]}
              >
                {isBoxSort ? (
                  <>
                    <Text style={styles.zoneEmoji}>⬜</Text>
                    <Text style={styles.sortZoneLabel}>SQUARE</Text>
                  </>
                ) : (
                  <Text style={styles.zoneEmoji}>{mode === 'shapeSort' ? '⬜' : '🎯'}</Text>
                )}
              </View>
            </>
          )}

          {roundActive && (
            <>
              <Animated.View
                style={[
                  styles.obj,
                  { backgroundColor: T.leftColor },
                  isTwinDrag && styles.twinObj,
                  isPairMatch && styles.pairObj,
                  isBoxSort && styles.sortObj,
                  leftStyle,
                ]}
              >
                <Text style={styles.objEmoji}>{leftEmoji}</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.obj,
                  { backgroundColor: T.rightColor },
                  isTwinDrag && styles.twinObj,
                  isPairMatch && styles.pairObj,
                  isBoxSort && styles.sortObj,
                  rightStyle,
                ]}
              >
                <Text style={styles.objEmoji}>{rightEmoji}</Text>
              </Animated.View>
            </>
          )}

          {kickOffVisible && isTwinDrag ? (
            <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.kickOffText}>🤲 TWIN DRAG!</Text>
            </Animated.View>
          ) : null}
          {kickOffVisible && isPairMatch ? (
            <Animated.View style={[styles.kickOffBanner, styles.pairKickOff, kickOffStyle]} pointerEvents="none">
              <Text style={[styles.kickOffText, styles.pairKickOffText]}>🤝 PAIR MATCH!</Text>
            </Animated.View>
          ) : null}
          {kickOffVisible && isBoxSort ? (
            <Animated.View style={[styles.kickOffBanner, styles.sortKickOff, kickOffStyle]} pointerEvents="none">
              <Text style={[styles.kickOffText, styles.sortKickOffText]}>📦 BOX SORT!</Text>
            </Animated.View>
          ) : null}

          <SparkleBurst
            key={sparkleKey}
            visible={sparkleKey > 0}
            color={T.sparkleColor}
            count={isThemedDual ? 16 : 10}
            size={isThemedDual ? 8 : 6}
          />
          {isTwinDrag && <ResultToast text="BOTH!" type="ok" show={successToast} />}
          {isPairMatch && <ResultToast text="MATCH!" type="ok" show={successToast} />}
          {isBoxSort && <ResultToast text="SORTED!" type="ok" show={successToast} />}
        </View>
        </Animated.View>
      </GestureDetector>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: {
    width: '70%',
    height: 8,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: 'rgba(12,25,41,0.55)',
  },
  twinRoundTrack: { backgroundColor: 'rgba(12,25,41,0.55)' },
  pairRoundTrack: { backgroundColor: 'rgba(5,46,22,0.55)' },
  sortRoundTrack: { backgroundColor: 'rgba(46,16,101,0.55)' },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  decoEmoji: { fontSize: 20 },
  decoArrow: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1 },
  playAreaThemed: { borderWidth: 2, overflow: 'hidden', justifyContent: 'center' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  zone: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  centerZone: { width: 110, height: 110, borderRadius: 55 },
  pairCenterZone: {
    backgroundColor: 'rgba(5,46,22,0.65)',
    zIndex: 3,
    borderWidth: 3,
  },
  zoneLabel: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  pairZoneLabel: { fontSize: 9, fontWeight: '900', color: '#BBF7D0', marginTop: 2, letterSpacing: 1 },
  zoneEmoji: { fontSize: 32 },
  twinZone: {
    backgroundColor: 'rgba(12,25,41,0.55)',
    zIndex: 3,
  },
  sortZone: {
    backgroundColor: 'rgba(46,16,101,0.65)',
    zIndex: 3,
    borderWidth: 3,
  },
  circleSortZone: { borderColor: 'rgba(129,140,248,0.55)' },
  squareSortZone: { borderColor: 'rgba(45,212,191,0.55)' },
  sortZoneLabel: { fontSize: 9, fontWeight: '900', color: '#DDD6FE', marginTop: 2, letterSpacing: 0.5 },
  obj: {
    position: 'absolute',
    width: HALF * 2,
    height: HALF * 2,
    borderRadius: HALF,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  objEmoji: { fontSize: 34 },
  twinObj: {
    borderColor: 'rgba(191,219,254,0.55)',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 5,
  },
  pairObj: {
    borderColor: 'rgba(187,247,208,0.55)',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 5,
  },
  sortObj: {
    borderColor: 'rgba(221,214,254,0.55)',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 5,
  },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 2,
    borderColor: '#60A5FA',
    zIndex: 6,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#BFDBFE', letterSpacing: 1 },
  pairKickOff: {
    backgroundColor: 'rgba(5,46,22,0.92)',
    borderColor: '#4ADE80',
  },
  pairKickOffText: { color: '#BBF7D0' },
  sortKickOff: {
    backgroundColor: 'rgba(46,16,101,0.92)',
    borderColor: '#A78BFA',
  },
  sortKickOffText: { color: '#DDD6FE' },
});

export default DualDragGame;
