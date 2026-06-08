/**
 * Shared left-to-right drag game core for OT Level 4 Session 1.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { DragColor, distPx, randomDragColor, useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';
import { SESSION4_1_PACING } from '@/components/game/occupational/level4/session1/session1Pacing';
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
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_1_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type HorizontalDragMode = 'ballTransfer' | 'feedMonster' | 'roadCrossing' | 'colorMatch' | 'timedDrag';

export type HorizontalDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  draggableEmoji: string;
  targetEmoji: string;
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
  zoneBorder: string;
};

export type HorizontalDragGameConfig = {
  theme: HorizontalDragTheme;
  mode: HorizontalDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsColorWrong?: string;
  ttsTimed?: string;
  ttsTimedMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const HorizontalDragGame: React.FC<
  HorizontalDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Drag to the right target!',
  ttsMiss = 'Try dragging to the right zone!',
  ttsColorWrong = 'Colors must match!',
  ttsTimed = 'Drag fast — beat the clock!',
  ttsTimedMiss = 'Too slow — try again!',
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
  const [statusHint, setStatusHint] = useState('');
  const [dragColor, setDragColor] = useState<DragColor>(randomDragColor());
  const [timeLeftMs, setTimeLeftMs] = useState(P.timedLimitMs);
  const [timerActive, setTimerActive] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const timerActiveRef = useRef(false);
  const dragColorRef = useRef(dragColor);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(72);
  const startY = useRef(200);
  const targetX = useRef(288);
  const targetY = useRef(200);

  const objX = useSharedValue(72);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);

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
    timerActiveRef.current = timerActive;
  }, [timerActive]);
  useEffect(() => {
    dragColorRef.current = dragColor;
  }, [dragColor]);

  const objStyle = useAnimatedStyle(() => ({
    left: objX.value - 34,
    top: objY.value - 34,
    transform: [{ scale: objScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    cancelAnimation(objX);
    cancelAnimation(objY);
  }, [objX, objY]);

  const layoutPositions = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    startX.current = w * P.startXPct;
    targetX.current = w * P.targetXPct;
    startY.current = h * P.objectYPct;
    targetY.current = h * (mode === 'feedMonster' ? P.monsterTargetYPct : P.objectYPct);
    objX.value = startX.current;
    objY.value = startY.current;
  }, [mode, objX, objY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setTimerActive(false);
      timerActiveRef.current = false;
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

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const resetObject = useCallback(() => {
    objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    objScale.value = withTiming(1, { duration: 120 });
  }, [objScale, objX, objY]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setTimerActive(false);
    timerActiveRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    bumpScore();
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    if (mode === 'timedDrag') {
      setTimerActive(false);
      timerActiveRef.current = false;
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, mode, objScale]);

  const failTimedRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setTimerActive(false);
    timerActiveRef.current = false;
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    showWarn(ttsTimedMiss);
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, showWarn, ttsTimedMiss]);

  const startTimedCountdown = useCallback(() => {
    setTimeLeftMs(P.timedLimitMs);
    setTimerActive(true);
    timerActiveRef.current = true;
    tickTimerRef.current = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = prev - P.timedTickMs;
        if (next <= 0) {
          if (tickTimerRef.current) clearInterval(tickTimerRef.current);
          if (roundActiveRef.current && !roundCompleteRef.current) {
            failTimedRound();
          }
          return 0;
        }
        return next;
      });
    }, P.timedTickMs);
  }, [failTimedRound]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutPositions();
    if (mode === 'colorMatch') {
      const c = randomDragColor();
      setDragColor(c);
      dragColorRef.current = c;
    }
    setStatusHint(mode === 'timedDrag' ? 'Beat the clock!' : 'Drag left to right!');
    if (mode === 'timedDrag') {
      speakTTS(ttsTimed, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => startTimedCountdown(), 300);
    } else {
      speakTTS(ttsDrag, 0.78).catch(() => {});
    }
  }, [layoutPositions, mode, startTimedCountdown, ttsDrag, ttsTimed]);

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
    .onBegin(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'timedDrag' && !timerActiveRef.current) return;
      objScale.value = withTiming(1.15, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'timedDrag' && !timerActiveRef.current) return;
      const half = 34;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'timedDrag' && !timerActiveRef.current) return;
      objScale.value = withTiming(1, { duration: 100 });
      const d = distPx(objX.value, objY.value, targetX.current, targetY.current);
      if (d <= P.matchTolerancePx) {
        completeRound();
        return;
      }
      if (mode === 'colorMatch' && d <= P.matchTolerancePx * 1.4) {
        showWarn(ttsColorWrong);
      } else {
        showWarn(ttsMiss);
      }
      resetObject();
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

  const timerPct = (timeLeftMs / P.timedLimitMs) * 100;
  const targetBorderColor = mode === 'colorMatch' ? dragColor.hex : T.zoneBorder;

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
        {mode === 'timedDrag' && timerActive && (
          <View style={[styles.timerTrack, { borderColor: T.accent }]}>
            <View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutPositions();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'roadCrossing' && (
            <>
              <View style={[styles.roadLane, { left: '8%', borderColor: T.zoneBorder }]} />
              <View style={[styles.roadLane, { left: '72%', borderColor: T.zoneBorder }]} />
            </>
          )}

          {roundActive && (
            <>
              <View style={[styles.zone, styles.leftZone, { borderColor: T.zoneBorder, left: '6%' }]}>
                <Text style={[styles.zoneLabel, { color: T.accentDark }]}>FROM</Text>
                {mode !== 'colorMatch' && mode !== 'ballTransfer' && (
                  <Text style={styles.zoneEmoji}>{mode === 'feedMonster' ? '🍎' : T.draggableEmoji}</Text>
                )}
              </View>
              <View
                style={[
                  styles.zone,
                  styles.rightZone,
                  { borderColor: targetBorderColor, left: '68%' },
                  mode === 'colorMatch' && { backgroundColor: `${dragColor.hex}22` },
                ]}
              >
                <Text style={[styles.zoneLabel, { color: T.accentDark }]}>TO</Text>
                <Text style={styles.zoneEmoji}>
                  {mode === 'colorMatch' ? dragColor.emoji : T.targetEmoji}
                </Text>
              </View>
            </>
          )}

          {roundActive && (
            <Animated.View
              style={[
                styles.draggable,
                objStyle,
                mode === 'colorMatch' && { backgroundColor: `${dragColor.hex}33`, borderColor: dragColor.hex },
              ]}
            >
              <Text style={styles.dragEmoji}>
                {mode === 'colorMatch' ? dragColor.emoji : T.draggableEmoji}
              </Text>
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
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  timerTrack: { width: '70%', height: 10, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  timerFill: { height: '100%', borderRadius: 8 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  roadLane: {
    position: 'absolute',
    top: '18%',
    width: '20%',
    height: '64%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  zone: {
    position: 'absolute',
    top: '32%',
    width: '22%',
    height: '36%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  leftZone: {},
  rightZone: {},
  zoneLabel: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  zoneEmoji: { fontSize: 36 },
  draggable: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragEmoji: { fontSize: 40 },
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

export default HorizontalDragGame;
