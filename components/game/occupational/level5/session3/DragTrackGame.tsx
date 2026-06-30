/**
 * OT Level 5 · Session 3 — Drag to Track (shared engine)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import type { DragTrackGameConfig } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import { DragTrackBackdrop, DragTrailDot, TetherLine } from '@/components/game/occupational/level5/session3/DragTrackVisuals';
import { SESSION5_3_PACING as P } from '@/components/game/occupational/level5/session3/session3Pacing';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const HALF = P.targetHalfPx;

type TrailPt = { x: number; y: number; o: number };

export const DragTrackGame: React.FC<
  DragTrackGameConfig & { onBack?: () => void; onComplete?: () => void }
> = (config) => {
  const { onBack, onComplete, ...C } = config;
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [followPct, setFollowPct] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [hint, setHint] = useState('');
  const [trail, setTrail] = useState<TrailPt[]>([]);
  const [positions, setPositions] = useState({ tx: 0, ty: 0, fx: 0, fy: 0, tether: false });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const activeRef = useRef(false);
  const completeRef = useRef(false);
  const followingRef = useRef(false);
  const followStartRef = useRef<number | null>(null);
  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(340);
  const playH = useRef(400);
  const timeRef = useRef(0);
  const trailRef = useRef<TrailPt[]>([]);

  const targetX = useSharedValue(170);
  const targetY = useSharedValue(200);
  const fingerX = useSharedValue(170);
  const fingerY = useSharedValue(280);

  const targetStyle = useAnimatedStyle(() => ({
    left: targetX.value - HALF,
    top: targetY.value - HALF,
  }));
  const fingerStyle = useAnimatedStyle(() => ({
    left: fingerX.value - P.fingerHalfPx,
    top: fingerY.value - P.fingerHalfPx,
  }));

  const clearTimers = useCallback(() => {
    if (moveTimer.current) clearInterval(moveTimer.current);
    if (checkTimer.current) clearInterval(checkTimer.current);
    if (roundTimer.current) clearTimeout(roundTimer.current);
    moveTimer.current = null;
    checkTimer.current = null;
    roundTimer.current = null;
    cancelAnimation(targetX);
    cancelAnimation(targetY);
  }, [targetX, targetY]);

  const endGame = useCallback((finalScore: number) => {
    const total = P.rounds;
    const xp = finalScore * P.xpPerScore;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    clearTimers();
    activeRef.current = false;
    setPhase('idle');
    setShowCongrats(true);
    speakTTS(C.ttsComplete, 0.78);
    recordGame(xp)
      .then(() => logGameAndAward({ type: C.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: C.skillTags }))
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [C, clearTimers, router]);

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(C.ttsSuccess, 0.78).catch(() => {});
    setScore((s) => { scoreRef.current = s + 1; return s + 1; });
  }, [C.ttsSuccess, playSuccess]);

  const advanceRound = useCallback(() => {
    clearTimers();
    activeRef.current = false;
    completeRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowPct(0);
    trailRef.current = [];
    setTrail([]);
    if (roundRef.current >= P.rounds) { endGame(scoreRef.current); return; }
    setPhase('idle');
    roundTimer.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (completeRef.current || doneRef.current) return;
    completeRef.current = true;
    clearTimers();
    bumpScore();
    roundTimer.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers]);

  const tickTarget = useCallback(() => {
    if (!activeRef.current || completeRef.current) return;
    timeRef.current += P.moveTickMs / 1000;
    const w = playW.current;
    const h = playH.current;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = timeRef.current;
    const r = Math.min(w, h) * 0.22;

    switch (C.motion) {
      case 'horizontal':
        targetX.value = cx + Math.sin(t * 0.9) * r * 1.1;
        targetY.value = cy;
        break;
      case 'vertical':
        targetX.value = cx;
        targetY.value = cy + Math.sin(t * 0.85) * r;
        break;
      case 'orbit':
        targetX.value = cx + Math.sin(t * 0.55) * r;
        targetY.value = cy + Math.cos(t * 0.55) * r * 0.65;
        break;
      case 'figure8':
        targetX.value = cx + Math.sin(t * 0.7) * r;
        targetY.value = cy + Math.sin(t * 1.4) * r * 0.55;
        break;
      case 'zigzag': {
        const phase = (t * 1.2) % 2;
        const tri = phase < 1 ? phase : 2 - phase;
        targetX.value = cx + (tri * 2 - 1) * r;
        targetY.value = cy + Math.sin(t * 0.5) * r * 0.4;
        break;
      }
    }
  }, [C.motion, targetX, targetY]);

  const pushTrail = useCallback((x: number, y: number) => {
    const next = [{ x, y, o: 1 }, ...trailRef.current].slice(0, 8);
    next.forEach((p, i) => { p.o = 1 - i / 8; });
    trailRef.current = next;
    setTrail([...next]);
  }, []);

  const checkFollow = useCallback(() => {
    if (!activeRef.current || completeRef.current || doneRef.current) return;
    const d = distPx(fingerX.value, fingerY.value, targetX.value, targetY.value);
    const onTarget = d <= P.followDistancePx;
    setPositions({ tx: targetX.value, ty: targetY.value, fx: fingerX.value, fy: fingerY.value, tether: onTarget });
    pushTrail(fingerX.value, fingerY.value);

    if (onTarget) {
      if (!followingRef.current) {
        followingRef.current = true;
        followStartRef.current = Date.now();
      } else {
        const elapsed = Date.now() - (followStartRef.current ?? Date.now());
        setFollowPct(Math.min(100, Math.round((elapsed / P.followHoldMs) * 100)));
        if (elapsed >= P.followHoldMs) completeRound();
      }
    } else {
      followingRef.current = false;
      followStartRef.current = null;
      setFollowPct(0);
    }
  }, [completeRound, fingerX, fingerY, pushTrail, targetX, targetY]);

  const startPlaying = useCallback(() => {
    if (doneRef.current) return;
    completeRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowPct(0);
    activeRef.current = true;
    setPhase('playing');
    timeRef.current = 0;
    const w = playW.current;
    const h = playH.current;
    targetX.value = w * 0.5;
    targetY.value = h * 0.45;
    fingerX.value = w * 0.5;
    fingerY.value = h * 0.72;
    setHint('Drag to stay on target!');
    speakTTS(C.ttsCue, 0.78).catch(() => {});
    moveTimer.current = setInterval(tickTarget, P.moveTickMs);
    checkTimer.current = setInterval(checkFollow, 80);
  }, [C.ttsCue, checkFollow, fingerX, fingerY, targetX, targetY, tickTarget]);

  useEffect(() => { scoreRef.current = score; roundRef.current = round; }, [score, round]);
  useEffect(() => {
    if (!showInfo && !done && phase === 'idle') {
      if (round === 1) speakTTS(C.ttsIntro, 0.78);
      setPhase('countdown');
    }
  }, [showInfo, done, round, phase, C.ttsIntro]);
  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); clearTimers(); }, [clearTimers]);

  const panGesture = Gesture.Pan().runOnJS(true).onUpdate((e) => {
    if (!activeRef.current || completeRef.current || doneRef.current) return;
    fingerX.value = Math.max(P.fingerHalfPx, Math.min(playW.current - P.fingerHalfPx, e.x));
    fingerY.value = Math.max(P.fingerHalfPx, Math.min(playH.current - P.fingerHalfPx, e.y));
  });

  const exit = () => { stopAllSpeech(); cleanupSounds(); clearTimers(); onBack?.(); };

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{
            theme: C.theme, emoji: C.emoji, title: C.title, tagline: C.tagline, body: C.introBody,
            chips: C.chips, startLabel: C.startLabel, startGradient: C.startGradient,
            backdrop: <DragTrackBackdrop config={C} />, floatEmoji: C.targetEmoji,
          }}
          onStart={() => setShowInfo(false)}
          onBack={exit}
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen message={C.congrats} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={exit} />
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={exit} style={[styles.back, { borderColor: C.theme.hudBorder }]}><Text style={styles.backText}>← Exit</Text></TouchableOpacity>
      <Session2HUD theme={C.theme} gameTitle={C.title.split(' ')[0] ?? C.title} emoji={C.emoji} round={round} totalRounds={P.rounds} score={score} scoreLabel="TRACKS" hint={hint} showHint={phase === 'playing'}
        extra={phase === 'playing' && followPct > 0 ? (
          <View style={[styles.progressBar, { borderColor: C.theme.accent }]}>
            <View style={[styles.progressFill, { width: `${followPct}%`, backgroundColor: C.theme.accent }]} />
          </View>
        ) : null}
      />
      <GestureDetector gesture={panGesture}>
        <View style={[styles.arena, { borderColor: C.theme.hudBorder }]} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }}>
          <DragTrackBackdrop config={C} />
          {trail.map((p, i) => <DragTrailDot key={i} x={p.x} y={p.y} color={C.trailColor} opacity={p.o} />)}
          <TetherLine x1={positions.fx} y1={positions.fy} x2={positions.tx} y2={positions.ty} color={C.tetherColor} visible={positions.tether && phase === 'playing'} />
          {phase === 'playing' && (
            <>
              <Animated.View pointerEvents="none" style={[styles.target, { backgroundColor: C.targetBg }, targetStyle]}>
                <Text style={styles.targetEmoji}>{C.targetEmoji}</Text>
              </Animated.View>
              <Animated.View pointerEvents="none" style={[styles.finger, { backgroundColor: C.fingerColor, borderColor: C.theme.accent }, fingerStyle]} />
            </>
          )}
          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={C.theme.accent} />
          {phase === 'countdown' && <RoundCountdownOverlay key={`cd-${round}`} accent={C.theme.accent} onDone={startPlaying} />}
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  backText: { color: '#F8FAFC', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
  target: { position: 'absolute', width: HALF * 2, height: HALF * 2, borderRadius: HALF, alignItems: 'center', justifyContent: 'center', zIndex: 4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.75)' },
  targetEmoji: { fontSize: 32 },
  finger: { position: 'absolute', width: P.fingerHalfPx * 2, height: P.fingerHalfPx * 2, borderRadius: P.fingerHalfPx, zIndex: 6, borderWidth: 3 },
  progressBar: { width: '90%', height: 8, borderRadius: 4, borderWidth: 1, marginTop: 6, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.35)', alignSelf: 'center' },
  progressFill: { height: '100%', borderRadius: 4 },
});

export default DragTrackGame;
