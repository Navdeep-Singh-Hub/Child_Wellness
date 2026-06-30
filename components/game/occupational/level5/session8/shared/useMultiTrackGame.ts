/**
 * Shared multi-object tracking logic — modes: follow-red, two-balls, speed-pick
 */
import type { MultiTrackConfig } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import { SESSION5_8_PACING as P } from '@/components/game/occupational/level5/session8/session8Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

const TOLERANCE = 50;
const { width: SW, height: SH } = Dimensions.get('window');

const DISTRACTOR_STYLES = [
  { color: '#3B82F6', emoji: '🔵' },
  { color: '#10B981', emoji: '🟢' },
  { color: '#FCD34D', emoji: '🟡' },
  { color: '#8B5CF6', emoji: '🟣' },
];

export type TrackObject = {
  id: string;
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  color: string;
  emoji: string;
  isTarget: boolean;
  isFast: boolean;
  scale: number;
};

export type TrackPhase = 'countdown' | 'playing' | 'idle';

type Options = { config: MultiTrackConfig; ttsComplete?: string; onBack?: () => void };

export function useMultiTrackGame({ config, ttsComplete, onBack }: Options) {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<TrackPhase>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<TrackObject[]>([]);
  const [targetFast, setTargetFast] = useState(true);

  const playW = useRef(SW);
  const playH = useRef(SH);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetFastRef = useRef(true);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);

  const clearAnim = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
  }, []);

  const generateObjects = useCallback(() => {
    const size = config.objectSize;
    const items: TrackObject[] = [];

    if (config.mode === 'follow-red') {
      items.push({
        id: 'red', x: Math.random() * (playW.current - size) + size / 2, y: Math.random() * (playH.current - size - 40) + size / 2 + 20,
        directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed, directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
        color: '#EF4444', emoji: '🔴', isTarget: true, isFast: true, scale: 1,
      });
      for (let i = 0; i < config.objectCount - 1; i++) {
        const style = DISTRACTOR_STYLES[i % DISTRACTOR_STYLES.length]!;
        items.push({
          id: `d-${i}`, x: Math.random() * (playW.current - size) + size / 2, y: Math.random() * (playH.current - size - 40) + size / 2 + 20,
          directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed, directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
          color: style.color, emoji: style.emoji, isTarget: false, isFast: true, scale: 1,
        });
      }
    } else if (config.mode === 'two-balls') {
      const targetIdx = Math.floor(Math.random() * 2);
      for (let i = 0; i < 2; i++) {
        items.push({
          id: `ball-${i}`, x: Math.random() * (playW.current - size) + size / 2, y: Math.random() * (playH.current - size - 40) + size / 2 + 20,
          directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed, directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
          color: i === targetIdx ? '#10B981' : '#3B82F6', emoji: i === targetIdx ? '⭐' : '⚽', isTarget: i === targetIdx, isFast: true, scale: 1,
        });
      }
    } else {
      const wantFast = Math.random() > 0.5;
      targetFastRef.current = wantFast;
      setTargetFast(wantFast);
      for (let i = 0; i < config.objectCount; i++) {
        const fast = i < 2;
        const spd = fast ? config.speed : (config.slowSpeed ?? 0.8);
        items.push({
          id: `sp-${i}`, x: Math.random() * (playW.current - size) + size / 2, y: Math.random() * (playH.current - size - 40) + size / 2 + 20,
          directionX: (Math.random() > 0.5 ? 1 : -1) * spd, directionY: (Math.random() > 0.5 ? 1 : -1) * spd,
          color: fast ? '#EF4444' : '#10B981', emoji: fast ? '⚡' : '🐢', isTarget: false, isFast: fast, scale: 1,
        });
      }
    }
    setObjects(items);
  }, [config]);

  const moveObjects = useCallback(() => {
    clearAnim();
    const size = config.objectSize;
    animRef.current = setInterval(() => {
      setObjects((prev) => prev.map((obj) => {
        const spd = config.mode === 'speed-pick' ? (obj.isFast ? config.speed : (config.slowSpeed ?? 0.8)) : config.speed;
        let newX = obj.x + obj.directionX;
        let newY = obj.y + obj.directionY;
        let newDirX = obj.directionX;
        let newDirY = obj.directionY;
        if (newX <= size / 2 || newX >= playW.current - size / 2) { newDirX *= -1; newX = Math.max(size / 2, Math.min(playW.current - size / 2, newX)); }
        if (newY <= size / 2 + 20 || newY >= playH.current - size / 2 - 20) { newDirY *= -1; newY = Math.max(size / 2 + 20, Math.min(playH.current - size / 2 - 20, newY)); }
        return { ...obj, x: newX, y: newY, directionX: newDirX, directionY: newDirY };
      }));
    }, 16);
  }, [clearAnim, config]);

  const endGame = useCallback(async (finalScore: number) => {
    clearAnim();
    const total = P.standardRounds;
    const xp = finalScore * P.standardXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setShowCongrats(true);
    setPhase('idle');
    if (ttsComplete) speakTTS(ttsComplete, 0.78).catch(() => {});
    try {
      await logGameAndAward({ type: config.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: config.skillTags });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [clearAnim, config.logType, config.skillTags, router, ttsComplete]);

  useEffect(() => { endGameRef.current = endGame; }, [endGame]);

  const onSuccess = useCallback(() => {
    clearAnim();
    setObjects((prev) => prev.map((o) => ({ ...o, scale: 1.35 })));
    setTimeout(() => setObjects((prev) => prev.map((o) => ({ ...o, scale: 1 }))), 200);
    setScore((s) => {
      const ns = s + 1;
      if (ns >= P.standardRounds) setTimeout(() => endGameRef.current?.(ns), 900);
      else setTimeout(() => setRound((r) => r + 1), 1100);
      return ns;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(config.ttsSuccess, 0.9).catch(() => {});
  }, [clearAnim, config.ttsSuccess]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || phase !== 'playing' || objects.length === 0) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const size = config.objectSize;
    for (const obj of objects) {
      if (Math.hypot(tapX - obj.x, tapY - obj.y) > TOLERANCE + size / 2) continue;
      let correct = config.mode === 'follow-red' || config.mode === 'two-balls' ? obj.isTarget : obj.isFast === targetFastRef.current;
      if (correct) onSuccess();
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(config.mode === 'speed-pick' ? `Tap the ${targetFastRef.current ? 'fast' : 'slow'} object!` : config.ttsMiss, 0.8).catch(() => {});
      }
      return;
    }
  }, [config, done, objects, onSuccess, phase]);

  const startRound = useCallback(() => {
    stopTTS();
    generateObjects();
    moveObjects();
    setTimeout(() => {
      speakTTS(config.mode === 'speed-pick' ? `Tap the ${targetFastRef.current ? 'fast' : 'slow'} object!` : config.ttsStart, 0.8).catch(() => {});
    }, 350);
  }, [config.mode, config.ttsStart, generateObjects, moveObjects]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') { startRound(); return clearAnim; }
  }, [showInfo, round, done, phase, startRound, clearAnim]);

  const handleStart = useCallback(() => { setShowInfo(false); setPhase('countdown'); }, []);
  const handleExit = useCallback(() => { stopTTS(); cleanupSounds(); clearAnim(); onBack?.(); }, [clearAnim, onBack]);
  useEffect(() => () => { try { stopTTS(); } catch { /* ignore */ } cleanupSounds(); clearAnim(); }, [clearAnim]);

  const hint = config.mode === 'speed-pick' ? `Tap the ${targetFast ? 'fast ⚡' : 'slow 🐢'} object!` : config.instruction;

  return {
    showInfo, showCongrats, done, finalStats, phase, round, score, hint, objects, targetFast,
    totalRounds: P.standardRounds, objectSize: config.objectSize,
    handleStart, handleExit, handleTap, beginPlaying: () => setPhase('playing'),
    onLayout: (w: number, h: number) => { playW.current = w; playH.current = h; },
  };
}
