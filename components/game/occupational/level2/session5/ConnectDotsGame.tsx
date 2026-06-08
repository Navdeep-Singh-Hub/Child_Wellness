/**
 * Shared connect-the-dots game core for OT Level 2 Session 5.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { DotRound } from '@/components/game/occupational/level2/session5/dotUtils';
import { SESSION5_PACING } from '@/components/game/occupational/level2/session5/session5Pacing';
import { useTraceSound } from '@/components/game/occupational/level2/session4/traceUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const P = SESSION5_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');
const MAX_DOTS = 10;

export type ConnectDotsTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  lineStroke: string;
  dotFill: string;
  dotConnected: string;
  dotStroke: string;
  glowColor: string;
  revealFill: string;
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
};

export type ConnectDotsConfig = {
  theme: ConnectDotsTheme;
  generateRound: () => DotRound;
  glowMode?: boolean;
  ttsIntro: string;
  ttsComplete: string;
  ttsWrong: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const GlowRing: React.FC<{ x: number; y: number; pulse: Animated.SharedValue<number>; color: string }> = ({ x, y, pulse, color }) => {
  const style = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.55, transform: [{ scale: 0.85 + pulse.value * 0.3 }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: P.dotHitSize + 12, height: P.dotHitSize + 12, marginLeft: -(P.dotHitSize + 12) / 2, marginTop: -(P.dotHitSize + 12) / 2, borderRadius: (P.dotHitSize + 12) / 2, backgroundColor: color }, style]}
    />
  );
};

export const ConnectDotsGame: React.FC<
  ConnectDotsConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T, generateRound, glowMode = false, ttsIntro, ttsComplete, ttsWrong, congratsMessage, logType, skillTags, onBack, onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const TOTAL = P.totalRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [dots, setDots] = useState<(DotRound['dots'][0] & { connected: boolean })[]>([]);
  const [connections, setConnections] = useState<{ from: number; to: number }[]>([]);
  const [revealPath, setRevealPath] = useState('');
  const [shapeRevealed, setShapeRevealed] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const [expectedDot, setExpectedDot] = useState(1);
  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const dotCountRef = useRef(0);

  const glow0 = useSharedValue(0); const glow1 = useSharedValue(0); const glow2 = useSharedValue(0);
  const glow3 = useSharedValue(0); const glow4 = useSharedValue(0); const glow5 = useSharedValue(0);
  const glow6 = useSharedValue(0); const glow7 = useSharedValue(0); const glow8 = useSharedValue(0);
  const glow9 = useSharedValue(0);
  const glowValues = [glow0, glow1, glow2, glow3, glow4, glow5, glow6, glow7, glow8, glow9];

  const startGlow = useCallback((idx: number) => {
    if (!glowMode || idx < 0 || idx >= MAX_DOTS) return;
    glowValues.forEach((g, i) => { g.value = i === idx ? withRepeat(withSequence(withTiming(1, { duration: P.glowPulseMs }), withTiming(0.2, { duration: P.glowPulseMs })), -1, false) : 0; });
  }, [glowMode]);

  const stopAllGlow = useCallback(() => { glowValues.forEach((g) => { g.value = 0; }); }, []);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS(ttsComplete, 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router, ttsComplete, logType, skillTags]);

  const initRound = useCallback(() => {
    const { dots: defs, revealPath: path } = generateRound();
    setDots(defs.map((d) => ({ ...d, connected: false })));
    setConnections([]);
    setRevealPath(path ?? '');
    setShapeRevealed(false);
    dotCountRef.current = defs.length;
    setExpectedDot(1);
    roundActiveRef.current = true;
    if (glowMode) startGlow(0);
    else stopAllGlow();
  }, [generateRound, glowMode, startGlow, stopAllGlow]);

  useEffect(() => { if (!doneRef.current) initRound(); }, [round]);
  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, [ttsIntro]);

  const completeRound = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (revealPath) setShapeRevealed(true);
    roundActiveRef.current = false;
    stopAllGlow();
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        if (next >= TOTAL) endGame(next);
        else { setRound((r) => r + 1); roundActiveRef.current = true; }
      }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess, revealPath, stopAllGlow]);

  const handleDotPress = useCallback((num: number) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (num !== expectedDot) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS(ttsWrong, 0.78).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const prev = num - 1;
    if (prev > 0) setConnections((c) => [...c, { from: prev, to: num }]);
    setDots((d) => d.map((dot) => (dot.number === num ? { ...dot, connected: true } : dot)));
    if (num >= dotCountRef.current) {
      completeRound();
      return;
    }
    setExpectedDot(num + 1);
    if (glowMode) startGlow(num);
    else speakTTS(`Tap dot ${num + 1}!`, 0.78).catch(() => {});
  }, [completeRound, expectedDot, glowMode, startGlow, ttsWrong]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message={congratsMessage} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn}>
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
            <Text style={[styles.statValue, { color: T.statValue }]}>{round}/{TOTAL}</Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {glowMode && (
          <Text style={[styles.hint, { color: T.subtitleColor }]}>Tap the glowing dot next!</Text>
        )}
      </View>
      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
          {connections.map((c, i) => {
            const from = dots.find((d) => d.number === c.from);
            const to = dots.find((d) => d.number === c.to);
            if (!from || !to) return null;
            return <Line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={T.lineStroke} strokeWidth={2.5} strokeLinecap="round" />;
          })}
          {shapeRevealed && revealPath ? (
            <Path d={revealPath} fill={T.revealFill} stroke={T.lineStroke} strokeWidth={1.5} opacity={0.55} />
          ) : null}
          {dots.map((dot) => (
            <React.Fragment key={dot.number}>
              <Circle cx={dot.x} cy={dot.y} r={P.dotRadius} fill={dot.connected ? T.dotConnected : T.dotFill} stroke={dot.connected ? T.lineStroke : T.dotStroke} strokeWidth={1.5} />
              <SvgText x={dot.x} y={dot.y + 1.2} fontSize={3.5} fontWeight="bold" fill={dot.connected ? '#fff' : '#374151'} textAnchor="middle">{dot.number}</SvgText>
            </React.Fragment>
          ))}
        </Svg>
        {glowMode && dots.map((dot) => (
          dot.number === expectedDot && !dot.connected ? (
            <GlowRing key={`g-${dot.number}`} x={dot.x} y={dot.y} pulse={glowValues[dot.number - 1] ?? glow0} color={T.glowColor} />
          ) : null
        ))}
        {dots.map((dot) => (
          <Pressable key={`hit-${dot.number}`} onPress={() => handleDotPress(dot.number)}
            style={[styles.hit, { left: `${dot.x}%`, top: `${dot.y}%` }]} />
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={14} size={8} />
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
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, position: 'relative' },
  svg: { position: 'absolute', width: '100%', height: '100%' },
  hit: { position: 'absolute', width: P.dotHitSize, height: P.dotHitSize, marginLeft: -P.dotHitSize / 2, marginTop: -P.dotHitSize / 2, zIndex: 5 },
});
