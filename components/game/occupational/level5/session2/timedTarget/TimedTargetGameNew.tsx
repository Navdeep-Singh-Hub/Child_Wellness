/**
 * OT Level 5 · Session 2 · Game 5 — Timed Target (Beat the Clock)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { PulsingTarget, RaceTrackBackdrop } from '@/components/game/occupational/level5/session2/timedTarget/TimedTargetVisuals';
import { TIMED_TARGET_COPY as COPY, TARGET_SIZE, TIMED_TARGET_THEME as THEME, TIME_LIMIT_MS } from '@/components/game/occupational/level5/session2/timedTarget/timedTargetTheme';
import { SESSION5_2_PACING as P } from '@/components/game/occupational/level5/session2/session2Pacing';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Target { id: string; x: number; y: number; scale: number; timeLeft: number }

const TimedTargetGameNew: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [target, setTarget] = useState<Target | null>(null);
  const [hint, setHint] = useState('');

  const playW = useRef(340);
  const playH = useRef(400);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spokeRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const timedOutRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const endGame = useCallback((finalScore: number) => {
    clearTimer();
    const total = P.rounds;
    const xp = finalScore * P.xpPerScore;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setShowCongrats(true);
    speakTTS(COPY.ttsComplete, 0.78);
    recordGame(xp)
      .then(() => logGameAndAward({ type: COPY.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: [...COPY.skillTags] }))
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [router]);

  const spawnTarget = useCallback(() => {
    timedOutRef.current = false;
    clearTimer();
    const pad = TARGET_SIZE;
    const t: Target = {
      id: `t-${Date.now()}`,
      x: Math.random() * (playW.current - pad * 2) + pad,
      y: Math.random() * (playH.current - pad * 2 - 40) + pad + 20,
      scale: 1,
      timeLeft: TIME_LIMIT_MS,
    };
    setTarget(t);
    let remaining = TIME_LIMIT_MS;
    timerRef.current = setInterval(() => {
      remaining -= 100;
      setTarget((prev) => (prev ? { ...prev, timeLeft: remaining } : null));
      if (remaining <= 0 && !timedOutRef.current) {
        timedOutRef.current = true;
        clearTimer();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS('Too slow!', 0.8);
        setTarget(null);
        setTimeout(() => {
          if (roundRef.current >= P.rounds) endGame(scoreRef.current);
          else { setRound((r) => r + 1); setPhase('countdown'); }
        }, 900);
      }
    }, 100);
  }, [endGame]);

  const onHit = useCallback(() => {
    if (!target || target.timeLeft <= 0 || timedOutRef.current) return;
    clearTimer();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.9);
    setTarget(null);
    setScore((s) => {
      const ns = s + 1;
      scoreRef.current = ns;
      if (ns >= P.rounds) setTimeout(() => endGame(ns), 700);
      else setTimeout(() => { setRound((r) => r + 1); setPhase('countdown'); }, 700);
      return ns;
    });
  }, [target, endGame]);

  const startPlaying = useCallback(() => {
    setPhase('playing');
    setHint('Beat the clock!');
    spawnTarget();
    if (!spokeRef.current) { spokeRef.current = true; speakTTS(COPY.ttsIntro, 0.78); }
  }, [spawnTarget]);

  useEffect(() => { scoreRef.current = score; roundRef.current = round; }, [score, round]);
  useEffect(() => {
    if (!showInfo && !done && phase === 'idle') setPhase('countdown');
  }, [showInfo, done, round, phase]);
  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); clearTimer(); }, []);

  const exit = () => { stopAllSpeech(); cleanupSounds(); clearTimer(); onBack?.(); };
  const timePercent = target ? (target.timeLeft / TIME_LIMIT_MS) * 100 : 0;

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{ theme: THEME, emoji: COPY.emoji, title: COPY.title, tagline: COPY.tagline, body: COPY.body, chips: [...COPY.chips], startLabel: COPY.startLabel, startGradient: ['#10B981', '#059669', '#047857'], backdrop: <RaceTrackBackdrop /> }}
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
        gameTitle="Race Tap"
        emoji={COPY.emoji}
        round={round}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="HITS"
        hint={hint}
        showHint={phase === 'playing'}
        extra={target ? <Text style={styles.timerLbl}>{(target.timeLeft / 1000).toFixed(1)}s left</Text> : null}
      />
      <View style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }}>
        <RaceTrackBackdrop />
        {target && phase === 'playing' && target.timeLeft > 0 && (
          <>
            <PulsingTarget x={target.x} y={target.y} scale={target.scale} timePercent={timePercent} />
            <Pressable onPress={onHit} style={[styles.hitZone, { left: target.x - 44, top: target.y - 44, width: 88, height: 88 }]} />
          </>
        )}
        {phase === 'countdown' && <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startPlaying} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#6EE7B7' },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(6,78,59,0.5)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(16,185,129,0.4)' },
  timerLbl: { textAlign: 'center', fontSize: 13, fontWeight: '900', color: '#047857', marginTop: 4 },
  hitZone: { position: 'absolute', zIndex: 6, borderRadius: 44 },
});

export default TimedTargetGameNew;
