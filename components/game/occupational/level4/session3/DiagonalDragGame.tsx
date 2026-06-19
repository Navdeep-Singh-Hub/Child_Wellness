/**
 * Shared corner-to-corner diagonal drag core for OT Level 4 Session 3.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { CornerMatchPlayArea } from '@/components/game/occupational/level4/session3/CornerMatchPlayArea';
import { DiagonalDashPlayArea } from '@/components/game/occupational/level4/session3/DiagonalDashPlayArea';
import { distPx, randomMatchEmoji, useTraceSound } from '@/components/game/occupational/level4/session3/diagonalUtils';
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

const P = SESSION4_3_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type DiagonalDragMode = 'cornerDrag' | 'colorMatch';

export type DiagonalDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  draggableEmoji: string;
  targetEmoji: string;
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

export type DiagonalDragGameConfig = {
  theme: DiagonalDragTheme;
  mode: DiagonalDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsGoal?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const DiagonalDragGame: React.FC<
  DiagonalDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Drag diagonally to the opposite corner!',
  ttsMiss = 'Try dragging to the bottom-right corner!',
  ttsGoal = 'Great job!',
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
  const [isDragging, setIsDragging] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [dashKey, setDashKey] = useState(0);
  const [matchKey, setMatchKey] = useState(0);
  const [dashPct, setDashPct] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [matchEmoji, setMatchEmoji] = useState(randomMatchEmoji());

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(54);
  const startY = useRef(72);
  const endX = useRef(306);
  const endY = useRef(328);

  const objX = useSharedValue(54);
  const objY = useSharedValue(72);
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
    left: objX.value - 34,
    top: objY.value - 34,
    transform: [{ scale: objScale.value }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.92 + kickOffOpacity.value * 0.08 }],
  }));

  const cometShadowStyle = useAnimatedStyle(() => ({
    left: objX.value - 26,
    top: objY.value + 20,
    opacity: 0.2 + (objScale.value - 1) * 0.12,
    transform: [{ scaleX: 1 + (objScale.value - 1) * 0.25 }, { scaleY: 0.5 }],
  }));

  const gemShadowStyle = useAnimatedStyle(() => ({
    left: objX.value - 24,
    top: objY.value + 18,
    opacity: 0.2 + (objScale.value - 1) * 0.12,
    transform: [{ scaleX: 1 + (objScale.value - 1) * 0.22 }, { scaleY: 0.48 }],
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

  const layoutPositions = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    startX.current = w * P.startXPct;
    startY.current = h * P.startYPct;
    endX.current = w * P.endXPct;
    endY.current = h * P.endYPct;
    objX.value = startX.current;
    objY.value = startY.current;
    setDashPct(0);
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
      setWarnMessage(
        mode === 'cornerDrag' ? 'Missed the valley!' : mode === 'colorMatch' ? 'Wrong corner!' : 'Try again!',
      );
      setWarnVisible(true);
      if (mode === 'cornerDrag' || mode === 'colorMatch') shakePlayArea();
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [mode, playWarn, shakePlayArea],
  );

  const resetObject = useCallback(() => {
    objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    objScale.value = withTiming(1, { duration: 120 });
    setDashPct(0);
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
    setIsDragging(false);
    setKickOffVisible(false);
    kickOffOpacity.value = withTiming(0, { duration: 120 });
    bumpScore();
    if (mode === 'cornerDrag' || mode === 'colorMatch') {
      setSuccessToast(true);
      if (mode === 'cornerDrag') setDashKey(Date.now());
      if (mode === 'colorMatch') setMatchKey(Date.now());
      setTimeout(() => setSuccessToast(false), 700);
      speakTTS(ttsGoal, 0.82).catch(() => {});
    }
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(
      () => advanceRound(),
      mode === 'cornerDrag' || mode === 'colorMatch' ? 780 : 650,
    );
  }, [advanceRound, bumpScore, kickOffOpacity, mode, objScale, ttsGoal]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutPositions();
    let emoji = matchEmoji;
    if (mode === 'colorMatch') {
      emoji = randomMatchEmoji();
      setMatchEmoji(emoji);
    }
    setIsDragging(false);
    setStatusHint(
      mode === 'cornerDrag'
        ? 'Slide from summit to valley finish!'
        : mode === 'colorMatch'
          ? `Drag ${emoji} to the matching corner!`
          : 'Top-left → bottom-right!',
    );
    if (mode === 'cornerDrag' || mode === 'colorMatch') {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 280 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1400);
    }
    speakTTS(ttsDrag, 0.78).catch(() => {});
  }, [kickOffOpacity, layoutPositions, matchEmoji, mode, ttsDrag]);

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
      objScale.value = withTiming(
        mode === 'cornerDrag' ? 1.2 : mode === 'colorMatch' ? 1.18 : 1.15,
        { duration: 100 },
      );
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const half = 34;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));
      if (mode === 'cornerDrag' || mode === 'colorMatch') {
        const total = distPx(startX.current, startY.current, endX.current, endY.current);
        const current = distPx(startX.current, startY.current, objX.value, objY.value);
        setDashPct(Math.min(100, (current / total) * 100));
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      setIsDragging(false);
      objScale.value = withTiming(1, { duration: 100 });
      const d = distPx(objX.value, objY.value, endX.current, endY.current);
      if (d <= P.matchTolerancePx) {
        completeRound();
        return;
      }
      showWarn(ttsMiss);
      resetObject();
    });

  const dragEmoji = mode === 'colorMatch' ? matchEmoji : T.draggableEmoji;

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
  const isDiagonalDash = mode === 'cornerDrag';
  const isCornerMatch = mode === 'colorMatch';
  const isThemed = isDiagonalDash || isCornerMatch;
  const successLabel = isDiagonalDash ? 'LANDED!' : isCornerMatch ? 'MATCHED!' : 'Nice!';
  const roundBannerText = isDiagonalDash ? '↘️ DASH!' : isCornerMatch ? '💎 MATCH!' : '';
  const waitLabel = isDiagonalDash
    ? 'Summit warming up…'
    : isCornerMatch
      ? 'Gems aligning…'
      : 'Get ready…';
  const waitColor = isDiagonalDash ? '#BAE6FD' : isCornerMatch ? '#FECDD3' : T.subtitleColor;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      {isDiagonalDash && (
        <View style={styles.skyGlow} pointerEvents="none">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={`glow-${i}`}
              style={[styles.skyOrb, { left: `${10 + i * 22}%`, opacity: 0.08 + i * 0.04 }]}
            />
          ))}
        </View>
      )}
      {isCornerMatch && (
        <View style={styles.prismHeader} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View key={`prism-${i}`} style={[styles.prismOrb, { left: `${14 + i * 32}%` }]} />
          ))}
        </View>
      )}
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View
          style={[
            styles.backInner,
            {
              borderColor: T.backBorder,
              backgroundColor: isDiagonalDash
                ? 'rgba(15,23,42,0.55)'
                : isCornerMatch
                  ? 'rgba(26,10,20,0.55)'
                  : 'rgba(255,255,255,0.75)',
            },
          ]}
        >
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: T.titleColor },
            isThemed && (isCornerMatch ? styles.prismTitle : styles.themedTitle),
          ]}
        >
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statPill,
              {
                borderColor: T.statBorder,
                backgroundColor: isThemed
                  ? isDiagonalDash
                    ? 'rgba(15,23,42,0.45)'
                    : 'rgba(26,10,20,0.45)'
                  : 'rgba(255,255,255,0.7)',
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              styles.starPill,
              {
                borderColor: T.statBorder,
                backgroundColor: isThemed
                  ? isDiagonalDash
                    ? 'rgba(251,191,36,0.15)'
                    : 'rgba(251,113,133,0.15)'
                  : 'rgba(251,191,36,0.2)',
              },
            ]}
          >
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {isThemed && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {(isDiagonalDash || isCornerMatch) && roundActive && (
          <View style={[styles.dashProgressTrack, { borderColor: T.accent }]}>
            <View style={[styles.dashProgressFill, { width: `${dashPct}%`, backgroundColor: T.accent }]} />
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
              borderWidth: isThemed ? 2 : 1,
              shadowColor: isThemed ? '#000' : 'transparent',
              shadowOpacity: isThemed ? 0.28 : 0,
              shadowRadius: isThemed ? 16 : 0,
              shadowOffset: isThemed ? { width: 0, height: 6 } : { width: 0, height: 0 },
              elevation: isThemed ? 8 : 0,
            },
          ]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutPositions();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: waitColor }]}>{waitLabel}</Text>}

          {roundActive && isDiagonalDash && (
            <DiagonalDashPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              dashKey={dashKey}
            />
          )}

          {roundActive && isCornerMatch && (
            <CornerMatchPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              matchEmoji={matchEmoji}
              matchKey={matchKey}
            />
          )}

          {roundActive && (isDiagonalDash || isCornerMatch) && (
            <Animated.View
              style={[
                isDiagonalDash ? styles.cometShadow : styles.gemShadow,
                isDiagonalDash ? cometShadowStyle : gemShadowStyle,
              ]}
              pointerEvents="none"
            />
          )}

          {roundActive && (
            <Animated.View
              style={[
                isDiagonalDash
                  ? styles.cometDraggable
                  : isCornerMatch
                    ? styles.gemDraggable
                    : styles.draggable,
                objStyle,
              ]}
            >
              {isDiagonalDash ? (
                <LinearGradient colors={['#BAE6FD', '#38BDF8', '#FBBF24']} style={styles.cometGradient}>
                  <Text style={styles.cometEmoji}>{dragEmoji}</Text>
                </LinearGradient>
              ) : isCornerMatch ? (
                <LinearGradient colors={['#FFE4E6', '#FB7185', '#BE123C']} style={styles.gemGradient}>
                  <Text style={styles.gemEmoji}>{dragEmoji}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.dragEmoji}>{dragEmoji}</Text>
              )}
            </Animated.View>
          )}

          {kickOffVisible && isThemed && roundBannerText ? (
            <Animated.View
              style={[
                isDiagonalDash ? styles.dashBanner : styles.matchBanner,
                kickOffStyle,
              ]}
              pointerEvents="none"
            >
              <Text style={isDiagonalDash ? styles.dashBannerText : styles.matchBannerText}>
                {roundBannerText}
              </Text>
            </Animated.View>
          ) : null}

          <SparkleBurst
            key={sparkleKey}
            visible={sparkleKey > 0}
            color={T.sparkleColor}
            count={isThemed ? 16 : 10}
            size={isThemed ? 8 : 6}
          />
          <ResultToast text={successLabel} type="ok" show={successToast && isThemed} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View
          style={[
            styles.warnPill,
            isDiagonalDash && styles.dashWarnPill,
            isCornerMatch && styles.matchWarnPill,
          ]}
        >
          <Text
            style={[
              styles.warnText,
              isDiagonalDash && styles.dashWarnText,
              isCornerMatch && styles.matchWarnText,
            ]}
          >
            {warnMessage}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  skyGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, pointerEvents: 'none' },
  skyOrb: {
    position: 'absolute',
    top: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#38BDF8',
  },
  prismHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    pointerEvents: 'none',
  },
  prismOrb: {
    position: 'absolute',
    top: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(251,113,133,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  themedTitle: {
    textShadowColor: 'rgba(56,189,248,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  prismTitle: {
    textShadowColor: 'rgba(251,113,133,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressTrack: {
    width: '72%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  dashProgressTrack: {
    width: '72%',
    height: 7,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dashProgressFill: { height: '100%', borderRadius: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  diagonalGuide: {
    position: 'absolute',
    left: '12%',
    top: '16%',
    width: '76%',
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: '32deg' }],
    opacity: 0.5,
  },
  cornerZone: {
    position: 'absolute',
    width: '24%',
    height: '24%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  tlZone: { left: '6%', top: '8%' },
  brZone: { right: '6%', bottom: '8%' },
  zoneLabel: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  zoneEmoji: { fontSize: 36 },
  cometShadow: {
    position: 'absolute',
    width: 52,
    height: 16,
    borderRadius: 26,
    backgroundColor: '#000',
    zIndex: 1,
  },
  draggable: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  cometDraggable: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
  cometGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cometEmoji: { fontSize: 36 },
  gemShadow: {
    position: 'absolute',
    width: 48,
    height: 14,
    borderRadius: 24,
    backgroundColor: '#000',
    zIndex: 1,
  },
  gemDraggable: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#FB7185',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
  gemGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemEmoji: { fontSize: 36 },
  dragEmoji: { fontSize: 40 },
  dashBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderWidth: 2,
    borderColor: '#FBBF24',
    zIndex: 5,
  },
  dashBannerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FEF3C7',
    textShadowColor: '#38BDF8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  matchBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(26,10,20,0.88)',
    borderWidth: 2,
    borderColor: '#FB7185',
    zIndex: 5,
  },
  matchBannerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFE4E6',
    textShadowColor: '#FBBF24',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dashWarnPill: {
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.45)',
  },
  warnText: { fontSize: 15, fontWeight: '800', color: '#B91C1C' },
  dashWarnText: { color: '#FCA5A5' },
  matchWarnPill: {
    backgroundColor: 'rgba(26,10,20,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
  },
  matchWarnText: { color: '#FDA4AF' },
});

export default DiagonalDragGame;
