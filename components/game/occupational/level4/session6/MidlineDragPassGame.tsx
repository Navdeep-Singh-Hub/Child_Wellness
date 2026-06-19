/**
 * Shared pan-drag midline pass core for OT Level 4 Session 6.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { AimPassPlayArea } from '@/components/game/occupational/level4/session6/AimPassPlayArea';
import { DetourPassPlayArea } from '@/components/game/occupational/level4/session6/DetourPassPlayArea';
import { distPx, useTraceSound } from '@/components/game/occupational/level4/session6/midlineUtils';
import { SESSION4_6_PACING } from '@/components/game/occupational/level4/session6/session6Pacing';
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

const P = SESSION4_6_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const BALL_HALF = 28;

export type MidlineDragMode = 'targetPass' | 'obstaclePass';

export type MidlineDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  ballEmoji: string;
  targetEmoji: string;
  obstacleEmoji: string;
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
  midlineColor: string;
};

export type MidlineDragPassGameConfig = {
  theme: MidlineDragTheme;
  mode: MidlineDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsCross?: string;
  ttsDetourCross?: string;
  ttsObstacle?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const MidlineDragPassGame: React.FC<
  MidlineDragPassGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Drag the ball across your body to the target!',
  ttsMiss = 'Drag to the target across your body!',
  ttsCross = 'Cross the line first!',
  ttsDetourCross = 'Go around via the right side!',
  ttsObstacle = 'Hit obstacle! Go around it!',
  ttsSuccess = 'Perfect pass!',
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
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [roundLayout, setRoundLayout] = useState<{
    start: { x: number; y: number };
    target: { x: number; y: number };
    obstacle: { x: number; y: number };
  } | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [midlineCrossed, setMidlineCrossed] = useState(false);
  const [aimKey, setAimKey] = useState(0);
  const [detourKey, setDetourKey] = useState(0);

  const isAimPass = mode === 'targetPass';
  const isDetourPass = mode === 'obstaclePass';
  const isThemedDrag = isAimPass || isDetourPass;

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(64);
  const startY = useRef(288);
  const targetX = useRef(288);
  const targetY = useRef(96);
  const obstacleX = useRef(180);
  const obstacleY = useRef(200);
  const crossedMidlineRef = useRef(false);
  const midlineX = useRef(180);

  const ballX = useSharedValue(64);
  const ballY = useSharedValue(288);
  const ballScale = useSharedValue(1);
  const targetScale = useSharedValue(1);
  const kickOffOpacity = useSharedValue(0);
  const playShake = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const ballStyle = useAnimatedStyle(() => ({
    left: ballX.value - BALL_HALF,
    top: ballY.value - BALL_HALF,
    transform: [{ scale: ballScale.value }],
  }));

  const targetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
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
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(ballX);
    cancelAnimation(ballY);
    cancelAnimation(kickOffOpacity);
    cancelAnimation(playShake);
  }, [ballX, ballY, kickOffOpacity, playShake]);

  const layoutRound = useCallback(() => {
    const w = Math.max(playW.current, 1);
    const h = Math.max(playH.current, 1);
    const start = { x: w * P.ballStartXPct, y: h * P.ballStartYPct };
    const target =
      mode === 'obstaclePass'
        ? {
            x: w * P.obstaclePassTargetXPct,
            y: h * P.obstaclePassTargetYPct,
          }
        : {
            x: w * P.targetPassXPct,
            y: start.y,
          };
    const obstacle =
      mode === 'obstaclePass'
        ? {
            x: w * P.obstaclePassObstacleXPct,
            y: h * P.obstaclePassObstacleYPct,
          }
        : { x: w * 0.5, y: h * 0.5 };

    startX.current = start.x;
    startY.current = start.y;
    targetX.current = target.x;
    targetY.current = target.y;
    obstacleX.current = obstacle.x;
    obstacleY.current = obstacle.y;
    midlineX.current = w * P.midlineXPct;
    crossedMidlineRef.current = false;
    setMidlineCrossed(false);

    ballX.value = start.x;
    ballY.value = start.y;
    targetScale.value = 1;
    setRoundLayout({ start, target, obstacle });
  }, [ballX, ballY, mode, targetScale]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
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
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, ttsSuccess]);

  const resetBall = useCallback(() => {
    ballX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    ballY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    ballScale.value = withTiming(1, { duration: 120 });
    crossedMidlineRef.current = false;
    setMidlineCrossed(false);
  }, [ballScale, ballX, ballY]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
      if (isThemedDrag) {
        setWarnMessage(msg);
        setWarnVisible(true);
        playShake.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
        toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
      }
    },
    [isThemedDrag, playShake, playWarn],
  );

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
    targetScale.value = withSequence(withTiming(1.25, { duration: 140 }), withTiming(1, { duration: 140 }));
    bumpScore();
    if (isAimPass) {
      setSuccessToast(true);
      setAimKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isDetourPass) {
      setSuccessToast(true);
      setDetourKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, isAimPass, isDetourPass, targetScale]);

  const tryCatch = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current || !roundActiveRef.current) return;
    if (!crossedMidlineRef.current) return;
    const hitTarget = distPx(ballX.value, ballY.value, targetX.current, targetY.current) <= P.matchTolerancePx;
    if (hitTarget) completeRound();
  }, [ballX, ballY, completeRound]);

  const hitsObstacle = useCallback(() => {
    return distPx(ballX.value, ballY.value, obstacleX.current, obstacleY.current) <= P.obstacleRadiusPx;
  }, [ballX, ballY]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    layoutRound();
    setRoundActive(true);
    if (isThemedDrag) {
      setSuccessToast(false);
      setWarnVisible(false);
    }
    setStatusHint(
      isAimPass
        ? '🎯 Drag left → cross midline → hit bullseye!'
        : isDetourPass
          ? '🚧 Go UP → around barrier → GOAL!'
          : mode === 'targetPass'
            ? 'Slide ball left → right!'
            : 'Go UP, then RIGHT around the barrier → GOAL!',
    );
    speakTTS(ttsDrag, 0.78).catch(() => {});
    if (isThemedDrag) {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 350 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    }
  }, [isAimPass, isDetourPass, isThemedDrag, kickOffOpacity, layoutRound, mode, ttsDrag]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    setRoundLayout(null);
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
      crossedMidlineRef.current = ballX.value > midlineX.current;
      ballScale.value = withTiming(1.15, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      ballX.value = Math.max(BALL_HALF, Math.min(playW.current - BALL_HALF, e.x));
      if (mode === 'targetPass') {
        ballY.value = startY.current;
      } else {
        ballY.value = Math.max(BALL_HALF, Math.min(playH.current - BALL_HALF, e.y));
      }
      if (ballX.value > midlineX.current) {
        crossedMidlineRef.current = true;
        if (isThemedDrag) setMidlineCrossed(true);
      }

      if (mode === 'obstaclePass' && hitsObstacle()) {
        showWarn(ttsObstacle);
        resetBall();
        crossedMidlineRef.current = false;
        return;
      }

      tryCatch();
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      ballScale.value = withTiming(1, { duration: 100 });

      if (mode === 'obstaclePass' && hitsObstacle()) {
        showWarn(ttsObstacle);
        resetBall();
        crossedMidlineRef.current = false;
        return;
      }

      const hitTarget = distPx(ballX.value, ballY.value, targetX.current, targetY.current) <= P.matchTolerancePx;
      if (hitTarget) {
        if (!crossedMidlineRef.current) {
          showWarn(isDetourPass ? ttsDetourCross : isAimPass ? ttsCross : 'Cross the line first!');
          resetBall();
          return;
        }
        completeRound();
        return;
      }
      showWarn(ttsMiss);
      resetBall();
      crossedMidlineRef.current = false;
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
        {isThemedDrag && (
          <View style={[styles.roundTrack, isDetourPass && styles.detourRoundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${(round / P.rounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isAimPass && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>⚽</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>→</Text>
            <Text style={styles.decoEmoji}>🎯</Text>
          </View>
        )}
        {isDetourPass && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>↑</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🚧</Text>
            <Text style={styles.decoEmoji}>🎯</Text>
          </View>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.playAreaWrap, isThemedDrag && playShakeStyle]}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, isThemedDrag && styles.playAreaThemed]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutRound();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {isAimPass && (
            <AimPassPlayArea
              roundActive={roundActive}
              showGuide={isAimPass && round <= 2}
              midlineCrossed={midlineCrossed}
              aimKey={aimKey}
            />
          )}

          {isDetourPass && (
            <DetourPassPlayArea
              roundActive={roundActive}
              showGuide={isDetourPass && round <= 2}
              midlineCrossed={midlineCrossed}
              detourKey={detourKey}
            />
          )}

          {roundActive && roundLayout && (
            <>
              {!isThemedDrag && (
                <>
                  <View style={[styles.sideLabel, styles.leftLabel, { color: T.accentDark }]}>START</View>
                  <View style={[styles.sideLabel, styles.rightLabel, { color: T.accentDark }]}>TARGET</View>
                </>
              )}
              {!isThemedDrag && <View style={[styles.midline, { backgroundColor: T.midlineColor }]} />}
              {mode === 'targetPass' && !isThemedDrag && (
                <View
                  style={[
                    styles.passLane,
                    {
                      top: roundLayout.start.y - 6,
                      borderColor: T.accent,
                      backgroundColor: `${T.accent}18`,
                    },
                  ]}
                />
              )}
              {mode === 'obstaclePass' && roundLayout && !isDetourPass && (
                <>
                  {(() => {
                    const pathY = roundLayout.obstacle.y - P.obstacleRadiusPx - 22;
                    return (
                      <>
                        <View
                          style={[
                            styles.detourSegment,
                            {
                              left: roundLayout.start.x - 2,
                              top: pathY,
                              height: Math.max(20, roundLayout.start.y - pathY),
                              width: 4,
                              borderColor: T.accent,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.detourSegment,
                            {
                              left: roundLayout.start.x,
                              top: pathY - 2,
                              width: Math.max(40, roundLayout.target.x - roundLayout.start.x),
                              height: 4,
                              borderColor: T.accent,
                            },
                          ]}
                        />
                      </>
                    );
                  })()}
                  <Text
                    style={[
                      styles.detourHint,
                      { left: roundLayout.obstacle.x - 28, top: roundLayout.obstacle.y - 54, color: T.accentDark },
                    ]}
                  >
                    go around ↑
                  </Text>
                </>
              )}
              {!isThemedDrag && (
                <Text style={[styles.midlineHint, { color: T.accent, top: mode === 'obstaclePass' ? '38%' : '62%' }]}>
                  {mode === 'obstaclePass' ? 'cross here →' : 'cross →'}
                </Text>
              )}
              {!isThemedDrag && (
                <View
                  style={[
                    styles.startZone,
                    {
                      left: roundLayout.start.x - 36,
                      top: roundLayout.start.y - 36,
                      borderColor: T.accent,
                    },
                  ]}
                >
                  <Text style={[styles.zoneLabel, { color: T.accentDark }]}>START</Text>
                </View>
              )}
              <Animated.View
                style={[
                  styles.target,
                  isAimPass && styles.aimTarget,
                  isDetourPass && styles.detourTarget,
                  targetStyle,
                  {
                    left: roundLayout.target.x - 40,
                    top: roundLayout.target.y - 40,
                    borderColor: T.accent,
                  },
                ]}
              >
                <Text style={styles.targetEmoji}>{T.targetEmoji}</Text>
                <Text style={[styles.targetLabel, { color: T.accentDark }]}>
                  {isAimPass ? 'BULLSEYE' : isDetourPass ? 'GOAL' : 'GOAL'}
                </Text>
              </Animated.View>
              {mode === 'obstaclePass' && (
                <View
                  style={[
                    styles.obstacle,
                    isDetourPass && styles.detourObstacle,
                    {
                      left: roundLayout.obstacle.x - P.obstacleRadiusPx,
                      top: roundLayout.obstacle.y - P.obstacleRadiusPx,
                      width: P.obstacleRadiusPx * 2,
                      height: P.obstacleRadiusPx * 2,
                    },
                  ]}
                >
                  <Text style={styles.obstacleEmoji}>{T.obstacleEmoji}</Text>
                  <Text style={styles.obstacleLabel}>{isDetourPass ? 'BLOCK' : 'BLOCK'}</Text>
                </View>
              )}
              <Animated.View style={[styles.ball, isAimPass && styles.aimBall, isDetourPass && styles.detourBall, ballStyle]}>
                <Text style={styles.ballEmoji}>{T.ballEmoji}</Text>
              </Animated.View>
            </>
          )}

        {kickOffVisible && isAimPass ? (
          <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
            <Text style={styles.kickOffText}>🎯 AIM PASS!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isDetourPass ? (
          <Animated.View style={[styles.kickOffBanner, styles.detourKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.detourKickOffText]}>🚧 DETOUR PASS!</Text>
          </Animated.View>
        ) : null}

        <SparkleBurst
          key={sparkleKey}
          visible={sparkleKey > 0}
          color={T.sparkleColor}
          count={isThemedDrag ? 16 : 10}
          size={isThemedDrag ? 8 : 6}
        />
        {isAimPass && <ResultToast text="BULLSEYE!" type="ok" show={successToast} />}
        {isDetourPass && <ResultToast text="DETOUR!" type="ok" show={successToast} />}
        </View>
        </Animated.View>
      </GestureDetector>

      {warnVisible && isAimPass && (
        <View style={styles.aimWarnPill}>
          <Text style={styles.aimWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isDetourPass && (
        <View style={styles.detourWarnPill}>
          <Text style={styles.detourWarnText}>{warnMessage}</Text>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: { width: '70%', height: 8, borderRadius: 6, borderWidth: 1, overflow: 'hidden', marginBottom: 6, backgroundColor: 'rgba(69,10,10,0.55)' },
  detourRoundTrack: { backgroundColor: 'rgba(6,78,59,0.55)' },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  decoEmoji: { fontSize: 16 },
  decoArrow: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1 },
  playAreaThemed: { overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  midline: { position: 'absolute', left: '50%', top: 12, bottom: 12, width: 4, marginLeft: -2, borderRadius: 2 },
  passLane: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  detourSegment: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 2,
    opacity: 0.6,
    backgroundColor: 'transparent',
  },
  detourHint: { position: 'absolute', fontSize: 10, fontWeight: '800' },
  midlineHint: {
    position: 'absolute',
    left: '50%',
    top: '62%',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '900',
  },
  sideLabel: {
    position: 'absolute',
    top: 14,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  leftLabel: { left: 16 },
  rightLabel: { right: 16 },
  startZone: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  zoneLabel: { fontSize: 10, fontWeight: '800' },
  target: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 30 },
  targetLabel: { fontSize: 9, fontWeight: '900', marginTop: 2 },
  aimTarget: {
    zIndex: 4,
    backgroundColor: 'rgba(69,10,10,0.85)',
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  detourTarget: {
    zIndex: 4,
    backgroundColor: 'rgba(6,78,59,0.88)',
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  obstacle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  detourObstacle: {
    backgroundColor: 'rgba(120,53,15,0.92)',
    borderWidth: 3,
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  obstacleEmoji: { fontSize: 28 },
  obstacleLabel: { fontSize: 8, fontWeight: '900', color: '#fff', marginTop: 2 },
  ball: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245,158,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  aimBall: {
    borderWidth: 2,
    borderColor: '#FBBF24',
    shadowColor: '#EF4444',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  detourBall: {
    backgroundColor: 'rgba(52,211,153,0.95)',
    borderWidth: 2,
    borderColor: '#FBBF24',
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  ballEmoji: { fontSize: 32 },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderWidth: 2,
    borderColor: '#EF4444',
    zIndex: 6,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#FECACA', letterSpacing: 1 },
  detourKickOff: {
    backgroundColor: 'rgba(6,78,59,0.92)',
    borderColor: '#10B981',
  },
  detourKickOffText: { color: '#A7F3D0' },
  aimWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  aimWarnText: { fontSize: 14, fontWeight: '800', color: '#FECACA', textAlign: 'center' },
  detourWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(6,78,59,0.92)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  detourWarnText: { fontSize: 14, fontWeight: '800', color: '#A7F3D0', textAlign: 'center' },
});

export default MidlineDragPassGame;
