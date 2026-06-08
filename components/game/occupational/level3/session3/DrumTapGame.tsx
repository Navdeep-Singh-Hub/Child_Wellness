/**
 * Shared drum tap game core for OT Level 3 Session 3 rhythm variants.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION3_PACING } from '@/components/game/occupational/level3/session3/session3Pacing';
import { playInstrument, useTraceSound } from '@/components/game/occupational/level3/session1/rhythmUtils';
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

const P = SESSION3_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type DrumTapMode = 'singleBeat' | 'doubleBeat' | 'pauseTap' | 'fastBeat' | 'slowBeat';

export type DrumTapTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  drumBg: string;
  drumActive: string;
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

export type DrumTapGameConfig = {
  theme: DrumTapTheme;
  mode: DrumTapMode;
  ttsIntro: string;
  ttsComplete: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const DrumTapGame: React.FC<
  DrumTapGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({ theme: T, mode, ttsIntro, ttsComplete, congratsMessage, logType, skillTags, onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const totalRounds =
    mode === 'doubleBeat'
      ? P.doubleBeatRounds
      : mode === 'fastBeat'
        ? P.fastBeatRounds
        : mode === 'slowBeat'
          ? P.slowBeatRounds
          : mode === 'pauseTap'
            ? P.pauseTapRounds
            : P.singleBeatRounds;

  const totalScoreUnits =
    mode === 'fastBeat' ? totalRounds * P.fastBeatsPerRound : totalRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [beatCount, setBeatCount] = useState(0);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const canTapRef = useRef(false);
  const userTapsRef = useRef(0);
  const beatsDoneRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drumPulse = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    canTapRef.current = canTap;
  }, [canTap]);

  const drumAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: drumPulse.value }],
  }));

  const pulseDrum = useCallback(
    (vol = 0.8) => {
      playInstrument('drum', vol);
      drumPulse.value = withSequence(withTiming(1.12, { duration: 80 }), withTiming(1, { duration: 120 }));
    },
    [drumPulse],
  );

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalScoreUnits;
      const xp = Math.round(finalScore * (mode === 'fastBeat' ? 8 : 15));
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
  }, [playWarn]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setCanTap(false);
    canTapRef.current = false;
    beatsDoneRef.current = 0;
    userTapsRef.current = 0;
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    timerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, totalRounds]);

  const startSingleBeat = useCallback(() => {
    setStatusHint('Listen…');
    pulseDrum();
    timerRef.current = setTimeout(() => {
      setCanTap(true);
      canTapRef.current = true;
      setStatusHint('Tap now!');
      timerRef.current = setTimeout(() => {
        if (!canTapRef.current) return;
        setCanTap(false);
        canTapRef.current = false;
        failTap();
        timerRef.current = setTimeout(() => startSingleBeat(), 700);
      }, P.singleBeatTapWindowMs);
    }, 400);
  }, [failTap, pulseDrum]);

  const startDoubleBeat = useCallback(() => {
    setStatusHint('Listen to two beats…');
    userTapsRef.current = 0;
    setCanTap(false);
    pulseDrum();
    timerRef.current = setTimeout(() => {
      pulseDrum();
      timerRef.current = setTimeout(() => {
        setCanTap(true);
        canTapRef.current = true;
        setStatusHint('Tap twice!');
        timerRef.current = setTimeout(() => {
          if (userTapsRef.current < 2) {
            failTap();
            advanceRound();
          }
        }, P.doubleBeatTapWindowMs);
      }, 300);
    }, P.doubleBeatIntervalMs);
  }, [advanceRound, failTap, pulseDrum]);

  const startPauseTap = useCallback(() => {
    setStatusHint('Beat…');
    setCanTap(false);
    pulseDrum();
    timerRef.current = setTimeout(() => {
      setStatusHint('Pause… wait…');
      timerRef.current = setTimeout(() => {
        setCanTap(true);
        canTapRef.current = true;
        setStatusHint('Tap now!');
        timerRef.current = setTimeout(() => {
          if (canTapRef.current) {
            failTap();
            timerRef.current = setTimeout(() => startPauseTap(), 700);
          }
        }, P.pauseTapWindowMs);
      }, P.pauseWaitMs);
    }, P.pauseBeatMs);
  }, [failTap, pulseDrum]);

  const playNextFastBeat = useCallback(() => {
    if (doneRef.current) return;
    if (beatsDoneRef.current >= P.fastBeatsPerRound) {
      advanceRound();
      return;
    }
    beatsDoneRef.current += 1;
    setBeatCount(beatsDoneRef.current);
    setCanTap(false);
    canTapRef.current = false;
    pulseDrum();
    timerRef.current = setTimeout(() => {
      setCanTap(true);
      canTapRef.current = true;
      setStatusHint(`Tap beat ${beatsDoneRef.current}!`);
      timerRef.current = setTimeout(() => {
        if (!canTapRef.current) return;
        setCanTap(false);
        canTapRef.current = false;
        failTap();
        timerRef.current = setTimeout(() => playNextFastBeat(), P.fastBeatIntervalMs);
      }, P.fastBeatTapWindowMs);
    }, 80);
  }, [advanceRound, failTap, pulseDrum]);

  const startFastBeat = useCallback(() => {
    beatsDoneRef.current = 0;
    setBeatCount(0);
    setStatusHint('Fast beats — tap each one!');
    playNextFastBeat();
  }, [playNextFastBeat]);

  const startSlowBeat = useCallback(() => {
    setStatusHint('Slow calm beat…');
    setCanTap(false);
    pulseDrum(0.6);
    timerRef.current = setTimeout(() => {
      setCanTap(true);
      canTapRef.current = true;
      setStatusHint('Tap gently');
      timerRef.current = setTimeout(() => {
        if (canTapRef.current) {
          failTap();
          timerRef.current = setTimeout(() => startSlowBeat(), 900);
        }
      }, P.slowBeatTapWindowMs);
    }, 500);
  }, [failTap, pulseDrum]);

  const runRound = useCallback(() => {
    if (doneRef.current) return;
    setCanTap(false);
    userTapsRef.current = 0;
    if (mode === 'singleBeat') startSingleBeat();
    else if (mode === 'doubleBeat') startDoubleBeat();
    else if (mode === 'pauseTap') startPauseTap();
    else if (mode === 'fastBeat') startFastBeat();
    else startSlowBeat();
  }, [mode, startDoubleBeat, startFastBeat, startPauseTap, startSingleBeat, startSlowBeat]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    timerRef.current = setTimeout(() => runRound(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, runRound, ttsIntro, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const handleTap = () => {
    if (doneRef.current) return;

    if (mode === 'doubleBeat') {
      if (!canTapRef.current) return;
      userTapsRef.current += 1;
      pulseDrum(0.7);
      if (userTapsRef.current >= 2) {
        setCanTap(false);
        canTapRef.current = false;
        clearTimers();
        bumpScore();
        advanceRound();
      }
      return;
    }

    if (!canTapRef.current) {
      failTap();
      return;
    }

    setCanTap(false);
    canTapRef.current = false;

    if (mode === 'fastBeat') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      bumpScore();
      timerRef.current = setTimeout(() => playNextFastBeat(), P.fastBeatIntervalMs);
      return;
    }

    clearTimers();
    bumpScore();
    advanceRound();
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
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{statusHint || T.hintText}</Text>
        {mode === 'fastBeat' && beatCount > 0 && (
          <Text style={[styles.beatCount, { color: T.titleColor }]}>
            Beat {beatCount}/{P.fastBeatsPerRound}
          </Text>
        )}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        <Pressable onPress={handleTap}>
          <Animated.View
            style={[
              styles.drum,
              drumAnimStyle,
              { backgroundColor: canTap ? T.drumActive : T.drumBg },
            ]}
          >
            <Text style={styles.drumEmoji}>🥁</Text>
          </Animated.View>
        </Pressable>
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
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  beatCount: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  drum: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  drumEmoji: { fontSize: 48 },
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

export default DrumTapGame;
