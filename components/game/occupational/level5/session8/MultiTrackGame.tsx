import { TrackOrb, TargetZoneBoxes, buildTargetZones, isObjectInTargetZone, type TargetZoneLayout } from '@/components/game/occupational/level5/session8/MultiTrackVisuals';
import { MultiTrackShell, useMultiTrackExit } from '@/components/game/occupational/level5/session8/MultiTrackShell';
import type { MultiTrackConfig } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import { getMultiTrackTheme } from '@/components/game/occupational/level5/session8/multiTrackThemes';
import { SESSION5_8_PACING as P } from '@/components/game/occupational/level5/session8/session8Pacing';
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

const TOLERANCE = 50;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function scatterPositions(count: number, size: number, width: number, height: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const minDist = size * 1.15;
  for (let i = 0; i < count; i++) {
    let x = width * 0.5;
    let y = height * 0.5;
    for (let attempt = 0; attempt < 48; attempt++) {
      x = Math.random() * (width - size) + size / 2;
      y = Math.random() * (height - size - 40) + size / 2 + 20;
      if (points.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist)) break;
    }
    points.push({ x, y });
  }
  return points;
}

const DISTRACTOR_STYLES = [
  { color: '#3B82F6', emoji: '🔵' },
  { color: '#10B981', emoji: '🟢' },
  { color: '#FCD34D', emoji: '🟡' },
  { color: '#8B5CF6', emoji: '🟣' },
];

interface TrackObject {
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
  currentLane?: 'upper' | 'lower';
}

const MultiTrackGame: React.FC<{ config: MultiTrackConfig; onBack?: () => void; onComplete?: () => void }> = ({
  config,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const { theme, copy } = getMultiTrackTheme(config.logType);
  const handleExit = useMultiTrackExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<TrackObject[]>([]);
  const [targetZones, setTargetZones] = useState<TargetZoneLayout>(() => buildTargetZones(SCREEN_WIDTH, SCREEN_HEIGHT));
  const [targetFast, setTargetFast] = useState(true);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const targetZonesRef = useRef<TargetZoneLayout>(buildTargetZones(SCREEN_WIDTH, SCREEN_HEIGHT));
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetFastRef = useRef(true);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);
  const speedFieldReadyRef = useRef(false);

  const totalRounds = config.mode === 'speed-pick' ? (config.rounds ?? P.standardRounds) : P.standardRounds;

  const clearAnim = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const generateObjects = useCallback(() => {
    const size = config.objectSize;
    const items: TrackObject[] = [];

    if (config.mode === 'follow-red') {
      items.push({
        id: 'red',
        x: Math.random() * (screenWidth.current - size) + size / 2,
        y: Math.random() * (screenHeight.current - size - 40) + size / 2 + 20,
        directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed,
        directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
        color: '#EF4444',
        emoji: '🔴',
        isTarget: true,
        isFast: true,
        scale: 1,
      });
      for (let i = 0; i < config.objectCount - 1; i++) {
        const style = DISTRACTOR_STYLES[i % DISTRACTOR_STYLES.length]!;
        items.push({
          id: `d-${i}`,
          x: Math.random() * (screenWidth.current - size) + size / 2,
          y: Math.random() * (screenHeight.current - size - 40) + size / 2 + 20,
          directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed,
          directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
          color: style.color,
          emoji: style.emoji,
          isTarget: false,
          isFast: true,
          scale: 1,
        });
      }
    } else if (config.mode === 'two-balls') {
      const zones = targetZonesRef.current;
      const targetIdx = Math.floor(Math.random() * 2);
      for (let i = 0; i < 2; i++) {
        const lane: 'upper' | 'lower' = i === 0 ? 'upper' : 'lower';
        const zone = zones[lane];
        items.push({
          id: `ball-${i}`,
          x: screenWidth.current * (lane === 'upper' ? 0.22 : 0.78),
          y: zone.y,
          directionX: (i === 0 ? 1 : -1) * config.speed,
          directionY: 0,
          color: i === targetIdx ? '#10B981' : '#3B82F6',
          emoji: i === targetIdx ? '⭐' : '⚽',
          isTarget: i === targetIdx,
          isFast: true,
          scale: 1,
          currentLane: lane,
        });
      }
    } else if (config.mode === 'speed-pick') {
      /* Speed Storm field is built once in initSpeedField */
    }

    setObjects(items);
  }, [config]);

  const moveObjects = useCallback(() => {
    clearAnim();
    const size = config.objectSize;
    animationRef.current = setInterval(() => {
      setObjects((prev) =>
        prev.map((obj) => {
          if (config.mode === 'two-balls') {
            const zones = targetZonesRef.current;
            const lane = obj.currentLane ?? 'upper';
            let newX = obj.x + obj.directionX;
            let newDirX = obj.directionX;
            let newLane = lane;

            if (newX <= size / 2 || newX >= screenWidth.current - size / 2) {
              newDirX *= -1;
              newX = Math.max(size / 2, Math.min(screenWidth.current - size / 2, newX));
              newLane = lane === 'upper' ? 'lower' : 'upper';
            }

            return {
              ...obj,
              x: newX,
              y: zones[newLane].y,
              directionX: newDirX,
              directionY: 0,
              currentLane: newLane,
            };
          }

          const spd =
            config.mode === 'speed-pick'
              ? obj.isFast
                ? config.speed
                : (config.slowSpeed ?? 0.8)
              : config.speed;
          let newX = obj.x + obj.directionX;
          let newY = obj.y + obj.directionY;
          let newDirX = obj.directionX;
          let newDirY = obj.directionY;

          if (newX <= size / 2 || newX >= screenWidth.current - size / 2) {
            newDirX *= -1;
            newX = Math.max(size / 2, Math.min(screenWidth.current - size / 2, newX));
          }
          if (newY <= size / 2 + 20 || newY >= screenHeight.current - size / 2 - 20) {
            newDirY *= -1;
            newY = Math.max(size / 2 + 20, Math.min(screenHeight.current - size / 2 - 20, newY));
          }

          return { ...obj, x: newX, y: newY, directionX: newDirX, directionY: newDirY };
        }),
      );
    }, 16);
  }, [clearAnim, config]);

  const endGame = useCallback(
    async (finalScore: number) => {
      clearAnim();
      const total = totalRounds;
      const xp = finalScore * P.standardXp;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      setPhase('idle');

      try {
        await logGameAndAward({
          type: config.logType,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: config.skillTags,
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearAnim, config.logType, config.skillTags, router, totalRounds],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const onSuccess = useCallback(() => {
    clearAnim();
    setObjects((prev) => prev.map((o) => ({ ...o, scale: 1.35 })));
    setTimeout(() => setObjects((prev) => prev.map((o) => ({ ...o, scale: 1 }))), 200);

    setScore((s) => {
      const newScore = s + 1;
      if (newScore >= totalRounds) {
        setTimeout(() => endGameRef.current?.(newScore), 900);
      } else {
        setTimeout(() => setRound((r) => r + 1), 1100);
      }
      return newScore;
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(config.ttsSuccess, 0.9, 'en-US');
  }, [clearAnim, config.ttsSuccess, totalRounds]);

  const onSpeedSlowTap = useCallback(
    (tappedId: string) => {
      setObjects((prev) => prev.filter((o) => o.id !== tappedId));

      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= totalRounds) {
          setTimeout(() => {
            clearAnim();
            endGameRef.current?.(newScore);
          }, 700);
        } else {
          setRound((r) => r + 1);
        }
        return newScore;
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS(config.ttsSuccess, 0.9, 'en-US');
    },
    [clearAnim, config.ttsSuccess, totalRounds],
  );

  const handleTap = useCallback(
    (event: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (done || phase !== 'playing' || objects.length === 0) return;
      const tapX = event.nativeEvent.locationX;
      const tapY = event.nativeEvent.locationY;
      const size = config.objectSize;

      for (const obj of objects) {
        const dist = Math.hypot(tapX - obj.x, tapY - obj.y);
        if (dist > TOLERANCE + size / 2) continue;

        let correct = false;
        let missMsg = config.ttsMiss;

        if (config.mode === 'follow-red') {
          correct = obj.isTarget;
        } else if (config.mode === 'two-balls') {
          const zones = targetZonesRef.current;
          const inZone = isObjectInTargetZone(obj.x, obj.y, zones, size);
          if (obj.isTarget) {
            correct = inZone;
            if (!inZone) missMsg = 'Wait for the star to enter a box!';
          } else {
            correct = false;
            missMsg = inZone ? 'Tap the star, not the ball!' : 'Tap only the star inside a box!';
          }
        } else if (config.mode === 'speed-pick') {
          if (!obj.isFast) {
            onSpeedSlowTap(obj.id);
            return;
          }
          missMsg = config.ttsMiss;
        } else {
          correct = obj.isFast === targetFastRef.current;
        }

        if (correct) {
          onSuccess();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(missMsg, 0.8, 'en-US');
        }
        return;
      }
    },
    [config, done, objects, onSuccess, onSpeedSlowTap, phase],
  );

  const initSpeedField = useCallback(() => {
    stopTTS();
    const size = config.objectSize;
    const slowCount = config.slowCount ?? 10;
    const fastCount = config.fastCount ?? 14;
    const slowSpd = config.slowSpeed ?? 0.75;
    const w = screenWidth.current;
    const h = screenHeight.current;
    const slowPositions = scatterPositions(slowCount, size, w, h);
    const fastPositions = scatterPositions(fastCount, size, w, h);
    const items: TrackObject[] = [];

    slowPositions.forEach(({ x, y }, i) => {
      items.push({
        id: `slow-${i}`,
        x,
        y,
        directionX: (Math.random() > 0.5 ? 1 : -1) * slowSpd,
        directionY: (Math.random() > 0.5 ? 1 : -1) * slowSpd,
        color: '#10B981',
        emoji: '🐢',
        isTarget: false,
        isFast: false,
        scale: 1,
      });
    });

    fastPositions.forEach(({ x, y }, i) => {
      items.push({
        id: `fast-${i}`,
        x,
        y,
        directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed,
        directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
        color: '#EF4444',
        emoji: '⚡',
        isTarget: false,
        isFast: true,
        scale: 1,
      });
    });

    targetFastRef.current = false;
    setTargetFast(false);
    setObjects(items);
    moveObjects();
    speedFieldReadyRef.current = true;

    setTimeout(() => speakTTS(config.ttsStart, 0.8, 'en-US'), 350);
  }, [config, moveObjects, config.ttsStart]);

  const startRound = useCallback(() => {
    if (config.mode === 'speed-pick') return;
    stopTTS();
    generateObjects();
    moveObjects();
    setTimeout(() => speakTTS(config.ttsStart, 0.8, 'en-US'), 350);
  }, [config.mode, config.ttsStart, generateObjects, moveObjects]);

  useEffect(() => {
    if (showInfo || done || phase !== 'playing' || config.mode !== 'speed-pick') return;
    if (speedFieldReadyRef.current) return;
    initSpeedField();
  }, [showInfo, done, phase, config.mode, initSpeedField]);

  useEffect(() => {
    if (showInfo || done || phase !== 'playing' || config.mode === 'speed-pick') return;
    startRound();
    return clearAnim;
  }, [showInfo, round, done, phase, config.mode, startRound, clearAnim]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearAnim();
  }, [clearAnim]);

  const slowRemaining = objects.filter((o) => !o.isFast).length;
  const hint =
    config.mode === 'speed-pick'
      ? `Tap a slow 🐢 (${slowRemaining} left)`
      : config.instruction;

  return (
    <MultiTrackShell
      theme={theme}
      copy={copy}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={totalRounds}
      score={score}
      hint={hint}
      showHint={phase === 'playing'}
      onStart={() => { setShowInfo(false); setPhase('countdown'); }}
      onExit={() => { clearAnim(); handleExit(); }}
      onContinue={onComplete}
      onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
          const layout = buildTargetZones(screenWidth.current, screenHeight.current);
          targetZonesRef.current = layout;
          setTargetZones(layout);
        }}
        onPress={handleTap}
      >
        {phase === 'playing' && config.mode === 'two-balls' && (
          <TargetZoneBoxes zones={targetZones} accent={theme.accent} />
        )}
        {phase === 'playing' &&
          objects.map((obj) => (
            <View
              key={obj.id}
              pointerEvents="none"
              style={{ position: 'absolute', left: obj.x - config.objectSize / 2, top: obj.y - config.objectSize / 2, zIndex: 10 }}
            >
              <TrackOrb size={config.objectSize} color={obj.color} emoji={obj.emoji} scale={obj.scale} />
            </View>
          ))}
        {phase === 'countdown' && <RoundCountdownOverlay accent={theme.accent} onDone={() => setPhase('playing')} />}
      </Pressable>
    </MultiTrackShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });

export default MultiTrackGame;
