/**
 * Sky & Ground — OT Level 3 Session 4 vertical direction engine (games 1–5).
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { DirectionBadge } from '@/components/game/occupational/level3/session4/components/DirectionBadge';
import { ElevatorBuilding } from '@/components/game/occupational/level3/session4/components/ElevatorBuilding';
import { RainDrops } from '@/components/game/occupational/level3/session4/components/RainDrops';
import {
  SESSION4_PACING,
  balloonCountForRound,
  difficultyTier,
  mixedDirectionRound,
  swipeThreshold,
} from '@/components/game/occupational/level3/session4/session4Pacing';
import {
  VerticalDir,
  elevatorTarget,
  floorToPct,
  randomVerticalDir,
  swipeMatchesDir,
  useTraceSound,
} from '@/components/game/occupational/level3/session4/directionUtils';
import { useDirectionAnalytics } from '@/components/game/occupational/level3/session4/useDirectionAnalytics';
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
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Awesome!', 'Perfect Direction!', 'Great Job!', 'You Did It!'];

export type VerticalGestureMode = 'swipeUp' | 'swipeDown' | 'elevator' | 'arrowMatch' | 'rainCatch';

export type VerticalGestureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  objectEmoji: string;
  objectColors: [string, string];
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

export type VerticalGestureGameConfig = {
  theme: VerticalGestureTheme;
  mode: VerticalGestureMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsUp: string;
  ttsDown: string;
  ttsWrongUp?: string;
  ttsWrongDown?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const VerticalGestureGame: React.FC<
  VerticalGestureGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsUp,
  ttsDown,
  ttsWrongUp = 'Try swiping up!',
  ttsWrongDown = 'Try swiping down!',
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
    recordDirectionError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useDirectionAnalytics();

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
  const [arrowDir, setArrowDir] = useState<VerticalDir>('up');
  const [requiredDir, setRequiredDir] = useState<VerticalDir>('up');
  const [statusHint, setStatusHint] = useState('');
  const [rainActive, setRainActive] = useState(false);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [elevator, setElevator] = useState({ current: 1, target: 3, floors: 5 });
  const [balloonCount, setBalloonCount] = useState(1);
  const [dropEmojis] = useState(['⚽', '⭐', '🎁', '☁️']);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const arrowDirRef = useRef<VerticalDir>('up');
  const requiredDirRef = useRef<VerticalDir>('up');
  const elevatorRef = useRef(elevator);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playH = useRef(360);
  const wiggle = useSharedValue(0);
  const objY = useSharedValue(P.objectStartDownPct);
  const objScale = useSharedValue(1);
  const arrowPulse = useSharedValue(1);

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
    arrowDirRef.current = arrowDir;
  }, [arrowDir]);
  useEffect(() => {
    requiredDirRef.current = requiredDir;
  }, [requiredDir]);
  useEffect(() => {
    elevatorRef.current = elevator;
  }, [elevator]);

  const tier = difficultyTier(round, P.verticalRounds);

  const objStyle = useAnimatedStyle(() => ({
    top: `${objY.value}%`,
    transform: [{ scale: objScale.value }, { translateX: wiggle.value }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ scale: arrowPulse.value }] }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const getRequiredDir = useCallback((): VerticalDir => {
    if (mode === 'arrowMatch') return arrowDirRef.current;
    if (mode === 'elevator') return elevatorRef.current.target > elevatorRef.current.current ? 'up' : 'down';
    if (mode === 'swipeDown') return 'down';
    if (mode === 'rainCatch' || mode === 'swipeUp') {
      if (mixedDirectionRound(roundRef.current, P.verticalRounds)) return requiredDirRef.current;
      return 'up';
    }
    return 'up';
  }, [mode]);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 18 + snap.spatialAwarenessScore * 0.15);
      setFinalStats({ correct: finalScore, total: P.verticalRounds, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRainActive(false);
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total: P.verticalRounds,
            accuracy: snap.spatialAwarenessScore,
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
    [analyticsMeta, analyticsSnapshot, clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(
    (dir: VerticalDir, swipeScore: number) => {
      setSparkleKey(Date.now());
      setCoins((c) => c + 5);
      setCueSuccess(true);
      recordSuccess({ dir, score: swipeScore });
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

  const failAttempt = useCallback(
    (need: VerticalDir) => {
      recordDirectionError();
      playWarn();
      wiggle.value = withSequence(withTiming(10, { duration: 60 }), withTiming(-10, { duration: 60 }), withTiming(0));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setCueSuccess(false);
      setWarnVisible(true);
      setTimeout(() => {
        setWarnVisible(false);
        setCueSuccess(undefined);
      }, 800);
      speakTTS(need === 'up' ? ttsWrongUp : ttsWrongDown, 0.78).catch(() => {});
    },
    [playWarn, recordDirectionError, ttsWrongDown, ttsWrongUp, wiggle],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setRainActive(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.verticalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(
    (need: VerticalDir, swipeScore: number) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore(need, swipeScore);
      if (mode === 'elevator') {
        objY.value = withTiming(floorToPct(elevatorRef.current.target, elevatorRef.current.floors), { duration: 450 });
      } else if (need === 'up') objY.value = withTiming(P.objectEndUpPct, { duration: 450 });
      else objY.value = withTiming(P.objectEndDownPct, { duration: 450 });
      objScale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 150 }));
      roundTimerRef.current = setTimeout(() => advanceRound(), 650);
    },
    [advanceRound, bumpScore, mode, objScale, objY],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    setRoundActive(true);
    setBalloonCount(balloonCountForRound(roundRef.current));

    if (mode === 'arrowMatch') {
      const dir = randomVerticalDir();
      setArrowDir(dir);
      arrowDirRef.current = dir;
      objY.value = 62;
      const speed = tier >= 4 ? 280 : 400;
      arrowPulse.value = withRepeat(
        withSequence(withTiming(1.18, { duration: speed }), withTiming(1, { duration: speed })),
        -1,
        true,
      );
      setStatusHint(dir === 'up' ? 'Swipe UP!' : 'Swipe DOWN!');
      speakTTS(dir === 'up' ? ttsUp : ttsDown, 0.78).catch(() => {});
      return;
    }

    if (mode === 'elevator') {
      const e = elevatorTarget(roundRef.current, P.verticalRounds);
      setElevator(e);
      elevatorRef.current = e;
      objY.value = floorToPct(e.current, e.floors);
      setStatusHint(e.dir === 'up' ? `Go UP to Floor ${e.target}!` : `Go DOWN to Floor ${e.target}!`);
      speakTTS(e.dir === 'up' ? ttsUp : ttsDown, 0.78).catch(() => {});
      return;
    }

    if (mode === 'rainCatch') {
      objY.value = P.objectStartDownPct;
      setRainActive(true);
      setStatusHint('Reach up — catch the rain!');
      speakTTS(ttsUp, 0.78).catch(() => {});
      return;
    }

    if (mode === 'swipeDown') {
      const emoji = dropEmojis[roundRef.current % dropEmojis.length];
      objY.value = P.objectStartUpPct;
      setStatusHint(`Swipe DOWN the ${emoji}!`);
      speakTTS(ttsDown, 0.78).catch(() => {});
      return;
    }

    let need: VerticalDir = 'up';
    if (mixedDirectionRound(roundRef.current, P.verticalRounds)) {
      need = randomVerticalDir();
      setRequiredDir(need);
      requiredDirRef.current = need;
    }
    objY.value = need === 'up' ? P.objectStartDownPct : P.objectStartUpPct;
    setStatusHint(need === 'up' ? 'Swipe UP!' : 'Swipe DOWN!');
    speakTTS(need === 'up' ? ttsUp : ttsDown, 0.78).catch(() => {});
  }, [arrowPulse, dropEmojis, mode, objY, startAnalyticsRound, tier, ttsDown, ttsUp]);

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

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

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const need = getRequiredDir();
      if (need === 'up' && e.translationY < 0) {
        const base = mode === 'elevator' ? floorToPct(elevatorRef.current.current, elevatorRef.current.floors) : P.objectStartDownPct;
        objY.value = Math.max(P.objectEndUpPct, base + (e.translationY / playH.current) * 100);
      } else if (need === 'down' && e.translationY > 0) {
        const base = mode === 'elevator' ? floorToPct(elevatorRef.current.current, elevatorRef.current.floors) : P.objectStartUpPct;
        objY.value = Math.min(P.objectEndDownPct, base + (e.translationY / playH.current) * 50);
      }
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      const need = getRequiredDir();
      const { ok, score: swipeScore } = swipeMatchesDir(e.translationX, e.translationY, dist, need, tier);
      if (ok) completeRound(need, swipeScore);
      else if (dist >= swipeThreshold(tier) * 0.5) failAttempt(need);
    });

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n☁️ Sky Festival!\n⬆️ ${a.upwardSwipeAccuracy}% · ⬇️ ${a.downwardSwipeAccuracy}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.spatialAwarenessScore}
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

  const displayDir = mode === 'arrowMatch' ? arrowDir : getRequiredDir();

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
        <Text style={[styles.title, { color: T.titleColor }]}>{T.emoji} {T.title}</Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{round}/{P.verticalRounds}</Text>
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
        {roundActive && <DirectionBadge visible dir={displayDir} success={cueSuccess} />}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playH.current = e.nativeEvent.layout.height;
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'elevator' && (
            <ElevatorBuilding floors={elevator.floors} current={elevator.current} target={elevator.target} accent={T.accent} />
          )}

          {roundActive && mode === 'arrowMatch' && (
            <Animated.View style={[styles.arrowCue, arrowStyle]}>
              <Text style={styles.arrowEmoji}>{arrowDir === 'up' ? '⬆️' : '⬇️'}</Text>
            </Animated.View>
          )}

          {roundActive && rainActive && <RainDrops active count={P.rainDropsPerRound} />}

          {roundActive && mode !== 'arrowMatch' && (
            <Animated.View style={[styles.objectRow, objStyle]}>
              {Array.from({ length: balloonCount }).map((_, i) => (
                <View key={i} style={[styles.objectBubble, i > 0 && { marginLeft: -20 }]}>
                  <LinearGradient colors={T.objectColors} style={styles.objectGrad}>
                    <Text style={styles.objectEmoji}>
                      {mode === 'swipeDown' ? dropEmojis[round % dropEmojis.length] : T.objectEmoji}
                    </Text>
                  </LinearGradient>
                  {(mode === 'swipeUp' || mode === 'rainCatch') && i === 0 && <View style={styles.string} />}
                </View>
              ))}
            </Animated.View>
          )}

          {roundActive && mode === 'arrowMatch' && (
            <Animated.View style={[styles.character, objStyle]}>
              <Text style={styles.charEmoji}>🦅</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again — check direction!</Text>
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
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.22)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.18)' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  objectRow: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-end' },
  objectBubble: { alignItems: 'center' },
  objectGrad: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  objectEmoji: { fontSize: 44 },
  string: { width: 2, height: 40, backgroundColor: '#78350F', marginTop: 4 },
  arrowCue: { position: 'absolute', alignSelf: 'center', top: '26%' },
  arrowEmoji: { fontSize: 72 },
  character: { position: 'absolute', alignSelf: 'center' },
  charEmoji: { fontSize: 56 },
  warnPill: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: 'rgba(254,226,226,0.92)', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  warnText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
});

export default VerticalGestureGame;
