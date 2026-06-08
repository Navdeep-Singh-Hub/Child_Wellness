/**
 * Shared fast vs slow movement game core for OT Level 3 Session 3.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION3_PACING } from '@/components/game/occupational/level3/session3/session3Pacing';
import {
  SpeedKind,
  randomSpeed,
  swipeSpeedOk,
  useTraceSound,
} from '@/components/game/occupational/level3/session3/speedUtils';
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
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION3_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type SpeedGameMode = 'dragSlow' | 'dragFast' | 'speedMatch' | 'trafficLight' | 'musicSpeed';

export type SpeedGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  characterEmoji: string;
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
  fastColor: string;
  slowColor: string;
};

export type SpeedGameConfig = {
  theme: SpeedGameTheme;
  mode: SpeedGameMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsFast: string;
  ttsSlow: string;
  ttsTooFast?: string;
  ttsTooSlow?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const SpeedGame: React.FC<
  SpeedGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsFast,
  ttsSlow,
  ttsTooFast = 'Try again — slower!',
  ttsTooSlow = 'Try again — faster!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const totalRounds =
    mode === 'speedMatch'
      ? P.speedMatchRounds
      : mode === 'trafficLight'
        ? P.trafficRounds
        : mode === 'musicSpeed'
          ? P.musicRounds
          : P.dragRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [cueSpeed, setCueSpeed] = useState<SpeedKind>('fast');
  const [showCue, setShowCue] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const cueSpeedRef = useRef<SpeedKind>('fast');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackW = useRef(300);
  const panStartTime = useRef(0);
  const swipeStartTime = useRef(0);
  const swipeDist = useRef(0);
  const targetDurationRef = useRef(P.fastMatchMs);
  const dragStartOffset = useRef(0);
  const currentDragX = useRef(0);
  const hasSwipedRef = useRef(false);

  const dragX = useSharedValue(0);
  const upperX = useSharedValue(0);
  const cueScale = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);
  useEffect(() => {
    cueSpeedRef.current = cueSpeed;
  }, [cueSpeed]);

  const maxDrag = () => Math.max(80, trackW.current - 88);
  const finishDrag = () => maxDrag() * 0.88;

  const charStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));
  const upperStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: upperX.value }, { scaleY: mode === 'speedMatch' ? -1 : 1 }],
  }));
  const cueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cueScale.value }],
    opacity: cueScale.value,
  }));

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const xp = Math.round(finalScore * 12);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearRoundTimer();
      cancelAnimation(upperX);
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
    [clearRoundTimer, logType, router, skillTags, totalRounds, ttsComplete, upperX],
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

  const failAttempt = useCallback(
    (msg?: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      if (msg) speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const advanceRound = useCallback(() => {
    clearRoundTimer();
    cancelAnimation(upperX);
    setRoundActive(false);
    setShowCue(false);
    roundCompleteRef.current = false;
    dragX.value = 0;
    upperX.value = 0;
    currentDragX.current = 0;
    hasSwipedRef.current = false;
    cueScale.value = 0;

    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearRoundTimer, cueScale, dragX, endGame, totalRounds, upperX]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    bumpScore();
    dragX.value = withTiming(maxDrag(), { duration: mode === 'dragFast' ? 250 : 400 });
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, bumpScore, dragX, mode]);

  const tryFinishDrag = useCallback(
    (x: number) => {
      if (roundCompleteRef.current || !roundActiveRef.current) return;
      if (x < finishDrag()) return;
      const elapsed = Date.now() - panStartTime.current;
      if (mode === 'dragSlow') {
        if (elapsed >= P.slowMinDragMs) completeRound();
      } else if (mode === 'dragFast') {
        if (elapsed <= P.fastMaxDragMs) completeRound();
      } else if (mode === 'speedMatch') {
        const diff = Math.abs(elapsed - targetDurationRef.current);
        if (diff <= P.speedToleranceMs) completeRound();
      }
    },
    [completeRound, mode],
  );

  const runUpperReference = useCallback(
    (speed: SpeedKind) => {
      const duration = speed === 'fast' ? P.fastMatchMs : P.slowMatchMs;
      targetDurationRef.current = duration;
      upperX.value = 0;
      cancelAnimation(upperX);
      upperX.value = withTiming(maxDrag(), { duration });
    },
    [upperX],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    dragX.value = 0;
    upperX.value = 0;
    currentDragX.current = 0;
    setRoundActive(true);

    if (mode === 'trafficLight' || mode === 'musicSpeed') {
      const speed = randomSpeed();
      setCueSpeed(speed);
      cueSpeedRef.current = speed;
      setShowCue(true);
      cueScale.value = withTiming(1, { duration: 280 });
      speakTTS(speed === 'fast' ? ttsFast : ttsSlow, 0.78).catch(() => {});
      return;
    }

    if (mode === 'speedMatch') {
      const speed = randomSpeed();
      setCueSpeed(speed);
      cueSpeedRef.current = speed;
      runUpperReference(speed);
      speakTTS(speed === 'fast' ? ttsFast : ttsSlow, 0.78).catch(() => {});
      return;
    }

    speakTTS(mode === 'dragSlow' ? ttsSlow : ttsFast, 0.78).catch(() => {});
  }, [cueScale, dragX, mode, runUpperReference, ttsFast, ttsSlow, upperX]);

  useEffect(() => {
    if (round === 1 && !doneRef.current) speakTTS(ttsIntro, 0.78);
    clearRoundTimer();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearRoundTimer;
  }, [round, startRoundPlay, ttsIntro, clearRoundTimer]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearRoundTimer();
      cancelAnimation(upperX);
    },
    [clearRoundTimer, upperX],
  );

  const panDrag = Gesture.Pan()
    .runOnJS(true)
    .minDistance(10)
    .onStart(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      panStartTime.current = Date.now();
      dragStartOffset.current = currentDragX.current;
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(maxDrag(), dragStartOffset.current + e.translationX));
      currentDragX.current = next;
      dragX.value = next;
      tryFinishDrag(next);
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(maxDrag(), dragStartOffset.current + e.translationX));
      if (next >= finishDrag()) {
        const elapsed = Date.now() - panStartTime.current;
        if (mode === 'dragSlow' && elapsed < P.slowMinDragMs) {
          failAttempt(ttsTooFast);
          dragX.value = 0;
          currentDragX.current = 0;
        } else if (mode === 'dragFast' && elapsed > P.fastMaxDragMs) {
          failAttempt(ttsTooSlow);
          dragX.value = 0;
          currentDragX.current = 0;
        } else if (mode === 'speedMatch') {
          const diff = Math.abs(elapsed - targetDurationRef.current);
          if (diff > P.speedToleranceMs) {
            failAttempt(cueSpeedRef.current === 'fast' ? ttsTooSlow : ttsTooFast);
          }
          dragX.value = 0;
          currentDragX.current = 0;
        }
      } else {
        dragX.value = 0;
        currentDragX.current = 0;
      }
    });

  const panSwipe = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || hasSwipedRef.current || doneRef.current) return;
      swipeStartTime.current = Date.now();
      swipeDist.current = 0;
    })
    .onUpdate((e) => {
      swipeDist.current = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
    })
    .onEnd(() => {
      if (!roundActiveRef.current || hasSwipedRef.current || !showCue || doneRef.current) return;
      const ms = Date.now() - swipeStartTime.current;
      const ok = swipeSpeedOk(
        ms,
        swipeDist.current,
        cueSpeedRef.current,
        P.fastSwipeMaxMs,
        P.slowSwipeMinMs,
        P.minSwipeDistance,
      );
      if (ok) {
        hasSwipedRef.current = true;
        bumpScore();
        cueScale.value = withTiming(0, { duration: 200 });
        roundTimerRef.current = setTimeout(() => advanceRound(), 400);
      } else {
        failAttempt(cueSpeedRef.current === 'fast' ? ttsTooSlow : ttsTooFast);
      }
    });

  const gesture =
    mode === 'trafficLight' || mode === 'musicSpeed' ? panSwipe : panDrag;

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

  const renderDragTrack = (label: string, style: object, flipped?: boolean) => (
    <View style={styles.lane}>
      <Text style={[styles.laneLabel, { color: T.titleColor }]}>{label}</Text>
      <View
        style={[styles.track, { borderColor: T.accent }]}
        onLayout={(e) => {
          trackW.current = e.nativeEvent.layout.width;
        }}
      >
        <Text style={styles.finishFlag}>🏁</Text>
        <Animated.View style={[styles.character, style, flipped && styles.upperChar]}>
          <Text style={styles.charEmoji}>{T.characterEmoji}</Text>
        </Animated.View>
      </View>
    </View>
  );

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
      </View>

      <GestureDetector gesture={gesture}>
        <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
          {!roundActive && (
            <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>
          )}

          {roundActive && mode === 'speedMatch' && (
            <>
              {renderDragTrack('Watch ↑', upperStyle, true)}
              <View style={[styles.divider, { backgroundColor: T.accent }]} />
              {renderDragTrack('You drag ↓', charStyle)}
            </>
          )}

          {roundActive && (mode === 'dragSlow' || mode === 'dragFast') && (
            <>
              <Text style={[styles.hint, { color: T.accentDark }]}>{T.hintText}</Text>
              {renderDragTrack('Drag →', charStyle)}
            </>
          )}

          {roundActive && mode === 'trafficLight' && showCue && (
            <Animated.View style={[styles.cueBox, cueStyle]}>
              <View
                style={[
                  styles.light,
                  { backgroundColor: cueSpeed === 'fast' ? T.fastColor : T.slowColor },
                ]}
              />
              <Text style={[styles.cueLabel, { color: T.titleColor }]}>
                {cueSpeed === 'fast' ? 'GO FAST!' : 'GO SLOW!'}
              </Text>
              <Text style={[styles.swipeHint, { color: T.subtitleColor }]}>Swipe anywhere!</Text>
            </Animated.View>
          )}

          {roundActive && mode === 'musicSpeed' && showCue && (
            <Animated.View style={[styles.cueBox, cueStyle]}>
              <Text style={styles.musicEmoji}>{cueSpeed === 'fast' ? '🎵⚡' : '🎵🧘'}</Text>
              <Text style={[styles.cueLabel, { color: T.titleColor }]}>
                {cueSpeed === 'fast' ? 'Fast music!' : 'Slow music!'}
              </Text>
              <Text style={[styles.swipeHint, { color: T.subtitleColor }]}>Move your swipe speed!</Text>
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
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, padding: 16, justifyContent: 'center' },
  waitText: { textAlign: 'center', fontSize: 20, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 16, fontWeight: '800', marginBottom: 16 },
  lane: { marginVertical: 6 },
  laneLabel: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  track: { height: 88, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 16, borderWidth: 2, justifyContent: 'center', overflow: 'hidden' },
  finishFlag: { position: 'absolute', right: 8, fontSize: 24, zIndex: 1 },
  character: { position: 'absolute', left: 8, width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  upperChar: { transform: [{ scaleY: -1 }] },
  charEmoji: { fontSize: 52 },
  divider: { height: 2, marginVertical: 10, borderRadius: 1, opacity: 0.5 },
  cueBox: { alignItems: 'center', padding: 24 },
  light: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, borderWidth: 4, borderColor: '#fff' },
  musicEmoji: { fontSize: 56, marginBottom: 12 },
  cueLabel: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  swipeHint: { fontSize: 15, fontWeight: '600' },
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

export default SpeedGame;
