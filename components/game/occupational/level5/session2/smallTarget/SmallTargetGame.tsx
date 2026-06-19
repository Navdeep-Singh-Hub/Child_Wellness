/**
 * OT Level 5 · Session 2 · Game 3 — Small Target (Archery Range)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ArcheryRangeBackdrop, BullseyeTarget, HitRipple } from '@/components/game/occupational/level5/session2/smallTarget/SmallTargetVisuals';
import { BULLSEYE_SIZE, SMALL_TARGET_COPY as COPY, SMALL_TARGET_THEME as THEME } from '@/components/game/occupational/level5/session2/smallTarget/smallTargetTheme';
import { SESSION5_2_PACING as P } from '@/components/game/occupational/level5/session2/session2Pacing';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Target { id: string; x: number; y: number; scale: number }

const SmallTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const [hint, setHint] = useState('');

  const playW = useRef(340);
  const playH = useRef(400);
  const spokeRef = useRef(false);

  const spawn = useCallback(() => {
    const pad = BULLSEYE_SIZE + 8;
    setTargets([{
      id: `t-${Date.now()}`,
      x: Math.random() * (playW.current - pad * 2) + pad,
      y: Math.random() * (playH.current - pad * 2 - 40) + pad + 20,
      scale: 1,
    }]);
  }, []);

  const endGame = useCallback((finalScore: number) => {
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

  const onHit = useCallback((t: Target) => {
    if (done) return;
    setRipple({ x: t.x, y: t.y, key: Date.now() });
    setTimeout(() => setRipple(null), 520);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.9);
    setTargets([]);
    setScore((s) => {
      const ns = s + 1;
      if (ns >= P.rounds) setTimeout(() => endGame(ns), 800);
      else setTimeout(() => { setRound((r) => r + 1); setPhase('countdown'); }, 800);
      return ns;
    });
  }, [done, endGame]);

  const startPlaying = useCallback(() => {
    setPhase('playing');
    setHint('Tap the bullseye center!');
    spawn();
    if (!spokeRef.current) { spokeRef.current = true; speakTTS(COPY.ttsIntro, 0.78); }
  }, [spawn]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'idle') setPhase('countdown');
  }, [showInfo, done, round, phase]);

  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); }, []);
  const exit = () => { stopAllSpeech(); cleanupSounds(); onBack?.(); };

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{ theme: THEME, emoji: COPY.emoji, title: COPY.title, tagline: COPY.tagline, body: COPY.body, chips: [...COPY.chips], startLabel: COPY.startLabel, startGradient: ['#EF4444', '#DC2626', '#B91C1C'], backdrop: <ArcheryRangeBackdrop /> }}
          onStart={() => setShowInfo(false)}
          onBack={exit}
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return <CongratulationsScreen message={COPY.congrats} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp} onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={exit} />;
  }

  const target = targets[0];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={exit} style={styles.back}><Text style={styles.backText}>← Exit</Text></TouchableOpacity>
      <Session2HUD theme={THEME} gameTitle="Bullseye" emoji={COPY.emoji} round={round} totalRounds={P.rounds} score={score} scoreLabel="HITS" hint={hint} showHint={phase === 'playing'} />
      <View style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }}>
        <ArcheryRangeBackdrop />
        {target && phase === 'playing' && (
          <>
            <BullseyeTarget x={target.x} y={target.y} scale={target.scale} showCrosshair={round <= 3} />
            <Pressable onPress={() => onHit(target)} style={[styles.hitZone, { left: target.x - BULLSEYE_SIZE, top: target.y - BULLSEYE_SIZE, width: BULLSEYE_SIZE * 2, height: BULLSEYE_SIZE * 2 }]} />
          </>
        )}
        {ripple && <HitRipple x={ripple.x} y={ripple.y} visible />}
        {phase === 'countdown' && <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startPlaying} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBBF24' },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(120,53,15,0.55)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(251,191,36,0.55)' },
  hitZone: { position: 'absolute', zIndex: 6, borderRadius: 999 },
});

export default SmallTargetGame;
