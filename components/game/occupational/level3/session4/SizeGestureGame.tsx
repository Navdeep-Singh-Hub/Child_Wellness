/**
 * Sky & Ground — OT Level 3 Session 4 size-control engine (games 6–10).
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CreaturePinchView } from '@/components/game/occupational/level3/session2/components/CreaturePinchView';
import { DirectionBadge } from '@/components/game/occupational/level3/session4/components/DirectionBadge';
import {
  SESSION4_PACING,
  difficultyTier,
  dotSizeForRound,
} from '@/components/game/occupational/level3/session4/session4Pacing';
import {
  SizeKind,
  pinchMatchesSize,
  randomSize,
  swipeMatchesSize,
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
import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_PACING;
const { width: SW, height: SH } = Dimensions.get('window');
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Awesome!', 'Perfect Direction!', 'Great Job!', 'You Did It!'];
const OBJECTS = ['🎈', '⭐', '☁️', '💧', '🦅'];

export type SizeGestureMode = 'bigTap' | 'smallDot' | 'bigSmallSwitch' | 'balloonInflate' | 'compareMove';

export type SizeGestureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  bigColor: string;
  smallColor: string;
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
  objectEmoji?: string;
};

export type SizeGestureGameConfig = {
  theme: SizeGestureTheme;
  mode: SizeGestureMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsBig: string;
  ttsSmall: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const SizeGestureGame: React.FC<
  SizeGestureGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsBig,
  ttsSmall,
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
  } = useDirectionAnalytics();

  const totalRounds =
    mode === 'smallDot'
      ? P.smallDotRounds
      : mode === 'bigSmallSwitch'
        ? P.switchRounds
        : P.sizeRounds;

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
  const [showCue, setShowCue] = useState(false);
  const [target, setTarget] = useState<SizeKind>('big');
  const [dotPos, setDotPos] = useState({ x: SW * 0.5, y: SH * 0.45 });
  const [compareObject, setCompareObject] = useState(OBJECTS[0]);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [pinchCelebrate, setPinchCelebrate] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const targetRef = useRef<SizeKind>('big');
  const panStart = useRef({ x: 0, y: 0, t: 0 });
  const shakeX = useSharedValue(0);
  const bigScale = useSharedValue(0);
  const dotScale = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const bigAnim = useAnimatedStyle(() => ({ transform: [{ scale: bigScale.value }] }));
  const dotAnim = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }));

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const tier = difficultyTier(round, totalRounds);
  const dotSize = dotSizeForRound(round, totalRounds);

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 18 + snap.spatialAwarenessScore * 0.15);
      setFinalStats({ correct: finalScore, total: totalRounds, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total: totalRounds,
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
    [analyticsMeta, analyticsSnapshot, logType, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    setCoins((c) => c + 5);
    setCueSuccess(true);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    praiseVoice();
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    setTimeout(() => setCueSuccess(undefined), 650);
  }, [playSuccess, praiseVoice]);

  const failAttempt = useCallback(() => {
    recordError();
    playWarn();
    shakeX.value = withSequence(withSpring(8), withSpring(-8), withSpring(0));
    setCueSuccess(false);
    setWarnVisible(true);
    setTimeout(() => {
      setWarnVisible(false);
      setCueSuccess(undefined);
    }, 800);
  }, [playWarn, recordError, shakeX]);

  const advanceRound = useCallback(() => {
    setShowCue(false);
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [endGame, totalRounds]);

  const finishAttempt = useCallback(
    (ok: boolean, opts?: { sizeScore?: number; precision?: number }) => {
      if (ok) {
        recordSuccess({ sizeScore: opts?.sizeScore, precision: opts?.precision });
        bumpScore();
      } else failAttempt();
      setShowCue(false);
      setTimeout(() => advanceRound(), ok ? 600 : P.nextRoundDelayMs);
    },
    [advanceRound, bumpScore, failAttempt, recordSuccess],
  );

  const setupRound = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    const next = randomSize();
    setTarget(next);
    setCompareObject(OBJECTS[roundRef.current % OBJECTS.length]!);
    setDotPos({
      x: 60 + Math.random() * (SW - 120),
      y: SH * 0.28 + Math.random() * (SH * 0.35),
    });
    setPinchCelebrate(false);
    bigScale.value = 0;
    dotScale.value = 0;
    setTimeout(() => {
      setShowCue(true);
      bigScale.value = withSpring(1);
      dotScale.value = withSpring(1);
      if (mode === 'bigTap') speakTTS(ttsBig, 0.78).catch(() => {});
      else if (mode === 'smallDot') speakTTS('Tap the small dot!', 0.78).catch(() => {});
      else if (mode === 'balloonInflate')
        speakTTS(next === 'big' ? 'Make it BIG!' : 'Make it SMALL!', 0.78).catch(() => {});
      else if (mode === 'compareMove')
        speakTTS(next === 'big' ? 'Big object — BIG swipe!' : 'Small object — small swipe!', 0.78).catch(() => {});
      else speakTTS(next === 'big' ? ttsBig : ttsSmall, 0.78).catch(() => {});
    }, P.roundStartDelayMs);
  }, [bigScale, dotScale, mode, startAnalyticsRound, ttsBig, ttsSmall]);

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    setupRound();
  }, [round, setupRound, ttsIntro]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
    },
    [],
  );

  const panBigTap = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      panStart.current = { x: e.x, y: e.y, t: Date.now() };
    })
    .onEnd((e) => {
      if (!showCue || doneRef.current) return;
      const dist = Math.sqrt((e.x - panStart.current.x) ** 2 + (e.y - panStart.current.y) ** 2);
      const ok = dist >= P.bigTapMinDist || dist / Math.max(SW, SH) >= P.bigTapMinScreenPct;
      finishAttempt(ok, { sizeScore: ok ? 100 : 0 });
    });

  const panCompare = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      panStart.current = { x: e.x, y: e.y, t: Date.now() };
    })
    .onEnd((e) => {
      if (!showCue || doneRef.current) return;
      const dist = Math.sqrt((e.x - panStart.current.x) ** 2 + (e.y - panStart.current.y) ** 2);
      const { ok, score: s } = swipeMatchesSize(dist, targetRef.current, tier);
      finishAttempt(ok, { sizeScore: s });
    });

  const handleDotTap = () => {
    if (!showCue || doneRef.current) return;
    finishAttempt(true, { precision: 100 });
  };

  const handleSwitchTap = (choice: SizeKind) => {
    if (!showCue || doneRef.current) return;
    finishAttempt(choice === targetRef.current, { precision: choice === targetRef.current ? 100 : 0 });
  };

  const handlePinchEnd = (scale: number) => {
    const { ok, score: s } = pinchMatchesSize(scale, targetRef.current, tier);
    if (ok) setPinchCelebrate(true);
    finishAttempt(ok, { sizeScore: s });
  };

  const renderContent = () => {
    if (mode === 'bigTap') {
      return (
        <GestureDetector gesture={panBigTap}>
          <Animated.View style={[styles.bigTarget, bigAnim, { backgroundColor: T.bigColor }]}>
            <Text style={styles.bigLabel}>BIG TAP!</Text>
            <Text style={styles.bigHint}>Tap or swipe big anywhere</Text>
          </Animated.View>
        </GestureDetector>
      );
    }
    if (mode === 'smallDot') {
      return (
        <Pressable onPress={handleDotTap} style={StyleSheet.absoluteFill}>
          {showCue && (
            <Animated.View
              style={[
                dotAnim,
                styles.dot,
                {
                  left: dotPos.x - dotSize / 2,
                  top: dotPos.y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: T.smallColor,
                },
              ]}
            />
          )}
        </Pressable>
      );
    }
    if (mode === 'bigSmallSwitch') {
      const isBig = target === 'big';
      return (
        <View style={styles.switchRow}>
          <Pressable
            onPress={() => handleSwitchTap('big')}
            style={[styles.switchBig, { backgroundColor: T.bigColor, opacity: isBig ? 1 : 0.55 }]}
          >
            <Text style={styles.switchLabel}>BIG</Text>
          </Pressable>
          <Pressable
            onPress={() => handleSwitchTap('small')}
            style={[styles.switchSmall, { backgroundColor: T.smallColor, opacity: !isBig ? 1 : 0.55 }]}
          >
            <Text style={styles.switchLabelSmall}>S</Text>
          </Pressable>
        </View>
      );
    }
    if (mode === 'balloonInflate') {
      return (
        <CreaturePinchView
          emoji={T.objectEmoji ?? '🎈'}
          target={target}
          targetBig={P.inflateBigTarget}
          targetSmall={P.inflateSmallTarget}
          minScale={P.inflateMinScale}
          maxScale={P.inflateMaxScale}
          baseSize={150}
          bigColor={T.bigColor}
          active={showCue}
          celebrate={pinchCelebrate}
          onScaleEnd={handlePinchEnd}
        />
      );
    }
    const objSize = target === 'big' ? 140 : 48;
    return (
      <GestureDetector gesture={panCompare}>
        <View style={styles.compareWrap}>
          <View style={[styles.compareObj, { width: objSize, height: objSize, borderRadius: objSize / 2, backgroundColor: T.accent }]}>
            <Text style={{ fontSize: objSize * 0.45 }}>{compareObject}</Text>
          </View>
          <Text style={[styles.compareHint, { color: T.subtitleColor }]}>Swipe {target === 'big' ? 'BIG' : 'small'}!</Text>
        </View>
      </GestureDetector>
    );
  };

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n☁️ Sky Festival!\n🏆 Direction Score ${a.spatialAwarenessScore}%`}
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
  if (done) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); onBack?.(); }} style={styles.backBtn}>
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
            <Text style={[styles.statValue, { color: T.statValue }]}>{round}/{totalRounds}</Text>
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
        {showCue && mode !== 'smallDot' && (
          <DirectionBadge
            visible
            dir={null}
            label={target === 'big' ? 'BIG' : 'SMALL'}
            success={cueSuccess}
          />
        )}
      </View>

      <Animated.View style={[styles.playArea, shakeStyle, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {renderContent()}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </Animated.View>

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
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.22)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.18)' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bigTarget: { width: SW * 0.78, height: SW * 0.78, maxWidth: 340, maxHeight: 340, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  bigLabel: { fontSize: 36, fontWeight: '900', color: '#fff' },
  bigHint: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  dot: { position: 'absolute', borderWidth: 2, borderColor: '#fff' },
  switchRow: { flexDirection: 'row', gap: 32, alignItems: 'center' },
  switchBig: { width: P.bigCircleSize, height: P.bigCircleSize, borderRadius: P.bigCircleSize / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  switchSmall: { width: P.smallCircleSize, height: P.smallCircleSize, borderRadius: P.smallCircleSize / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  switchLabel: { fontSize: 22, fontWeight: '900', color: '#fff' },
  switchLabelSmall: { fontSize: 14, fontWeight: '900', color: '#fff' },
  compareWrap: { alignItems: 'center', gap: 20 },
  compareObj: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  compareHint: { fontSize: 18, fontWeight: '800' },
  warnPill: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: 'rgba(254,226,226,0.92)', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  warnText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
});

export default SizeGestureGame;
