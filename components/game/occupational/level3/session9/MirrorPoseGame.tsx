/** Superhero Training Academy — OT Level 3 Session 9 pose imitation engine. */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { MirrorHandGuide } from './MirrorHandGuide';
import { SequenceStrip } from './SequenceStrip';
import { SuperheroBadge } from './SuperheroBadge';
import {
  CHAIN_EMOJIS,
  ChainMove,
  HAND_EMOJIS,
  HandSide,
  POSE_EMOJIS,
  PoseType,
  chainLabel,
  generateChainPattern,
  handDisplayLabel,
  imitationScore,
  mirrorHand,
  poseLabel,
  randomHand,
  randomPose,
  useTraceSound,
} from '@/components/game/occupational/level3/session9/mirrorUtils';
import {
  SESSION9_PACING,
  confirmTimeLimitMs,
  delayedShowMs,
  delayedWaitMs,
  difficultyTier,
  fastPoseMs,
  fastPosesPerRound,
  handShowMs,
  patternLength,
  patternStepMs,
  poseShowMs,
} from '@/components/game/occupational/level3/session9/session9Pacing';
import { usePoseAnalytics } from '@/components/game/occupational/level3/session9/usePoseAnalytics';
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION9_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Super Copy!', 'Hero Level Move!', 'Perfect Pose!', 'Amazing Memory!', "You're Becoming a Superhero!"];

export type MirrorPoseMode = 'copyPose' | 'handMirror' | 'delayedMirror' | 'fastCopy' | 'patternCopy';

export type MirrorPoseTheme = {
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
  hintText: string;
};

export type MirrorPoseGameConfig = {
  theme: MirrorPoseTheme;
  mode: MirrorPoseMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCopyPose?: string;
  ttsHandMirror?: string;
  ttsDelayedWatch?: string;
  ttsDelayedWait?: string;
  ttsDelayedCopy?: string;
  ttsFastPose?: string;
  ttsPatternCopy?: string;
  confirmLabel?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const MirrorPoseGame: React.FC<
  MirrorPoseGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCopyPose = 'Copy this pose!',
  ttsHandMirror = 'Raise your opposite hand!',
  ttsDelayedWatch = 'Watch this pose!',
  ttsDelayedWait = 'Wait, then copy from memory!',
  ttsDelayedCopy = 'Now copy the pose!',
  ttsFastPose = 'Copy fast!',
  ttsPatternCopy = 'Do the pattern, then tap done!',
  confirmLabel = '✓ I did it!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const {
    reset: resetAnalytics,
    startRound: startAnalyticsRound,
    recordSuccess,
    recordError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = usePoseAnalytics();

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
  const [phase, setPhase] = useState<'idle' | 'show' | 'wait' | 'copy' | 'demo'>('idle');
  const [currentPose, setCurrentPose] = useState<PoseType>('hands-up');
  const [screenHand, setScreenHand] = useState<HandSide>('left');
  const [pattern, setPattern] = useState<ChainMove[]>([]);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [patternStep, setPatternStep] = useState(0);
  const [fastPoseIndex, setFastPoseIndex] = useState(0);
  const [displayEmoji, setDisplayEmoji] = useState('🙌');
  const [displayLabel, setDisplayLabel] = useState('');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const canConfirmRef = useRef(false);
  const phaseRef = useRef(phase);
  const fastPoseIndexRef = useRef(0);
  const fastPosesNeededRef = useRef(3);
  const currentPoseRef = useRef<PoseType>('hands-up');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tier = difficultyTier(round, P.rounds);

  const cueScale = useSharedValue(0.7);
  const cueOpacity = useSharedValue(0);
  const waitPulse = useSharedValue(1);

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
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    canConfirmRef.current = canConfirm;
  }, [canConfirm]);
  useEffect(() => {
    fastPoseIndexRef.current = fastPoseIndex;
  }, [fastPoseIndex]);

  const cueStyle = useAnimatedStyle(() => ({
    opacity: cueOpacity.value,
    transform: [{ scale: cueScale.value }],
  }));
  const waitStyle = useAnimatedStyle(() => ({
    transform: [{ scale: waitPulse.value }],
  }));

  const gameTotal = mode === 'fastCopy' ? P.rounds * fastPosesPerRound(4) : P.rounds;

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(cueScale);
    cancelAnimation(waitPulse);
  }, [cueScale, waitPulse]);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 16 + snap.imitationScore * 0.18);
      setFinalStats({ correct: finalScore, total: gameTotal, xp, analytics: snap });
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
            total: gameTotal,
            accuracy: snap.imitationScore,
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
    [analyticsMeta, analyticsSnapshot, clearTimers, gameTotal, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(
    (opts?: {
      pose?: number;
      imitation?: number;
      lateral?: number;
      sequence?: number;
      memory?: number;
      delayed?: number;
      motor?: number;
    }) => {
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

  const showCue = useCallback(
    (emoji: string, label: string) => {
      setDisplayEmoji(emoji);
      setDisplayLabel(label);
      cueOpacity.value = 0;
      cueScale.value = 0.7;
      cueOpacity.value = withTiming(1, { duration: 220 });
      cueScale.value = withSpring(1, { damping: 12, stiffness: 140 });
    },
    [cueOpacity, cueScale],
  );

  const hideCue = useCallback(() => {
    cueOpacity.value = withTiming(0, { duration: 220 });
  }, [cueOpacity]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setCanConfirm(false);
    canConfirmRef.current = false;
    setPhase('idle');
    setPatternStep(0);
    fastPoseIndexRef.current = 0;
    setFastPoseIndex(0);
    cueOpacity.value = 0;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, cueOpacity, endGame]);

  const scheduleConfirmLimit = useCallback(() => {
    const limit = confirmTimeLimitMs(tier);
    if (limit <= 0) return;
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    roundTimerRef.current = setTimeout(() => {
      if (!roundCompleteRef.current && canConfirmRef.current) {
        recordError();
        setCanConfirm(false);
        canConfirmRef.current = false;
        speakTTS('Time is up! Watch again next round.', 0.78).catch(() => {});
        roundCompleteRef.current = true;
        roundTimerRef.current = setTimeout(() => advanceRound(), 600);
      }
    }, limit);
  }, [advanceRound, recordError, tier]);

  const enableConfirm = useCallback(() => {
    setCanConfirm(true);
    canConfirmRef.current = true;
    setStatusHint('Copy the pose, then tap Done!');
    scheduleConfirmLimit();
  }, [scheduleConfirmLimit]);

  const completeRound = useCallback(
    (opts?: {
      pose?: number;
      imitation?: number;
      lateral?: number;
      sequence?: number;
      memory?: number;
      delayed?: number;
      motor?: number;
    }) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      if (mode !== 'fastCopy') bumpScore(opts);
      cueScale.value = withSequence(withTiming(1.2, { duration: 160 }), withTiming(1, { duration: 160 }));
      roundTimerRef.current = setTimeout(() => advanceRound(), 650);
    },
    [advanceRound, bumpScore, cueScale, mode],
  );

  const runPatternDemo = useCallback(
    (steps: ChainMove[], index: number) => {
      if (index >= steps.length) {
        enableConfirm();
        speakTTS(ttsPatternCopy, 0.78).catch(() => {});
        setPhase('copy');
        phaseRef.current = 'copy';
        setStatusHint('Repeat the move chain!');
        return;
      }
      const move = steps[index]!;
      setPatternStep(index);
      showCue(CHAIN_EMOJIS[move], chainLabel(move));
      const stepMs = patternStepMs(tier);
      roundTimerRef.current = setTimeout(() => {
        hideCue();
        roundTimerRef.current = setTimeout(() => runPatternDemo(steps, index + 1), 180);
      }, stepMs);
    },
    [enableConfirm, hideCue, showCue, tier, ttsPatternCopy],
  );

  const startCopyPoseRound = useCallback(
    (pose: PoseType) => {
      setCurrentPose(pose);
      currentPoseRef.current = pose;
      setPhase('show');
      showCue(POSE_EMOJIS[pose], poseLabel(pose));
      setStatusHint('Watch Captain Motion…');
      speakTTS(`Watch carefully. ${poseLabel(pose)}!`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        enableConfirm();
        speakTTS(ttsCopyPose, 0.78).catch(() => {});
      }, poseShowMs(tier));
    },
    [enableConfirm, showCue, tier, ttsCopyPose],
  );

  const startHandMirrorRound = useCallback(
    (side: HandSide) => {
      setScreenHand(side);
      setPhase('show');
      const child = mirrorHand(side);
      showCue(HAND_EMOJIS[side], handDisplayLabel(side));
      setStatusHint(`You raise: ${child.toUpperCase()} hand`);
      speakTTS(`Trainer raises ${side} hand. You raise your ${child} hand!`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        enableConfirm();
        speakTTS(ttsHandMirror, 0.78).catch(() => {});
      }, handShowMs(tier));
    },
    [enableConfirm, showCue, tier, ttsHandMirror],
  );

  const startDelayedRound = useCallback(
    (pose: PoseType) => {
      setCurrentPose(pose);
      currentPoseRef.current = pose;
      setPhase('show');
      showCue(POSE_EMOJIS[pose], poseLabel(pose));
      setStatusHint('Watch carefully…');
      speakTTS(`${ttsDelayedWatch} ${poseLabel(pose)}`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        hideCue();
        setPhase('wait');
        phaseRef.current = 'wait';
        setStatusHint('Remember the pose…');
        waitPulse.value = withSequence(withTiming(1.15, { duration: 500 }), withTiming(1, { duration: 500 }));
        speakTTS(ttsDelayedWait, 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => {
          setPhase('copy');
          phaseRef.current = 'copy';
          setStatusHint('Copy from memory!');
          enableConfirm();
          speakTTS(ttsDelayedCopy, 0.78).catch(() => {});
        }, delayedWaitMs(tier));
      }, delayedShowMs(tier));
    },
    [enableConfirm, hideCue, tier, ttsDelayedCopy, ttsDelayedWait, ttsDelayedWatch, waitPulse],
  );

  const startFastPose = useCallback(() => {
    const pose = randomPose(tier);
    setCurrentPose(pose);
    currentPoseRef.current = pose;
    setPhase('show');
    showCue(POSE_EMOJIS[pose], poseLabel(pose));
    setStatusHint(`Pose ${fastPoseIndexRef.current + 1}/${fastPosesNeededRef.current}`);
    speakTTS(poseLabel(pose), 0.85).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      enableConfirm();
      speakTTS(ttsFastPose, 0.85).catch(() => {});
    }, fastPoseMs(tier));
  }, [enableConfirm, showCue, tier, ttsFastPose]);

  const handleReplay = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current) return;
    if (mode === 'copyPose' || mode === 'delayedMirror') {
      const pose = currentPoseRef.current;
      showCue(POSE_EMOJIS[pose], poseLabel(pose));
      speakTTS(poseLabel(pose), 0.78).catch(() => {});
    } else if (mode === 'handMirror') {
      showCue(HAND_EMOJIS[screenHand], handDisplayLabel(screenHand));
    } else if (mode === 'fastCopy') {
      const pose = currentPoseRef.current;
      showCue(POSE_EMOJIS[pose], poseLabel(pose));
    }
  }, [mode, screenHand, showCue]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    setRoundActive(true);
    setCanConfirm(false);
    canConfirmRef.current = false;
    fastPosesNeededRef.current = fastPosesPerRound(tier);

    if (mode === 'copyPose') {
      startCopyPoseRound(randomPose(tier));
      return;
    }
    if (mode === 'handMirror') {
      startHandMirrorRound(randomHand());
      return;
    }
    if (mode === 'delayedMirror') {
      startDelayedRound(randomPose(tier));
      return;
    }
    if (mode === 'fastCopy') {
      fastPoseIndexRef.current = 0;
      setFastPoseIndex(0);
      startFastPose();
      return;
    }
    if (mode === 'patternCopy') {
      const steps = generateChainPattern(patternLength(tier), tier);
      setPattern(steps);
      setPhase('demo');
      phaseRef.current = 'demo';
      setStatusHint('Watch the move chain…');
      roundTimerRef.current = setTimeout(() => runPatternDemo(steps, 0), 400);
    }
  }, [
    mode,
    runPatternDemo,
    startAnalyticsRound,
    startCopyPoseRound,
    startDelayedRound,
    startFastPose,
    startHandMirrorRound,
    tier,
  ]);

  useEffect(() => {
    if (round === 1) {
      resetAnalytics();
      speakTTS(ttsIntro, 0.78);
    }
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers, resetAnalytics]);

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
    if (mode === 'delayedMirror' && phaseRef.current !== 'copy') return;

    setCanConfirm(false);
    canConfirmRef.current = false;

    const scoreOpts = {
      pose: imitationScore(tier, mode === 'fastCopy'),
      imitation: imitationScore(tier, mode === 'fastCopy'),
      lateral: mode === 'handMirror' ? imitationScore(tier) : undefined,
      sequence: mode === 'patternCopy' ? imitationScore(tier) : undefined,
      memory: mode === 'patternCopy' || mode === 'delayedMirror' ? imitationScore(tier) : undefined,
      delayed: mode === 'delayedMirror' ? imitationScore(tier) : undefined,
      motor: imitationScore(tier),
    };

    if (mode === 'fastCopy') {
      bumpScore(scoreOpts);
      cueScale.value = withSequence(withTiming(1.15, { duration: 140 }), withTiming(1, { duration: 140 }));
      if (fastPoseIndexRef.current < fastPosesNeededRef.current - 1) {
        const next = fastPoseIndexRef.current + 1;
        fastPoseIndexRef.current = next;
        setFastPoseIndex(next);
        roundTimerRef.current = setTimeout(() => startFastPose(), 360);
      } else {
        completeRound(scoreOpts);
      }
      return;
    }

    completeRound(scoreOpts);
  }, [bumpScore, completeRound, cueScale, mode, startFastPose, tier]);

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🦸 Superhero Graduation Ceremony!\n🦸 ${a.imitationScore}% · 🧠 ${a.sequenceMemoryScore}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.imitationScore}
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

  const showWait = mode === 'delayedMirror' && phase === 'wait';
  const showPatternReminder = mode === 'patternCopy' && phase === 'copy' && pattern.length > 0;
  const showReplay = roundActive && (phase === 'show' || phase === 'copy') && mode !== 'patternCopy';

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
          <View style={[styles.statPill, styles.coinPill, { borderColor: T.statBorder }]}>
            <Text>🪙</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{coins}</Text>
          </View>
        </View>
        {roundActive && <SuperheroBadge visible label={T.hintText} success={cueSuccess} />}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && mode === 'handMirror' && phase === 'show' && (
          <MirrorHandGuide visible screenSide={screenHand} />
        )}

        {roundActive && showWait && (
          <Animated.View style={[styles.waitCue, waitStyle]}>
            <Text style={styles.waitEmoji}>⏳</Text>
            <Text style={[styles.waitLabel, { color: T.accentDark }]}>Remember the pose…</Text>
          </Animated.View>
        )}

        {roundActive && !showWait && (phase === 'show' || phase === 'copy' || phase === 'demo') && (
          <Animated.View style={[styles.cueCard, { borderColor: T.accent }, cueStyle]}>
            <Text style={styles.cueEmoji}>{displayEmoji}</Text>
            {displayLabel ? (
              <Text style={[styles.cueLabel, { color: T.accentDark }]}>{displayLabel}</Text>
            ) : null}
          </Animated.View>
        )}

        {showPatternReminder && <SequenceStrip moves={pattern} accent={T.accent} />}

        {showReplay && (
          <TouchableOpacity style={[styles.replayBtn, { borderColor: T.accent }]} onPress={handleReplay}>
            <Text style={[styles.replayText, { color: T.accentDark }]}>🔁 Replay</Text>
          </TouchableOpacity>
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
  waitCue: { alignItems: 'center', marginBottom: 24 },
  waitEmoji: { fontSize: 72 },
  waitLabel: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  replayBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  replayText: { fontSize: 15, fontWeight: '800' },
  confirmBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 260,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confirmText: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
});

export default MirrorPoseGame;
