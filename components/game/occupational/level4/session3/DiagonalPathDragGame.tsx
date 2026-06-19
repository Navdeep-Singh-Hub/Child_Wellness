/**
 * Shared diagonal zigzag path drag core for OT Level 4 Session 3.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { ZigzagRunPlayArea } from '@/components/game/occupational/level4/session3/ZigzagRunPlayArea';
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

export type DiagonalPathTheme = {
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

export type DiagonalPathDragGameConfig = {
  theme: DiagonalPathTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsGoal?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const buildZigzagPath = (w: number, h: number) => {
  const sx = w * P.startXPct;
  const sy = h * P.zigzagStartYPct;
  const ex = w * P.endXPct;
  const ey = h * P.zigzagEndYPct;
  const mid1X = sx + (ex - sx) * 0.33;
  const mid1Y = sy + (ey - sy) * 0.33;
  const mid2X = sx + (ex - sx) * 0.66;
  const mid2Y = sy + (ey - sy) * 0.66;
  return {
    path: `M ${sx} ${sy} L ${mid1X} ${mid1Y} L ${mid2X} ${mid2Y} L ${ex} ${ey}`,
    sx,
    sy,
    ex,
    ey,
  };
};

export const DiagonalPathDragGame: React.FC<
  DiagonalPathDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Follow the zigzag path!',
  ttsMiss = 'Follow the path to the bottom-right!',
  ttsGoal = 'Zapped!',
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
  const [warnMessage, setWarnMessage] = useState('Off the bolt!');
  const [successToast, setSuccessToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [zapKey, setZapKey] = useState(0);
  const [zigPct, setZigPct] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [pathString, setPathString] = useState('');
  const [statusHint, setStatusHint] = useState('');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const zigPctRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(54);
  const startY = useRef(88);
  const endX = useRef(306);
  const endY = useRef(312);

  const objX = useSharedValue(54);
  const objY = useSharedValue(88);
  const objScale = useSharedValue(1);
  const objSpin = useSharedValue(0);
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
    transform: [{ scale: objScale.value }, { rotate: `${objSpin.value}deg` }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.92 + kickOffOpacity.value * 0.08 }],
  }));

  const boltShadowStyle = useAnimatedStyle(() => ({
    left: objX.value - 20,
    top: objY.value + 16,
    opacity: 0.22 + (objScale.value - 1) * 0.12,
    transform: [{ scaleX: 1 + (objScale.value - 1) * 0.25 }, { scaleY: 0.45 }],
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

  const applyPath = useCallback(() => {
    const { path, sx, sy, ex, ey } = buildZigzagPath(playW.current, playH.current);
    setPathString(path);
    startX.current = sx;
    startY.current = sy;
    endX.current = ex;
    endY.current = ey;
    objX.value = sx;
    objY.value = sy;
    setZigPct(0);
    zigPctRef.current = 0;
  }, [objX, objY]);

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
      setWarnMessage('Off the bolt!');
      setWarnVisible(true);
      shakePlayArea();
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn, shakePlayArea],
  );

  const resetObject = useCallback(() => {
    objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    objScale.value = withTiming(1, { duration: 120 });
    objSpin.value = withSpring(0, { damping: 14, stiffness: 120 });
    setZigPct(0);
    zigPctRef.current = 0;
  }, [objScale, objSpin, objX, objY]);

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
    setZapKey(Date.now());
    setZigPct(100);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 700);
    speakTTS(ttsGoal, 0.82).catch(() => {});
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 780);
  }, [advanceRound, bumpScore, kickOffOpacity, objScale, ttsGoal]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    applyPath();
    setIsDragging(false);
    setStatusHint('Ride the zigzag lightning to the gate!');
    setKickOffVisible(true);
    kickOffOpacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 }),
    );
    kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1400);
    speakTTS(ttsDrag, 0.78).catch(() => {});
  }, [applyPath, kickOffOpacity, ttsDrag]);

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
      objScale.value = withTiming(1.2, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const half = 25;
      const prevX = objX.value;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));
      objSpin.value += (objX.value - prevX) * 0.15;
      const total = distPx(startX.current, startY.current, endX.current, endY.current);
      const current = distPx(startX.current, startY.current, objX.value, objY.value);
      const pct = Math.min(100, (current / total) * 100);
      zigPctRef.current = pct;
      setZigPct(pct);
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      setIsDragging(false);
      objScale.value = withTiming(1, { duration: 100 });
      objSpin.value = withSpring(0, { damping: 14, stiffness: 120 });
      const d = distPx(objX.value, objY.value, endX.current, endY.current);
      if (d <= P.pathTolerancePx) {
        completeRound();
        return;
      }
      const missMsg =
        zigPctRef.current < 30
          ? 'Start at the spark in the top-left!'
          : 'Follow the zigzag bolt to the thunder gate!';
      showWarn(missMsg);
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

  const roundPct = ((round - 1) / P.rounds) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.boltHeader} pointerEvents="none">
        {[0, 1, 2].map((i) => (
          <View key={`bh-${i}`} style={[styles.boltOrb, { left: `${12 + i * 30}%` }]} />
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
        <View style={[styles.backInner, { borderColor: T.backBorder, backgroundColor: 'rgba(12,10,9,0.55)' }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }, styles.themedTitle]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder, backgroundColor: 'rgba(12,10,9,0.45)' }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              styles.starPill,
              { borderColor: T.statBorder, backgroundColor: 'rgba(163,230,53,0.15)' },
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
          <View style={[styles.zigProgressTrack, { borderColor: T.accent }]}>
            <View style={[styles.zigProgressFill, { width: `${zigPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
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
            if (roundActive) applyPath();
          }}
        >
          {!roundActive && (
            <Text style={[styles.waitText, { color: '#BEF264' }]}>Charging up…</Text>
          )}

          {roundActive && (
            <ZigzagRunPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              zapKey={zapKey}
            />
          )}

          {roundActive && pathString ? (
            <Svg style={StyleSheet.absoluteFill} width={playW.current} height={playH.current}>
              <Path
                d={pathString}
                stroke={T.pathColor}
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.25}
              />
              <Path
                d={pathString}
                stroke={T.pathColor}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.95}
              />
            </Svg>
          ) : null}

          {roundActive && (
            <Animated.View style={[styles.boltShadow, boltShadowStyle]} pointerEvents="none" />
          )}

          {roundActive && (
            <Animated.View style={[styles.boltDraggable, objStyle]}>
              <LinearGradient colors={['#FEF9C3', '#FACC15', '#EAB308']} style={styles.boltGradient}>
                <Text style={styles.boltEmoji}>{T.draggableEmoji}</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {kickOffVisible && (
            <Animated.View style={[styles.zigBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.zigBannerText}>⚡ ZIGZAG!</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
          <ResultToast text="ZAPPED!" type="ok" show={successToast} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.zigWarnPill}>
          <Text style={styles.zigWarnText}>{warnMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  boltHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 90, pointerEvents: 'none' },
  boltOrb: {
    position: 'absolute',
    top: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(250,204,21,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.2)',
  },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  themedTitle: {
    textShadowColor: 'rgba(163,230,53,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressTrack: {
    width: '72%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  zigProgressTrack: {
    width: '72%',
    height: 7,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  zigProgressFill: { height: '100%', borderRadius: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: {},
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700', zIndex: 3 },
  boltShadow: {
    position: 'absolute',
    width: 40,
    height: 12,
    borderRadius: 20,
    backgroundColor: '#000',
    zIndex: 1,
  },
  boltDraggable: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#FACC15',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  boltGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltEmoji: { fontSize: 28 },
  zigBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: 'rgba(12,10,9,0.88)',
    borderWidth: 2,
    borderColor: '#FACC15',
    zIndex: 5,
  },
  zigBannerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FEF9C3',
    textShadowColor: '#A3E635',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  zigWarnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(12,10,9,0.88)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
  },
  zigWarnText: { fontSize: 15, fontWeight: '800', color: '#FCA5A5' },
});

export default DiagonalPathDragGame;
