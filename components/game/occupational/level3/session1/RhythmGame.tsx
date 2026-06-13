/**
 * Musical Jungle Adventure — OT Level 3 Session 1 shared rhythm engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { BeatPulseRing } from '@/components/game/occupational/level3/session1/components/BeatPulseRing';
import { JungleCharacterPick } from '@/components/game/occupational/level3/session1/components/JungleCharacterPick';
import { RhythmTimeline, StopGoBanner } from '@/components/game/occupational/level3/session1/components/RhythmTimeline';
import { TimingBadge } from '@/components/game/occupational/level3/session1/components/TimingBadge';
import { JUNGLE_SHELL } from '@/components/game/occupational/level3/session1/jungleTheme';
import { SESSION1_PACING } from '@/components/game/occupational/level3/session1/session1Pacing';
import {
  Instrument,
  VolumeKind,
  TimingGrade,
  bpmForRound,
  bpmToInterval,
  buildEchoPattern,
  gradeTiming,
  lerp,
  patternMatches,
  playInstrument,
  randomInstrument,
  randomVolumePattern,
  useTraceSound,
} from '@/components/game/occupational/level3/session1/rhythmUtils';
import { useRhythmAnalytics } from '@/components/game/occupational/level3/session1/useRhythmAnalytics';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION1_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type RhythmMode = 'beatMatch' | 'stopGo' | 'copy' | 'loudSoft' | 'instrument';

export type RhythmTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  drumBg: string;
  drumActive: string;
  drumText: string;
  loudBtn: string;
  softBtn: string;
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
  choiceBg: string;
  choiceBorder: string;
  choiceText: string;
};

export type RhythmGameConfig = {
  theme: RhythmTheme;
  mode: RhythmMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsWrong?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const VOICE_PRAISE = ['Great job!', 'Awesome!', 'Keep going!', 'You did it!'];

export const RhythmGame: React.FC<
  RhythmGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsWrong = 'Try again!',
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
    recordTiming: recordAnalyticsTiming,
    recordMissedBeat,
    recordStopViolation,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useRhythmAnalytics();

  const totalRounds =
    mode === 'copy'
      ? P.copyRounds
      : mode === 'instrument'
        ? P.instrumentRounds
        : mode === 'beatMatch'
          ? P.beatMatchRounds
          : mode === 'stopGo'
            ? P.stopGoRounds
            : P.loudSoftRounds;

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
  const [timingGrade, setTimingGrade] = useState<TimingGrade | null>(null);
  const [timingVisible, setTimingVisible] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'listen' | 'tap' | 'choose'>('idle');
  const [stopGoState, setStopGoState] = useState<'idle' | 'play' | 'stop'>('idle');
  const [currentVolume, setCurrentVolume] = useState<VolumeKind | null>(null);
  const [statusHint, setStatusHint] = useState('');
  const [roundHits, setRoundHits] = useState(0);
  const [timelineLit, setTimelineLit] = useState(0);
  const [userTapCount, setUserTapCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(60);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const userTapsRef = useRef<number[]>([]);
  const copyPatternRef = useRef<number[]>(buildEchoPattern(2));
  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundHitsRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isDrumActiveRef = useRef(false);
  const canTapBeatRef = useRef(false);
  const lastBeatTimeRef = useRef(0);
  const beatsDoneRef = useRef(0);
  const currentVolumeRef = useRef<VolumeKind | null>(null);
  const phaseRef = useRef<'idle' | 'listen' | 'tap' | 'choose'>('idle');
  const targetInstrumentRef = useRef<Instrument | null>(null);
  const drumPulse = useSharedValue(1);
  const drumShake = useSharedValue(0);
  const targetScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const drumAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: drumPulse.value * targetScale.value },
      { translateX: drumShake.value },
    ],
  }));

  const showTimingFeedback = useCallback((grade: TimingGrade) => {
    setTimingGrade(grade);
    setTimingVisible(true);
    recordAnalyticsTiming(grade);
    setTimeout(() => setTimingVisible(false), 750);
  }, [recordAnalyticsTiming]);

  const pulseDrum = useCallback(() => {
    drumPulse.value = withSequence(withSpring(1.18, { damping: 6 }), withSpring(1));
    setPulseKey((k) => k + 1);
  }, [drumPulse]);

  const shakeDrum = useCallback(() => {
    drumShake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [drumShake]);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    canTapBeatRef.current = false;
  }, []);

  const praiseVoice = useCallback(() => {
    const msg = VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!;
    speakTTS(msg, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * (mode === 'copy' || mode === 'instrument' ? 22 : 18) + snap.perfectCount * 2);
      setFinalStats({ correct: finalScore, total, xp, analytics: snap });
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
            total,
            accuracy: snap.accuracyPct,
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
    [analyticsMeta, analyticsSnapshot, clearTimers, logType, mode, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    setCoins((c) => c + 5);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    praiseVoice();
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      return next;
    });
  }, [playSuccess, praiseVoice]);

  const markHit = useCallback(
    (grade: TimingGrade = 'good') => {
      roundHitsRef.current += 1;
      setRoundHits(roundHitsRef.current);
      setSparkleKey(Date.now());
      if (grade === 'perfect') {
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setCoins((c) => c + 2);
      } else if (grade === 'good') {
        playSuccess();
      }
    },
    [playSuccess],
  );

  const failTap = useCallback(() => {
    playWarn();
    shakeDrum();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    showTimingFeedback('miss');
    speakTTS(ttsWrong, 0.78).catch(() => {});
  }, [playWarn, shakeDrum, showTimingFeedback, ttsWrong]);

  const awardRoundStar = useCallback(() => {
    if (mode === 'instrument') return;
    const needed =
      mode === 'beatMatch'
        ? Math.ceil(P.beatMatchBeatsPerRound * 0.55)
        : mode === 'stopGo'
          ? Math.ceil(P.stopGoCyclesPerRound * 0.5)
          : mode === 'loudSoft'
            ? Math.ceil(P.loudSoftBeatsPerRound * 0.55)
            : 1;
    if (roundHitsRef.current >= needed) bumpScore();
    roundHitsRef.current = 0;
    setRoundHits(0);
  }, [bumpScore, mode]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    isPlayingRef.current = false;
    isDrumActiveRef.current = false;
    setStopGoState('idle');
    cancelAnimation(drumPulse);
    drumPulse.value = 1;
    targetScale.value = 1;
    currentVolumeRef.current = null;
    setCurrentVolume(null);
    beatsDoneRef.current = 0;
    awardRoundStar();

    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    scheduleTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [awardRoundStar, clearTimers, drumPulse, endGame, scheduleTimeout, targetScale, totalRounds]);

  // ─── Game 1: Beat Sync ───────────────────────────────────────────
  const startBeatMatch = useCallback(() => {
    if (isPlayingRef.current || doneRef.current) return;
    isPlayingRef.current = true;
    const bpm = bpmForRound(roundRef.current);
    setCurrentBpm(bpm);
    const interval = bpmToInterval(bpm);
    setIsPlaying(true);
    setBeatCount(0);
    beatsDoneRef.current = 0;
    roundHitsRef.current = 0;
    setRoundHits(0);
    setStatusHint(`Tap on the beat! ${bpm} BPM`);

    const playNextBeat = () => {
      if (doneRef.current) return;
      lastBeatTimeRef.current = Date.now();
      canTapBeatRef.current = true;
      playInstrument('drum');
      pulseDrum();
      beatsDoneRef.current += 1;
      setBeatCount(beatsDoneRef.current);

      scheduleTimeout(() => {
        if (canTapBeatRef.current) {
          canTapBeatRef.current = false;
          recordMissedBeat();
        }
      }, P.timingGoodMs);

      if (beatsDoneRef.current >= P.beatMatchBeatsPerRound) {
        scheduleTimeout(() => advanceRound(), interval);
      } else {
        scheduleTimeout(playNextBeat, interval);
      }
    };

    playNextBeat();
  }, [advanceRound, pulseDrum, recordMissedBeat, scheduleTimeout]);

  // ─── Game 2: Stop & Go ───────────────────────────────────────────
  const startStopGo = useCallback(() => {
    if (isPlayingRef.current || doneRef.current) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    beatsDoneRef.current = 0;
    roundHitsRef.current = 0;
    setRoundHits(0);
    setStatusHint('GO = tap! STOP = freeze!');

    const t = (roundRef.current - 1) / Math.max(1, totalRounds - 1);
    const playMs = Math.round(lerp(P.stopGoPlayMsMin, P.stopGoPlayMsMax, t * 0.5 + 0.3));
    const stopMs = Math.round(lerp(P.stopGoStopMsMin, P.stopGoStopMsMax, t));

    let cycle = 0;
    const runCycle = () => {
      if (doneRef.current) return;
      setStopGoState('play');
      isDrumActiveRef.current = true;
      playInstrument('drum');
      pulseDrum();

      scheduleTimeout(() => {
        setStopGoState('stop');
        isDrumActiveRef.current = false;

        scheduleTimeout(() => {
          cycle += 1;
          beatsDoneRef.current = cycle;
          setBeatCount(cycle);
          if (cycle >= P.stopGoCyclesPerRound) {
            advanceRound();
          } else {
            runCycle();
          }
        }, stopMs);
      }, playMs);
    };

    runCycle();
  }, [advanceRound, pulseDrum, scheduleTimeout, totalRounds]);

  // ─── Game 3: Rhythm Echo ─────────────────────────────────────────
  const playCopyPattern = useCallback(
    (fromReplay = false) => {
      const beatLen = P.copyPatternLengths[Math.min(roundRef.current - 1, P.copyPatternLengths.length - 1)] ?? 3;
      const pattern = buildEchoPattern(beatLen);
      copyPatternRef.current = pattern;
      userTapsRef.current = [];
      setUserTapCount(0);
      setTimelineLit(0);
      setPhase('listen');
      phaseRef.current = 'listen';
      setIsPlaying(true);
      setStatusHint(fromReplay ? 'Listen again…' : 'Listen to the pattern…');

      let idx = 0;
      const playNext = () => {
        if (idx >= pattern.length) {
          setIsPlaying(false);
          setPhase('tap');
          phaseRef.current = 'tap';
          setStatusHint('Your turn — tap the pattern!');
          speakTTS('Now copy the pattern!', 0.78).catch(() => {});
          return;
        }
        playInstrument('drum');
        pulseDrum();
        setTimelineLit(idx + 1);
        idx += 1;
        scheduleTimeout(playNext, P.copyBaseIntervalMs);
      };

      if (!fromReplay) speakTTS('Listen to the pattern!', 0.78).catch(() => {});
      scheduleTimeout(playNext, 350);
    },
    [pulseDrum, scheduleTimeout],
  );

  // ─── Game 4: Loud & Soft ─────────────────────────────────────────
  const startLoudSoft = useCallback(() => {
    if (isPlayingRef.current || doneRef.current) return;
    isPlayingRef.current = true;
    const pattern = randomVolumePattern(P.loudSoftBeatsPerRound);
    setIsPlaying(true);
    beatsDoneRef.current = 0;
    roundHitsRef.current = 0;
    setRoundHits(0);
    setStatusHint('Loud = BIG tap · Soft = small tap!');

    let idx = 0;
    const playNext = () => {
      if (doneRef.current || idx >= pattern.length) {
        advanceRound();
        return;
      }
      const vol = pattern[idx]!;
      currentVolumeRef.current = vol;
      setCurrentVolume(vol);
      targetScale.value = vol === 'loud' ? 1.45 : 0.72;
      playInstrument(vol === 'loud' ? 'drum' : 'bell', vol === 'loud' ? 0.95 : 0.35);
      pulseDrum();
      beatsDoneRef.current = idx + 1;
      setBeatCount(beatsDoneRef.current);
      idx += 1;
      scheduleTimeout(playNext, P.loudSoftBeatIntervalMs);
    };

    playNext();
  }, [advanceRound, pulseDrum, scheduleTimeout, targetScale]);

  // ─── Game 5: Sound Match ─────────────────────────────────────────
  const startInstrumentRound = useCallback(() => {
    const inst = randomInstrument();
    targetInstrumentRef.current = inst;
    setPhase('listen');
    phaseRef.current = 'listen';
    setStatusHint('Listen carefully…');
    const hard = roundRef.current >= P.instrumentSimilarSoundRound;
    playInstrument(inst, hard ? 0.55 : 0.85);
    scheduleTimeout(() => {
      setPhase('choose');
      phaseRef.current = 'choose';
      setStatusHint('Who made that sound?');
    }, hard ? 700 : 900);
  }, [scheduleTimeout]);

  const callbacksRef = useRef({
    startBeatMatch,
    startStopGo,
    startLoudSoft,
    playCopyPattern,
    startInstrumentRound,
  });
  callbacksRef.current = {
    startBeatMatch,
    startStopGo,
    startLoudSoft,
    playCopyPattern,
    startInstrumentRound,
  };

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

  useEffect(() => {
    if (doneRef.current) return;
    clearTimers();
    setIsPlaying(false);
    isPlayingRef.current = false;
    cancelAnimation(drumPulse);
    drumPulse.value = 1;
    targetScale.value = 1;
    setPhase('idle');
    phaseRef.current = 'idle';
    setBeatCount(0);
    setStatusHint(T.hintText);
    userTapsRef.current = [];
    beatsDoneRef.current = 0;
    roundHitsRef.current = 0;
    setRoundHits(0);
    setUserTapCount(0);
    setTimelineLit(0);
    setShowHint(false);

    const c = callbacksRef.current;
    const delay = round === 1 ? P.roundIntroDelayMs + 200 : P.roundIntroDelayMs;
    if (mode === 'copy') scheduleTimeout(() => c.playCopyPattern(), delay);
    else if (mode === 'instrument') scheduleTimeout(() => c.startInstrumentRound(), delay);
    else if (mode === 'beatMatch') scheduleTimeout(() => c.startBeatMatch(), delay);
    else if (mode === 'stopGo') scheduleTimeout(() => c.startStopGo(), delay);
    else if (mode === 'loudSoft') scheduleTimeout(() => c.startLoudSoft(), delay);
  }, [round, mode, clearTimers, drumPulse, scheduleTimeout, T.hintText, targetScale]);

  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    };
  }, [ttsIntro, clearTimers]);

  const handleBeatSyncTap = useCallback(() => {
    if (!canTapBeatRef.current) {
      failTap();
      return;
    }
    canTapBeatRef.current = false;
    const delta = Date.now() - lastBeatTimeRef.current;
    const grade = gradeTiming(delta);
    recordAnalyticsTiming(grade, Math.abs(delta));
    showTimingFeedback(grade);
    if (grade !== 'miss') markHit(grade);
    else failTap();
  }, [failTap, markHit, recordAnalyticsTiming, showTimingFeedback]);

  const handleStopGoTap = useCallback(() => {
    if (!isPlayingRef.current) return;
    if (isDrumActiveRef.current) {
      markHit('good');
    } else {
      recordStopViolation();
      failTap();
    }
  }, [failTap, markHit, recordStopViolation]);

  const handleCopyTap = useCallback(() => {
    if (phaseRef.current !== 'tap' || isPlayingRef.current) return;
    playInstrument('drum', 0.65);
    pulseDrum();
    userTapsRef.current.push(Date.now());
    const count = userTapsRef.current.length;
    setUserTapCount(count);
    const pattern = copyPatternRef.current;
    if (count >= pattern.length) {
      if (patternMatches(userTapsRef.current, pattern, P.copyBaseIntervalMs, P.copyToleranceRatio)) {
        bumpScore();
        advanceRound();
      } else {
        failTap();
        userTapsRef.current = [];
        setUserTapCount(0);
      }
    }
  }, [advanceRound, bumpScore, failTap, pulseDrum]);

  const handleLoudSoftTap = useCallback(
    (vol: VolumeKind) => {
      if (!isPlayingRef.current || !currentVolumeRef.current) return;
      const expected = currentVolumeRef.current;
      if (vol === expected) {
        const grade: TimingGrade = vol === 'loud' ? 'perfect' : 'good';
        markHit(grade);
        showTimingFeedback(grade);
      } else {
        failTap();
      }
      currentVolumeRef.current = null;
      setCurrentVolume(null);
    },
    [failTap, markHit, showTimingFeedback],
  );

  const handleInstrumentPick = useCallback(
    (inst: Instrument) => {
      if (phaseRef.current !== 'choose' || !targetInstrumentRef.current || doneRef.current) return;
      playInstrument(inst, 0.6);
      if (inst === targetInstrumentRef.current) {
        bumpScore();
        advanceRound();
      } else {
        failTap();
        scheduleTimeout(() => startInstrumentRound(), P.nextRoundDelayMs);
      }
    },
    [advanceRound, bumpScore, failTap, scheduleTimeout, startInstrumentRound],
  );

  const onMainTap = () => {
    if (mode === 'beatMatch') handleBeatSyncTap();
    else if (mode === 'stopGo') handleStopGoTap();
    else if (mode === 'copy') handleCopyTap();
  };

  const hintOpacity = round >= P.loudSoftHintFadeStart ? 0.35 : 1;

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n\n⭐ ${finalStats.correct}/${finalStats.total} rounds · 🎯 ${a.accuracyPct}% accuracy · ⚡ ${a.avgReactionMs}ms avg`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.accuracyPct}
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

  const patternLen = copyPatternRef.current.length;
  const showDrum =
    mode !== 'instrument' || phase !== 'choose';
  const showLoudSoftTargets = mode === 'loudSoft' && isPlaying && currentVolume;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.jungleDeco} pointerEvents="none">
        <Text style={styles.jungleTree}>🌴</Text>
        <Text style={[styles.jungleTree, styles.jungleTreeRight]}>🌳</Text>
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
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.jungleLabel, { color: JUNGLE_SHELL.accentDark }]}>🎵 Musical Jungle</Text>
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
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
          <View style={[styles.statPill, styles.coinPill]}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{coins}</Text>
          </View>
        </View>
        {mode === 'beatMatch' && isPlaying && (
          <Text style={[styles.bpmBadge, { color: T.subtitleColor }]}>{currentBpm} BPM</Text>
        )}
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{statusHint || T.hintText}</Text>
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        <TimingBadge grade={timingGrade} visible={timingVisible} />

        {mode === 'stopGo' && isPlaying && <StopGoBanner state={stopGoState === 'idle' ? 'idle' : stopGoState} />}

        {mode === 'copy' && (
          <>
            <RhythmTimeline
              total={patternLen}
              litIndex={timelineLit}
              userTaps={userTapCount}
              phase={phase === 'tap' ? 'tap' : phase === 'listen' ? 'listen' : 'idle'}
            />
            {phase === 'tap' && (
              <View style={styles.echoActions}>
                <Pressable style={styles.echoBtn} onPress={() => playCopyPattern(true)}>
                  <Text style={styles.echoBtnText}>🔁 Replay</Text>
                </Pressable>
                <Pressable
                  style={styles.echoBtn}
                  onPress={() => {
                    setShowHint(true);
                    setTimelineLit(patternLen);
                  }}
                >
                  <Text style={styles.echoBtnText}>💡 Hint</Text>
                </Pressable>
              </View>
            )}
            {showHint && phase === 'tap' && (
              <Text style={styles.hintOverlay}>{patternLen} beats — tap the drum!</Text>
            )}
          </>
        )}

        {mode === 'instrument' && phase === 'choose' ? (
          <JungleCharacterPick onPick={handleInstrumentPick} />
        ) : showLoudSoftTargets ? (
          <View style={styles.loudSoftRow}>
            <Pressable
              onPress={() => handleLoudSoftTap('loud')}
              style={[styles.bigTarget, { opacity: hintOpacity }]}
            >
              <Text style={styles.bigTargetLabel}>BIG</Text>
              <Text style={styles.bigTargetEmoji}>👆</Text>
            </Pressable>
            <Pressable
              onPress={() => handleLoudSoftTap('soft')}
              style={[styles.smallTarget, { opacity: hintOpacity }]}
            >
              <Text style={styles.smallTargetLabel}>small</Text>
            </Pressable>
          </View>
        ) : showDrum ? (
          <Pressable
            onPress={onMainTap}
            disabled={mode === 'copy' && phase !== 'tap'}
            style={styles.drumWrap}
          >
            <BeatPulseRing active={pulseKey > 0} key={pulseKey} color="rgba(251,191,36,0.6)" size={200} />
            <Animated.View
              style={[
                styles.drum,
                drumAnimStyle,
                {
                  backgroundColor:
                    stopGoState === 'play' || (isPlaying && mode !== 'copy')
                      ? T.drumActive
                      : stopGoState === 'stop'
                        ? '#94A3B8'
                        : T.drumBg,
                  opacity: mode === 'copy' && phase === 'listen' ? 0.65 : 1,
                },
              ]}
            >
              <Text style={[styles.drumEmoji, { color: T.drumText }]}>
                {mode === 'copy' ? '🔁' : mode === 'stopGo' ? (stopGoState === 'stop' ? '⏸️' : '🥁') : '🐻'}
              </Text>
              <Text style={[styles.drumLabel, { color: T.drumText }]}>
                {mode === 'copy'
                  ? phase === 'tap'
                    ? 'Tap'
                    : 'Listen…'
                  : mode === 'beatMatch'
                    ? 'TAP!'
                    : mode === 'stopGo'
                      ? stopGoState === 'stop'
                        ? 'Freeze!'
                        : 'Tap!'
                      : 'Start'}
              </Text>
            </Animated.View>
          </Pressable>
        ) : null}

        {isPlaying && mode !== 'copy' && mode !== 'instrument' && (
          <Text style={[styles.beatCounter, { color: T.subtitleColor }]}>
            {mode === 'beatMatch' && `Beat ${beatCount}/${P.beatMatchBeatsPerRound} · Hits ${roundHits}`}
            {mode === 'stopGo' && `Cycle ${beatCount}/${P.stopGoCyclesPerRound} · Hits ${roundHits}`}
            {mode === 'loudSoft' &&
              `Beat ${beatCount}/${P.loudSoftBeatsPerRound} · ${currentVolume ?? ''} · Hits ${roundHits}`}
          </Text>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={16} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  jungleDeco: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
  jungleTree: { fontSize: 48, opacity: 0.35 },
  jungleTreeRight: { transform: [{ scaleX: -1 }] },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 56, paddingHorizontal: 16 },
  jungleLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  bpmBadge: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.35)' },
  coinEmoji: { fontSize: 14 },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 12 },
  drumWrap: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200 },
  drum: { width: 150, height: 150, borderRadius: 75, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.9)' },
  drumEmoji: { fontSize: 44 },
  drumLabel: { fontSize: 15, fontWeight: '900', marginTop: 4 },
  loudSoftRow: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  bigTarget: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  bigTargetLabel: { color: '#fff', fontWeight: '900', fontSize: 22 },
  bigTargetEmoji: { fontSize: 32 },
  smallTarget: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#93C5FD', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  smallTargetLabel: { color: '#fff', fontWeight: '800', fontSize: 12 },
  beatCounter: { marginTop: 16, fontSize: 13, fontWeight: '700' },
  echoActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  echoBtn: { backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(5,150,105,0.25)' },
  echoBtnText: { fontWeight: '800', fontSize: 13, color: '#065F46' },
  hintOverlay: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#047857' },
});

export default RhythmGame;
