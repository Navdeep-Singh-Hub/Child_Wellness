/**
 * Shared depth & distance game logic — OT Level 5 Session 7
 */
import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import type { DepthGameConfig } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { SESSION5_7_PACING as P } from '@/components/game/occupational/level5/session7/session7Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');
export const NEAR_SIZE = 72;
export const FAR_SIZE = 38;
const TOLERANCE = 50;
const NEAR_DISTANCE = 95;
const FAR_DISTANCE = 235;
export const ANCHOR_SIZE = 52;

export type NearFarTarget = { id: string; x: number; y: number; isNear: boolean; scale: number };
export type LayerTarget = { id: string; x: number; y: number; size: number; color: string; emoji: string; isFront: boolean };
export type DepthPhase = 'countdown' | 'playing' | 'idle';

type Options = {
  config: DepthGameConfig;
  ttsComplete?: string;
  onBack?: () => void;
};

export function lineStyle(ax: number, ay: number, bx: number, by: number) {
  const length = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
  const angleDeg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  return { left: ax, top: ay, width: length, transform: [{ rotate: `${angleDeg}deg` }] };
}

export function useDepthDistanceGame({ config, ttsComplete, onBack }: Options) {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<DepthPhase>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const playW = useRef(SW);
  const playH = useRef(SH);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const [nearFarTargets, setNearFarTargets] = useState<NearFarTarget[]>([]);
  const [tapNear, setTapNear] = useState(true);
  const tapNearRef = useRef(true);
  const [anchorPoint, setAnchorPoint] = useState({ x: SW * 0.5, y: SH * 0.82 });

  const [zoomPos, setZoomPos] = useState({ x: SW * 0.5, y: SH * 0.45 });
  const [zoomScale, setZoomScale] = useState(0.4);
  const [zoomReady, setZoomReady] = useState(false);

  const [fallPos, setFallPos] = useState({ x: SW * 0.5, y: 80 });
  const [fallActive, setFallActive] = useState(false);
  const fallMissedRef = useRef(false);

  const [shrinkPos, setShrinkPos] = useState({ x: SW * 0.5, y: SH * 0.45 });
  const [shrinkSize, setShrinkSize] = useState(90);
  const [shrinkActive, setShrinkActive] = useState(false);

  const [layers, setLayers] = useState<LayerTarget[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const scheduleInterval = useCallback((fn: () => void, ms: number) => {
    intervalsRef.current.push(setInterval(fn, ms));
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearTimers();
    const total = P.rounds;
    const xp = finalScore * P.xpPerScore;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setShowCongrats(true);
    setPhase('idle');
    if (ttsComplete) speakTTS(ttsComplete, 0.78).catch(() => {});
    try {
      await logGameAndAward({ type: config.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: config.skillTags });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [clearTimers, config.logType, config.skillTags, router, ttsComplete]);

  useEffect(() => { endGameRef.current = endGame; }, [endGame]);

  const advanceOrFinish = useCallback((success: boolean) => {
    if (!success) return;
    setScore((s) => {
      const ns = s + 1;
      if (ns >= P.rounds) scheduleTimeout(() => endGameRef.current?.(ns), 800);
      else scheduleTimeout(() => setRound((r) => r + 1), 1000);
      return ns;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Great!', 0.9).catch(() => {});
  }, [scheduleTimeout]);

  const randomX = useCallback((size: number) => Math.random() * (playW.current - size) + size / 2, []);
  const randomY = useCallback((size: number) => Math.random() * (playH.current - size - 40) + size / 2 + 20, []);
  const getAnchor = useCallback(() => ({ x: playW.current * 0.5, y: playH.current * 0.86 }), []);

  const startNearFarRound = useCallback(() => {
    const isNear = Math.random() > 0.5;
    tapNearRef.current = isNear;
    setTapNear(isNear);
    const anchor = getAnchor();
    setAnchorPoint(anchor);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    const place = (dist: number, near: boolean): NearFarTarget => ({
      id: near ? 'near' : 'far',
      x: anchor.x + Math.cos(angle) * dist,
      y: anchor.y + Math.sin(angle) * dist,
      isNear: near,
      scale: 1,
    });
    setNearFarTargets([place(NEAR_DISTANCE, true), place(FAR_DISTANCE, false)]);
    scheduleTimeout(() => speakTTS(isNear ? 'Tap the object closer to the yellow point!' : 'Tap the object farther from the yellow point!', 0.8).catch(() => {}), 400);
  }, [getAnchor, scheduleTimeout]);

  const startZoomRound = useCallback(() => {
    setZoomPos({ x: randomX(70), y: randomY(70) });
    setZoomScale(0.35);
    setZoomReady(false);
    let scale = 0.35;
    scheduleInterval(() => {
      scale += 0.04;
      setZoomScale(scale);
      if (scale >= 1.15) setZoomReady(true);
      if (scale >= 1.6) {
        clearTimers();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS('Try again!', 0.8).catch(() => {});
        scheduleTimeout(() => setRound((r) => r + 1), 800);
      }
    }, 120);
    scheduleTimeout(() => speakTTS('Tap when it is big!', 0.8).catch(() => {}), 300);
  }, [clearTimers, randomX, randomY, scheduleInterval, scheduleTimeout]);

  const startFallingRound = useCallback(() => {
    fallMissedRef.current = false;
    setFallPos({ x: randomX(60), y: 60 });
    setFallActive(true);
    let y = 60;
    scheduleInterval(() => {
      y += 14;
      setFallPos((p) => ({ ...p, y }));
      if (y >= playH.current - 80 && !fallMissedRef.current) {
        fallMissedRef.current = true;
        setFallActive(false);
        clearTimers();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS('Too late!', 0.8).catch(() => {});
        scheduleTimeout(() => setRound((r) => r + 1), 800);
      }
    }, 50);
    scheduleTimeout(() => speakTTS('Catch it!', 0.8).catch(() => {}), 300);
  }, [clearTimers, randomX, scheduleInterval, scheduleTimeout]);

  const startShrinkingRound = useCallback(() => {
    setShrinkPos({ x: randomX(90), y: randomY(90) });
    setShrinkSize(95);
    setShrinkActive(true);
    let size = 95;
    scheduleInterval(() => {
      size -= 4;
      setShrinkSize(size);
      if (size <= 20) {
        setShrinkActive(false);
        clearTimers();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS('Too small!', 0.8).catch(() => {});
        scheduleTimeout(() => setRound((r) => r + 1), 800);
      }
    }, 200);
    scheduleTimeout(() => speakTTS('Tap it quickly!', 0.8).catch(() => {}), 300);
  }, [clearTimers, randomX, randomY, scheduleInterval, scheduleTimeout]);

  const startLayersRound = useCallback(() => {
    const baseX = randomX(100);
    const baseY = randomY(100);
    const frontIndex = Math.floor(Math.random() * 3);
    const data: LayerTarget[] = [
      { id: 'back', x: baseX - 30, y: baseY + 20, size: 55, color: '#93C5FD', emoji: '🔵', isFront: frontIndex === 0 },
      { id: 'mid', x: baseX + 20, y: baseY, size: 70, color: '#F9A8D4', emoji: '🟣', isFront: frontIndex === 1 },
      { id: 'front', x: baseX, y: baseY - 15, size: 85, color: '#FCD34D', emoji: '🟡', isFront: frontIndex === 2 },
    ];
    setLayers(data.map((l, i) => ({ ...l, isFront: i === frontIndex })));
    scheduleTimeout(() => speakTTS('Tap the front circle!', 0.8).catch(() => {}), 300);
  }, [randomX, randomY, scheduleTimeout]);

  const startRound = useCallback(() => {
    clearTimers();
    stopTTS();
    switch (config.mode) {
      case 'near-far': startNearFarRound(); break;
      case 'zoom': startZoomRound(); break;
      case 'falling': startFallingRound(); break;
      case 'shrinking': startShrinkingRound(); break;
      case 'layers': startLayersRound(); break;
    }
  }, [clearTimers, config.mode, startFallingRound, startLayersRound, startNearFarRound, startShrinkingRound, startZoomRound]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') startRound();
  }, [showInfo, round, done, phase, startRound]);

  const handleTap = useCallback((event: GestureResponderEvent) => {
    if (done || phase !== 'playing') return;

    if (config.mode === 'near-far') {
      for (const target of nearFarTargets) {
        const size = target.isNear ? NEAR_SIZE : FAR_SIZE;
        if (!isTapNearTarget(event, target.x, target.y, size, TOLERANCE)) continue;
        if (target.isNear === tapNearRef.current) advanceOrFinish(true);
        else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(tapNearRef.current ? 'Tap the one closer to the yellow point!' : 'Tap the one farther from the yellow point!', 0.8).catch(() => {});
        }
        return;
      }
      return;
    }

    if (config.mode === 'zoom') {
      const size = 70 * zoomScale;
      if (zoomReady && isTapNearTarget(event, zoomPos.x, zoomPos.y, size, TOLERANCE)) {
        clearTimers();
        setZoomReady(false);
        advanceOrFinish(true);
      }
      return;
    }

    if (config.mode === 'falling') {
      if (!fallActive) return;
      if (isTapNearTarget(event, fallPos.x, fallPos.y, 56, TOLERANCE)) {
        clearTimers();
        setFallActive(false);
        advanceOrFinish(true);
      }
      return;
    }

    if (config.mode === 'shrinking') {
      if (!shrinkActive) return;
      if (isTapNearTarget(event, shrinkPos.x, shrinkPos.y, shrinkSize, TOLERANCE)) {
        clearTimers();
        setShrinkActive(false);
        advanceOrFinish(true);
      }
      return;
    }

    if (config.mode === 'layers') {
      for (const layer of layers) {
        if (!isTapNearTarget(event, layer.x, layer.y, layer.size, TOLERANCE)) continue;
        if (layer.isFront) advanceOrFinish(true);
        else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS('Tap the front layer!', 0.8).catch(() => {});
        }
        return;
      }
    }
  }, [advanceOrFinish, clearTimers, config.mode, done, fallActive, fallPos.x, fallPos.y, layers, nearFarTargets, phase, shrinkActive, shrinkPos.x, shrinkPos.y, shrinkSize, zoomPos.x, zoomPos.y, zoomReady, zoomScale]);

  const hint = (() => {
    if (config.mode === 'near-far') return tapNear ? 'Tap closer to 📍 You' : 'Tap farther from 📍 You';
    if (config.mode === 'zoom' && zoomReady) return '🔍 Tap now — it is big!';
    return config.instruction;
  })();

  const handleStart = useCallback(() => { setShowInfo(false); setPhase('countdown'); }, []);
  const handleExit = useCallback(() => { stopTTS(); cleanupSounds(); clearTimers(); onBack?.(); }, [clearTimers, onBack]);

  useEffect(() => () => { try { stopTTS(); } catch { /* ignore */ } cleanupSounds(); clearTimers(); }, [clearTimers]);

  return {
    showInfo, showCongrats, done, finalStats, phase, round, score, hint, tapNear, totalRounds: P.rounds,
    nearFarTargets, anchorPoint, zoomPos, zoomScale, zoomReady, fallPos, fallActive, shrinkPos, shrinkSize, shrinkActive, layers,
    handleStart, handleExit, handleTap,
    onLayout: (w: number, h: number) => {
      playW.current = w;
      playH.current = h;
      if (config.mode === 'near-far') setAnchorPoint(getAnchor());
    },
    beginPlaying: () => setPhase('playing'),
  };
}
