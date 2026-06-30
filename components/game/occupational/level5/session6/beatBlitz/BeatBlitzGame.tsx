/**
 * OT Level 5 · Session 6 · Game 5 — Beat Blitz
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import { BEAT_BLITZ_COPY as COPY, BEAT_BLITZ_THEME as T } from '@/components/game/occupational/level5/session6/beatBlitz/beatBlitzTheme';
import { BeatBlitzHUD, BeatBlitzInfoScreen, BeatPulseRing, DiscoBackdrop, RhythmNote } from '@/components/game/occupational/level5/session6/beatBlitz/BeatBlitzVisuals';
import { SESSION5_6_PACING as P } from '@/components/game/occupational/level5/session6/session6Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TARGET_SIZE = 76;
const TOLERANCE = 50;
const BEAT_INTERVAL = 1000;
const { width: SW, height: SH } = Dimensions.get('window');

const BeatBlitzGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: SW * 0.5, y: SH * 0.5 });
  const [beatCount, setBeatCount] = useState(0);

  const playW = useRef(SW);
  const playH = useRef(SH);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatCountRef = useRef(0);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);

  const clearTimers = useCallback(() => {
    if (beatTimerRef.current) { clearInterval(beatTimerRef.current); beatTimerRef.current = null; }
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
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

  const showTarget = useCallback(() => {
    setTargetPos({ x: Math.random() * (playW.current - TARGET_SIZE) + TARGET_SIZE / 2, y: Math.random() * (playH.current - TARGET_SIZE - 20) + TARGET_SIZE / 2 + 10 });
    setTargetVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setTargetVisible(false), 800);
  }, []);

  const startBeat = useCallback(() => {
    clearTimers();
    beatCountRef.current = 0;
    setBeatCount(0);
    setTargetVisible(false);
    const playBeat = () => {
      void playSound('drum', 0.6, 1.0).catch(() => {});
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      beatCountRef.current += 1;
      setBeatCount(beatCountRef.current);
      if (beatCountRef.current % 3 === 0) showTarget();
    };
    playBeat();
    beatTimerRef.current = setInterval(playBeat, BEAT_INTERVAL);
  }, [clearTimers, showTarget]);

  const onHit = useCallback(() => {
    setTargetVisible(false);
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    setScore((s) => {
      const ns = s + 1;
      if (ns >= P.timedRounds) { clearTimers(); setTimeout(() => endGameRef.current?.(ns), 900); }
      else setTimeout(() => setRound((r) => r + 1), 1200);
      return ns;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.9).catch(() => {});
  }, [clearTimers]);

  const handleTap = useCallback((e: GestureResponderEvent) => {
    if (done || !targetVisible) return;
    if (isTapNearTarget(e, targetPos.x, targetPos.y, TARGET_SIZE, TOLERANCE)) onHit();
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [done, onHit, targetPos.x, targetPos.y, targetVisible]);

  useEffect(() => {
    if (!showInfo && !done) {
      stopTTS();
      startBeat();
      const t = setTimeout(() => speakTTS(COPY.ttsStart, 0.8).catch(() => {}), 500);
      return () => clearTimeout(t);
    }
  }, [showInfo, round, done, startBeat]);

  useEffect(() => () => { stopTTS(); cleanupSounds(); clearTimers(); }, [clearTimers]);

  const handleExit = () => { clearTimers(); stopTTS(); cleanupSounds(); onBack?.(); };
  const hint = targetVisible ? '🎵 Tap the note on beat!' : `Beat ${((beatCount % 3) || 3)}/3…`;

  if (showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><BeatBlitzInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} /></SafeAreaView>;
  if (showCongrats && done && finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <BeatBlitzHUD round={round} total={P.timedRounds} score={score} hint={hint} beatCount={beatCount} />
      <Pressable style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }} onPress={handleTap}>
        <DiscoBackdrop />
        <View style={styles.beatCenter} pointerEvents="none"><BeatPulseRing accent={T.accent} /></View>
        {targetVisible && (
          <View style={[styles.targetPos, { left: targetPos.x - TARGET_SIZE / 2, top: targetPos.y - TARGET_SIZE / 2 }]} pointerEvents="none">
            <RhythmNote size={TARGET_SIZE} urgent />
          </View>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#4C1D95' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(76,29,149,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  beatCenter: { position: 'absolute', alignSelf: 'center', top: '42%', zIndex: 2 },
  targetPos: { position: 'absolute', zIndex: 10 },
});

export default BeatBlitzGame;
