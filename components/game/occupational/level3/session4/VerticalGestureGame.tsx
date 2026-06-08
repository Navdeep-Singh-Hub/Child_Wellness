/**
 * Shared up/down vertical gesture game core for OT Level 3 Session 4.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION4_PACING } from '@/components/game/occupational/level3/session4/session4Pacing';
import {
  ElevatorFloor,
  VerticalDir,
  randomFloor,
  randomVerticalDir,
  swipeMatchesDir,
  useTraceSound,
} from '@/components/game/occupational/level3/session4/directionUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

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

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [arrowDir, setArrowDir] = useState<VerticalDir>('up');
  const [targetFloor, setTargetFloor] = useState<ElevatorFloor>('top');
  const [statusHint, setStatusHint] = useState('');
  const [rainVisible, setRainVisible] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const arrowDirRef = useRef<VerticalDir>('up');
  const targetFloorRef = useRef<ElevatorFloor>('top');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playH = useRef(360);

  const objY = useSharedValue(75);
  const objScale = useSharedValue(1);
  const arrowPulse = useSharedValue(1);
  const rainOffset = useSharedValue(0);

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
    targetFloorRef.current = targetFloor;
  }, [targetFloor]);

  const objStyle = useAnimatedStyle(() => ({
    top: `${objY.value}%`,
    transform: [{ scale: objScale.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arrowPulse.value }],
  }));

  const rainStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rainOffset.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (rainTimerRef.current) {
      clearTimeout(rainTimerRef.current);
      rainTimerRef.current = null;
    }
  }, []);

  const requiredDir = useCallback((): VerticalDir => {
    if (mode === 'swipeUp' || mode === 'rainCatch') return 'up';
    if (mode === 'swipeDown') return 'down';
    if (mode === 'arrowMatch') return arrowDirRef.current;
    return targetFloorRef.current === 'top' ? 'up' : 'down';
  }, [mode]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRainVisible(false);
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
    [clearTimers, logType, router, skillTags, ttsComplete],
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

  const failAttempt = useCallback(
    (dir: VerticalDir) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(dir === 'up' ? ttsWrongUp : ttsWrongDown, 0.78).catch(() => {});
      if (mode === 'swipeUp' || mode === 'rainCatch') objY.value = withTiming(P.objectStartDownPct, { duration: 250 });
      else if (mode === 'swipeDown') objY.value = withTiming(P.objectStartUpPct, { duration: 250 });
    },
    [mode, objY, playWarn, ttsWrongDown, ttsWrongUp],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setRainVisible(false);
    roundCompleteRef.current = false;
    rainOffset.value = 0;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, rainOffset]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    bumpScore();
    const dir = requiredDir();
    if (mode === 'elevator') {
      objY.value = withTiming(
        targetFloorRef.current === 'top' ? P.elevatorTopPct : P.elevatorGroundPct,
        { duration: 450 },
      );
    } else if (dir === 'up') objY.value = withTiming(P.objectEndUpPct, { duration: 450 });
    else objY.value = withTiming(P.objectEndDownPct, { duration: 450 });
    objScale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 150 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, mode, objScale, objY, requiredDir]);

  const startRain = useCallback(() => {
    setRainVisible(true);
    rainOffset.value = 0;
    rainOffset.value = withRepeat(withTiming(120, { duration: 1400 }), -1, false);
  }, [rainOffset]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);

    if (mode === 'arrowMatch') {
      const dir = randomVerticalDir();
      setArrowDir(dir);
      arrowDirRef.current = dir;
      objY.value = 62;
      arrowPulse.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 400 }), withTiming(1, { duration: 400 })),
        -1,
        true,
      );
      setStatusHint(dir === 'up' ? 'Swipe UP!' : 'Swipe DOWN!');
      speakTTS(dir === 'up' ? ttsUp : ttsDown, 0.78).catch(() => {});
      return;
    }

    if (mode === 'elevator') {
      const floor = randomFloor();
      setTargetFloor(floor);
      targetFloorRef.current = floor;
      objY.value = floor === 'top' ? P.elevatorGroundPct : P.elevatorTopPct;
      setStatusHint(floor === 'top' ? 'Go to TOP floor!' : 'Go to GROUND floor!');
      speakTTS(floor === 'top' ? ttsUp : ttsDown, 0.78).catch(() => {});
      return;
    }

    if (mode === 'rainCatch') {
      objY.value = P.objectStartDownPct;
      setStatusHint('Hands up — catch the rain!');
      startRain();
      speakTTS(ttsUp, 0.78).catch(() => {});
      return;
    }

    if (mode === 'swipeDown') {
      objY.value = P.objectStartUpPct;
      setStatusHint('Swipe DOWN!');
      speakTTS(ttsDown, 0.78).catch(() => {});
      return;
    }

    objY.value = P.objectStartDownPct;
    setStatusHint('Swipe UP!');
    speakTTS(ttsUp, 0.78).catch(() => {});
  }, [arrowPulse, mode, objY, startRain, ttsDown, ttsUp]);

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
      if (mode === 'swipeUp' || mode === 'rainCatch') {
        if (e.translationY < 0) {
          const pct = Math.max(P.objectEndUpPct, P.objectStartDownPct + (e.translationY / playH.current) * 100);
          objY.value = pct;
        }
      } else if (mode === 'swipeDown') {
        if (e.translationY > 0) {
          const pct = Math.min(P.objectEndDownPct, P.objectStartUpPct + (e.translationY / playH.current) * 100);
          objY.value = pct;
        }
      } else if (mode === 'elevator') {
        const base = targetFloorRef.current === 'top' ? P.elevatorGroundPct : P.elevatorTopPct;
        const pct = Math.max(P.elevatorTopPct, Math.min(P.elevatorGroundPct, base + (e.translationY / playH.current) * 50));
        objY.value = pct;
      }
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      const need = requiredDir();
      if (swipeMatchesDir(e.translationY, dist, need, P.swipeThreshold)) {
        completeRound();
      } else if (dist >= P.swipeThreshold) {
        failAttempt(need);
      }
    });

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

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playH.current = e.nativeEvent.layout.height;
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'arrowMatch' && (
            <Animated.View style={[styles.arrowCue, arrowStyle]}>
              <Text style={styles.arrowEmoji}>{arrowDir === 'up' ? '⬆️' : '⬇️'}</Text>
            </Animated.View>
          )}

          {roundActive && mode === 'elevator' && (
            <View style={styles.elevatorShaft}>
              <Text style={[styles.floorLabel, { top: '12%', color: T.accentDark }]}>TOP</Text>
              <Text style={[styles.floorLabel, { top: '68%', color: T.accentDark }]}>GROUND</Text>
            </View>
          )}

          {roundActive && rainVisible && (
            <Animated.View style={[styles.rainRow, rainStyle]}>
              <Text style={styles.rainEmoji}>💧💧💧</Text>
            </Animated.View>
          )}

          {roundActive && mode !== 'arrowMatch' && (
            <Animated.View style={[styles.objectWrap, objStyle]}>
              <LinearGradient colors={T.objectColors} style={styles.objectBubble}>
                <Text style={styles.objectEmoji}>{T.objectEmoji}</Text>
              </LinearGradient>
              {(mode === 'swipeUp' || mode === 'rainCatch') && <View style={styles.string} />}
            </Animated.View>
          )}

          {roundActive && mode === 'arrowMatch' && (
            <Animated.View style={[styles.character, objStyle]}>
              <Text style={styles.charEmoji}>🧒</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>

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
  hint: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  objectWrap: { position: 'absolute', alignSelf: 'center', alignItems: 'center' },
  objectBubble: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  objectEmoji: { fontSize: 52 },
  string: { width: 2, height: 48, backgroundColor: '#78350F', marginTop: 4 },
  arrowCue: { position: 'absolute', alignSelf: 'center', top: '28%' },
  arrowEmoji: { fontSize: 72 },
  character: { position: 'absolute', alignSelf: 'center' },
  charEmoji: { fontSize: 56 },
  elevatorShaft: { ...StyleSheet.absoluteFillObject },
  floorLabel: { position: 'absolute', left: 12, fontSize: 12, fontWeight: '800' },
  rainRow: { position: 'absolute', alignSelf: 'center', top: '8%' },
  rainEmoji: { fontSize: 28, letterSpacing: 8 },
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

export default VerticalGestureGame;
