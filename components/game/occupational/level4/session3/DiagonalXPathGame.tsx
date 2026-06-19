/**
 * X-shape diagonal trace core for OT Level 4 Session 3.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { XTracePlayArea } from '@/components/game/occupational/level4/session3/XTracePlayArea';
import { distPx, useTraceSound } from '@/components/game/occupational/level4/session3/diagonalUtils';
import { SESSION4_3_PACING } from '@/components/game/occupational/level4/session3/session3Pacing';
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

const P = SESSION4_3_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type DiagonalXPathTheme = {
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

export type DiagonalXPathGameConfig = {
  theme: DiagonalXPathTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsGoal?: string;
  ttsLeg1?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

type XLeg = 'first' | 'second';

export const DiagonalXPathGame: React.FC<
  DiagonalXPathGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Trace the X shape with two diagonals!',
  ttsMiss = 'Complete both diagonals of the X!',
  ttsGoal = 'Sigil complete!',
  ttsLeg1 = 'First leg done!',
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
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [successToast, setSuccessToast] = useState(false);
  const [leg1Toast, setLeg1Toast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [traceKey, setTraceKey] = useState(0);
  const [leg1Key, setLeg1Key] = useState(0);
  const [tracePct, setTracePct] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [currentLeg, setCurrentLeg] = useState<XLeg>('first');
  const [legHint, setLegHint] = useState('Leg 1 of 2 ↘');
  const [pathString, setPathString] = useState('');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const currentLegRef = useRef<XLeg>('first');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const centerX = useRef(180);
  const centerY = useRef(200);
  const offset = useRef(100);
  const leg1EndX = useRef(280);
  const leg1EndY = useRef(300);
  const leg2StartX = useRef(280);
  const leg2StartY = useRef(100);
  const leg2EndX = useRef(80);
  const leg2EndY = useRef(300);
  const startX = useRef(80);
  const startY = useRef(100);

  const objX = useSharedValue(80);
  const objY = useSharedValue(100);
  const objScale = useSharedValue(1);
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

  const objStyle = useAnimatedStyle(() => ({
    left: objX.value - 25,
    top: objY.value - 25,
    transform: [{ scale: objScale.value }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.92 + kickOffOpacity.value * 0.08 }],
  }));

  const penShadowStyle = useAnimatedStyle(() => ({
    left: objX.value - 18,
    top: objY.value + 14,
    opacity: 0.22 + (objScale.value - 1) * 0.1,
    transform: [{ scaleX: 1 + (objScale.value - 1) * 0.2 }, { scaleY: 0.45 }],
  }));

  const shakePlayArea = useCallback(() => {
    playShake.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(-5, { duration: 45 }),
      withTiming(5, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [playShake]);

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    cancelAnimation(objX);
    cancelAnimation(objY);
  }, [objX, objY]);

  const layoutX = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    centerX.current = w / 2;
    centerY.current = h / 2;
    offset.current = Math.min(w, h) * P.xPathOffsetPct;
    const cx = centerX.current;
    const cy = centerY.current;
    const off = offset.current;
    startX.current = cx - off;
    startY.current = cy - off;
    leg1EndX.current = cx + off;
    leg1EndY.current = cy + off;
    leg2StartX.current = cx + off;
    leg2StartY.current = cy - off;
    leg2EndX.current = cx - off;
    leg2EndY.current = cy + off;
    setPathString(
      `M ${startX.current} ${startY.current} L ${leg1EndX.current} ${leg1EndY.current} M ${leg2StartX.current} ${leg2StartY.current} L ${leg2EndX.current} ${leg2EndY.current}`,
    );
  }, []);

  const resetToLegStart = useCallback(
    (leg: XLeg) => {
      currentLegRef.current = leg;
      setCurrentLeg(leg);
      if (leg === 'first') {
        objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
        objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
        setLegHint('Trace leg 1 — top-left to bottom-right ↘');
        setTracePct(0);
      } else {
        objX.value = withSpring(leg2StartX.current, { damping: 14, stiffness: 160 });
        objY.value = withSpring(leg2StartY.current, { damping: 14, stiffness: 160 });
        setLegHint('Trace leg 2 — top-right to bottom-left ↙');
        setTracePct(50);
      }
      objScale.value = withTiming(1, { duration: 120 });
    },
    [objScale, objX, objY],
  );

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
      setWarnMessage(currentLegRef.current === 'first' ? 'Stay on leg 1!' : 'Finish leg 2!');
      setWarnVisible(true);
      shakePlayArea();
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn, shakePlayArea],
  );

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
    setIsDragging(false);
    setKickOffVisible(false);
    kickOffOpacity.value = withTiming(0, { duration: 120 });
    bumpScore();
    setTraceKey(Date.now());
    setTracePct(100);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 700);
    speakTTS(ttsGoal, 0.82).catch(() => {});
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 780);
  }, [advanceRound, bumpScore, kickOffOpacity, objScale, ttsGoal]);

  const completeLeg1 = useCallback(() => {
    setLeg1Key(Date.now());
    setLeg1Toast(true);
    setTimeout(() => setLeg1Toast(false), 550);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    speakTTS(ttsLeg1, 0.82).catch(() => {});
    resetToLegStart('second');
  }, [resetToLegStart, ttsLeg1]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutX();
    resetToLegStart('first');
    setIsDragging(false);
    setKickOffVisible(true);
    kickOffOpacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 }),
    );
    kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1400);
    speakTTS(ttsDrag, 0.78).catch(() => {});
  }, [kickOffOpacity, layoutX, resetToLegStart, ttsDrag]);

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
      setIsDragging(true);
      setKickOffVisible(false);
      kickOffOpacity.value = withTiming(0, { duration: 100 });
      objScale.value = withTiming(1.18, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const half = 25;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));

      if (currentLegRef.current === 'first') {
        const total = distPx(startX.current, startY.current, leg1EndX.current, leg1EndY.current);
        const current = distPx(startX.current, startY.current, objX.value, objY.value);
        setTracePct(Math.min(50, (current / total) * 50));
        const d = distPx(objX.value, objY.value, leg1EndX.current, leg1EndY.current);
        if (d <= P.pathTolerancePx) {
          completeLeg1();
        }
      } else if (!roundCompleteRef.current) {
        const total = distPx(leg2StartX.current, leg2StartY.current, leg2EndX.current, leg2EndY.current);
        const current = distPx(leg2StartX.current, leg2StartY.current, objX.value, objY.value);
        setTracePct(50 + Math.min(50, (current / total) * 50));
        const d = distPx(objX.value, objY.value, leg2EndX.current, leg2EndY.current);
        if (d <= P.pathTolerancePx) {
          completeRound();
        }
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      setIsDragging(false);
      objScale.value = withTiming(1, { duration: 100 });
      if (currentLegRef.current === 'second') {
        const d = distPx(objX.value, objY.value, leg2EndX.current, leg2EndY.current);
        if (d <= P.pathTolerancePx) return;
      }
      showWarn(ttsMiss);
      resetToLegStart(currentLegRef.current);
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

  const roundPct = ((round - 1) / P.rounds) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.chamberGlow} pointerEvents="none">
        {[0, 1, 2].map((i) => (
          <View key={`orb-${i}`} style={[styles.chamberOrb, { left: `${12 + i * 30}%` }]} />
        ))}
      </View>
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder, backgroundColor: 'rgba(26,10,46,0.55)' }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }, styles.themedTitle]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder, backgroundColor: 'rgba(26,10,46,0.45)' }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              styles.starPill,
              { borderColor: T.statBorder, backgroundColor: 'rgba(232,121,249,0.15)' },
            ]}
          >
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
        </View>
        {roundActive && (
          <View style={[styles.traceProgressTrack, { borderColor: T.accent }]}>
            <View style={[styles.traceProgressFill, { width: `${tracePct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {roundActive ? <Text style={[styles.hint, { color: T.accentDark }]}>{legHint}</Text> : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.playArea,
            playShakeStyle,
            {
              borderColor: T.playBorder,
              backgroundColor: T.playBg,
              borderWidth: 2,
              shadowColor: '#000',
              shadowOpacity: 0.28,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            },
          ]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutX();
            if (roundActive) resetToLegStart(currentLegRef.current);
          }}
        >
          {!roundActive && (
            <Text style={[styles.waitText, { color: '#E9D5FF' }]}>Sigil awakening…</Text>
          )}

          {roundActive && (
            <XTracePlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              currentLeg={currentLeg}
              traceKey={traceKey}
              leg1Key={leg1Key}
            />
          )}

          {roundActive && pathString ? (
            <Svg style={StyleSheet.absoluteFill} width={playW.current} height={playH.current}>
              <Path
                d={pathString}
                stroke={T.pathColor}
                strokeWidth={16}
                fill="none"
                strokeLinecap="round"
                strokeOpacity={0.2}
              />
              <Path
                d={pathString}
                stroke={T.pathColor}
                strokeWidth={7}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.95}
              />
            </Svg>
          ) : null}

          {roundActive && (
            <Animated.View style={[styles.penShadow, penShadowStyle]} pointerEvents="none" />
          )}

          {roundActive && (
            <Animated.View style={[styles.penDraggable, objStyle]}>
              <LinearGradient colors={['#FAE8FF', '#E879F9', '#A855F7']} style={styles.penGradient}>
                <Text style={styles.penEmoji}>{T.draggableEmoji}</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {kickOffVisible && (
            <Animated.View style={[styles.sigilBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.sigilBannerText}>✨ TRACE!</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
          <ResultToast text="LEG 1!" type="ok" show={leg1Toast} />
          <ResultToast text="TRACED!" type="ok" show={successToast} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.sigilWarnPill}>
          <Text style={styles.sigilWarnText}>{warnMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chamberGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, pointerEvents: 'none' },
  chamberOrb: {
    position: 'absolute',
    top: 22,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232,121,249,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,121,249,0.2)',
  },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  themedTitle: {
    textShadowColor: 'rgba(232,121,249,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressTrack: {
    width: '72%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  traceProgressTrack: {
    width: '72%',
    height: 7,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  traceProgressFill: { height: '100%', borderRadius: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  penShadow: {
    position: 'absolute',
    width: 36,
    height: 10,
    borderRadius: 18,
    backgroundColor: '#000',
    zIndex: 1,
  },
  penDraggable: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#E879F9',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  penGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  penEmoji: { fontSize: 26 },
  sigilBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: 'rgba(26,10,46,0.88)',
    borderWidth: 2,
    borderColor: '#E879F9',
    zIndex: 5,
  },
  sigilBannerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FAE8FF',
    textShadowColor: '#FBBF24',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sigilWarnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(26,10,46,0.88)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
  },
  sigilWarnText: { fontSize: 15, fontWeight: '800', color: '#F9A8D4' },
});

export default DiagonalXPathGame;
