/**
 * OT Level 5 · Session 8 · Game 5 — Sequence Chase (pattern chase)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SequenceChaseBackdrop } from '@/components/game/occupational/level5/session8/sequenceChase/SequenceChaseVisuals';
import { SEQUENCE_CHASE_COPY, SEQUENCE_CHASE_META, SEQUENCE_CHASE_THEME } from '@/components/game/occupational/level5/session8/sequenceChase/sequenceChaseTheme';
import { TrackCountdown, TrackHUD, TrackIntro, TrackOrb } from '@/components/game/occupational/level5/session8/shared/MultiTrackUI';
import { SESSION5_8_PACING as P } from '@/components/game/occupational/level5/session8/session8Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOG_TYPE = 'pattern-chase';
const OBJECT_SIZE = 52;
const TOLERANCE = 50;
const { width: SW, height: SH } = Dimensions.get('window');
const PATTERNS = [['🔴', '🔵', '🟢', '🟡'], ['⭐', '💎', '🎈', '🎁'], ['🔴', '🔴', '🔵', '🔵'], ['🟢', '🟡', '🟢', '🟡']];

const THEME = SEQUENCE_CHASE_THEME;
const COPY = SEQUENCE_CHASE_COPY;
const META = SEQUENCE_CHASE_META;

type PatObj = { id: string; x: number; y: number; emoji: string; index: number; scale: number; isCorrect: boolean };

const SequenceChaseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [pattern, setPattern] = useState<string[]>([]);
  const [objects, setObjects] = useState<PatObj[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPattern, setShowPattern] = useState(true);
  const playW = useRef(SW); const playH = useRef(SH);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<((s: number) => Promise<void>) | null>(null);

  const clearTimer = useCallback(() => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearTimer();
    const total = P.patternRounds;
    const xp = finalScore * P.patternXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true); setShowCongrats(true); setPhase('idle');
    speakTTS(COPY.ttsComplete, 0.78).catch(() => {});
    try {
      await logGameAndAward({ type: LOG_TYPE, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: ['visual-memory', 'pattern-recognition', 'sequence-following'] });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [clearTimer, router]);

  useEffect(() => { endRef.current = endGame; }, [endGame]);

  const generateRound = useCallback(() => {
    clearTimer();
    const selected = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]!;
    setPattern(selected); setCurrentIndex(0); setShowPattern(true);
    let step = 0;
    const showStep = () => {
      if (step < selected.length) {
        const objs: PatObj[] = [];
        for (let i = 0; i <= step; i++) objs.push({ id: `p-${i}`, x: (playW.current / (selected.length + 1)) * (i + 1), y: playH.current * 0.32, emoji: selected[i]!, index: i, scale: 1, isCorrect: true });
        setObjects(objs); step++;
        timerRef.current = setTimeout(showStep, 800);
      } else {
        timerRef.current = setTimeout(() => {
          setShowPattern(false);
          const all = [...new Set(PATTERNS.flat())];
          const choices: PatObj[] = [];
          for (let i = 0; i < selected.length; i++) {
            const correct = selected[i]!;
            const wrong = all.filter((e) => e !== correct)[Math.floor(Math.random() * (all.length - 1))]!;
            choices.push({ id: `c-${i}-ok`, x: (playW.current / (selected.length + 1)) * (i + 1) - 30, y: playH.current * 0.58, emoji: correct, index: i, scale: 1, isCorrect: true });
            choices.push({ id: `c-${i}-no`, x: (playW.current / (selected.length + 1)) * (i + 1) + 30, y: playH.current * 0.58, emoji: wrong, index: i, scale: 1, isCorrect: false });
          }
          setObjects(choices); setCurrentIndex(0);
          speakTTS('Follow the pattern!', 0.8).catch(() => {});
        }, 1000);
      }
    };
    showStep();
  }, [clearTimer]);

  const handleTap = useCallback((e: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || phase !== 'playing' || showPattern || !pattern.length) return;
    const { locationX: tx, locationY: ty } = e.nativeEvent;
    for (const obj of objects) {
      if (Math.hypot(tx - obj.x, ty - obj.y) > TOLERANCE + OBJECT_SIZE / 2) continue;
      if (obj.isCorrect && obj.emoji === pattern[currentIndex]) {
        setObjects((prev) => prev.map((o) => (o.id === obj.id ? { ...o, scale: 1.4 } : o)));
        setTimeout(() => setObjects((prev) => prev.map((o) => ({ ...o, scale: 1 }))), 200);
        if (currentIndex < pattern.length - 1) { setCurrentIndex((i) => i + 1); speakTTS('Next!', 0.9).catch(() => {}); }
        else {
          setScore((s) => { const ns = s + 1; if (ns >= P.patternRounds) setTimeout(() => endRef.current?.(ns), 900); else setTimeout(() => setRound((r) => r + 1), 1200); return ns; });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          speakTTS('Pattern complete!', 0.9).catch(() => {});
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Follow the pattern!', 0.8).catch(() => {});
      }
      return;
    }
  }, [currentIndex, done, objects, pattern, phase, showPattern]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') { stopTTS(); generateRound(); setTimeout(() => speakTTS('Watch the pattern!', 0.8).catch(() => {}), 350); }
  }, [showInfo, round, done, phase, generateRound]);

  const handleExit = () => { clearTimer(); stopTTS(); cleanupSounds(); onBack?.(); };
  const hint = showPattern ? 'Watch the sequence…' : `Step ${currentIndex + 1} of ${pattern.length}`;

  if (showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><TrackIntro theme={THEME} copy={COPY} chips={[...META.chips]} startLabel={META.startLabel} startColors={META.startColors} backdrop={<SequenceChaseBackdrop />} onStart={() => { setShowInfo(false); setPhase('countdown'); }} onBack={handleExit} /></SafeAreaView>;
  if (showCongrats && done && finalStats) return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp} onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={handleExit} />;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={[styles.exit, { borderColor: THEME.hudBorder, backgroundColor: THEME.hudGlass }]}><Text style={{ color: THEME.title, fontWeight: '800' }}>← Exit</Text></TouchableOpacity>
      <TrackHUD theme={THEME} gameTitle={META.gameTitle} roundLabel={META.roundLabel} round={round} total={P.patternRounds} score={score} scoreLabel={META.scoreLabel} hint={hint} phaseLabel={showPattern ? 'WATCH' : 'RECALL'} playing={phase === 'playing'} />
      <Pressable style={[styles.arena, { borderColor: THEME.hudBorder }]} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }} onPress={handleTap}>
        <SequenceChaseBackdrop />
        {phase === 'playing' && objects.map((obj) => (
          <View key={obj.id} pointerEvents="none" style={{ position: 'absolute', left: obj.x - OBJECT_SIZE / 2, top: obj.y - OBJECT_SIZE / 2, zIndex: 10, opacity: showPattern ? 1 : obj.index < currentIndex ? 0.45 : obj.index === currentIndex ? 1 : 0.55 }}>
            <TrackOrb size={OBJECT_SIZE} color="#FFFFFF" emoji={obj.emoji} scale={obj.scale} pulse={showPattern && obj.id.startsWith('p')} />
          </View>
        ))}
        {phase === 'countdown' && <TrackCountdown accent={THEME.accent} onDone={() => setPhase('playing')} />}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: META.rootBg },
  exit: { position: 'absolute', top: 52, left: 14, zIndex: 50, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
});

export default SequenceChaseGame;
