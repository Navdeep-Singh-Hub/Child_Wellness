/**
 * Shared right-to-left drag game core for OT Level 4 Session 2.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { CrossReachPlayArea } from '@/components/game/occupational/level4/session2/crossReach/CrossReachVisuals';
import { ReturnPassPlayArea } from '@/components/game/occupational/level4/session2/returnPass/ReturnPassVisuals';
import { StarSweepPlayArea } from '@/components/game/occupational/level4/session2/starSweep/StarSweepVisuals';
import { distPx, useTraceSound } from '@/components/game/occupational/level4/session2/shared/reverseDragUtils';
import { STAR_SWEEP_STARS } from '@/components/game/occupational/level4/session2/starSweep/starSweepTheme';
import { SESSION4_2_PACING } from '@/components/game/occupational/level4/session2/shared/session2Pacing';
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
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_2_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type ReverseHorizontalDragMode = 'ballTransfer' | 'collectStars' | 'mirrorDrag';

export type ReverseHorizontalDragTheme = {
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

export type ReverseHorizontalDragGameConfig = {
  theme: ReverseHorizontalDragTheme;
  mode: ReverseHorizontalDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsGoal?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const ReverseHorizontalDragGame: React.FC<
  ReverseHorizontalDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Drag to the left target!',
  ttsMiss = 'Try dragging to the left zone!',
  ttsGoal = 'Great job!',
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
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [successToast, setSuccessToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [starEmoji, setStarEmoji] = useState<string>(STAR_SWEEP_STARS[0]);
  const [collectKey, setCollectKey] = useState(0);
  const [reachKey, setReachKey] = useState(0);
  const [reachPct, setReachPct] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(288);
  const startY = useRef(200);
  const targetX = useRef(72);
  const targetY = useRef(200);

  const objX = useSharedValue(288);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);
  const objSpin = useSharedValue(0);
  const playShake = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const objStyle = useAnimatedStyle(() => ({
    left: objX.value - 34,
    top: objY.value - 34,
    transform: [{ scale: objScale.value }, { rotate: `${objSpin.value}deg` }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.92 + kickOffOpacity.value * 0.08 }],
  }));

  const ballShadowStyle = useAnimatedStyle(() => ({
    left: objX.value - 28,
    top: objY.value + 20,
    opacity: 0.22 + (objScale.value - 1) * 0.15,
    transform: [{ scaleX: 1 + (objScale.value - 1) * 0.3 }, { scaleY: 0.55 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
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
    targetY.current = h * P.objectYPct;
    objX.value = startX.current;
    objY.value = startY.current;
  }, [objX, objY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
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

  const shakePlayArea = useCallback(() => {
    playShake.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(-5, { duration: 45 }),
      withTiming(5, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [playShake]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnMessage(
        mode === 'ballTransfer'
          ? 'Wide shot!'
          : mode === 'collectStars'
            ? 'Drifted away!'
            : mode === 'mirrorDrag'
              ? 'Short reach!'
              : 'Try again!',
      );
      setWarnVisible(true);
      if (mode === 'ballTransfer' || mode === 'collectStars' || mode === 'mirrorDrag') shakePlayArea();
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [mode, playWarn, shakePlayArea],
  );

  const resetObject = useCallback(() => {
    objX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    objY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    objScale.value = withTiming(1, { duration: 120 });
    setReachPct(0);
  }, [objScale, objX, objY]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setIsDragging(false);
    setKickOffVisible(false);
    kickOffOpacity.value = withTiming(0, { duration: 120 });
    bumpScore();
    if (mode === 'ballTransfer' || mode === 'collectStars' || mode === 'mirrorDrag') {
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 700);
      speakTTS(ttsGoal, 0.82).catch(() => {});
      if (mode === 'collectStars') setCollectKey(Date.now());
      if (mode === 'mirrorDrag') setReachKey(Date.now());
    }
    objScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(
      () => advanceRound(),
      mode === 'ballTransfer' || mode === 'collectStars' || mode === 'mirrorDrag' ? 780 : 650,
    );
  }, [advanceRound, bumpScore, kickOffOpacity, mode, objScale, ttsGoal]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutPositions();
    if (mode === 'collectStars') {
      const star = STAR_SWEEP_STARS[Math.floor(Math.random() * STAR_SWEEP_STARS.length)]!;
      setStarEmoji(star);
    }
    setIsDragging(false);
    setReachPct(0);
    const hint =
      mode === 'ballTransfer'
        ? 'Slide home across the pitch!'
        : mode === 'collectStars'
          ? 'Sweep the star into the bag!'
          : mode === 'mirrorDrag'
            ? 'Reach across to the mirror catch!'
            : 'Drag right to left!';
    setStatusHint(hint);
    if (mode === 'ballTransfer' || mode === 'collectStars' || mode === 'mirrorDrag') {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 280 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1400);
    }
    speakTTS(ttsDrag, 0.78).catch(() => {});
  }, [kickOffOpacity, layoutPositions, mode, ttsDrag]);

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
      setIsDragging(true);
      setKickOffVisible(false);
      kickOffOpacity.value = withTiming(0, { duration: 100 });
      objScale.value = withTiming(
        mode === 'ballTransfer' ? 1.22 : mode === 'collectStars' ? 1.2 : mode === 'mirrorDrag' ? 1.18 : 1.15,
        { duration: 100 },
      );
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const half = 34;
      const prevX = objX.value;
      objX.value = Math.max(half, Math.min(playW.current - half, e.x));
      objY.value = Math.max(half, Math.min(playH.current - half, e.y));
      if (mode === 'ballTransfer') {
        objSpin.value += (prevX - objX.value) * 0.35;
      } else if (mode === 'collectStars') {
        objSpin.value = Math.sin(objX.value * 0.05) * 10;
      } else if (mode === 'mirrorDrag') {
        objSpin.value = (startX.current - objX.value) * 0.08;
        const totalDist = Math.abs(startX.current - targetX.current);
        const currentDist = Math.abs(objX.value - startX.current);
        setReachPct(Math.min(100, (currentDist / totalDist) * 100));
      }
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      setIsDragging(false);
      objScale.value = withTiming(1, { duration: 100 });
      if (mode === 'ballTransfer' || mode === 'collectStars' || mode === 'mirrorDrag') {
        objSpin.value = withSpring(0, { damping: 14, stiffness: 120 });
      }
      if (mode === 'mirrorDrag') setReachPct(0);
      const d = distPx(objX.value, objY.value, targetX.current, targetY.current);
      if (d <= P.matchTolerancePx) {
        completeRound();
        return;
      }
      showWarn(ttsMiss);
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

  const roundPct = ((round - 1) / P.rounds) * 100;
  const isReturnStadium = mode === 'ballTransfer';
  const isStarCosmos = mode === 'collectStars';
  const isCrossReach = mode === 'mirrorDrag';
  const isThemed = isReturnStadium || isStarCosmos || isCrossReach;
  const successLabel = isReturnStadium
    ? 'SCORE!'
    : isStarCosmos
      ? 'CAUGHT!'
      : isCrossReach
        ? 'CROSSED!'
        : 'Nice!';
  const roundBannerText = isReturnStadium
    ? '⚽ RETURN KICK!'
    : isStarCosmos
      ? '✨ SWEEP!'
      : isCrossReach
        ? '🤲 CROSS!'
        : '';
  const waitLabel = isReturnStadium
    ? 'Sunset warm-up…'
    : isStarCosmos
      ? 'Stars aligning…'
      : isCrossReach
        ? 'Mirror warming up…'
        : 'Get ready…';
  const waitColor = isReturnStadium
    ? '#FEF3C7'
    : isStarCosmos
      ? '#DDD6FE'
      : isCrossReach
        ? '#BAE6FD'
        : T.subtitleColor;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      {isReturnStadium && (
        <View style={styles.sunsetLights} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={`sun-${i}`} style={[styles.sunsetLight, { left: `${8 + i * 18}%` }]} />
          ))}
        </View>
      )}
      {isStarCosmos && (
        <View style={styles.cosmosDots} pointerEvents="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={`cdot-${i}`}
              style={[
                styles.cosmosDot,
                {
                  left: `${6 + i * 15}%`,
                  top: 20 + (i % 3) * 16,
                  opacity: 0.15 + (i % 2) * 0.1,
                },
              ]}
            />
          ))}
        </View>
      )}
      {isCrossReach && (
        <View style={styles.crossReachGlow} pointerEvents="none">
          <View style={[styles.crossGlowOrb, styles.crossGlowLeft]} />
          <View style={[styles.crossGlowOrb, styles.crossGlowRight]} />
        </View>
      )}
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View
          style={[
            styles.backInner,
            {
              borderColor: T.backBorder,
              backgroundColor: isReturnStadium
                ? 'rgba(67,20,7,0.5)'
                : isStarCosmos
                  ? 'rgba(30,16,51,0.55)'
                  : isCrossReach
                    ? 'rgba(30,16,51,0.55)'
                    : 'rgba(255,255,255,0.75)',
            },
          ]}
        >
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }, isThemed && styles.themedTitle]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statPill,
              {
                borderColor: T.statBorder,
                backgroundColor: isThemed ? 'rgba(15,16,40,0.42)' : 'rgba(255,255,255,0.7)',
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              styles.starPill,
              {
                borderColor: T.statBorder,
                backgroundColor: isThemed ? 'rgba(251,191,36,0.18)' : 'rgba(251,191,36,0.2)',
              },
            ]}
          >
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {isThemed && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isCrossReach && roundActive && (
          <View style={[styles.reachProgressTrack, { borderColor: T.accent }]}>
            <View style={[styles.reachProgressFill, { width: `${reachPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.playArea,
            playShakeStyle,
            {
              borderColor: T.playBorder,
              backgroundColor: T.playBg,
              borderWidth: isThemed ? 2 : 1,
              shadowColor: isThemed ? '#000' : 'transparent',
              shadowOpacity: isThemed ? 0.28 : 0,
              shadowRadius: isThemed ? 16 : 0,
              shadowOffset: isThemed ? { width: 0, height: 6 } : { width: 0, height: 0 },
              elevation: isThemed ? 8 : 0,
            },
          ]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutPositions();
          }}
        >
          {!roundActive && (
            <Text style={[styles.waitText, { color: waitColor }]}>{waitLabel}</Text>
          )}

          {roundActive && mode === 'ballTransfer' && (
            <ReturnPassPlayArea roundActive={roundActive} showGuide={round <= 2} isDragging={isDragging} />
          )}

          {roundActive && mode === 'collectStars' && (
            <StarSweepPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              collectKey={collectKey}
              collectedCount={score}
              starEmoji={starEmoji}
            />
          )}

          {roundActive && mode === 'mirrorDrag' && (
            <CrossReachPlayArea
              roundActive={roundActive}
              showGuide={round <= 2}
              isDragging={isDragging}
              reachKey={reachKey}
            />
          )}

          {roundActive && (
            <>
              {(mode === 'ballTransfer' || mode === 'collectStars' || mode === 'mirrorDrag') && (
                <Animated.View style={[styles.ballShadow, ballShadowStyle]} pointerEvents="none" />
              )}
              <Animated.View
                style={[
                  mode === 'ballTransfer'
                    ? styles.ballDraggable
                    : mode === 'collectStars'
                      ? styles.starDraggable
                      : mode === 'mirrorDrag'
                        ? styles.handDraggable
                        : styles.draggable,
                  objStyle,
                ]}
              >
                {mode === 'ballTransfer' ? (
                  <LinearGradient colors={['#FFFFFF', '#E2E8F0', '#CBD5E1']} style={styles.ballGradient}>
                    <Text style={styles.ballEmoji}>{T.draggableEmoji}</Text>
                  </LinearGradient>
                ) : mode === 'collectStars' ? (
                  <LinearGradient
                    colors={['#FEF9C3', '#FDE047', '#EAB308']}
                    style={styles.starGradient}
                  >
                    <Text style={styles.starEmoji}>{starEmoji}</Text>
                  </LinearGradient>
                ) : mode === 'mirrorDrag' ? (
                  <LinearGradient colors={['#FDBA74', '#FB923C', '#EA580C']} style={styles.handGradient}>
                    <Text style={styles.handEmoji}>{T.draggableEmoji}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.dragEmoji}>{T.draggableEmoji}</Text>
                )}
              </Animated.View>
            </>
          )}

          {kickOffVisible && isThemed && roundBannerText ? (
            <Animated.View
              style={[
                styles.kickOffBanner,
                isStarCosmos && styles.cosmosBanner,
                isCrossReach && styles.crossReachBanner,
                kickOffStyle,
              ]}
              pointerEvents="none"
            >
              <Text
                style={[
                  styles.kickOffText,
                  isStarCosmos && styles.cosmosBannerText,
                  isCrossReach && styles.crossReachBannerText,
                ]}
              >
                {roundBannerText}
              </Text>
            </Animated.View>
          ) : null}

          <SparkleBurst
            key={sparkleKey}
            visible={sparkleKey > 0}
            color={T.sparkleColor}
            count={isThemed ? 16 : 10}
            size={isThemed ? 8 : 6}
          />
          <ResultToast text={successLabel} type="ok" show={successToast && isThemed} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View
          style={[
            styles.warnPill,
            isReturnStadium && styles.themedWarnPill,
            isStarCosmos && styles.cosmosWarnPill,
            isCrossReach && styles.crossReachWarnPill,
          ]}
        >
          <Text
            style={[
              styles.warnText,
              isReturnStadium && styles.themedWarnText,
              isStarCosmos && styles.cosmosWarnText,
              isCrossReach && styles.crossReachWarnText,
            ]}
          >
            {warnMessage}
          </Text>
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
  themedTitle: {
    textShadowColor: 'rgba(251,146,60,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 0.3,
  },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressTrack: {
    width: '72%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  sunsetLights: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    pointerEvents: 'none',
  },
  sunsetLight: {
    position: 'absolute',
    top: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.2)',
  },
  cosmosDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  cosmosDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FCD34D',
    shadowColor: '#FCD34D',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  crossReachGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    pointerEvents: 'none',
  },
  crossGlowOrb: {
    position: 'absolute',
    top: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  crossGlowLeft: {
    left: '8%',
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
  },
  crossGlowRight: {
    right: '8%',
    backgroundColor: 'rgba(251,146,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
  },
  reachProgressTrack: {
    width: '72%',
    height: 7,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  reachProgressFill: { height: '100%', borderRadius: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
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
  zoneSubLabel: { fontSize: 9, fontWeight: '800', marginTop: 2 },
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
  ballDraggable: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  ballEmoji: { fontSize: 42 },
  starDraggable: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#FCD34D',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  starEmoji: { fontSize: 38 },
  handDraggable: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#FB923C',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  handEmoji: { fontSize: 36 },
  ballShadow: {
    position: 'absolute',
    width: 56,
    height: 20,
    borderRadius: 28,
    backgroundColor: '#000',
    zIndex: 4,
  },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    backgroundColor: 'rgba(67,20,7,0.82)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(253,224,71,0.55)',
    zIndex: 8,
  },
  kickOffText: {
    color: '#FDE68A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  cosmosBanner: {
    borderColor: 'rgba(196,181,253,0.55)',
    backgroundColor: 'rgba(15,5,32,0.88)',
  },
  cosmosBannerText: {
    color: '#C4B5FD',
    fontSize: 21,
    textShadowColor: '#FCD34D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  crossReachBanner: {
    borderColor: 'rgba(56,189,248,0.55)',
    backgroundColor: 'rgba(30,16,51,0.88)',
  },
  crossReachBannerText: {
    color: '#BAE6FD',
    fontSize: 21,
    textShadowColor: '#FB923C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
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
  themedWarnPill: {
    backgroundColor: 'rgba(67,20,7,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.35)',
  },
  themedWarnText: { color: '#FDE68A' },
  cosmosWarnPill: {
    backgroundColor: 'rgba(15,5,32,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.4)',
  },
  cosmosWarnText: { color: '#C4B5FD' },
  crossReachWarnPill: {
    backgroundColor: 'rgba(30,16,51,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.4)',
  },
  crossReachWarnText: { color: '#FDBA74' },
});

export default ReverseHorizontalDragGame;
