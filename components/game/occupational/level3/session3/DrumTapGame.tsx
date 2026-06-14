/**
 * Tempo Town — OT Level 3 Session 3 shared drum/tempo tap engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { BeatBotDrum } from '@/components/game/occupational/level3/session3/components/BeatBotDrum';
import { BreathingAura } from '@/components/game/occupational/level3/session3/components/BreathingAura';
import { TempoBadge } from '@/components/game/occupational/level3/session3/components/TempoBadge';
import {
  SESSION3_PACING,
  bpmForRound,
  bpmToInterval,
  doubleBeatSpacing,
  pauseWaitForRound,
  sprintBpmForBeat,
} from '@/components/game/occupational/level3/session3/session3Pacing';
import {
  TempoGrade,
  gradeTapTiming,
  playDrumBeat,
  tapIntervalTooFast,
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
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION3_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Excellent Timing!', 'Perfect Beat!', 'Amazing Control!', 'Fantastic Work!'];

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
  const {
    reset: resetAnalytics,
    startRound: startAnalyticsRound,
    recordGrade,
    recordImpulse,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useTempoAnalytics();

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
  const [pulseKey, setPulseKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [beatCount, setBeatCount] = useState(0);
  const [bpmDisplay, setBpmDisplay] = useState(60);
  const [gradeVisible, setGradeVisible] = useState(false);
  const [lastGrade, setLastGrade] = useState<TempoGrade | null>(null);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const canTapRef = useRef(false);
  const phaseRef = useRef<'idle' | 'listen' | 'pause' | 'tap'>('idle');
  const userTapsRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);
  const beatsDoneRef = useRef(0);
  const beatTimeRef = useRef(0);
  const lastTapRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    canTapRef.current = canTap;
  }, [canTap]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const showGrade = useCallback((grade: TempoGrade) => {
    setLastGrade(grade);
    setGradeVisible(true);
    recordGrade(grade);
    schedule(() => setGradeVisible(false), 700);
  }, [recordGrade, schedule]);

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 18 + snap.perfectCount * 2);
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
            accuracy: snap.tempoAccuracy,
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
    [analyticsMeta, analyticsSnapshot, clearTimers, logType, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(
    (grade: TempoGrade = 'good') => {
      setSparkleKey(Date.now());
      setCoins((c) => c + (grade === 'perfect' ? 8 : 5));
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      praiseVoice();
      setScore((s) => {
        scoreRef.current = s + 1;
        return s + 1;
      });
    },
    [playSuccess, praiseVoice],
  );

  const failTap = useCallback(
    (grade: TempoGrade = 'miss') => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      showGrade(grade);
      setWarnVisible(true);
      schedule(() => setWarnVisible(false), 800);
    },
    [playWarn, schedule, showGrade],
  );

  const pulseBeat = useCallback((vol = 0.85) => {
    playDrumBeat(vol);
    setPulseKey((k) => k + 1);
  }, []);

  const runRoundRef = useRef<() => void>(() => {});

  const retryRound = useCallback(() => {
    if (doneRef.current) return;
    schedule(() => runRoundRef.current(), P.nextRoundDelayMs);
  }, [schedule]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setCanTap(false);
    canTapRef.current = false;
    phaseRef.current = 'idle';
    userTapsRef.current = 0;
    tapTimesRef.current = [];
    beatsDoneRef.current = 0;

    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    schedule(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, schedule, totalRounds]);

  const finishRoundSuccess = useCallback(
    (grade: TempoGrade) => {
      showGrade(grade);
      bumpScore(grade);
      advanceRound();
    },
    [advanceRound, bumpScore, showGrade],
  );

  const startSingleBeat = useCallback(() => {
    const bpm = mode === 'slowBeat' ? P.calmBpm : bpmForRound(roundRef.current, totalRounds);
    setBpmDisplay(bpm);
    beatTimeRef.current = Date.now();
    phaseRef.current = 'listen';
    setStatusHint('Listen…');
    pulseBeat(mode === 'slowBeat' ? 0.55 : 0.85);
    const window = bpmToInterval(bpm) * P.tapWindowRatio;
    schedule(() => {
      phaseRef.current = 'tap';
      setCanTap(true);
      canTapRef.current = true;
      setStatusHint(mode === 'slowBeat' ? 'Tap gently…' : 'Tap once!');
      schedule(() => {
        if (canTapRef.current && userTapsRef.current === 0) {
          setCanTap(false);
          canTapRef.current = false;
          failTap('late');
          retryRound();
        }
      }, window);
    }, 80);
  }, [failTap, mode, pulseBeat, retryRound, schedule, totalRounds]);

  const startDoubleBeat = useCallback(() => {
    const spacing = doubleBeatSpacing(roundRef.current, totalRounds);
    setBpmDisplay(Math.round(60000 / spacing));
    userTapsRef.current = 0;
    tapTimesRef.current = [];
    setStatusHint('Listen to two beats…');
    phaseRef.current = 'listen';
    pulseBeat();
    schedule(() => {
      pulseBeat();
      beatTimeRef.current = Date.now();
      schedule(() => {
        phaseRef.current = 'tap';
        setCanTap(true);
        canTapRef.current = true;
        setStatusHint('Tap twice!');
        schedule(() => {
          if (userTapsRef.current < 2) {
            setCanTap(false);
            canTapRef.current = false;
            failTap('miss');
            retryRound();
          }
        }, spacing * 2.2);
      }, 200);
    }, spacing);
  }, [failTap, pulseBeat, retryRound, schedule, totalRounds]);

  const startPauseTap = useCallback(() => {
    const wait = pauseWaitForRound(roundRef.current, totalRounds);
    phaseRef.current = 'listen';
    setCanTap(false);
    canTapRef.current = false;
    setStatusHint('Beat…');
    pulseBeat();
    schedule(() => {
      phaseRef.current = 'pause';
      setStatusHint('Pause… wait…');
      if (Math.random() < P.pauseFakeCueChance) {
        schedule(() => pulseBeat(0.35), wait * 0.4);
      }
      schedule(() => {
        phaseRef.current = 'tap';
        beatTimeRef.current = Date.now();
        setCanTap(true);
        canTapRef.current = true;
        setStatusHint('Tap now!');
        schedule(() => {
          if (canTapRef.current) {
            setCanTap(false);
            canTapRef.current = false;
            failTap('late');
            retryRound();
          }
        }, bpmToInterval(80) * P.tapWindowRatio);
      }, wait);
    }, P.pauseBeatMs);
  }, [failTap, pulseBeat, retryRound, schedule, totalRounds]);

  const playSprintBeat = useCallback(() => {
    if (doneRef.current) return;
    if (beatsDoneRef.current >= P.sprintBeatsPerRound) {
      advanceRound();
      return;
    }
    const beatIdx = beatsDoneRef.current + 1;
    const bpm = sprintBpmForBeat(beatsDoneRef.current);
    setBpmDisplay(bpm);
    beatsDoneRef.current = beatIdx;
    setBeatCount(beatIdx);
    setCanTap(false);
    canTapRef.current = false;
    beatTimeRef.current = Date.now();
    pulseBeat();
    const interval = bpmToInterval(bpm);
    schedule(() => {
      phaseRef.current = 'tap';
      setCanTap(true);
      canTapRef.current = true;
      setStatusHint(`Beat ${beatIdx} — tap!`);
      schedule(() => {
        if (!canTapRef.current) return;
        setCanTap(false);
        canTapRef.current = false;
        failTap('late');
        schedule(() => playSprintBeat(), interval * 0.5);
      }, interval * P.tapWindowRatio);
    }, 60);
  }, [advanceRound, failTap, pulseBeat, schedule]);

  const startFastBeat = useCallback(() => {
    beatsDoneRef.current = 0;
    setBeatCount(0);
    setStatusHint('Beat Sprint — keep up!');
    playSprintBeat();
  }, [playSprintBeat]);

  const runRound = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    userTapsRef.current = 0;
    tapTimesRef.current = [];
    setCanTap(false);
    canTapRef.current = false;
    if (mode === 'singleBeat' || mode === 'slowBeat') startSingleBeat();
    else if (mode === 'doubleBeat') startDoubleBeat();
    else if (mode === 'pauseTap') startPauseTap();
    else startFastBeat();
  }, [mode, startAnalyticsRound, startDoubleBeat, startFastBeat, startPauseTap, startSingleBeat]);

  runRoundRef.current = runRound;

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    schedule(() => runRound(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, runRound, ttsIntro, clearTimers, schedule]);

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
    const now = Date.now();

    if (phaseRef.current === 'pause' || (phaseRef.current === 'listen' && mode !== 'doubleBeat')) {
      recordImpulse();
      failTap('early');
      return;
    }

    if (mode === 'doubleBeat') {
      if (!canTapRef.current) {
        recordImpulse();
        failTap('early');
        return;
      }
      userTapsRef.current += 1;
      tapTimesRef.current.push(now);
      pulseBeat(0.7);
      if (userTapsRef.current >= 2) {
        setCanTap(false);
        canTapRef.current = false;
        clearTimers();
        const spacing = tapTimesRef.current[1]! - tapTimesRef.current[0]!;
        const expected = doubleBeatSpacing(roundRef.current, totalRounds);
        const grade = gradeTapTiming(spacing - expected);
        if (grade === 'miss' || grade === 'late' || grade === 'early') {
          failTap(grade);
          retryRound();
        } else {
          finishRoundSuccess(grade);
        }
      }
      return;
    }

    if (!canTapRef.current) {
      recordImpulse();
      failTap('early');
      return;
    }

    userTapsRef.current += 1;
    if (userTapsRef.current > 1) {
      recordImpulse();
      setCanTap(false);
      canTapRef.current = false;
      clearTimers();
      failTap('early');
      retryRound();
      return;
    }

    const reaction = now - beatTimeRef.current;
    const grade = gradeTapTiming(reaction - 120);

    if (mode === 'slowBeat' && lastTapRef.current > 0 && tapIntervalTooFast(now - lastTapRef.current, P.calmBpm)) {
      recordImpulse();
      failTap('early');
      setCanTap(false);
      canTapRef.current = false;
      clearTimers();
      retryRound();
      return;
    }
    lastTapRef.current = now;

    setCanTap(false);
    canTapRef.current = false;
    clearTimers();

    if (mode === 'fastBeat') {
      if (grade === 'miss' || grade === 'late') {
        failTap(grade);
        schedule(() => playSprintBeat(), bpmToInterval(bpmDisplay) * 0.4);
      } else {
        showGrade(grade);
        bumpScore(grade);
        schedule(() => playSprintBeat(), bpmToInterval(bpmDisplay) * 0.35);
      }
      return;
    }

    if (grade === 'miss' || grade === 'late') {
      failTap(grade);
      retryRound();
    } else {
      finishRoundSuccess(grade);
    }
  };

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🏁 Tempo Town Festival!\n🎯 ${a.tempoAccuracy}% · 🥁 ${a.rhythmConsistency} rhythm`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.tempoAccuracy}
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
      {mode === 'slowBeat' && <BreathingAura />}
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
        <TempoBadge visible={gradeVisible} grade={lastGrade} />
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{statusHint || T.hintText}</Text>
        {(mode === 'fastBeat' || mode === 'singleBeat') && (
          <Text style={[styles.bpm, { color: T.titleColor }]}>{bpmDisplay} BPM</Text>
        )}
        {mode === 'fastBeat' && beatCount > 0 && (
          <Text style={[styles.beatCount, { color: T.titleColor }]}>
            Beat {beatCount}/{P.sprintBeatsPerRound}
          </Text>
        )}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        <BeatBotDrum
          active
          canTap={canTap}
          pulseKey={pulseKey}
          drumBg={T.drumBg}
          drumActive={T.drumActive}
          onTap={handleTap}
        />
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again — control your timing!</Text>
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
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, zIndex: 2 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  bpm: { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  beatCount: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.22)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.18)' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
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
