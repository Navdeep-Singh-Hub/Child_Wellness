/**
 * Cross-body arrow swipe core for OT Level 4 Session 7.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { SwipeCrossPlayArea } from '@/components/game/occupational/level4/session7/swipeCross/SwipeCrossVisuals';
import {
  ArrowDirection,
  arrowEmoji,
  crossBodySwipe,
  randomDirection,
  swipeFromDelta,
  useTraceSound,
} from '@/components/game/occupational/level4/session7/shared/arrowUtils';
import { SESSION4_7_PACING } from '@/components/game/occupational/level4/session7/shared/session7Pacing';
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

const P = SESSION4_7_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type CrossBodySwipeTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
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

export type CrossBodySwipeGameConfig = {
  theme: CrossBodySwipeTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const CrossBodySwipeGame: React.FC<
  CrossBodySwipeGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Swipe across your body!',
  ttsSuccess = 'Perfect swipe!',
  ttsMiss = 'Swipe the opposite direction!',
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
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [arrowDir, setArrowDir] = useState<ArrowDirection>('left');
  const [expectedSwipe, setExpectedSwipe] = useState<ArrowDirection>('right');
  const [showArrow, setShowArrow] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [swipeKey, setSwipeKey] = useState(0);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const expectedSwipeRef = useRef<ArrowDirection>('right');
  const canSwipeRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const arrowScale = useSharedValue(0.5);
  const arrowOpacity = useSharedValue(0);
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

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ scale: arrowScale.value }],
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
    cancelAnimation(arrowOpacity);
    cancelAnimation(arrowScale);
    cancelAnimation(playShake);
    cancelAnimation(kickOffOpacity);
  }, [arrowOpacity, arrowScale, kickOffOpacity, playShake]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.swipeRounds;
      const xp = Math.round(finalScore * 15);
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

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
      setWarnMessage(msg);
      setWarnVisible(true);
      playShake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
    },
    [playShake, playWarn],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setShowArrow(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.swipeRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    canSwipeRef.current = false;
    arrowOpacity.value = withTiming(0, { duration: 180 });
    setShowArrow(false);
    bumpScore();
    setSuccessToast(true);
    setSwipeKey(Date.now());
    toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, arrowOpacity, bumpScore]);

  const revealArrow = useCallback(() => {
    const dir = randomDirection();
    const swipe = crossBodySwipe(dir);
    setArrowDir(dir);
    setExpectedSwipe(swipe);
    expectedSwipeRef.current = swipe;
    setShowArrow(true);
    canSwipeRef.current = true;
    roundCompleteRef.current = false;
    const hint = `${arrowEmoji(dir)} → swipe ${arrowEmoji(swipe)}!`;
    setStatusHint(hint);
    speakTTS(hint, 0.78).catch(() => {});
    arrowOpacity.value = 0;
    arrowScale.value = 0.5;
    arrowOpacity.value = withTiming(1, { duration: P.arrowRevealMs });
    arrowScale.value = withSpring(1);
  }, [arrowOpacity, arrowScale]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    setRoundActive(true);
    setSuccessToast(false);
    setWarnVisible(false);
    speakTTS(ttsCue, 0.78).catch(() => {});
    setKickOffVisible(true);
    kickOffOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 350 }),
    );
    kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    revealArrow();
  }, [kickOffOpacity, revealArrow, ttsCue]);

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
    .onBegin((e) => {
      if (!roundActiveRef.current || !canSwipeRef.current || roundCompleteRef.current || doneRef.current) return;
      startX.current = e.x;
      startY.current = e.y;
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || !canSwipeRef.current || roundCompleteRef.current || doneRef.current) return;
      const dx = e.x - startX.current;
      const dy = e.y - startY.current;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < P.swipeThresholdPx) {
        showWarn(ttsMiss);
        return;
      }
      const swipeDir = swipeFromDelta(dx, dy);
      if (!swipeDir) {
        showWarn(ttsMiss);
        return;
      }
      if (swipeDir === expectedSwipeRef.current) {
        completeRound();
      } else {
        showWarn(ttsMiss);
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
              {round}/{P.swipeRounds}
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
        <View style={[styles.roundTrack, { borderColor: T.accent }]}>
          <View style={[styles.roundFill, { width: `${(round / P.swipeRounds) * 100}%`, backgroundColor: T.accent }]} />
        </View>
        <View style={styles.headerDeco}>
          <Text style={styles.decoEmoji}>⬅️</Text>
          <Text style={[styles.decoArrow, { color: T.accent }]}>↔</Text>
          <Text style={styles.decoEmoji}>➡️</Text>
        </View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.playAreaWrap, playShakeStyle]}>
          <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, styles.playAreaThemed]}>
            {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

            <SwipeCrossPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              swipeKey={swipeKey}
            />

            {roundActive && showArrow && (
              <Animated.View style={[styles.arrow, styles.swipeArrow, arrowStyle]}>
                <Text style={styles.arrowEmoji}>{arrowEmoji(arrowDir)}</Text>
              </Animated.View>
            )}

            {kickOffVisible ? (
              <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
                <Text style={styles.kickOffText}>➡️ SWIPE CROSS!</Text>
              </Animated.View>
            ) : null}

            <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
            <ResultToast text="SWIPE!" type="ok" show={successToast} />
          </View>
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.swipeWarnPill}>
          <Text style={styles.swipeWarnText}>{warnMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(69,10,10,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(69,10,10,0.55)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
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
    backgroundColor: 'rgba(69,10,10,0.55)',
  },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  decoEmoji: { fontSize: 20 },
  decoArrow: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  playAreaThemed: { borderWidth: 2 },
  waitText: { fontSize: 18, fontWeight: '700', zIndex: 2 },
  arrow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    zIndex: 4,
  },
  swipeArrow: {
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderWidth: 3,
    borderColor: '#F87171',
    shadowColor: '#F87171',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  arrowEmoji: { fontSize: 60 },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderWidth: 2,
    borderColor: '#F87171',
    zIndex: 6,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#FECACA', letterSpacing: 1 },
  swipeWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  swipeWarnText: { fontSize: 14, fontWeight: '800', color: '#FECACA', textAlign: 'center' },
});

export default CrossBodySwipeGame;
