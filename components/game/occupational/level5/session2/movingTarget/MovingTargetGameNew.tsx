/**
 * OT Level 5 · Session 2 · Game 4 — Moving Target (Neon Arcade)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast } from '@/components/game/FX';
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { MOVING_TARGET_COPY as COPY, MOVING_TARGET_THEME as THEME } from '@/components/game/occupational/level5/session2/movingTarget/movingTargetTheme';
import { NeonGridBackdrop, NeonOrb } from '@/components/game/occupational/level5/session2/movingTarget/MovingTargetVisuals';
import { SESSION5_2_PACING as P } from '@/components/game/occupational/level5/session2/session2Pacing';
import { Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOVE_TICK = 16;

type RoundSettings = { dotSize: number; speed: number; tolerance: number };

const getSettings = (roundNum: number): RoundSettings => {
  if (roundNum <= 2) return { dotSize: 68, speed: 0.9, tolerance: Platform.OS === 'android' ? 74 : 64 };
  if (roundNum <= 4) return { dotSize: 60, speed: 1.4, tolerance: Platform.OS === 'android' ? 66 : 56 };
  if (roundNum <= 7) return { dotSize: 54, speed: 1.9, tolerance: Platform.OS === 'android' ? 60 : 52 };
  return { dotSize: 48, speed: 2.4, tolerance: Platform.OS === 'android' ? 54 : 48 };
};

const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);
const getTier = (round: number): 1 | 2 | 3 | 4 => (round <= 2 ? 1 : round <= 4 ? 2 : round <= 7 ? 3 : 4);
const tierLabels = ['WARM-UP', 'BUILDING', 'FAST', 'ELITE'];

const MovingTargetGameNew: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [dotVisible, setDotVisible] = useState(false);
  const [settings, setSettings] = useState<RoundSettings>(() => getSettings(1));
  const [missToast, setMissToast] = useState(false);

  const displayRound = Math.min(score + 1, P.rounds);
  const playW = useRef(340);
  const playH = useRef(400);
  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokeRef = useRef(false);
  const doneRef = useRef(false);
  const activeRef = useRef(false);
  const hitLock = useRef(false);
  const scoreRef = useRef(0);
  const dotPos = useRef({ x: 170, y: 200 });
  const dirX = useRef(0.9);
  const dirY = useRef(0.9);
  const speedRef = useRef(0.9);
  const sizeRef = useRef(68);
  const tolRef = useRef(64);

  const dotX = useSharedValue(170);
  const dotY = useSharedValue(200);
  const dotScale = useSharedValue(1);

  const dotStyle = useAnimatedStyle(() => ({
    left: dotX.value - sizeRef.current / 2,
    top: dotY.value - sizeRef.current / 2,
    transform: [{ scale: dotScale.value }],
  }));

  const clearMove = useCallback(() => {
    if (moveTimer.current) clearInterval(moveTimer.current);
    moveTimer.current = null;
    cancelAnimation(dotScale);
  }, [dotScale]);

  const clearAll = useCallback(() => {
    clearMove();
    if (roundTimer.current) clearTimeout(roundTimer.current);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    roundTimer.current = null;
    advanceTimer.current = null;
  }, [clearMove]);

  const syncPos = (x: number, y: number) => { dotPos.current = { x, y }; };

  const placeDot = useCallback((roundNum: number) => {
    const s = getSettings(roundNum);
    speedRef.current = s.speed;
    sizeRef.current = s.dotSize;
    tolRef.current = s.tolerance;
    setSettings(s);
    const w = playW.current;
    const h = playH.current;
    const pad = s.dotSize / 2;
    const x = randomInRange(pad, w - pad);
    const y = randomInRange(pad + 8, h - pad - 8);
    const angle = Math.random() * Math.PI * 2;
    dirX.current = Math.cos(angle) * s.speed;
    dirY.current = Math.sin(angle) * s.speed;
    dotX.value = x;
    dotY.value = y;
    dotScale.value = 1;
    syncPos(x, y);
    hitLock.current = false;
    setDotVisible(true);
    activeRef.current = true;
  }, [dotX, dotY, dotScale]);

  const tick = useCallback(() => {
    if (!activeRef.current || doneRef.current) return;
    const w = playW.current;
    const h = playH.current;
    const pad = sizeRef.current / 2;
    let nx = dotX.value + dirX.current;
    let ny = dotY.value + dirY.current;
    if (nx <= pad) { nx = pad + 1; dirX.current = Math.abs(dirX.current); }
    else if (nx >= w - pad) { nx = w - pad - 1; dirX.current = -Math.abs(dirX.current); }
    if (ny <= pad + 8) { ny = pad + 9; dirY.current = Math.abs(dirY.current); }
    else if (ny >= h - pad - 8) { ny = h - pad - 9; dirY.current = -Math.abs(dirY.current); }
    dotX.value = nx;
    dotY.value = ny;
    syncPos(nx, ny);
  }, [dotX, dotY]);

  const endGame = useCallback((finalScore: number) => {
    const total = P.rounds;
    const xp = finalScore * P.xpPerScore;
    doneRef.current = true;
    activeRef.current = false;
    clearAll();
    setDotVisible(false);
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setShowCongrats(true);
    speakTTS(COPY.ttsComplete, 0.78);
    recordGame(xp)
      .then(() => logGameAndAward({ type: COPY.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: [...COPY.skillTags] }))
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [clearAll, router]);

  const onHit = useCallback(() => {
    if (doneRef.current || !activeRef.current || hitLock.current) return;
    hitLock.current = true;
    dotScale.value = withSequence(withTiming(1.5, { duration: 120 }), withTiming(1, { duration: 120 }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Great timing!', 0.9);
    const ns = scoreRef.current + 1;
    scoreRef.current = ns;
    setScore(ns);
    activeRef.current = false;
    clearMove();
    setDotVisible(false);
    if (ns >= P.rounds) advanceTimer.current = setTimeout(() => endGame(ns), 700);
  }, [clearMove, dotScale, endGame]);

  const handleTap = useCallback((e: GestureResponderEvent) => {
    if (!dotVisible || !activeRef.current) return;
    const { x, y } = dotPos.current;
    if (isTapNearTarget(e, x, y, sizeRef.current, tolRef.current)) onHit();
    else { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setMissToast(true); setTimeout(() => setMissToast(false), 650); }
  }, [dotVisible, onHit]);

  const startRound = useCallback((roundNum: number) => {
    if (doneRef.current) return;
    stopTTS();
    placeDot(roundNum);
    moveTimer.current = setInterval(tick, MOVE_TICK);
    if (!spokeRef.current) { spokeRef.current = true; speakTTS('Tap the glowing orb!', 0.8); }
  }, [placeDot, tick]);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { doneRef.current = done; }, [done]);

  useEffect(() => {
    if (!showInfo && !done && !dotVisible) {
      const rn = score + 1;
      if (rn > P.rounds) return;
      roundTimer.current = setTimeout(() => startRound(rn), score === 0 ? 450 : 650);
      return () => { if (roundTimer.current) clearTimeout(roundTimer.current); };
    }
  }, [showInfo, score, done, dotVisible, startRound]);

  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); clearAll(); }, [clearAll]);

  const exit = () => { stopAllSpeech(); cleanupSounds(); clearAll(); onBack?.(); };
  const tier = getTier(displayRound);

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{ theme: THEME, emoji: COPY.emoji, title: COPY.title, tagline: COPY.tagline, body: COPY.body, chips: [...COPY.chips], startLabel: COPY.startLabel, startGradient: ['#22D3EE', '#06B6D4', '#0891B2'], backdrop: <NeonGridBackdrop /> }}
          onStart={() => setShowInfo(false)}
          onBack={exit}
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return <CongratulationsScreen message={COPY.congrats} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp} onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={exit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={exit} style={styles.back}><Text style={styles.backText}>← Exit</Text></TouchableOpacity>
      <Session2HUD
        theme={THEME}
        gameTitle="Neon Orb"
        emoji={COPY.emoji}
        round={displayRound}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="HITS"
        hint={displayRound <= 2 ? 'Warm-up — big & slow' : 'Track and tap!'}
        showHint={dotVisible}
        extra={<Text style={styles.tierText}>{tierLabels[tier - 1]}</Text>}
      />
      <Pressable style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }} onPress={handleTap}>
        <NeonGridBackdrop />
        {dotVisible && (
          <Animated.View pointerEvents="none" style={[styles.orbWrap, dotStyle]}>
            <NeonOrb size={settings.dotSize} scale={1} />
          </Animated.View>
        )}
        <ResultToast text="Missed — keep tracking!" type="bad" show={missToast} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(30,27,75,0.7)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(34,211,238,0.3)' },
  backText: { color: '#E0E7FF', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(34,211,238,0.25)' },
  orbWrap: { position: 'absolute', zIndex: 5 },
  tierText: { textAlign: 'center', fontSize: 10, fontWeight: '800', color: '#67E8F9', letterSpacing: 1.2, marginTop: 4 },
});

export default MovingTargetGameNew;
