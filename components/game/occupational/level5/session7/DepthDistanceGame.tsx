import { isTapNearTarget } from '@/components/game/occupational/level5/shared/movingTargetTouch';
import {
  AnchorPin,
  DepthLineBar,
  DepthSphere,
  DepthTarget,
} from '@/components/game/occupational/level5/session7/DepthDistanceVisuals';
import { DepthDistanceShell, useDepthExit } from '@/components/game/occupational/level5/session7/DepthDistanceShell';
import type { DepthGameConfig } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { getDepthTheme } from '@/components/game/occupational/level5/session7/depthDistanceThemes';
import { SESSION5_7_PACING as P } from '@/components/game/occupational/level5/session7/session7Pacing';
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NEAR_SIZE = 72;
const FAR_SIZE = 38;
const TOLERANCE = 50;
const NEAR_DISTANCE = 95;
const FAR_DISTANCE = 235;
const ANCHOR_SIZE = 52;

function distanceBetween(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function lineStyle(ax: number, ay: number, bx: number, by: number) {
  const length = distanceBetween(ax, ay, bx, by);
  const angleDeg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  return {
    left: ax,
    top: ay,
    width: length,
    transform: [{ rotate: `${angleDeg}deg` }],
  };
}

interface NearFarTarget {
  id: string;
  x: number;
  y: number;
  isNear: boolean;
  scale: number;
}

interface LayerTarget {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  emoji: string;
  isFront: boolean;
}

interface DepthDistanceGameProps {
  config: DepthGameConfig;
  onBack?: () => void;
  onComplete?: () => void;
}

const DepthDistanceGame: React.FC<DepthDistanceGameProps> = ({ config, onBack, onComplete }) => {
  const router = useRouter();
  const { theme, copy } = getDepthTheme(config.logType);
  const handleExit = useDepthExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const scoreRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const [nearFarTargets, setNearFarTargets] = useState<NearFarTarget[]>([]);
  const [tapNear, setTapNear] = useState(true);
  const tapNearRef = useRef(true);
  const [anchorPoint, setAnchorPoint] = useState({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.82 });

  const [zoomPos, setZoomPos] = useState({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.45 });
  const [zoomScale, setZoomScale] = useState(0.4);
  const [zoomReady, setZoomReady] = useState(false);

  const [fallPos, setFallPos] = useState({ x: SCREEN_WIDTH * 0.5, y: 80 });
  const [fallActive, setFallActive] = useState(false);
  const fallMissedRef = useRef(false);

  const [shrinkPos, setShrinkPos] = useState({ x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.45 });
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
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const scheduleInterval = useCallback((fn: () => void, ms: number) => {
    const id = setInterval(fn, ms);
    intervalsRef.current.push(id);
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      clearTimers();
      const total = P.rounds;
      const xp = finalScore * P.xpPerScore;
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
    [clearTimers, config.logType, config.skillTags, router],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    clearTimers();
    stopTTS();
    setShowInfo(true);
    setShowCongrats(false);
    setPhase('idle');
    setRound(1);
    setScore(0);
    scoreRef.current = 0;
    setDone(false);
    setFinalStats(null);
    setNearFarTargets([]);
    setTapNear(true);
    tapNearRef.current = true;
    setZoomScale(0.4);
    setZoomReady(false);
    setFallActive(false);
    fallMissedRef.current = false;
    setShrinkActive(false);
    setLayers([]);
  }, [clearTimers, config.logType]);

  const advanceOrFinish = useCallback(
    (success: boolean) => {
      if (!success) return;

      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);

      if (newScore >= P.rounds) {
        scheduleTimeout(() => endGameRef.current?.(newScore), 800);
      } else {
        scheduleTimeout(() => setRound((r) => r + 1), 1000);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Great!', 0.9, 'en-US');
    },
    [scheduleTimeout],
  );

  const layerZIndex = (layer: LayerTarget) => (layer.isFront ? 3 : layer.id === 'mid' ? 2 : 1);

  const layersFrontFirst = useCallback(
    (items: LayerTarget[]) => [...items].sort((a, b) => layerZIndex(b) - layerZIndex(a)),
    [],
  );

  const randomX = useCallback((size: number) => Math.random() * (screenWidth.current - size) + size / 2, []);
  const randomY = useCallback(
    (size: number) => Math.random() * (screenHeight.current - size - 40) + size / 2 + 20,
    [],
  );

  const getAnchorPoint = useCallback(
    () => ({ x: screenWidth.current * 0.5, y: screenHeight.current * 0.5 }),
    [],
  );

  const clampX = useCallback((x: number, size: number) => {
    const pad = 10;
    return Math.max(size / 2 + pad, Math.min(screenWidth.current - size / 2 - pad, x));
  }, []);

  const clampY = useCallback((y: number, size: number) => {
    const pad = 10;
    return Math.max(size / 2 + pad, Math.min(screenHeight.current - size / 2 - pad, y));
  }, []);

  const startNearFarRound = useCallback(() => {
    const isNear = Math.random() > 0.5;
    tapNearRef.current = isNear;
    setTapNear(isNear);

    const anchor = getAnchorPoint();
    setAnchorPoint(anchor);

    /** Even rounds: near on one side, far on the other (you stay centered). Odd: same depth line from center. */
    const useSplitLayout = round % 2 === 0;
    let targets: NearFarTarget[];

    if (useSplitLayout) {
      const nearOnLeft = Math.random() > 0.5;
      const nearX = clampX(anchor.x + (nearOnLeft ? -NEAR_DISTANCE : NEAR_DISTANCE), NEAR_SIZE);
      const farX = clampX(anchor.x + (nearOnLeft ? FAR_DISTANCE : -FAR_DISTANCE), FAR_SIZE);
      targets = [
        { id: 'near', x: nearX, y: anchor.y, isNear: true, scale: 1 },
        { id: 'far', x: farX, y: anchor.y, isNear: false, scale: 1 },
      ];
    } else {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
      const placeOnRay = (distance: number, near: boolean): NearFarTarget => {
        const size = near ? NEAR_SIZE : FAR_SIZE;
        return {
          id: near ? 'near' : 'far',
          x: clampX(anchor.x + Math.cos(angle) * distance, size),
          y: clampY(anchor.y + Math.sin(angle) * distance, size),
          isNear: near,
          scale: 1,
        };
      };
      targets = [placeOnRay(NEAR_DISTANCE, true), placeOnRay(FAR_DISTANCE, false)];
    }

    setNearFarTargets(targets);

    scheduleTimeout(() => {
      speakTTS(
        isNear ? 'Tap the object closer to the yellow point!' : 'Tap the object farther from the yellow point!',
        0.8,
        'en-US',
      );
    }, 400);
  }, [clampX, clampY, getAnchorPoint, round, scheduleTimeout]);

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
        speakTTS('Try again!', 0.8, 'en-US');
        scheduleTimeout(() => setRound((r) => r + 1), 800);
      }
    }, 120);
    scheduleTimeout(() => speakTTS('Tap when it is big!', 0.8, 'en-US'), 300);
  }, [clearTimers, randomX, randomY, scheduleInterval, scheduleTimeout]);

  const startFallingRound = useCallback(() => {
    fallMissedRef.current = false;
    setFallPos({ x: randomX(60), y: 60 });
    setFallActive(true);
    let y = 60;
    scheduleInterval(() => {
      y += 14;
      setFallPos((p) => ({ ...p, y }));
      if (y >= screenHeight.current - 80 && !fallMissedRef.current) {
        fallMissedRef.current = true;
        setFallActive(false);
        clearTimers();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS('Too late!', 0.8, 'en-US');
        scheduleTimeout(() => setRound((r) => r + 1), 800);
      }
    }, 50);
    scheduleTimeout(() => speakTTS('Catch it!', 0.8, 'en-US'), 300);
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
        speakTTS('Too small!', 0.8, 'en-US');
        scheduleTimeout(() => setRound((r) => r + 1), 800);
      }
    }, 200);
    scheduleTimeout(() => speakTTS('Tap it quickly!', 0.8, 'en-US'), 300);
  }, [clearTimers, randomX, randomY, scheduleInterval, scheduleTimeout]);

  const startLayersRound = useCallback(() => {
    const cx = screenWidth.current * 0.5;
    const cy = screenHeight.current * 0.46;
    const frontIndex = Math.floor(Math.random() * 3);

    const specs = [
      { id: 'back' as const, dx: -22, dy: 26, size: 58, color: '#93C5FD', emoji: '🔵' },
      { id: 'mid' as const, dx: 18, dy: 10, size: 74, color: '#F9A8D4', emoji: '🟣' },
      { id: 'front' as const, dx: 0, dy: -14, size: 90, color: '#FCD34D', emoji: '🟡' },
    ];

    setLayers(
      specs.map((spec, i) => ({
        id: spec.id,
        x: cx + spec.dx,
        y: cy + spec.dy,
        size: spec.size,
        color: spec.color,
        emoji: spec.emoji,
        isFront: i === frontIndex,
      })),
    );

    scheduleTimeout(() => speakTTS('Tap the circle with the glowing ring!', 0.8, 'en-US'), 300);
  }, [scheduleTimeout]);

  const startRound = useCallback(() => {
    clearTimers();
    stopTTS();

    switch (config.mode) {
      case 'near-far':
        startNearFarRound();
        break;
      case 'zoom':
        startZoomRound();
        break;
      case 'falling':
        startFallingRound();
        break;
      case 'shrinking':
        startShrinkingRound();
        break;
      case 'layers':
        startLayersRound();
        break;
    }
  }, [clearTimers, config.mode, startFallingRound, startLayersRound, startNearFarRound, startShrinkingRound, startZoomRound]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') {
      startRound();
    }
  }, [showInfo, round, done, phase, startRound]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearTimers();
  }, [clearTimers]);

  const handleTap = useCallback(
    (event: GestureResponderEvent) => {
      if (done || phase !== 'playing') return;

      if (config.mode === 'near-far') {
        for (const target of nearFarTargets) {
          const size = target.isNear ? NEAR_SIZE : FAR_SIZE;
          if (!isTapNearTarget(event, target.x, target.y, size, TOLERANCE)) continue;

          if (target.isNear === tapNearRef.current) {
            advanceOrFinish(true);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            speakTTS(
              tapNearRef.current
                ? 'Tap the one closer to the yellow point!'
                : 'Tap the one farther from the yellow point!',
              0.8,
              'en-US',
            );
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
        if (layers.length === 0) return;

        for (const layer of layersFrontFirst(layers)) {
          if (!isTapNearTarget(event, layer.x, layer.y, layer.size, TOLERANCE)) continue;
          if (layer.isFront) {
            advanceOrFinish(true);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            speakTTS('Tap the circle with the glowing ring!', 0.8, 'en-US');
          }
          return;
        }
        return;
      }
    },
    [
      advanceOrFinish,
      clearTimers,
      config.mode,
      done,
      fallActive,
      fallPos.x,
      fallPos.y,
      layers,
      layersFrontFirst,
      nearFarTargets,
      phase,
      shrinkActive,
      shrinkPos.x,
      shrinkPos.y,
      shrinkSize,
      zoomPos.x,
      zoomPos.y,
      zoomReady,
      zoomScale,
    ],
  );

  const liveInstruction = () => {
    if (config.mode === 'near-far') {
      return tapNear ? 'Tap closer to 📍 You' : 'Tap farther from 📍 You';
    }
    if (config.mode === 'zoom' && zoomReady) return '🔍 Tap now — it is big!';
    if (config.mode === 'layers') {
      const front = layers.find((l) => l.isFront);
      return front ? `Tap the front ${front.emoji} (glowing ring)` : config.instruction;
    }
    return config.instruction;
  };

  const renderGameContent = () => {
    if (config.mode === 'near-far') {
      return (
        <>
          {nearFarTargets.map((target) => (
            <DepthLineBar key={`line-${target.id}`} style={lineStyle(anchorPoint.x, anchorPoint.y, target.x, target.y)} />
          ))}
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: anchorPoint.x - ANCHOR_SIZE / 2, top: anchorPoint.y - ANCHOR_SIZE / 2, zIndex: 5 }}
          >
            <AnchorPin size={ANCHOR_SIZE} />
          </View>
          {nearFarTargets.map((target) => {
            const size = target.isNear ? NEAR_SIZE : FAR_SIZE;
            return (
              <View
                key={target.id}
                pointerEvents="none"
                style={{ position: 'absolute', left: target.x - size / 2, top: target.y - size / 2, zIndex: target.isNear ? 4 : 3 }}
              >
                <DepthSphere
                  size={size}
                  color={target.isNear ? '#10B981' : '#3B82F6'}
                  emoji="🔵"
                  dimmed={!target.isNear}
                  accentColor={theme.accent}
                />
              </View>
            );
          })}
        </>
      );
    }

    if (config.mode === 'zoom') {
      const size = 70 * zoomScale;
      return (
        <View pointerEvents="none" style={{ position: 'absolute', left: zoomPos.x - size / 2, top: zoomPos.y - size / 2, zIndex: 10 }}>
          <DepthTarget size={size} color="#EC4899" emoji="🔍" ready={zoomReady} accent={theme.accent} />
        </View>
      );
    }

    if (config.mode === 'falling') {
      if (!fallActive) return null;
      return (
        <View pointerEvents="none" style={{ position: 'absolute', left: fallPos.x - 28, top: fallPos.y - 28, zIndex: 10 }}>
          <DepthTarget size={56} color="#F97316" emoji="🍎" accent={theme.accent} />
        </View>
      );
    }

    if (config.mode === 'shrinking') {
      if (!shrinkActive) return null;
      return (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: shrinkPos.x - shrinkSize / 2, top: shrinkPos.y - shrinkSize / 2, zIndex: 10 }}
        >
          <DepthTarget size={shrinkSize} color="#EF4444" emoji="🎯" accent={theme.accent} />
        </View>
      );
    }

    if (config.mode === 'layers') {
      return layersFrontFirst(layers).map((layer) => (
        <View
          key={layer.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: layer.x - layer.size / 2,
            top: layer.y - layer.size / 2,
            zIndex: layerZIndex(layer),
          }}
        >
          <DepthSphere
            size={layer.size}
            color={layer.color}
            emoji={layer.emoji}
            dimmed={!layer.isFront}
            highlight={layer.isFront}
            accentColor={theme.accent}
          />
        </View>
      ));
    }

    return null;
  };

  return (
    <DepthDistanceShell
      theme={theme}
      copy={copy}
      mode={config.mode}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={P.rounds}
      score={score}
      hint={liveInstruction()}
      showHint={phase === 'playing'}
      onStart={() => {
        setShowInfo(false);
        setPhase('countdown');
      }}
      onExit={() => {
        clearTimers();
        handleExit();
      }}
      onContinue={onComplete}
      onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
          if (config.mode === 'near-far') setAnchorPoint(getAnchorPoint());
        }}
        onPress={handleTap}
      >
        {phase === 'playing' && renderGameContent()}
        {phase === 'countdown' && (
          <RoundCountdownOverlay accent={theme.accent} onDone={() => setPhase('playing')} />
        )}
      </Pressable>
    </DepthDistanceShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
});

export default DepthDistanceGame;
