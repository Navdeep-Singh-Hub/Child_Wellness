/**
 * Shared mirror / pose imitation game core for OT Level 3 Session 9.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  HAND_EMOJIS,
  HandSide,
  MOVEMENT_EMOJIS,
  Movement,
  POSE_EMOJIS,
  PoseType,
  generatePattern,
  mirrorHand,
  poseLabel,
  randomHand,
  randomPose,
  useTraceSound,
} from '@/components/game/occupational/level3/session9/mirrorUtils';
import { SESSION9_PACING } from '@/components/game/occupational/level3/session9/session9Pacing';
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

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [canConfirm, setCanConfirm] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'show' | 'wait' | 'copy' | 'demo'>('idle');
  const [currentPose, setCurrentPose] = useState<PoseType>('hands-up');
  const [screenHand, setScreenHand] = useState<HandSide>('left');
  const [pattern, setPattern] = useState<Movement[]>([]);
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
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const gameTotal = mode === 'fastCopy' ? P.rounds * P.fastPosesPerRound : P.rounds;

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
      const total = gameTotal;
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
    [clearTimers, gameTotal, logType, router, skillTags, ttsComplete],
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

  const enableConfirm = useCallback(() => {
    setCanConfirm(true);
    canConfirmRef.current = true;
    setStatusHint('Do it, then tap the button!');
  }, []);

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

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    if (mode !== 'fastCopy') bumpScore();
    cueScale.value = withSequence(withTiming(1.2, { duration: 160 }), withTiming(1, { duration: 160 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, cueScale, mode]);

  const runPatternDemo = useCallback(
    (steps: Movement[], index: number) => {
      if (index >= steps.length) {
        enableConfirm();
        speakTTS(ttsPatternCopy, 0.78).catch(() => {});
        setPhase('copy');
        phaseRef.current = 'copy';
        setStatusHint('Repeat the pattern!');
        return;
      }
      const move = steps[index]!;
      setPatternStep(index);
      showCue(MOVEMENT_EMOJIS[move], move.toUpperCase());
      roundTimerRef.current = setTimeout(() => {
        hideCue();
        roundTimerRef.current = setTimeout(() => runPatternDemo(steps, index + 1), 180);
      }, P.patternStepMs);
    },
    [enableConfirm, hideCue, showCue, ttsPatternCopy],
  );

  const startCopyPoseRound = useCallback(
    (pose: PoseType) => {
      setCurrentPose(pose);
      setPhase('show');
      showCue(POSE_EMOJIS[pose], poseLabel(pose));
      setStatusHint('Watch the pose…');
      speakTTS(poseLabel(pose), 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        enableConfirm();
        speakTTS(ttsCopyPose, 0.78).catch(() => {});
      }, P.poseShowMs);
    },
    [enableConfirm, showCue, ttsCopyPose],
  );

  const startHandMirrorRound = useCallback(
    (side: HandSide) => {
      setScreenHand(side);
      setPhase('show');
      const child = mirrorHand(side);
      showCue(HAND_EMOJIS[side], `Screen: ${side.toUpperCase()}`);
      setStatusHint(`You raise: ${child.toUpperCase()}`);
      speakTTS(`Screen shows ${side} hand. You raise your ${child} hand!`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        enableConfirm();
        speakTTS(ttsHandMirror, 0.78).catch(() => {});
      }, P.handShowMs);
    },
    [enableConfirm, showCue, ttsHandMirror],
  );

  const startDelayedRound = useCallback(
    (pose: PoseType) => {
      setCurrentPose(pose);
      setPhase('show');
      showCue(POSE_EMOJIS[pose], poseLabel(pose));
      setStatusHint('Watch carefully…');
      speakTTS(`${ttsDelayedWatch} ${poseLabel(pose)}`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        hideCue();
        setPhase('wait');
        phaseRef.current = 'wait';
        setStatusHint('Wait…');
        waitPulse.value = withSequence(withTiming(1.15, { duration: 500 }), withTiming(1, { duration: 500 }));
        speakTTS(ttsDelayedWait, 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => {
          setPhase('copy');
          phaseRef.current = 'copy';
          showCue(POSE_EMOJIS[pose], 'Copy now!');
          enableConfirm();
          speakTTS(ttsDelayedCopy, 0.78).catch(() => {});
        }, P.delayedWaitMs);
      }, P.delayedShowMs);
    },
    [enableConfirm, hideCue, showCue, ttsDelayedCopy, ttsDelayedWait, ttsDelayedWatch, waitPulse],
  );

  const startFastPose = useCallback(() => {
    const pose = randomPose();
    setCurrentPose(pose);
    setPhase('show');
    showCue(POSE_EMOJIS[pose], poseLabel(pose));
    setStatusHint(`Pose ${fastPoseIndexRef.current + 1}/${P.fastPosesPerRound}`);
    speakTTS(poseLabel(pose), 0.85).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      enableConfirm();
      speakTTS(ttsFastPose, 0.85).catch(() => {});
    }, P.fastPoseMs);
  }, [enableConfirm, showCue, ttsFastPose]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    setCanConfirm(false);
    canConfirmRef.current = false;

    if (mode === 'copyPose') {
      startCopyPoseRound(randomPose());
      return;
    }
    if (mode === 'handMirror') {
      startHandMirrorRound(randomHand());
      return;
    }
    if (mode === 'delayedMirror') {
      startDelayedRound(randomPose());
      return;
    }
    if (mode === 'fastCopy') {
      fastPoseIndexRef.current = 0;
      setFastPoseIndex(0);
      startFastPose();
      return;
    }
    if (mode === 'patternCopy') {
      const steps = generatePattern(P.patternLength);
      setPattern(steps);
      setPhase('demo');
      phaseRef.current = 'demo';
      setStatusHint('Watch the pattern…');
      roundTimerRef.current = setTimeout(() => runPatternDemo(steps, 0), 400);
    }
  }, [mode, runPatternDemo, startCopyPoseRound, startDelayedRound, startFastPose, startHandMirrorRound]);

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

  const handleConfirm = useCallback(() => {
    if (!canConfirmRef.current || roundCompleteRef.current || doneRef.current) return;
    if (mode === 'delayedMirror' && phaseRef.current !== 'copy') return;

    setCanConfirm(false);
    canConfirmRef.current = false;

    if (mode === 'fastCopy') {
      bumpScore();
      cueScale.value = withSequence(withTiming(1.15, { duration: 140 }), withTiming(1, { duration: 140 }));
      if (fastPoseIndexRef.current < P.fastPosesPerRound - 1) {
        const next = fastPoseIndexRef.current + 1;
        fastPoseIndexRef.current = next;
        setFastPoseIndex(next);
        roundTimerRef.current = setTimeout(() => startFastPose(), 360);
      } else {
        completeRound();
      }
      return;
    }

    completeRound();
  }, [bumpScore, completeRound, cueScale, mode, startFastPose]);

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

  const showWait = mode === 'delayedMirror' && phase === 'wait';
  const showPatternReminder = mode === 'patternCopy' && phase === 'copy' && pattern.length > 0;

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
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

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

        {showPatternReminder && (
          <View style={[styles.patternRow, { borderColor: T.playBorder }]}>
            {pattern.map((m, i) => (
              <Text key={`${m}-${i}`} style={styles.patternEmoji}>
                {MOVEMENT_EMOJIS[m]}
              </Text>
            ))}
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
  patternRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginBottom: 16,
  },
  patternEmoji: { fontSize: 36 },
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
