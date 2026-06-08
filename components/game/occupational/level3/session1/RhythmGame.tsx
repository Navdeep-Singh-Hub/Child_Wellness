/**
 * Shared rhythm/drum game core for OT Level 3 Session 1.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION1_PACING } from '@/components/game/occupational/level3/session1/session1Pacing';
import {
  BEAT_PATTERNS,
  Instrument,
  VolumeKind,
  INSTRUMENTS,
  bpmForRound,
  bpmToInterval,
  patternMatches,
  playInstrument,
  randomInstrument,
  randomVolumePattern,
  useTraceSound,
} from '@/components/game/occupational/level3/session1/rhythmUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
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
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'listen' | 'tap' | 'choose'>('idle');
  const [isDrumActive, setIsDrumActive] = useState(false);
  const [currentVolume, setCurrentVolume] = useState<VolumeKind | null>(null);
  const [volumePattern, setVolumePattern] = useState<VolumeKind[]>([]);
  const [targetInstrument, setTargetInstrument] = useState<Instrument | null>(null);
  const [statusHint, setStatusHint] = useState('');

  const expectedTapRef = useRef<number | null>(null);
  const beatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTapsRef = useRef<number[]>([]);
  const copyPatternRef = useRef<number[]>(BEAT_PATTERNS[0]!);
  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const drumPulse = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const drumAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: drumPulse.value }],
  }));

  const pulseDrum = useCallback(() => {
    drumPulse.value = withSequence(withTiming(1.12, { duration: 80 }), withTiming(1, { duration: 120 }));
  }, [drumPulse]);

  const clearTimers = useCallback(() => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const totalScoreUnits = useCallback(() => {
    if (mode === 'copy' || mode === 'instrument') return totalRounds;
    if (mode === 'beatMatch') return totalRounds * P.beatMatchBeatsPerRound;
    if (mode === 'stopGo') return totalRounds * P.stopGoBeatsPerRound;
    return totalRounds * P.loudSoftBeatsPerRound;
  }, [mode, totalRounds]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalScoreUnits();
      const xp = Math.round(finalScore * (mode === 'copy' || mode === 'instrument' ? 18 : 15));
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
    [clearTimers, logType, mode, router, skillTags, totalScoreUnits, ttsComplete],
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

  const failTap = useCallback(() => {
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setWarnVisible(true);
    setTimeout(() => setWarnVisible(false), 800);
    speakTTS(ttsWrong, 0.78).catch(() => {});
  }, [playWarn, ttsWrong]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    setIsDrumActive(false);
    setCurrentVolume(null);
    if (round >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, round, totalRounds]);

  const startBeatMatch = useCallback(() => {
    if (isPlaying || doneRef.current) return;
    const bpm = bpmForRound(round, totalRounds, P.beatMatchInitialBpm, P.beatMatchFinalBpm);
    const interval = bpmToInterval(bpm);
    setIsPlaying(true);
    setBeatCount(0);
    setStatusHint(`Tap with the beat! (${Math.round(bpm)} BPM)`);

    const playBeat = () => {
      const now = Date.now();
      expectedTapRef.current = now;
      playInstrument('drum');
      pulseDrum();
      setBeatCount((c) => {
        const next = c + 1;
        if (next >= P.beatMatchBeatsPerRound) {
          clearTimers();
          setIsPlaying(false);
          advanceRound();
        }
        return next;
      });
    };

    playBeat();
    beatIntervalRef.current = setInterval(playBeat, interval);
  }, [advanceRound, clearTimers, isPlaying, pulseDrum, round, totalRounds]);

  const startStopGo = useCallback(() => {
    if (isPlaying || doneRef.current) return;
    setIsPlaying(true);
    setBeatCount(0);
    setStatusHint('Tap only while the drum plays!');

    let count = 0;
    const cycle = () => {
      setIsDrumActive(true);
      playInstrument('drum');
      pulseDrum();
      timeoutRef.current = setTimeout(() => setIsDrumActive(false), P.stopGoSoundMs);
      count += 1;
      setBeatCount(count);
      if (count >= P.stopGoBeatsPerRound) {
        clearTimers();
        setIsPlaying(false);
        setIsDrumActive(false);
        advanceRound();
      }
    };

    cycle();
    beatIntervalRef.current = setInterval(cycle, P.stopGoBeatIntervalMs);
  }, [advanceRound, clearTimers, isPlaying, pulseDrum]);

  const playCopyPattern = useCallback(() => {
    const pattern = BEAT_PATTERNS[(round - 1) % BEAT_PATTERNS.length]!;
    copyPatternRef.current = pattern;
    userTapsRef.current = [];
    setPhase('listen');
    setIsPlaying(true);
    setStatusHint('Listen to the pattern…');

    let idx = 0;
    const playNext = () => {
      if (idx >= pattern.length) {
        setIsPlaying(false);
        setPhase('tap');
        setStatusHint('Now tap the same pattern!');
        speakTTS('Now tap the same pattern!', 0.78).catch(() => {});
        return;
      }
      playInstrument('drum');
      pulseDrum();
      const delay = pattern[idx]! * P.copyBaseIntervalMs;
      idx += 1;
      timeoutRef.current = setTimeout(playNext, delay);
    };

    speakTTS('Listen to the pattern!', 0.78).catch(() => {});
    timeoutRef.current = setTimeout(playNext, 400);
  }, [pulseDrum, round]);

  const startLoudSoft = useCallback(() => {
    if (isPlaying || doneRef.current) return;
    const pattern = randomVolumePattern(P.loudSoftBeatsPerRound);
    setVolumePattern(pattern);
    setIsPlaying(true);
    setBeatCount(0);
    setStatusHint('Match loud or soft beats!');

    let idx = 0;
    const playNext = () => {
      if (idx >= pattern.length) {
        clearTimers();
        setIsPlaying(false);
        setCurrentVolume(null);
        advanceRound();
        return;
      }
      const vol = pattern[idx]!;
      setCurrentVolume(vol);
      setBeatCount(idx + 1);
      playInstrument('drum', vol === 'loud' ? 0.9 : 0.3);
      pulseDrum();
      idx += 1;
    };

    playNext();
    beatIntervalRef.current = setInterval(playNext, P.loudSoftBeatIntervalMs);
  }, [advanceRound, clearTimers, isPlaying, pulseDrum]);

  const startInstrumentRound = useCallback(() => {
    const inst = randomInstrument();
    setTargetInstrument(inst);
    setPhase('listen');
    setStatusHint('Listen…');
    playInstrument(inst);
    timeoutRef.current = setTimeout(() => {
      setPhase('choose');
      setStatusHint('Which instrument was that?');
    }, 900);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    clearTimers();
    setIsPlaying(false);
    setPhase('idle');
    setBeatCount(0);
    setStatusHint(T.hintText);
    userTapsRef.current = [];

    if (mode === 'copy') {
      timeoutRef.current = setTimeout(() => playCopyPattern(), 600);
    } else if (mode === 'instrument') {
      timeoutRef.current = setTimeout(() => startInstrumentRound(), 400);
    }
  }, [round]);

  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    };
  }, [ttsIntro, clearTimers]);

  const handleDrumTap = useCallback(() => {
    if (doneRef.current) return;

    if (mode === 'beatMatch') {
      if (!isPlaying) {
        startBeatMatch();
        return;
      }
      const now = Date.now();
      if (expectedTapRef.current && Math.abs(now - expectedTapRef.current) <= bpmToInterval(bpmForRound(round, totalRounds, P.beatMatchInitialBpm, P.beatMatchFinalBpm)) * P.tapToleranceRatio) {
        bumpScore();
      } else failTap();
      return;
    }

    if (mode === 'stopGo') {
      if (!isPlaying) {
        startStopGo();
        return;
      }
      if (isDrumActive) bumpScore();
      else failTap();
      return;
    }

    if (mode === 'copy' && phase === 'tap' && !isPlaying) {
      playInstrument('drum', 0.6);
      pulseDrum();
      userTapsRef.current.push(Date.now());
      const pattern = copyPatternRef.current;
      if (userTapsRef.current.length >= pattern.length) {
        if (patternMatches(userTapsRef.current, pattern, P.copyBaseIntervalMs, P.copyToleranceRatio)) {
          bumpScore();
          advanceRound();
        } else {
          failTap();
          userTapsRef.current = [];
        }
      }
    }
  }, [advanceRound, bumpScore, failTap, isDrumActive, isPlaying, mode, phase, pulseDrum, round, startBeatMatch, startStopGo, totalRounds]);

  const handleVolumeTap = useCallback(
    (vol: VolumeKind) => {
      if (mode !== 'loudSoft' || !isPlaying || !currentVolume) return;
      if (vol === currentVolume) bumpScore();
      else failTap();
    },
    [bumpScore, currentVolume, failTap, isPlaying, mode],
  );

  const handleInstrumentPick = useCallback(
    (inst: Instrument) => {
      if (mode !== 'instrument' || phase !== 'choose' || !targetInstrument || doneRef.current) return;
      playInstrument(inst, 0.6);
      if (inst === targetInstrument) {
        bumpScore();
        advanceRound();
      } else {
        failTap();
        timeoutRef.current = setTimeout(() => startInstrumentRound(), P.nextRoundDelayMs);
      }
    },
    [advanceRound, bumpScore, failTap, mode, phase, startInstrumentRound, targetInstrument],
  );

  const startAction = () => {
    if (mode === 'loudSoft' && !isPlaying) startLoudSoft();
    else handleDrumTap();
  };

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

  const showStart =
    (mode === 'beatMatch' || mode === 'stopGo' || mode === 'loudSoft') && !isPlaying;

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
              {round}/{totalRounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{statusHint || T.hintText}</Text>
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {mode === 'instrument' && phase === 'choose' ? (
          <View style={styles.choiceRow}>
            {INSTRUMENTS.map((inst) => (
              <Pressable
                key={inst}
                onPress={() => handleInstrumentPick(inst)}
                style={[styles.choiceBtn, { backgroundColor: T.choiceBg, borderColor: T.choiceBorder }]}
              >
                <Text style={styles.choiceEmoji}>{inst === 'drum' ? '🥁' : inst === 'bell' ? '🔔' : '👏'}</Text>
                <Text style={[styles.choiceLabel, { color: T.choiceText }]}>{inst}</Text>
              </Pressable>
            ))}
          </View>
        ) : mode === 'loudSoft' && isPlaying ? (
          <View style={styles.choiceRow}>
            <Pressable onPress={() => handleVolumeTap('loud')} style={[styles.volBtn, { backgroundColor: T.loudBtn }]}>
              <Text style={styles.volLabel}>LOUD</Text>
            </Pressable>
            <Pressable onPress={() => handleVolumeTap('soft')} style={[styles.volBtn, styles.softBtn, { backgroundColor: T.softBtn }]}>
              <Text style={styles.volLabel}>soft</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={startAction} disabled={mode === 'copy' && phase !== 'tap'}>
            <Animated.View
              style={[
                styles.drum,
                drumAnimStyle,
                {
                  backgroundColor: isDrumActive || (isPlaying && mode !== 'copy') ? T.drumActive : T.drumBg,
                  opacity: mode === 'copy' && phase === 'listen' ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[styles.drumEmoji, { color: T.drumText }]}>🥁</Text>
              <Text style={[styles.drumLabel, { color: T.drumText }]}>
                {showStart ? 'Start' : mode === 'copy' ? (phase === 'tap' ? 'Tap' : 'Listen…') : 'Tap'}
              </Text>
            </Animated.View>
          </Pressable>
        )}

        {(mode === 'loudSoft' || mode === 'stopGo') && isPlaying && (
          <Text style={[styles.beatCounter, { color: T.subtitleColor }]}>
            Beat {beatCount}
            {mode === 'loudSoft' && currentVolume ? ` · ${currentVolume}` : ''}
          </Text>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={12} size={7} />

        {warnVisible && (
          <View style={styles.warnPill} pointerEvents="none">
            <Text style={styles.warnText}>Try again!</Text>
          </View>
        )}
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
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  drum: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  drumEmoji: { fontSize: 48 },
  drumLabel: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  choiceRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  choiceBtn: { width: 90, padding: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  choiceEmoji: { fontSize: 32 },
  choiceLabel: { fontSize: 12, fontWeight: '800', marginTop: 4, textTransform: 'capitalize' },
  volBtn: { width: 120, height: 120, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  softBtn: { borderRadius: 60, width: 80, height: 80 },
  volLabel: { fontSize: 18, fontWeight: '900', color: '#fff' },
  beatCounter: { marginTop: 20, fontSize: 14, fontWeight: '700' },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  warnText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
});

export default RhythmGame;
