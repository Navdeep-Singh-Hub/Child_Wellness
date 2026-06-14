/**
 * Tempo Town — OT Level 3 Session 3 shared speed/movement engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { TrafficSignal } from '@/components/game/occupational/level3/session3/components/TrafficSignal';
import {
  SESSION3_PACING,
  difficultyTier,
  musicTempoForRound,
  paceForRound,
  randomTrafficLight,
  type MusicTempo,
  type PaceLevel,
  type TrafficLight,
} from '@/components/game/occupational/level3/session3/session3Pacing';
import {
  dragPaceMatches,
  musicTempoLabel,
  paceDuration,
  paceLabel,
  swipeMatchesMusic,
  swipeMatchesTraffic,
  useTraceSound,
} from '@/components/game/occupational/level3/session3/tempoUtils';
import { useTempoAnalytics } from '@/components/game/occupational/level3/session3/useTempoAnalytics';
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

const P = SESSION3_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Excellent Timing!', 'Perfect Beat!', 'Amazing Control!', 'Fantastic Work!'];

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
  ttsStop?: string;
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
  ttsStop = 'Stop! Do not move!',
  ttsTooFast = 'Too fast — slow down!',
  ttsTooSlow = 'Too slow — try again!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const {
    reset: resetAnalytics,
    startRound: startAnalyticsRound,
    recordSpeedMatch,
    recordImpulse,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useTempoAnalytics();

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
  const [coins, setCoins] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    correct: number;
    total: number;
    xp: number;
    analytics: ReturnType<typeof analyticsSnapshot>;
  } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [showCue, setShowCue] = useState(false);
  const [matchPct, setMatchPct] = useState(0);
  const [timerPct, setTimerPct] = useState(100);
  const [stumbleFlash, setStumbleFlash] = useState(false);

  const [paceLevel, setPaceLevel] = useState<PaceLevel>('medium');
  const [trafficLight, setTrafficLight] = useState<TrafficLight>('green');
  const [musicTempo, setMusicTempo] = useState<MusicTempo>('medium');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const paceLevelRef = useRef<PaceLevel>('medium');
  const trafficRef = useRef<TrafficLight>('green');
  const musicTempoRef = useRef<MusicTempo>('medium');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRoundPlayRef = useRef<() => void>(() => {});
  const trackW = useRef(300);
  const panStartTime = useRef(0);
  const lastMoveTime = useRef(0);
  const swipeStartTime = useRef(0);
  const swipeDist = useRef(0);
  const targetDurationRef = useRef(P.paceDurations.medium);
  const dragStartOffset = useRef(0);
  const currentDragX = useRef(0);
  const hasSwipedRef = useRef(false);
  const checkpointRef = useRef(0);

  const dragX = useSharedValue(0);
  const upperX = useSharedValue(0);
  const shakeX = useSharedValue(0);

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
    paceLevelRef.current = paceLevel;
  }, [paceLevel]);
  useEffect(() => {
    trafficRef.current = trafficLight;
  }, [trafficLight]);
  useEffect(() => {
    musicTempoRef.current = musicTempo;
  }, [musicTempo]);

  const maxDrag = () => Math.max(80, trackW.current - 88);
  const finishDrag = () => maxDrag() * 0.88;
  const checkpointX = (idx: number) => (maxDrag() / (P.checkpointCount + 1)) * (idx + 1);

  const charStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));
  const upperStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: upperX.value }, { scaleY: -1 }],
  }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 18 + snap.motorRegulationScore * 0.2);
      setFinalStats({ correct: finalScore, total, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      clearRoundTimer();
      cancelAnimation(upperX);
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total,
            accuracy: snap.tempoAccuracy || snap.motorRegulationScore,
            xpAwarded: xp,
            durationMs: snap.durationMs,
            responseTimeMs: snap.avgReactionMs,
            skillTags,
            meta: analyticsMeta(),
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [analyticsMeta, analyticsSnapshot, clearRoundTimer, logType, router, skillTags, totalRounds, ttsComplete, upperX],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    setCoins((c) => c + 5);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    praiseVoice();
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, praiseVoice]);

  const failAttempt = useCallback(
    (msg?: string) => {
      playWarn();
      shakeX.value = withSequence(withSpring(10), withSpring(-10), withSpring(0));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      if (msg) speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn, shakeX],
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
    checkpointRef.current = 0;
    setMatchPct(0);
    setTimerPct(100);

    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearRoundTimer, dragX, endGame, totalRounds, upperX]);

  const completeRound = useCallback(
    (matchAccuracy = 100) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      recordSpeedMatch(matchAccuracy);
      bumpScore();
      dragX.value = withTiming(maxDrag(), { duration: mode === 'dragFast' ? 220 : 380 });
      roundTimerRef.current = setTimeout(() => advanceRound(), 700);
    },
    [advanceRound, bumpScore, dragX, mode, recordSpeedMatch],
  );

  const stumble = useCallback(() => {
    setStumbleFlash(true);
    failAttempt(ttsTooFast);
    dragX.value = withSpring(Math.max(0, currentDragX.current - 40));
    currentDragX.current = Math.max(0, currentDragX.current - 40);
    setTimeout(() => setStumbleFlash(false), 500);
  }, [dragX, failAttempt, ttsTooFast]);

  const retryCurrentRound = useCallback(() => {
    roundCompleteRef.current = false;
    hasSwipedRef.current = false;
    checkpointRef.current = 0;
    setMatchPct(0);
    setTimerPct(100);
    roundTimerRef.current = setTimeout(() => startRoundPlayRef.current(), 700);
  }, []);

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
        const acc = Math.max(0, 100 - Math.round((diff / targetDurationRef.current) * 100));
        setMatchPct(acc);
        if (dragPaceMatches(elapsed, targetDurationRef.current, P.paceToleranceMs)) {
          completeRound(acc);
        }
      }
    },
    [completeRound, mode],
  );

  const runUpperReference = useCallback(
    (pace: PaceLevel) => {
      const duration = paceDuration(pace);
      targetDurationRef.current = duration;
      upperX.value = 0;
      cancelAnimation(upperX);
      upperX.value = withTiming(maxDrag(), { duration });
    },
    [upperX],
  );

  const startRabbitTimer = useCallback(() => {
    const limit = P.rabbitTimeLimitMs - difficultyTier(roundRef.current, totalRounds) * 400;
    const start = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / limit) * 100);
      setTimerPct(pct);
      if (elapsed >= limit && !roundCompleteRef.current) {
        clearRoundTimer();
        failAttempt(ttsTooSlow);
        retryCurrentRound();
      }
    }, 80);
  }, [clearRoundTimer, failAttempt, retryCurrentRound, totalRounds, ttsTooSlow]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    dragX.value = 0;
    upperX.value = 0;
    currentDragX.current = 0;
    setRoundActive(true);

    if (mode === 'trafficLight') {
      const light = randomTrafficLight(roundRef.current);
      setTrafficLight(light);
      trafficRef.current = light;
      setShowCue(true);
      speakTTS(light === 'green' ? ttsFast : light === 'yellow' ? ttsSlow : ttsStop, 0.78).catch(() => {});
      return;
    }

    if (mode === 'musicSpeed') {
      const tempo = musicTempoForRound(roundRef.current);
      setMusicTempo(tempo);
      musicTempoRef.current = tempo;
      setShowCue(true);
      speakTTS(musicTempoLabel(tempo), 0.78).catch(() => {});
      return;
    }

    if (mode === 'speedMatch') {
      const pace = paceForRound(roundRef.current);
      setPaceLevel(pace);
      paceLevelRef.current = pace;
      runUpperReference(pace);
      speakTTS(`Match ${paceLabel(pace)} pace!`, 0.78).catch(() => {});
      return;
    }

    if (mode === 'dragFast') {
      startRabbitTimer();
      speakTTS(ttsFast, 0.78).catch(() => {});
      return;
    }

    speakTTS(ttsSlow, 0.78).catch(() => {});
  }, [dragX, mode, runUpperReference, startAnalyticsRound, startRabbitTimer, ttsFast, ttsSlow, ttsStop, upperX]);

  startRoundPlayRef.current = startRoundPlay;

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

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
    .minDistance(8)
    .onStart(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      panStartTime.current = Date.now();
      lastMoveTime.current = Date.now();
      dragStartOffset.current = currentDragX.current;
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const now = Date.now();
      const next = Math.max(0, Math.min(maxDrag(), dragStartOffset.current + e.translationX));
      if (mode === 'dragSlow') {
        const dt = now - lastMoveTime.current;
        const dx = Math.abs(next - currentDragX.current);
        if (dt > 0 && dx / dt > 0.55 && dx > 8) {
          lastMoveTime.current = now;
          stumble();
          return;
        }
      }
      if (mode === 'dragFast') {
        const cp = checkpointRef.current;
        if (cp < P.checkpointCount && next >= checkpointX(cp)) {
          checkpointRef.current = cp + 1;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
      lastMoveTime.current = now;
      currentDragX.current = next;
      dragX.value = next;
      tryFinishDrag(next);
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const next = Math.max(0, Math.min(maxDrag(), dragStartOffset.current + e.translationX));
      const elapsed = Date.now() - panStartTime.current;
      if (next >= finishDrag()) {
        if (mode === 'dragSlow' && elapsed < P.slowMinDragMs) {
          failAttempt(ttsTooFast);
          retryCurrentRound();
        } else if (mode === 'dragFast' && elapsed > P.fastMaxDragMs) {
          failAttempt(ttsTooSlow);
          retryCurrentRound();
        } else if (mode === 'speedMatch') {
          const diff = Math.abs(elapsed - targetDurationRef.current);
          if (!dragPaceMatches(elapsed, targetDurationRef.current, P.paceToleranceMs)) {
            failAttempt(diff > 0 ? ttsTooSlow : ttsTooFast);
            retryCurrentRound();
          }
        }
      } else if (mode === 'dragFast' && checkpointRef.current < P.checkpointCount) {
        failAttempt(ttsTooSlow);
        retryCurrentRound();
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
      let ok = false;
      if (mode === 'trafficLight') {
        ok = swipeMatchesTraffic(ms, swipeDist.current, trafficRef.current);
        if (trafficRef.current === 'red' && swipeDist.current >= P.minSwipeDistance) {
          recordImpulse();
        }
      } else {
        ok = swipeMatchesMusic(ms, swipeDist.current, musicTempoRef.current);
      }
      if (ok) {
        hasSwipedRef.current = true;
        recordSpeedMatch(100);
        bumpScore();
        roundTimerRef.current = setTimeout(() => advanceRound(), 450);
      } else {
        failAttempt(
          mode === 'trafficLight' && trafficRef.current === 'red'
            ? ttsStop
            : trafficRef.current === 'green' || musicTempoRef.current === 'fast'
              ? ttsTooSlow
              : ttsTooFast,
        );
        retryCurrentRound();
      }
    });

  const gesture = mode === 'trafficLight' || mode === 'musicSpeed' ? panSwipe : panDrag;

  const renderDragTrack = (label: string, style: object, flipped?: boolean) => (
    <View style={styles.lane}>
      <Text style={[styles.laneLabel, { color: T.titleColor }]}>{label}</Text>
      <View
        style={[styles.track, { borderColor: T.accent }, stumbleFlash && styles.stumbleTrack]}
        onLayout={(e) => {
          trackW.current = e.nativeEvent.layout.width;
        }}
      >
        <Text style={styles.finishFlag}>🏁</Text>
        {mode === 'dragFast' &&
          Array.from({ length: P.checkpointCount }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.checkpoint,
                { left: checkpointX(i) + 8, opacity: checkpointRef.current > i ? 0.35 : 1 },
              ]}
            >
              <Text style={styles.cpEmoji}>🥕</Text>
            </View>
          ))}
        <Animated.View style={[styles.character, style, flipped && styles.upperChar]}>
          <Text style={styles.charEmoji}>{T.characterEmoji}</Text>
        </Animated.View>
      </View>
    </View>
  );

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🏁 Tempo Town Festival!\n⚡ Regulation ${a.motorRegulationScore}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.motorRegulationScore}
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
          <View style={[styles.statPill, styles.coinPill, { borderColor: T.statBorder }]}>
            <Text>🪙</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{coins}</Text>
          </View>
        </View>
        {mode === 'speedMatch' && roundActive && (
          <View style={styles.matchMeter}>
            <Text style={[styles.matchLabel, { color: T.accentDark }]}>{paceLabel(paceLevel)} pace</Text>
            <View style={styles.matchBg}>
              <View style={[styles.matchFill, { width: `${matchPct}%`, backgroundColor: T.accent }]} />
            </View>
          </View>
        )}
        {mode === 'dragFast' && roundActive && (
          <View style={styles.matchMeter}>
            <Text style={[styles.matchLabel, { color: T.accentDark }]}>Time left</Text>
            <View style={styles.matchBg}>
              <View style={[styles.matchFill, { width: `${timerPct}%`, backgroundColor: T.fastColor }]} />
            </View>
          </View>
        )}
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.playArea, shakeStyle, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'speedMatch' && (
            <>
              {renderDragTrack('Guide ↑', upperStyle, true)}
              <View style={[styles.divider, { backgroundColor: T.accent }]} />
              {renderDragTrack('You ↓', charStyle)}
            </>
          )}

          {roundActive && (mode === 'dragSlow' || mode === 'dragFast') && (
            <>
              <Text style={[styles.hint, { color: T.accentDark }]}>{T.hintText}</Text>
              {renderDragTrack(mode === 'dragSlow' ? 'Slow drag →' : 'Quick hop →', charStyle)}
            </>
          )}

          {roundActive && mode === 'trafficLight' && (
            <TrafficSignal light={trafficLight} visible={showCue} />
          )}

          {roundActive && mode === 'musicSpeed' && showCue && (
            <View style={styles.musicCue}>
              <Text style={styles.musicEmoji}>🎵</Text>
              <Text style={[styles.musicLabel, { color: T.titleColor }]}>{musicTempoLabel(musicTempo)}</Text>
              <Text style={[styles.swipeHint, { color: T.subtitleColor }]}>Swipe to match the tempo!</Text>
            </View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again — control your speed!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.22)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.18)' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  matchMeter: { width: '88%', marginBottom: 8 },
  matchLabel: { fontSize: 12, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  matchBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 5, overflow: 'hidden' },
  matchFill: { height: '100%', borderRadius: 5 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, padding: 16, justifyContent: 'center' },
  waitText: { textAlign: 'center', fontSize: 20, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 16, fontWeight: '800', marginBottom: 16 },
  lane: { marginVertical: 6 },
  laneLabel: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  track: { height: 88, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 16, borderWidth: 2, justifyContent: 'center', overflow: 'hidden' },
  stumbleTrack: { borderColor: '#EF4444' },
  finishFlag: { position: 'absolute', right: 8, fontSize: 24, zIndex: 1 },
  checkpoint: { position: 'absolute', top: 20, zIndex: 2 },
  cpEmoji: { fontSize: 22 },
  character: { position: 'absolute', left: 8, width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  upperChar: { transform: [{ scaleY: -1 }] },
  charEmoji: { fontSize: 52 },
  divider: { height: 2, marginVertical: 10, borderRadius: 1, opacity: 0.5 },
  musicCue: { alignItems: 'center', padding: 20 },
  musicEmoji: { fontSize: 56, marginBottom: 10 },
  musicLabel: { fontSize: 26, fontWeight: '900', marginBottom: 8 },
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
