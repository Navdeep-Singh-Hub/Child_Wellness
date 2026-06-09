/**
 * Shared drag-to-match shape outline game core for OT Level 2 Session 6.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  MatchRound,
  ShapeKind,
  makeRandomMatchRound,
  renderShapeSvg,
  rotationMatches,
} from '@/components/game/occupational/level2/session6/shapeUtils';
import { SESSION6_PACING } from '@/components/game/occupational/level2/session6/session6Pacing';
import { useTraceSound } from '@/components/game/occupational/level2/session4/traceUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';

const P = SESSION6_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARNING = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type OutlineMode = 'stroke' | 'shadow' | 'puzzle' | 'cookie';

export type MatchTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  shapeFill: string;
  shapeStroke: string;
  outlineFill: string;
  outlineStroke: string;
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
  rotateBtnBg: string;
  rotateBtnBorder: string;
  rotateBtnText: string;
  hintText: string;
};

export type DragShapeMatchConfig = {
  theme: MatchTheme;
  shapePool: ShapeKind[];
  outlineMode: OutlineMode;
  requireRotation?: boolean;
  fastPacing?: boolean;
  ttsIntro: string;
  ttsComplete: string;
  ttsWrong: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
  generateRound?: () => MatchRound;
};

export const DragShapeMatchGame: React.FC<
  DragShapeMatchConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  shapePool,
  outlineMode,
  requireRotation = false,
  fastPacing = false,
  ttsIntro,
  ttsComplete,
  ttsWrong,
  congratsMessage,
  logType,
  skillTags,
  generateRound,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarning = useTraceSound(WARNING);
  const TOTAL = P.totalRounds;
  const handoffMs = fastPacing ? P.fastNextRoundDelayMs : P.nextRoundDelayMs;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [roundData, setRoundData] = useState<MatchRound | null>(null);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const roundDataRef = useRef<MatchRound | null>(null);
  const screenW = useRef(400);
  const screenH = useRef(600);
  const [shapePx, setShapePx] = useState(64);

  const shapeX = useSharedValue(50);
  const shapeY = useSharedValue(25);
  const shapeScale = useSharedValue(1);
  const shapeRot = useSharedValue(0);

  const buildRound = useCallback((): MatchRound => {
    if (generateRound) return generateRound();
    return makeRandomMatchRound(shapePool, requireRotation);
  }, [generateRound, requireRotation, shapePool]);

  const applyRound = useCallback((data: MatchRound) => {
    setRoundData(data);
    roundDataRef.current = data;
    shapeRot.value = 0;
    shapeX.value = data.startX;
    shapeY.value = data.startY;
    shapeScale.value = 1;
    roundActiveRef.current = true;
  }, [shapeRot, shapeX, shapeY, shapeScale]);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
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
  }, [router, skillTags, logType, ttsComplete]);

  useEffect(() => {
    if (!doneRef.current) applyRound(buildRound());
  }, [round]);

  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, [ttsIntro]);

  const checkMatch = useCallback((x: number, y: number, rotation: number) => {
    const cfg = roundDataRef.current;
    if (!cfg) return false;
    const dist = Math.hypot(x - cfg.targetX, y - cfg.targetY);
    if (dist >= P.matchTolerance) return false;
    if (requireRotation) return rotationMatches(rotation, cfg.requiredRotation, P.rotationTolerance);
    return true;
  }, [requireRotation]);

  const completeRound = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    roundActiveRef.current = false;
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        if (next >= TOTAL) endGame(next);
        else {
          setRound((r) => r + 1);
        }
      }, handoffMs);
      return next;
    });
  }, [endGame, handoffMs, playSuccess]);

  const snapToStart = useCallback(() => {
    const cfg = roundDataRef.current;
    if (!cfg) return;
    shapeX.value = withSpring(cfg.startX, { damping: 12, stiffness: 120 });
    shapeY.value = withSpring(cfg.startY, { damping: 12, stiffness: 120 });
  }, [shapeX, shapeY]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current || !roundDataRef.current) return;
      shapeScale.value = withSpring(1.08, { damping: 10, stiffness: 200 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current || !roundDataRef.current) return;
      const nx = (e.x / screenW.current) * 100;
      const ny = (e.y / screenH.current) * 100;
      shapeX.value = Math.max(5, Math.min(95, nx));
      shapeY.value = Math.max(10, Math.min(90, ny));
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current || !roundDataRef.current) return;
      shapeScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      if (checkMatch(shapeX.value, shapeY.value, shapeRot.value)) {
        completeRound();
        return;
      }
      snapToStart();
      playWarning();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 900);
      speakTTS(ttsWrong, 0.78).catch(() => {});
    });

  const handleRotate = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    shapeRot.value = (shapeRot.value + 90) % 360;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [shapeRot]);

  const shapeStyle = useAnimatedStyle(() => ({
    left: `${shapeX.value}%`,
    top: `${shapeY.value}%`,
    transform: [
      { translateX: -shapePx / 2 },
      { translateY: -shapePx / 2 },
      { scale: shapeScale.value },
      { rotate: `${shapeRot.value}deg` },
    ],
  }), [shapePx]);

  const outlinePaint = (() => {
    switch (outlineMode) {
      case 'shadow':
        return { fill: T.outlineFill, stroke: T.outlineStroke, strokeWidth: 2, opacity: 0.55 };
      case 'puzzle':
        return { fill: 'none', stroke: T.outlineStroke, strokeWidth: 2.5, opacity: 0.55 };
      case 'cookie':
        return { fill: 'none', stroke: T.outlineStroke, strokeWidth: 3.5, opacity: 1 };
      default:
        return { fill: 'none', stroke: T.outlineStroke, strokeWidth: 3, opacity: 1 };
    }
  })();

  const draggablePaint = { fill: T.shapeFill, stroke: T.shapeStroke, strokeWidth: 2, opacity: 1 };

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
              {round}/{TOTAL}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{T.hintText}</Text>
      </View>

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          screenW.current = width;
          screenH.current = height;
          setShapePx((width * P.shapeViewSize) / 100);
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
              {roundData &&
                renderShapeSvg(
                  roundData.shape,
                  roundData.targetX,
                  roundData.targetY,
                  P.shapeViewSize,
                  outlinePaint,
                  requireRotation ? roundData.requiredRotation : 0,
                  { x: roundData.targetX, y: roundData.targetY },
                )}
            </Svg>

            {roundData && (
              <Animated.View style={[styles.shapeWrap, { width: shapePx, height: shapePx }, shapeStyle]}>
                <Svg width="100%" height="100%" viewBox="0 0 100 100">
                  {renderShapeSvg(roundData.shape, 50, 50, P.shapeInnerSize, draggablePaint)}
                </Svg>
              </Animated.View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={14} size={8} />
          </Animated.View>
        </GestureDetector>

        {warnVisible && (
          <View style={styles.warnPill} pointerEvents="none">
            <Text style={styles.warnText}>Try again — align the shape!</Text>
          </View>
        )}
      </View>

      {requireRotation && (
        <TouchableOpacity
          onPress={handleRotate}
          style={[styles.rotateBtn, { backgroundColor: T.rotateBtnBg, borderColor: T.rotateBtnBorder }]}
        >
          <Text style={[styles.rotateBtnText, { color: T.rotateBtnText }]}>🔄 Rotate</Text>
        </TouchableOpacity>
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
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, position: 'relative', overflow: 'hidden' },
  gestureArea: { flex: 1 },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  shapeWrap: { position: 'absolute', zIndex: 5 },
  warnPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  warnText: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#B91C1C' },
  rotateBtn: {
    alignSelf: 'center',
    marginBottom: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  rotateBtnText: { fontSize: 16, fontWeight: '800' },
});

export default DragShapeMatchGame;
