/**
 * OT Level 5 · Session 8 · Game 4 — Focus Field (distraction mode)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { FocusFieldBackdrop } from '@/components/game/occupational/level5/session8/focusField/FocusFieldVisuals';
import { FOCUS_FIELD_COPY, FOCUS_FIELD_META, FOCUS_FIELD_THEME } from '@/components/game/occupational/level5/session8/focusField/focusFieldTheme';
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

const LOG_TYPE = 'distraction-mode';
const TARGET_SIZE = 64;
const DISTRACTION_SIZE = 48;
const TOLERANCE = 50;
const { width: SW, height: SH } = Dimensions.get('window');

const THEME = FOCUS_FIELD_THEME;
const COPY = FOCUS_FIELD_COPY;
const META = FOCUS_FIELD_META;

type Obj = { id: string; x: number; y: number; isTarget: boolean; scale: number };

const FocusFieldGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<Obj[]>([]);
  const playW = useRef(SW); const playH = useRef(SH);
  const endRef = useRef<((s: number) => Promise<void>) | null>(null);

  const generate = useCallback(() => {
    const used = new Set<string>();
    const place = (size: number) => {
      let x: number; let y: number; let a = 0;
      do { x = Math.random() * (playW.current - size) + size / 2; y = Math.random() * (playH.current - size - 40) + size / 2 + 20; a++; }
      while (used.has(`${Math.floor(x / 50)}-${Math.floor(y / 50)}`) && a < 20);
      used.add(`${Math.floor(x / 50)}-${Math.floor(y / 50)}`);
      return { x, y };
    };
    const t = place(TARGET_SIZE);
    const items: Obj[] = [{ id: 'target', x: t.x, y: t.y, isTarget: true, scale: 1 }];
    for (let i = 0; i < 4; i++) { const p = place(DISTRACTION_SIZE); items.push({ id: `d-${i}`, x: p.x, y: p.y, isTarget: false, scale: 1 }); }
    setObjects(items);
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    const total = P.distractionRounds;
    const xp = finalScore * P.standardXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true); setShowCongrats(true); setPhase('idle');
    speakTTS(COPY.ttsComplete, 0.78).catch(() => {});
    try {
      await logGameAndAward({ type: LOG_TYPE, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: ['focus-under-load', 'selective-attention', 'distraction-resistance'] });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [router]);

  useEffect(() => { endRef.current = endGame; }, [endGame]);

  const handleTap = useCallback((e: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || phase !== 'playing') return;
    const { locationX: tx, locationY: ty } = e.nativeEvent;
    for (const obj of objects) {
      const size = obj.isTarget ? TARGET_SIZE : DISTRACTION_SIZE;
      if (Math.hypot(tx - obj.x, ty - obj.y) > TOLERANCE + size / 2) continue;
      if (obj.isTarget) {
        setObjects((prev) => prev.map((o) => (o.id === obj.id ? { ...o, scale: 1.4 } : o)));
        setTimeout(() => setObjects((prev) => prev.map((o) => ({ ...o, scale: 1 }))), 200);
        setScore((s) => { const ns = s + 1; if (ns >= P.distractionRounds) setTimeout(() => endRef.current?.(ns), 900); else setTimeout(() => setRound((r) => r + 1), 1100); return ns; });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Focus maintained!', 0.9).catch(() => {});
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Focus on the target!', 0.8).catch(() => {});
      }
      return;
    }
  }, [done, objects, phase]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') { stopTTS(); generate(); setTimeout(() => speakTTS('Tap the target, ignore distractions!', 0.8).catch(() => {}), 350); }
  }, [showInfo, round, done, phase, generate]);

  const handleExit = () => { stopTTS(); cleanupSounds(); onBack?.(); };

  if (showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><TrackIntro theme={THEME} copy={COPY} chips={[...META.chips]} startLabel={META.startLabel} startColors={META.startColors} backdrop={<FocusFieldBackdrop />} onStart={() => { setShowInfo(false); setPhase('countdown'); }} onBack={handleExit} /></SafeAreaView>;
  if (showCongrats && done && finalStats) return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp} onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={handleExit} />;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={[styles.exit, { borderColor: THEME.hudBorder, backgroundColor: THEME.hudGlass }]}><Text style={{ color: THEME.title, fontWeight: '800' }}>← Exit</Text></TouchableOpacity>
      <TrackHUD theme={THEME} gameTitle={META.gameTitle} roundLabel={META.roundLabel} round={round} total={P.distractionRounds} score={score} scoreLabel={META.scoreLabel} hint="Tap the bullseye — ignore decoys!" phaseLabel={META.phaseLabel} playing={phase === 'playing'} />
      <Pressable style={[styles.arena, { borderColor: THEME.hudBorder }]} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }} onPress={handleTap}>
        <FocusFieldBackdrop />
        {phase === 'playing' && objects.map((obj) => {
          const size = obj.isTarget ? TARGET_SIZE : DISTRACTION_SIZE;
          return (
            <View key={obj.id} pointerEvents="none" style={{ position: 'absolute', left: obj.x - size / 2, top: obj.y - size / 2, zIndex: obj.isTarget ? 10 : 5 }}>
              <TrackOrb size={size} color={obj.isTarget ? '#10B981' : '#94A3B8'} emoji={obj.isTarget ? '🎯' : '⚪'} scale={obj.scale} dimmed={!obj.isTarget} pulse={obj.isTarget} />
            </View>
          );
        })}
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

export default FocusFieldGame;
