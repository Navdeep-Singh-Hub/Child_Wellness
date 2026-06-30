import { TrackOrb } from '@/components/game/occupational/level5/session8/MultiTrackVisuals';
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
  const [targetFast, setTargetFast] = useState(true);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetFastRef = useRef(true);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);

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
      const targetIdx = Math.floor(Math.random() * 2);
      for (let i = 0; i < 2; i++) {
        items.push({
          id: `ball-${i}`,
          x: Math.random() * (screenWidth.current - size) + size / 2,
          y: Math.random() * (screenHeight.current - size - 40) + size / 2 + 20,
          directionX: (Math.random() > 0.5 ? 1 : -1) * config.speed,
          directionY: (Math.random() > 0.5 ? 1 : -1) * config.speed,
          color: i === targetIdx ? '#10B981' : '#3B82F6',
          emoji: i === targetIdx ? '⭐' : '⚽',
          isTarget: i === targetIdx,
          isFast: true,
          scale: 1,
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
          id: `sp-${i}`,
          x: Math.random() * (screenWidth.current - size) + size / 2,
          y: Math.random() * (screenHeight.current - size - 40) + size / 2 + 20,
          directionX: (Math.random() > 0.5 ? 1 : -1) * spd,
          directionY: (Math.random() > 0.5 ? 1 : -1) * spd,
          color: fast ? '#EF4444' : '#10B981',
          emoji: fast ? '⚡' : '🐢',
          isTarget: false,
          isFast: fast,
          scale: 1,
        });
      }
    }

    setObjects(items);
  }, [config]);

  const moveObjects = useCallback(() => {
    clearAnim();
    const size = config.objectSize;
    animationRef.current = setInterval(() => {
      setObjects((prev) =>
        prev.map((obj) => {
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
      const total = P.standardRounds;
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
    [clearAnim, config.logType, config.skillTags, router],
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
      if (newScore >= P.standardRounds) {
        setTimeout(() => endGameRef.current?.(newScore), 900);
      } else {
        setTimeout(() => setRound((r) => r + 1), 1100);
      }
      return newScore;
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(config.ttsSuccess, 0.9, 'en-US');
  }, [clearAnim, config.ttsSuccess]);

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
        if (config.mode === 'follow-red') correct = obj.isTarget;
        else if (config.mode === 'two-balls') correct = obj.isTarget;
        else correct = obj.isFast === targetFastRef.current;

        if (correct) {
          onSuccess();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          const miss =
            config.mode === 'speed-pick'
              ? `Tap the ${targetFastRef.current ? 'fast' : 'slow'} object!`
              : config.ttsMiss;
          speakTTS(miss, 0.8, 'en-US');
        }
        return;
      }
    },
    [config, done, objects, onSuccess, phase],
  );

  const startRound = useCallback(() => {
    stopTTS();
    generateObjects();
    moveObjects();
    setTimeout(() => {
      const msg =
        config.mode === 'speed-pick'
          ? `Tap the ${targetFastRef.current ? 'fast' : 'slow'} object!`
          : config.ttsStart;
      speakTTS(msg, 0.8, 'en-US');
    }, 350);
  }, [config.mode, config.ttsStart, generateObjects, moveObjects]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') {
      startRound();
      return clearAnim;
    }
  }, [showInfo, round, done, phase, startRound, clearAnim]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearAnim();
  }, [clearAnim]);

  const hint =
    config.mode === 'speed-pick'
      ? `Tap the ${targetFast ? 'fast ⚡' : 'slow 🐢'} object!`
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
      totalRounds={P.standardRounds}
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
        }}
        onPress={handleTap}
      >
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
