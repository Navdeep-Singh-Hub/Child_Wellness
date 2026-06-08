/**
 * Look-hide-recall pattern game for OT Level 2 Session 9.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION9_PACING } from '@/components/game/occupational/level2/session9/session9Pacing';
import { MemoryShape, MEMORY_SHAPES, randomMemoryShape, useTraceSound } from '@/components/game/occupational/level2/session9/patternUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const P = SESSION9_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type MemoryTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  shapeStroke: string;
  selectedBorder: string;
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
  btnBg: string;
  btnBorder: string;
  phaseText: string;
};

type Phase = 'show' | 'hide' | 'draw';

const renderShape = (type: MemoryShape, stroke: string) => {
  switch (type) {
    case 'circle':
      return <Circle cx={50} cy={40} r={10} fill="none" stroke={stroke} strokeWidth={3} />;
    case 'square':
      return <Rect x={40} y={30} width={20} height={20} fill="none" stroke={stroke} strokeWidth={3} />;
    case 'triangle':
      return <Path d="M 50 30 L 60 50 L 40 50 Z" fill="none" stroke={stroke} strokeWidth={3} />;
    case 'cross':
      return (
        <>
          <Line x1={50} y1={30} x2={50} y2={50} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
          <Line x1={40} y1={40} x2={60} y2={40} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1={50} y1={35} x2={50} y2={45} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
          <Line x1={45} y1={40} x2={55} y2={40} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
        </>
      );
  }
};

export const MemoryPatternGame: React.FC<
  {
    theme: MemoryTheme;
    ttsIntro: string;
    ttsHidden: string;
    ttsSelect: string;
    ttsComplete: string;
    ttsWrong: string;
    congratsMessage: string;
    logType: string;
    skillTags: string[];
    onBack?: () => void;
    onComplete?: () => void;
  }
> = ({
  theme: T,
  ttsIntro,
  ttsHidden,
  ttsSelect,
  ttsComplete,
  ttsWrong,
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const TOTAL = P.totalRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [target, setTarget] = useState<MemoryShape>('circle');
  const [userPick, setUserPick] = useState<MemoryShape | null>(null);
  const [phase, setPhase] = useState<Phase>('show');
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(false);
  const doneRef = useRef(false);
  const targetRef = useRef<MemoryShape>('circle');
  const fade = useSharedValue(1);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const endGame = useCallback(
    (finalScore: number) => {
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
    },
    [router, skillTags, logType, ttsComplete],
  );

  useEffect(() => {
    if (doneRef.current) return;
    const shape = randomMemoryShape();
    setTarget(shape);
    targetRef.current = shape;
    setUserPick(null);
    setPhase('show');
    fade.value = 1;
    roundActiveRef.current = false;

    speakTTS(ttsIntro, 0.78).catch(() => {});

    const showTimer = setTimeout(() => {
      setPhase('hide');
      fade.value = withTiming(0, { duration: 300 });
      speakTTS(ttsHidden, 0.78).catch(() => {});
    }, P.showDurationMs);

    const drawTimer = setTimeout(() => {
      setPhase('draw');
      roundActiveRef.current = true;
      speakTTS(ttsSelect, 0.78).catch(() => {});
    }, P.showDurationMs + P.hideDurationMs);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(drawTimer);
    };
  }, [round, fade, ttsIntro, ttsHidden, ttsSelect]);

  useEffect(() => {
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, []);

  const handlePick = useCallback(
    (type: MemoryShape) => {
      if (!roundActiveRef.current || doneRef.current || phase !== 'draw') return;
      setUserPick(type);
      if (type === targetRef.current) {
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;
        setScore((prev) => {
          const next = prev + 1;
          setTimeout(() => {
            if (next >= TOTAL) endGame(next);
            else setRound((r) => r + 1);
          }, P.nextRoundDelayMs);
          return next;
        });
        return;
      }
      setUserPick(null);
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(ttsWrong, 0.78).catch(() => {});
    },
    [phase, endGame, playSuccess, playWarn, ttsWrong],
  );

  const phaseLabel =
    phase === 'show' ? 'Look carefully…' : phase === 'hide' ? 'Remember it!' : 'Pick the shape you saw';

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
        <Text style={[styles.phasePill, { color: T.phaseText, borderColor: T.playBorder }]}>{phaseLabel}</Text>
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        <View style={[styles.previewBox, { borderColor: T.playBorder }]}>
          {(phase === 'show' || phase === 'hide') && (
            <Animated.View style={fadeStyle}>
              <Svg width="100%" height={80} viewBox="0 0 100 80">
                {renderShape(target, T.shapeStroke)}
              </Svg>
            </Animated.View>
          )}
          {phase === 'draw' && userPick && (
            <Svg width="100%" height={80} viewBox="0 0 100 80">
              {renderShape(userPick, T.shapeStroke)}
            </Svg>
          )}
          {phase === 'hide' && (
            <Text style={[styles.hiddenText, { color: T.subtitleColor }]}>?</Text>
          )}
        </View>

        {phase === 'draw' && (
          <>
            <Text style={[styles.pickTitle, { color: T.titleColor }]}>Select the pattern</Text>
            <View style={styles.choiceGrid}>
              {MEMORY_SHAPES.map((shape) => (
                <Pressable
                  key={shape}
                  onPress={() => handlePick(shape)}
                  style={[
                    styles.choiceBtn,
                    { backgroundColor: T.btnBg, borderColor: userPick === shape ? T.selectedBorder : T.btnBorder },
                  ]}
                >
                  <Svg width={48} height={40} viewBox="0 0 100 80">
                    {renderShape(shape, T.shapeStroke)}
                  </Svg>
                  <Text style={[styles.choiceLabel, { color: T.titleColor }]}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={12} size={7} />
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
  phasePill: { fontSize: 13, fontWeight: '700', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, padding: 14 },
  previewBox: { height: 100, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  hiddenText: { position: 'absolute', fontSize: 36, fontWeight: '900' },
  pickTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  choiceBtn: { width: '30%', minWidth: 90, alignItems: 'center', padding: 8, borderRadius: 14, borderWidth: 2 },
  choiceLabel: { fontSize: 10, fontWeight: '700', marginTop: 4 },
});

export default MemoryPatternGame;
