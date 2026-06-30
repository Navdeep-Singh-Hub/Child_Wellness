/**
 * OT Level 5 · Session 6 · Game 4 — Timer Strike
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { TIMER_STRIKE_COPY as COPY, TIMER_STRIKE_THEME as T } from '@/components/game/occupational/level5/session6/timerStrike/timerStrikeTheme';
import { BigCountdownDisplay, ClockBackdrop, StrikeTarget, TimerStrikeHUD, TimerStrikeInfoScreen } from '@/components/game/occupational/level5/session6/timerStrike/TimerStrikeVisuals';
import { SESSION5_6_PACING as P } from '@/components/game/occupational/level5/session6/session6Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TARGET_SIZE = 72;
const TOLERANCE = 50;
const { width: SW, height: SH } = Dimensions.get('window');

const TimerStrikeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: SW * 0.5, y: SH * 0.5 });

  const playW = useRef(SW);
  const playH = useRef(SH);
  const cdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);

  const clearTimers = useCallback(() => {
    if (cdTimerRef.current) { clearInterval(cdTimerRef.current); cdTimerRef.current = null; }
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearTimers();
    const total = P.timedRounds;
    const xp = finalScore * P.timedXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setShowCongrats(true);
    speakTTS(COPY.ttsComplete, 0.78).catch(() => {});
    try {
      await logGameAndAward({ type: COPY.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: [...COPY.skillTags] });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [clearTimers, router]);

  useEffect(() => { endGameRef.current = endGame; }, [endGame]);

  const revealTarget = useCallback(() => {
    setTargetPos({ x: Math.random() * (playW.current - TARGET_SIZE) + TARGET_SIZE / 2, y: Math.random() * (playH.current - TARGET_SIZE - 20) + TARGET_SIZE / 2 + 10 });
    setTargetVisible(true);
    speakTTS(COPY.ttsTap, 0.9).catch(() => {});
  }, []);

  const startRound = useCallback(() => {
    clearTimers();
    stopTTS();
    setCountdown(3);
    setTargetVisible(false);
    let current = 3;
    speakTTS('3', 0.9).catch(() => {});
    cdTimerRef.current = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current > 0) { speakTTS(current.toString(), 0.9).catch(() => {}); return; }
      clearTimers();
      setCountdown(0);
      revealTarget();
    }, 1000);
  }, [clearTimers, revealTarget]);

  const onHit = useCallback(() => {
    setTargetVisible(false);
    setScore((s) => {
      const ns = s + 1;
      if (ns >= P.timedRounds) setTimeout(() => endGameRef.current?.(ns), 900);
      else setTimeout(() => setRound((r) => r + 1), 1200);
      return ns;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.9).catch(() => {});
  }, []);

  const handleTap = useCallback((e: GestureResponderEvent) => {
    if (done || !targetVisible) return;
    if (isTapNearTarget(e, targetPos.x, targetPos.y, TARGET_SIZE, TOLERANCE)) onHit();
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [done, onHit, targetPos.x, targetPos.y, targetVisible]);

  useEffect(() => { if (!showInfo && !done) startRound(); }, [showInfo, round, done, startRound]);
  useEffect(() => () => { stopTTS(); cleanupSounds(); clearTimers(); }, [clearTimers]);

  const handleExit = () => { clearTimers(); stopTTS(); cleanupSounds(); onBack?.(); };
  const hint = targetVisible ? '🎯 TAP NOW!' : countdown > 0 ? `Wait… ${countdown}` : 'Get ready…';

  if (showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><TimerStrikeInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} /></SafeAreaView>;
  if (showCongrats && done && finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <TimerStrikeHUD round={round} total={P.timedRounds} score={score} hint={hint} striking={targetVisible} />
      <Pressable style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }} onPress={handleTap}>
        <ClockBackdrop />
        {!targetVisible && countdown > 0 && <View style={styles.cdCenter} pointerEvents="none"><BigCountdownDisplay value={countdown} accent={T.accent} /></View>}
        {targetVisible && (
          <>
            <View style={[styles.targetPos, { left: targetPos.x - TARGET_SIZE / 2, top: targetPos.y - TARGET_SIZE / 2 }]} pointerEvents="none">
              <StrikeTarget size={TARGET_SIZE} urgent />
            </View>
            <View style={styles.strikeBanner} pointerEvents="none"><Text style={styles.strikeText}>STRIKE!</Text></View>
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#312E81' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(30,27,75,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  cdCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  targetPos: { position: 'absolute', zIndex: 10 },
  strikeBanner: { position: 'absolute', top: 16, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 15 },
  strikeText: { fontSize: 22, fontWeight: '900', color: T.accent, letterSpacing: 2 },
});

export default TimerStrikeGame;
