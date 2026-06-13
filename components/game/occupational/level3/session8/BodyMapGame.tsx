/**
 * Robo Body Builder Academy — OT Level 3 Session 8 body awareness engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { BodyPartBadge } from '@/components/game/occupational/level3/session8/components/BodyPartBadge';
import { LateralityHint } from '@/components/game/occupational/level3/session8/components/LateralityHint';
import { PuzzleBuildProgress } from '@/components/game/occupational/level3/session8/components/PuzzleBuildProgress';
import { RoboSilhouette } from '@/components/game/occupational/level3/session8/components/RoboSilhouette';
import {
  FLASH_ZONES,
  FlashPart,
  FOLLOW_ZONES,
  FollowPart,
  LATERAL_ZONES,
  LateralPart,
  PUZZLE_PARTS,
  PuzzlePart,
  TOUCH_ZONES,
  TouchPart,
  buildFollowSequence,
  distPx,
  lateralPool,
  lateralTts,
  randomFlashPart,
  randomLateralPart,
  randomTouchPart,
  scoreReaction,
  touchPartTts,
  useTraceSound,
} from '@/components/game/occupational/level3/session8/bodyMapUtils';
import {
  SESSION8_PACING,
  difficultyTier,
  flashDurationMs,
  flashesPerRound,
  followDemoMs,
  followSequenceLength,
  highlightDelayMs,
  puzzleMatchPx,
  puzzleRoundLimitMs,
  pulseMs,
  showGlowHint,
  tapTimeLimitMs,
} from '@/components/game/occupational/level3/session8/session8Pacing';
import { useBodyAnalytics } from '@/components/game/occupational/level3/session8/useBodyAnalytics';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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

const P = SESSION8_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Excellent!', 'You found it!', 'Great Body Detective!', 'Fantastic Job!', "You're a Robot Builder Master!"];

export type BodyMapMode = 'touchHead' | 'shouldersTap' | 'bodyFlash' | 'followBody' | 'bodyPuzzle';

export type BodyMapTheme = {
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
  hintText: string;
};

export type BodyMapGameConfig = {
  theme: BodyMapTheme;
  mode: BodyMapMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsHead?: string;
  ttsShoulder?: string;
  ttsWrongShoulder?: string;
  ttsFlash?: string;
  ttsFlashMiss?: string;
  ttsFollowDemo?: string;
  ttsFollowCopy?: string;
  ttsWrongPart?: string;
  ttsPuzzleSnap?: string;
  ttsPuzzleMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const PUZZLE_KEYS: PuzzlePart[] = ['head', 'torso', 'arm', 'leg'];

export const BodyMapGame: React.FC<BodyMapGameConfig & { onBack?: () => void; onComplete?: () => void }> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsHead = 'Touch the head!',
  ttsShoulder = 'Touch the highlighted shoulder!',
  ttsWrongShoulder = 'Touch the other shoulder!',
  ttsFlash = 'Tap the flashing body part quickly!',
  ttsFlashMiss = 'Tap it while you see it!',
  ttsFollowDemo = 'Watch which part is touched!',
  ttsFollowCopy = 'Now touch the same part!',
  ttsWrongPart = 'Try the highlighted body part!',
  ttsPuzzleSnap = 'Great fit!',
  ttsPuzzleMiss = 'Drag it to the matching spot!',
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
    recordSuccess,
    recordError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useBodyAnalytics();

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
  const [statusHint, setStatusHint] = useState('');
  const [phase, setPhase] = useState<'idle' | 'demo' | 'copy' | 'play'>('idle');
  const [highlightReady, setHighlightReady] = useState(false);
  const [touchTarget, setTouchTarget] = useState<TouchPart>('head');
  const [lateralTarget, setLateralTarget] = useState<LateralPart>('leftShoulder');
  const [flashPart, setFlashPart] = useState<FlashPart | null>(null);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [flashVisible, setFlashVisible] = useState(false);
  const [followTarget, setFollowTarget] = useState<FollowPart | null>(null);
  const [flashHits, setFlashHits] = useState(0);
  const [placedParts, setPlacedParts] = useState<Set<PuzzlePart>>(new Set());

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const phaseRef = useRef(phase);
  const flashHitsRef = useRef(0);
  const flashVisibleRef = useRef(false);
  const followTargetRef = useRef<FollowPart | null>(null);
  const followSequenceRef = useRef<FollowPart[]>(['head']);
  const followStepRef = useRef(0);
  const flashesNeededRef = useRef(4);
  const flashDurationRef = useRef(750);
  const puzzleMatchRef = useRef(52);
  const placedRef = useRef<Set<PuzzlePart>>(new Set());
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundStartRef = useRef(Date.now());
  const playW = useRef(360);
  const playH = useRef(480);

  const zonePulse = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(0.8);
  const demoPulse = useSharedValue(1);

  const headX = useSharedValue(PUZZLE_PARTS.head.startXPct);
  const headY = useSharedValue(PUZZLE_PARTS.head.startYPct);
  const torsoX = useSharedValue(PUZZLE_PARTS.torso.startXPct);
  const torsoY = useSharedValue(PUZZLE_PARTS.torso.startYPct);
  const armX = useSharedValue(PUZZLE_PARTS.arm.startXPct);
  const armY = useSharedValue(PUZZLE_PARTS.arm.startYPct);
  const legX = useSharedValue(PUZZLE_PARTS.leg.startXPct);
  const legY = useSharedValue(PUZZLE_PARTS.leg.startYPct);
  const headScale = useSharedValue(1);
  const torsoScale = useSharedValue(1);
  const armScale = useSharedValue(1);
  const legScale = useSharedValue(1);

  const tier = difficultyTier(round, P.rounds);

  const puzzlePos = useRef({
    head: { x: headX, y: headY, scale: headScale },
    torso: { x: torsoX, y: torsoY, scale: torsoScale },
    arm: { x: armX, y: armY, scale: armScale },
    leg: { x: legX, y: legY, scale: legScale },
  });

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
    flashVisibleRef.current = flashVisible;
  }, [flashVisible]);

  const zonePulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: zonePulse.value }] }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));
  const demoPulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: demoPulse.value }] }));

  const headPieceStyle = useAnimatedStyle(() => ({
    left: `${headX.value}%`,
    top: `${headY.value}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }, { scale: headScale.value }],
  }));
  const torsoPieceStyle = useAnimatedStyle(() => ({
    left: `${torsoX.value}%`,
    top: `${torsoY.value}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }, { scale: torsoScale.value }],
  }));
  const armPieceStyle = useAnimatedStyle(() => ({
    left: `${armX.value}%`,
    top: `${armY.value}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }, { scale: armScale.value }],
  }));
  const legPieceStyle = useAnimatedStyle(() => ({
    left: `${legX.value}%`,
    top: `${legY.value}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }, { scale: legScale.value }],
  }));
  const pieceStyles = {
    head: headPieceStyle,
    torso: torsoPieceStyle,
    arm: armPieceStyle,
    leg: legPieceStyle,
  };

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(zonePulse);
    cancelAnimation(demoPulse);
  }, [demoPulse, zonePulse]);

  const gameTotal = mode === 'bodyFlash' ? P.rounds * flashesPerRound(4) : P.rounds;

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 16 + snap.bodyAwarenessScore * 0.18);
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
            accuracy: snap.bodyAwarenessScore,
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
      part?: number;
      lateral?: number;
      mapping?: number;
      scanning?: number;
      memory?: number;
      spatial?: number;
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

  const showWarn = useCallback(
    (msg: string) => {
      recordError();
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setCueSuccess(false);
      setWarnVisible(true);
      setTimeout(() => {
        setWarnVisible(false);
        setCueSuccess(undefined);
      }, 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn, recordError],
  );

  const startPulse = useCallback(() => {
    const ms = pulseMs(tier);
    zonePulse.value = withRepeat(
      withSequence(withTiming(1.18, { duration: ms }), withTiming(1, { duration: ms })),
      -1,
      true,
    );
  }, [tier, zonePulse]);

  const startDemoPulse = useCallback(() => {
    demoPulse.value = withRepeat(
      withSequence(withTiming(1.25, { duration: 450 }), withTiming(1, { duration: 450 })),
      3,
      false,
    );
  }, [demoPulse]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setPhase('idle');
    setHighlightReady(false);
    setFlashPart(null);
    setFlashVisible(false);
    flashVisibleRef.current = false;
    setFollowTarget(null);
    followTargetRef.current = null;
    flashHitsRef.current = 0;
    setFlashHits(0);
    placedRef.current = new Set();
    setPlacedParts(new Set());
    flashOpacity.value = 0;
    zonePulse.value = 1;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, flashOpacity, zonePulse]);

  const completeRound = useCallback(
    (opts?: {
      part?: number;
      lateral?: number;
      mapping?: number;
      scanning?: number;
      memory?: number;
      spatial?: number;
    }) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      if (mode !== 'bodyFlash') bumpScore(opts);
      cancelAnimation(zonePulse);
      roundTimerRef.current = setTimeout(() => advanceRound(), P.nextRoundDelayLongMs);
    },
    [advanceRound, bumpScore, mode, zonePulse],
  );

  const resetPuzzlePieces = useCallback(() => {
    PUZZLE_KEYS.forEach((key) => {
      puzzlePos.current[key].x.value = PUZZLE_PARTS[key].startXPct;
      puzzlePos.current[key].y.value = PUZZLE_PARTS[key].startYPct;
      puzzlePos.current[key].scale.value = 1;
    });
  }, []);

  const triggerFlash = useCallback(() => {
    if (roundCompleteRef.current || !roundActiveRef.current) return;
    const part = randomFlashPart(tier);
    const duration = flashDurationRef.current;
    setFlashPart(part);
    setFlashVisible(true);
    flashVisibleRef.current = true;
    flashOpacity.value = 0;
    flashScale.value = 0.75;
    flashOpacity.value = withTiming(1, { duration: 180 });
    flashScale.value = withSequence(withTiming(1.15, { duration: 160 }), withTiming(1, { duration: 120 }));
    speakTTS(FLASH_ZONES[part].label, 0.78).catch(() => {});

    roundTimerRef.current = setTimeout(() => {
      setFlashVisible(false);
      flashVisibleRef.current = false;
      flashOpacity.value = withTiming(0, { duration: 180 });
      roundTimerRef.current = setTimeout(() => {
        if (!roundCompleteRef.current && flashHitsRef.current < flashesNeededRef.current) {
          triggerFlash();
        }
      }, 280);
    }, duration);
  }, [flashOpacity, flashScale, tier]);

  const startFollowDemo = useCallback(
    (step = 0) => {
      const seq = followSequenceRef.current;
      const part = seq[step];
      if (!part) return;
      setFollowTarget(part);
      followTargetRef.current = part;
      setPhase('demo');
      phaseRef.current = 'demo';
      setStatusHint(`Watch the ${FOLLOW_ZONES[part].label.toLowerCase()}!`);
      startDemoPulse();
      speakTTS(`${FOLLOW_ZONES[part].label}! ${ttsFollowDemo}`, 0.78).catch(() => {});
      const demoMs = followDemoMs(tier);
      roundTimerRef.current = setTimeout(() => {
        if (step + 1 < seq.length) {
          startFollowDemo(step + 1);
        } else {
          setPhase('copy');
          phaseRef.current = 'copy';
          followStepRef.current = 0;
          setStatusHint(seq.length > 1 ? 'Copy the sequence!' : 'Your turn — copy it!');
          speakTTS(ttsFollowCopy, 0.78).catch(() => {});
        }
      }, demoMs);
    },
    [startDemoPulse, tier, ttsFollowCopy, ttsFollowDemo],
  );

  const scheduleTapTimeout = useCallback(() => {
    const limit = tapTimeLimitMs(tier);
    if (limit <= 0 || roundCompleteRef.current) return;
    roundTimerRef.current = setTimeout(() => {
      if (!roundCompleteRef.current && roundActiveRef.current) {
        showWarn('Time is up! Try again!');
        roundTimerRef.current = setTimeout(() => advanceRound(), 600);
        roundCompleteRef.current = true;
      }
    }, limit);
  }, [advanceRound, showWarn, tier]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundStartRef.current = Date.now();
    roundCompleteRef.current = false;
    setRoundActive(true);
    flashesNeededRef.current = flashesPerRound(tier);
    flashDurationRef.current = flashDurationMs(tier);
    puzzleMatchRef.current = puzzleMatchPx(tier);

    if (mode === 'touchHead') {
      const part = randomTouchPart(tier);
      setTouchTarget(part);
      setPhase('play');
      setStatusHint(touchPartTts(part));
      roundTimerRef.current = setTimeout(() => {
        setHighlightReady(true);
        if (showGlowHint(tier)) startPulse();
        speakTTS(touchPartTts(part), 0.78).catch(() => {});
        scheduleTapTimeout();
      }, highlightDelayMs(tier));
      return;
    }
    if (mode === 'shouldersTap') {
      const part = randomLateralPart(tier);
      setLateralTarget(part);
      setPhase('play');
      setStatusHint(lateralTts(part));
      roundTimerRef.current = setTimeout(() => {
        setHighlightReady(true);
        if (showGlowHint(tier)) startPulse();
        speakTTS(lateralTts(part), 0.78).catch(() => {});
        scheduleTapTimeout();
      }, highlightDelayMs(tier));
      return;
    }
    if (mode === 'bodyFlash') {
      setPhase('play');
      flashHitsRef.current = 0;
      setFlashHits(0);
      setStatusHint(`Quick taps: 0/${flashesNeededRef.current}`);
      speakTTS(ttsFlash, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => triggerFlash(), highlightDelayMs(tier));
      return;
    }
    if (mode === 'followBody') {
      followSequenceRef.current = buildFollowSequence(followSequenceLength(tier));
      followStepRef.current = 0;
      setStatusHint('Watch Professor Bot…');
      roundTimerRef.current = setTimeout(() => startFollowDemo(0), highlightDelayMs(tier));
      return;
    }
    if (mode === 'bodyPuzzle') {
      setPhase('play');
      resetPuzzlePieces();
      placedRef.current = new Set();
      setPlacedParts(new Set());
      setStatusHint('Drag each robot part to its spot!');
      const limit = puzzleRoundLimitMs(tier);
      if (limit > 0) {
        roundTimerRef.current = setTimeout(() => {
          if (!roundCompleteRef.current && roundActiveRef.current) {
            showWarn('Build faster next time!');
            roundCompleteRef.current = true;
            roundTimerRef.current = setTimeout(() => advanceRound(), 600);
          }
        }, limit);
      }
    }
  }, [
    mode,
    resetPuzzlePieces,
    scheduleTapTimeout,
    startAnalyticsRound,
    startFollowDemo,
    startPulse,
    tier,
    triggerFlash,
    ttsFlash,
    advanceRound,
    showWarn,
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

  const handleTouchTap = useCallback(
    (part: TouchPart) => {
      if (!roundActiveRef.current || roundCompleteRef.current || !highlightReady) return;
      if (part === touchTarget) {
        const reaction = Date.now() - roundStartRef.current;
        const partScore = scoreReaction(reaction, tapTimeLimitMs(tier) || 3000);
        completeRound({ part: partScore, scanning: partScore });
      } else showWarn(ttsHead);
    },
    [completeRound, highlightReady, showWarn, touchTarget, tier, ttsHead],
  );

  const handleLateralTap = useCallback(
    (part: LateralPart) => {
      if (!roundActiveRef.current || roundCompleteRef.current || !highlightReady) return;
      if (part === lateralTarget) {
        const reaction = Date.now() - roundStartRef.current;
        const latScore = scoreReaction(reaction, tapTimeLimitMs(tier) || 3000);
        completeRound({ lateral: latScore, part: latScore });
      } else showWarn(ttsWrongShoulder);
    },
    [completeRound, highlightReady, lateralTarget, showWarn, tier, ttsWrongShoulder],
  );

  const handleFlashTap = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || !flashVisibleRef.current || !flashPart) return;
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    bumpScore({ scanning: 92, part: 88 });
    flashHitsRef.current++;
    const hits = flashHitsRef.current;
    setFlashHits(hits);
    setFlashVisible(false);
    flashVisibleRef.current = false;
    flashOpacity.value = withTiming(0, { duration: 120 });
    if (hits >= flashesNeededRef.current) {
      completeRound({ scanning: 95, part: 90 });
    } else {
      setStatusHint(`Quick taps: ${hits}/${flashesNeededRef.current}`);
      roundTimerRef.current = setTimeout(() => triggerFlash(), 360);
    }
  }, [bumpScore, completeRound, flashOpacity, flashPart, triggerFlash]);

  const handleFollowTap = useCallback(
    (part: FollowPart) => {
      if (!roundActiveRef.current || roundCompleteRef.current || phaseRef.current !== 'copy') return;
      const expected = followSequenceRef.current[followStepRef.current];
      if (part === expected) {
        followStepRef.current++;
        if (followStepRef.current >= followSequenceRef.current.length) {
          const memScore = followSequenceRef.current.length > 1 ? 95 : 88;
          completeRound({ memory: memScore, part: memScore });
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          const next = followSequenceRef.current[followStepRef.current]!;
          setStatusHint(`Now touch ${FOLLOW_ZONES[next].label}!`);
          speakTTS(FOLLOW_ZONES[next].label, 0.78).catch(() => {});
        }
      } else showWarn(ttsWrongPart);
    },
    [completeRound, showWarn, ttsWrongPart],
  );

  const snapPuzzlePart = useCallback(
    (part: PuzzlePart) => {
      const cfg = PUZZLE_PARTS[part];
      const pos = puzzlePos.current[part];
      pos.x.value = withSpring(cfg.xPct, { damping: 14, stiffness: 180 });
      pos.y.value = withSpring(cfg.yPct, { damping: 14, stiffness: 180 });
      pos.scale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
      const next = new Set([...placedRef.current, part]);
      placedRef.current = next;
      setPlacedParts(next);
      setSparkleKey(Date.now());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS(ttsPuzzleSnap, 0.78).catch(() => {});
      if (next.size >= PUZZLE_KEYS.length) {
        completeRound({ spatial: 95, mapping: 95 });
      }
    },
    [completeRound, ttsPuzzleSnap],
  );

  const makePuzzleGesture = (part: PuzzlePart) =>
    Gesture.Pan()
      .runOnJS(true)
      .onBegin(() => {
        if (placedRef.current.has(part)) return;
        puzzlePos.current[part].scale.value = withTiming(1.15, { duration: 100 });
      })
      .onUpdate((e) => {
        if (placedRef.current.has(part)) return;
        const xPct = (e.x / playW.current) * 100;
        const yPct = (e.y / playH.current) * 100;
        puzzlePos.current[part].x.value = Math.max(6, Math.min(94, xPct));
        puzzlePos.current[part].y.value = Math.max(10, Math.min(90, yPct));
      })
      .onEnd((e) => {
        if (placedRef.current.has(part)) return;
        puzzlePos.current[part].scale.value = withTiming(1, { duration: 100 });
        const xPct = (e.x / playW.current) * 100;
        const yPct = (e.y / playH.current) * 100;
        const cfg = PUZZLE_PARTS[part];
        const d = distPx(xPct, yPct, cfg.xPct, cfg.yPct, playW.current, playH.current);
        if (d <= puzzleMatchRef.current) snapPuzzlePart(part);
        else {
          showWarn(ttsPuzzleMiss);
          puzzlePos.current[part].x.value = withTiming(cfg.startXPct, { duration: 280 });
          puzzlePos.current[part].y.value = withTiming(cfg.startYPct, { duration: 280 });
        }
      });

  const puzzleGestures = {
    head: makePuzzleGesture('head'),
    torso: makePuzzleGesture('torso'),
    arm: makePuzzleGesture('arm'),
    leg: makePuzzleGesture('leg'),
  };

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🤖 Robo Graduation Festival!\n👤 ${a.bodyPartAccuracy}% · ⬅️➡️ ${a.leftRightAccuracy}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.bodyAwarenessScore}
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

  const touchParts: TouchPart[] =
    tier <= 2 ? ['head'] : tier === 3 ? ['head', 'eyes', 'nose'] : (Object.keys(TOUCH_ZONES) as TouchPart[]);
  const lateralParts = lateralPool(tier);

  const renderZone = (
    zone: { emoji: string; label: string; xPct: number; yPct: number },
    onPress: () => void,
    active: boolean,
    key: string,
  ) => (
    <Pressable key={key} onPress={onPress} style={[styles.zoneHit, { left: `${zone.xPct}%`, top: `${zone.yPct}%` }]}>
      <Animated.View
        style={[
          styles.zone,
          active && { borderColor: T.accent, backgroundColor: 'rgba(255,255,255,0.85)' },
          active ? zonePulseStyle : undefined,
        ]}
      >
        <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
      </Animated.View>
    </Pressable>
  );

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
        {roundActive && <BodyPartBadge visible label={T.hintText} success={cueSuccess} />}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && mode !== 'bodyPuzzle' && <RoboSilhouette visible />}

        {roundActive && mode === 'shouldersTap' && (
          <LateralityHint
            visible
            side={lateralTarget.includes('left') ? 'left' : lateralTarget.includes('right') ? 'right' : null}
          />
        )}

        {roundActive && mode === 'touchHead' &&
          touchParts.map((part) =>
            renderZone(
              TOUCH_ZONES[part],
              () => handleTouchTap(part),
              highlightReady && touchTarget === part && showGlowHint(tier),
              part,
            ),
          )}

        {roundActive && mode === 'shouldersTap' &&
          lateralParts.map((part) =>
            renderZone(
              LATERAL_ZONES[part],
              () => handleLateralTap(part),
              highlightReady && lateralTarget === part && showGlowHint(tier),
              part,
            ),
          )}

        {roundActive && mode === 'bodyFlash' && flashPart && flashVisible && (
          <Pressable
            onPress={handleFlashTap}
            style={[styles.zoneHit, { left: `${FLASH_ZONES[flashPart].xPct}%`, top: `${FLASH_ZONES[flashPart].yPct}%` }]}
          >
            <Animated.View style={[styles.zone, styles.flashZone, { borderColor: T.accent }, flashStyle]}>
              <Text style={styles.zoneEmoji}>{FLASH_ZONES[flashPart].emoji}</Text>
            </Animated.View>
          </Pressable>
        )}

        {roundActive && mode === 'followBody' && (
          <>
            {phase === 'demo' && followTarget && (
              <Animated.View
                style={[
                  styles.demoMarker,
                  { left: `${FOLLOW_ZONES[followTarget].xPct}%`, top: `${FOLLOW_ZONES[followTarget].yPct}%`, borderColor: T.accent },
                  demoPulseStyle,
                ]}
              >
                <Text style={styles.zoneEmoji}>{FOLLOW_ZONES[followTarget].emoji}</Text>
              </Animated.View>
            )}
            {phase === 'copy' &&
              (Object.keys(FOLLOW_ZONES) as FollowPart[]).map((part) =>
                renderZone(FOLLOW_ZONES[part], () => handleFollowTap(part), false, part),
              )}
          </>
        )}

        {roundActive && mode === 'bodyPuzzle' && (
          <>
            <PuzzleBuildProgress placed={placedParts.size} total={PUZZLE_KEYS.length} accent={T.accent} />
            {PUZZLE_KEYS.map((part) => (
              <View
                key={`target-${part}`}
                style={[
                  styles.targetDot,
                  { left: `${PUZZLE_PARTS[part].xPct}%`, top: `${PUZZLE_PARTS[part].yPct}%`, borderColor: T.accent },
                ]}
              />
            ))}
            {PUZZLE_KEYS.map((part) =>
              placedParts.has(part) ? (
                <Animated.View key={part} style={[styles.piece, pieceStyles[part]]}>
                  <Text style={styles.zoneEmoji}>{PUZZLE_PARTS[part].emoji}</Text>
                </Animated.View>
              ) : (
                <GestureDetector key={part} gesture={puzzleGestures[part]}>
                  <Animated.View style={[styles.piece, pieceStyles[part]]}>
                    <Text style={styles.zoneEmoji}>{PUZZLE_PARTS[part].emoji}</Text>
                  </Animated.View>
                </GestureDetector>
              ),
            )}
          </>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>

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
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  zoneHit: { position: 'absolute', transform: [{ translateX: -40 }, { translateY: -40 }] },
  zone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashZone: { backgroundColor: 'rgba(255,255,255,0.92)' },
  zoneEmoji: { fontSize: 36 },
  demoMarker: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -42 }, { translateY: -42 }],
  },
  targetDot: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderStyle: 'dashed',
    transform: [{ translateX: -36 }, { translateY: -36 }],
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  piece: { position: 'absolute', width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  warnText: { fontSize: 15, fontWeight: '800', color: '#B91C1C' },
});

export default BodyMapGame;
