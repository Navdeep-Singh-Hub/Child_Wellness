/**
 * Zen Animal Academy — OT Level 3 Session 10 posture & hold engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { BreathingBubble } from '@/components/game/occupational/level3/session10/components/BreathingBubble';
import { HoldCrystalRing } from '@/components/game/occupational/level3/session10/components/HoldCrystalRing';
import { ZenBadge } from '@/components/game/occupational/level3/session10/components/ZenBadge';
import {
  ANIMAL_POSES,
  HOLD_POSES,
  PostureCue,
  SHAPE_POSES,
  YOGA_POSES,
  holdQualityScore,
  randomAnimalPose,
  randomHoldPose,
  randomShapePose,
  randomYogaPose,
  useTraceSound,
} from '@/components/game/occupational/level3/session10/postureUtils';
import {
  SESSION10_PACING,
  confirmWindowMs,
  countIntervalMs,
  countStart,
  difficultyTier,
  holdDurationMs,
  holdPoseShowMs,
  poseShowMs,
} from '@/components/game/occupational/level3/session10/session10Pacing';
import { usePostureAnalytics } from '@/components/game/occupational/level3/session10/usePostureAnalytics';
import { LEVEL3_GRADUATION } from '@/components/game/occupational/level3/session10/zenAcademyTheme';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION10_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = [
  'Wonderful Focus!',
  'Excellent Balance!',
  'Amazing Control!',
  'Great Posture!',
  'You Are a Zen Master!',
];

export type PostureMode = 'poseMatch' | 'animalPose' | 'shapePose' | 'freezePose' | 'countHold';

export type PostureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  confirmBg: string;
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
  hintText?: string;
};

export type PostureGameConfig = {
  theme: PostureTheme;
  mode: PostureMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsWatch?: string;
  ttsConfirm?: string;
  ttsMiss?: string;
  ttsHold?: string;
  ttsHoldDone?: string;
  confirmLabel?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
  showLevel3Graduation?: boolean;
};

const isHoldMode = (mode: PostureMode) => mode === 'freezePose' || mode === 'countHold';

export const PostureGame: React.FC<PostureGameConfig & { onBack?: () => void; onComplete?: () => void }> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsWatch = 'Watch the pose…',
  ttsConfirm = 'Copy the pose, then tap done!',
  ttsMiss = 'Try to match the pose!',
  ttsHold = 'Hold the pose!',
  ttsHoldDone = 'Perfect hold!',
  confirmLabel = '✅ Done',
  congratsMessage,
  logType,
  skillTags,
  showLevel3Graduation = false,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const {
    reset: resetAnalytics,
    startRound: startAnalyticsRound,
    recordSuccess,
    recordError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const totalRounds = isHoldMode(mode) ? P.holdRounds : P.confirmRounds;

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
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [canConfirm, setCanConfirm] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [cue, setCue] = useState<PostureCue>({ emoji: '🙆', label: 'Arms Up' });
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [breathing, setBreathing] = useState(false);
  const [holdTargetMs, setHoldTargetMs] = useState(P.holdDurationBaseMs);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const canConfirmRef = useRef(false);
  const holdTargetRef = useRef(P.holdDurationBaseMs);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRoundPlayRef = useRef<() => void>(() => {});
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const introPlayedRef = useRef(false);

  const cueScale = useSharedValue(0.75);
  const cueOpacity = useSharedValue(0);
  const bubbleScale = useSharedValue(0.85);

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
    canConfirmRef.current = canConfirm;
  }, [canConfirm]);

  const cueStyle = useAnimatedStyle(() => ({
    opacity: cueOpacity.value,
    transform: [{ scale: cueScale.value }],
  }));

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    cancelAnimation(cueScale);
    cancelAnimation(bubbleScale);
  }, [bubbleScale, cueScale]);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 16 + snap.posturalControlRating * 0.2);
      setFinalStats({ correct: finalScore, total: totalRounds, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total: totalRounds,
            accuracy: snap.posturalControlRating,
            xpAwarded: xp,
            durationMs: snap.durationMs,
            skillTags,
            meta: analyticsMeta(),
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [analyticsMeta, analyticsSnapshot, clearTimers, logType, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(
    (opts?: Parameters<typeof recordSuccess>[0]) => {
      setSparkleKey(Date.now());
      setCoins((c) => c + 5);
      setCueSuccess(true);
      recordSuccess(opts);
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      praiseVoice();
      setScore((s) => {
        scoreRef.current = s + 1;
        return s + 1;
      });
      setTimeout(() => setCueSuccess(undefined), 650);
    },
    [playSuccess, praiseVoice, recordSuccess],
  );

  const showWarn = useCallback(
    (msg: string) => {
      setCueSuccess(false);
      recordError();
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
      setTimeout(() => setCueSuccess(undefined), 650);
    },
    [playWarn, recordError],
  );

  const showCueCard = useCallback(
    (next: PostureCue) => {
      setCue(next);
      cueOpacity.value = 0;
      cueScale.value = 0.75;
      cueOpacity.value = withTiming(1, { duration: 240 });
      cueScale.value = withSpring(1, { damping: 12, stiffness: 140 });
    },
    [cueOpacity, cueScale],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setCanConfirm(false);
    canConfirmRef.current = false;
    setIsHolding(false);
    setHoldProgress(0);
    setCountdown(countStart(1));
    cueOpacity.value = 0;
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, cueOpacity, endGame, totalRounds]);

  const completeRound = useCallback(
    (opts?: Parameters<typeof recordSuccess>[0]) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore(opts);
      cueScale.value = withSequence(withTiming(1.18, { duration: 160 }), withTiming(1, { duration: 160 }));
      speakTTS(ttsHoldDone, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => advanceRound(), 650);
    },
    [advanceRound, bumpScore, cueScale, ttsHoldDone],
  );

  const failRound = useCallback(() => {
    if (doneRef.current) return;
    showWarn(ttsMiss);
    roundCompleteRef.current = false;
    roundTimerRef.current = setTimeout(() => startRoundPlayRef.current(), 700);
  }, [showWarn, ttsMiss]);

  const pickCue = useCallback((): PostureCue => {
    const t = difficultyTier(roundRef.current, totalRounds);
    if (mode === 'poseMatch') return YOGA_POSES[randomYogaPose(t)];
    if (mode === 'animalPose') return ANIMAL_POSES[randomAnimalPose(t)];
    if (mode === 'shapePose') return SHAPE_POSES[randomShapePose(t)];
    return HOLD_POSES[randomHoldPose(t)];
  }, [mode, totalRounds]);

  const startHoldTimer = useCallback(() => {
    const t = difficultyTier(roundRef.current, totalRounds);
    const targetMs = holdDurationMs(t);
    holdTargetRef.current = targetMs;
    setHoldTargetMs(targetMs);
    setIsHolding(true);
    setStatusHint('Hold steady…');
    speakTTS(ttsHold, 0.78).catch(() => {});

    if (mode === 'freezePose') {
      let elapsed = 0;
      holdTimerRef.current = setInterval(() => {
        elapsed += P.holdTickMs;
        const prog = Math.min(1, elapsed / targetMs);
        setHoldProgress(prog);
        if (elapsed >= targetMs) {
          clearInterval(holdTimerRef.current!);
          holdTimerRef.current = null;
          const hq = holdQualityScore(elapsed, targetMs);
          completeRound({
            hold: hq,
            stability: hq,
            balance: Math.min(100, hq + 6),
            regulation: hq,
            core: hq,
            posture: hq,
            holdMs: elapsed,
          });
        }
      }, P.holdTickMs);
      return;
    }

    const start = countStart(t);
    let count = start;
    setCountdown(count);
    speakTTS(String(count), 0.78).catch(() => {});
    const interval = countIntervalMs(t);
    holdTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count > 0) {
        speakTTS(String(count), 0.78).catch(() => {});
      } else {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        const heldMs = start * interval;
        const hq = holdQualityScore(heldMs, start * interval);
        completeRound({
          hold: hq,
          stability: hq,
          balance: Math.min(100, hq + 4),
          regulation: hq,
          core: hq,
          posture: hq,
          holdMs: heldMs,
        });
      }
    }, interval);
  }, [completeRound, mode, totalRounds, ttsHold]);

  const startConfirmRound = useCallback(
    (next: PostureCue) => {
      const t = difficultyTier(roundRef.current, totalRounds);
      showCueCard(next);
      setStatusHint('Watch the pose…');
      const breath = next.breath ? ` ${next.breath}.` : '';
      speakTTS(`${next.label}.${breath} ${ttsWatch}`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        setCanConfirm(true);
        canConfirmRef.current = true;
        setStatusHint('Copy it calmly, then tap Done!');
        speakTTS(ttsConfirm, 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => {
          if (!roundCompleteRef.current && canConfirmRef.current) {
            failRound();
          }
        }, confirmWindowMs(t));
      }, poseShowMs(t));
    },
    [failRound, showCueCard, totalRounds, ttsConfirm, ttsWatch],
  );

  const startHoldRound = useCallback(
    (next: PostureCue) => {
      const t = difficultyTier(roundRef.current, totalRounds);
      showCueCard(next);
      setStatusHint('Get ready…');
      speakTTS(`Get ready! ${next.label}! Stay calm and steady.`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => startHoldTimer(), holdPoseShowMs(t));
    },
    [showCueCard, startHoldTimer],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    setRoundActive(true);
    setCanConfirm(false);
    canConfirmRef.current = false;
    setIsHolding(false);
    const next = pickCue();
    if (isHoldMode(mode)) startHoldRound(next);
    else startConfirmRound(next);
  }, [mode, pickCue, startAnalyticsRound, startConfirmRound, startHoldRound]);

  startRoundPlayRef.current = startRoundPlay;

  const runBreathingIntro = useCallback(
    (then: () => void) => {
      setBreathing(true);
      bubbleScale.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 900 }), withTiming(0.85, { duration: 900 })),
        2,
        false,
      );
      speakTTS('Take a slow breath. Stay calm and steady.', 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        setBreathing(false);
        then();
      }, P.breathingIntroMs);
    },
    [bubbleScale],
  );

  useEffect(() => {
    resetAnalytics();
    introPlayedRef.current = false;
  }, [resetAnalytics]);

  useEffect(() => {
    clearTimers();
    setRoundActive(false);

    const begin = () => {
      if (round === 1 && !introPlayedRef.current) {
        introPlayedRef.current = true;
        speakTTS(ttsIntro, 0.78);
        runBreathingIntro(() => {
          roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
        });
      } else {
        roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
      }
    };

    begin();
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers, runBreathingIntro]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const handleConfirm = useCallback(() => {
    if (!canConfirmRef.current || roundCompleteRef.current || doneRef.current) return;
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    setCanConfirm(false);
    canConfirmRef.current = false;
    const base = 82 + Math.floor(Math.random() * 14);
    completeRound({
      posture: base,
      awareness: base + 2,
      balance: base - 4,
      stability: base,
      regulation: base + 3,
      core: base - 2,
    });
  }, [completeRound]);

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    const grad = showLevel3Graduation ? LEVEL3_GRADUATION : '';
    return (
      <CongratulationsScreen
        message={`${congratsMessage}${grad}\n🧘 ${a.posturalControlRating}% · 🌳 ${a.balanceScore}% · ⚡ ${a.stabilityScore}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.posturalControlRating}
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
  if (done) return null;

  const holdSecondsLeft = Math.max(0, ((1 - holdProgress) * holdTargetMs) / 1000).toFixed(1);
  const hintLabel = T.hintText ?? (isHoldMode(mode) ? '🧘 Hold steady!' : '🎯 Match the pose!');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <BreathingBubble visible={breathing} bubbleScale={bubbleScale} />

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
        {roundActive && <ZenBadge visible label={hintLabel} success={cueSuccess} />}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && !breathing && (
          <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>
        )}

        {roundActive && (
          <Animated.View style={[styles.cueCard, { borderColor: T.accent }, cueStyle]}>
            <Text style={styles.cueEmoji}>{cue.emoji}</Text>
            <Text style={[styles.cueLabel, { color: T.accentDark }]}>{cue.label}</Text>
            {cue.breath ? (
              <Text style={[styles.breathHint, { color: T.subtitleColor }]}>🌬️ {cue.breath}</Text>
            ) : null}
          </Animated.View>
        )}

        {roundActive && isHolding && mode === 'freezePose' && (
          <HoldCrystalRing
            visible
            progress={holdProgress}
            secondsLeft={holdSecondsLeft}
            accent={T.accent}
          />
        )}

        {roundActive && isHolding && mode === 'countHold' && (
          <View style={styles.countBlock}>
            <Text style={[styles.countNum, { color: T.accentDark }]}>{countdown}</Text>
            <Text style={[styles.holdLabel, { color: T.accentDark }]}>Keep holding!</Text>
          </View>
        )}

        {canConfirm && (
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: T.confirmBg }]}
            onPress={handleConfirm}
            activeOpacity={0.88}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
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
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  waitText: { fontSize: 18, fontWeight: '700' },
  cueCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.88)',
    marginBottom: 20,
  },
  cueEmoji: { fontSize: 88 },
  cueLabel: { fontSize: 18, fontWeight: '800', marginTop: 8, textTransform: 'capitalize' },
  breathHint: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  holdLabel: { fontSize: 16, fontWeight: '800', marginTop: 8 },
  countBlock: { alignItems: 'center', marginBottom: 16 },
  countNum: { fontSize: 64, fontWeight: '900' },
  confirmBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 260,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confirmText: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
});

export default PostureGame;
