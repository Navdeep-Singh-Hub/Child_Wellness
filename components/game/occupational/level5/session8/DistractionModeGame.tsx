import { TrackOrb } from '@/components/game/occupational/level5/session8/MultiTrackVisuals';
import { MultiTrackShell, useMultiTrackExit } from '@/components/game/occupational/level5/session8/MultiTrackShell';
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

const LOG_TYPE = 'distraction-mode';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 64;
const DISTRACTION_SIZE = 48;
const TOLERANCE = 50;
const DISTRACTION_COUNT = 4;

interface GameObject {
  id: string;
  x: number;
  y: number;
  isTarget: boolean;
  scale: number;
}

const DistractionModeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { theme, copy } = getMultiTrackTheme(LOG_TYPE);
  const handleExit = useMultiTrackExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);

  const generateObjects = useCallback(() => {
    const newObjects: GameObject[] = [];
    const used = new Set<string>();

    const place = (size: number) => {
      let x: number;
      let y: number;
      let attempts = 0;
      do {
        x = Math.random() * (screenWidth.current - size) + size / 2;
        y = Math.random() * (screenHeight.current - size - 40) + size / 2 + 20;
        attempts++;
      } while (used.has(`${Math.floor(x / 50)}-${Math.floor(y / 50)}`) && attempts < 20);
      used.add(`${Math.floor(x / 50)}-${Math.floor(y / 50)}`);
      return { x, y };
    };

    const targetPos = place(TARGET_SIZE);
    newObjects.push({ id: 'target', x: targetPos.x, y: targetPos.y, isTarget: true, scale: 1 });

    for (let i = 0; i < DISTRACTION_COUNT; i++) {
      const pos = place(DISTRACTION_SIZE);
      newObjects.push({ id: `d-${i}`, x: pos.x, y: pos.y, isTarget: false, scale: 1 });
    }

    setObjects(newObjects);
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = P.distractionRounds;
      const xp = finalScore * P.standardXp;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      setPhase('idle');

      try {
        await logGameAndAward({
          type: LOG_TYPE,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: ['focus-under-load', 'selective-attention', 'distraction-resistance'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [router],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const handleTap = useCallback(
    (event: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (done || phase !== 'playing' || objects.length === 0) return;
      const tapX = event.nativeEvent.locationX;
      const tapY = event.nativeEvent.locationY;

      for (const obj of objects) {
        const size = obj.isTarget ? TARGET_SIZE : DISTRACTION_SIZE;
        if (Math.hypot(tapX - obj.x, tapY - obj.y) > TOLERANCE + size / 2) continue;

        if (obj.isTarget) {
          setObjects((prev) => prev.map((o) => (o.id === obj.id ? { ...o, scale: 1.4 } : o)));
          setTimeout(() => setObjects((prev) => prev.map((o) => ({ ...o, scale: 1 }))), 200);

          setScore((s) => {
            const newScore = s + 1;
            if (newScore >= P.distractionRounds) {
              setTimeout(() => endGameRef.current?.(newScore), 900);
            } else {
              setTimeout(() => setRound((r) => r + 1), 1100);
            }
            return newScore;
          });

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          speakTTS('Focus maintained!', 0.9, 'en-US');
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS('Focus on the target!', 0.8, 'en-US');
        }
        return;
      }
    },
    [done, objects, phase],
  );

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') {
      stopTTS();
      generateObjects();
      setTimeout(() => speakTTS('Tap the target, ignore distractions!', 0.8, 'en-US'), 350);
    }
  }, [showInfo, round, done, phase, generateObjects]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
  }, []);

  return (
    <MultiTrackShell
      theme={theme}
      copy={copy}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={P.distractionRounds}
      score={score}
      hint="Tap the bullseye — ignore decoys!"
      showHint={phase === 'playing'}
      onStart={() => { setShowInfo(false); setPhase('countdown'); }}
      onExit={handleExit}
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
          objects.map((obj) => {
            const size = obj.isTarget ? TARGET_SIZE : DISTRACTION_SIZE;
            return (
              <View
                key={obj.id}
                pointerEvents="none"
                style={{ position: 'absolute', left: obj.x - size / 2, top: obj.y - size / 2, zIndex: obj.isTarget ? 10 : 5 }}
              >
                <TrackOrb
                  size={size}
                  color={obj.isTarget ? '#10B981' : '#94A3B8'}
                  emoji={obj.isTarget ? '🎯' : '⚪'}
                  scale={obj.scale}
                  dimmed={!obj.isTarget}
                  pulse={obj.isTarget}
                />
              </View>
            );
          })}
        {phase === 'countdown' && <RoundCountdownOverlay accent={theme.accent} onDone={() => setPhase('playing')} />}
      </Pressable>
    </MultiTrackShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });

export default DistractionModeGame;
