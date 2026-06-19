import { ThemedObjectTile } from '@/components/game/occupational/level5/session4/VisualFocusVisuals';
import { useVisualFocusExit, VisualFocusShell } from '@/components/game/occupational/level5/session4/VisualFocusShell';
import { SESSION5_4_PACING } from '@/components/game/occupational/level5/session4/session4Pacing';
import { MATCH_SHADOW_COPY, MATCH_SHADOW_THEME } from '@/components/game/occupational/level5/session4/visualFocusThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOTAL_ROUNDS = 8;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 64;
const SHADOW_SIZE = 64;

const OBJECTS = [
  { emoji: '🐱', label: 'cat' },
  { emoji: '🐶', label: 'dog' },
  { emoji: '🐰', label: 'bunny' },
  { emoji: '🐻', label: 'bear' },
  { emoji: '🐸', label: 'frog' },
  { emoji: '🦁', label: 'lion' },
];

interface GameObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  isShadow: boolean;
  matched: boolean;
  isCorrectShadow: boolean;
}

const MatchShadowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const handleExit = useVisualFocusExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const endGameRef = useRef<(score: number) => Promise<void>>();

  const generateRound = useCallback(() => {
    const selectedObj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!;
    const newObjects: GameObject[] = [];

    newObjects.push({
      id: 'obj-1',
      x: Math.random() * (screenWidth.current - OBJECT_SIZE) + OBJECT_SIZE / 2,
      y: Math.random() * (screenHeight.current / 2 - OBJECT_SIZE - 20) + OBJECT_SIZE / 2 + 10,
      emoji: selectedObj.emoji,
      isShadow: false,
      matched: false,
      isCorrectShadow: false,
    });

    newObjects.push({
      id: 'shadow-correct',
      x: Math.random() * (screenWidth.current - SHADOW_SIZE) + SHADOW_SIZE / 2,
      y: screenHeight.current / 2 + Math.random() * (screenHeight.current / 2 - SHADOW_SIZE - 20) + SHADOW_SIZE / 2,
      emoji: selectedObj.emoji,
      isShadow: true,
      matched: false,
      isCorrectShadow: true,
    });

    const wrongObjects = OBJECTS.filter((o) => o.emoji !== selectedObj.emoji);
    for (let i = 0; i < 2; i++) {
      const wrongObj = wrongObjects[Math.floor(Math.random() * wrongObjects.length)]!;
      newObjects.push({
        id: `shadow-wrong-${i}`,
        x: Math.random() * (screenWidth.current - SHADOW_SIZE) + SHADOW_SIZE / 2,
        y: screenHeight.current / 2 + Math.random() * (screenHeight.current / 2 - SHADOW_SIZE - 20) + SHADOW_SIZE / 2,
        emoji: wrongObj.emoji,
        isShadow: true,
        matched: false,
        isCorrectShadow: false,
      });
    }

    const shadows = newObjects.filter((o) => o.isShadow);
    const object = newObjects.find((o) => !o.isShadow)!;
    for (let i = shadows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shadows[i], shadows[j]] = [shadows[j]!, shadows[i]!];
    }

    setObjects([object, ...shadows]);
    setSelectedObject(null);
  }, []);

  const handleObjectTap = useCallback(
    (obj: GameObject) => {
      if (done || obj.matched) return;

      if (!obj.isShadow) {
        setSelectedObject(obj);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (selectedObject) {
        const object = objects.find((o) => !o.isShadow && !o.matched);
        if (object) {
          if (obj.isCorrectShadow) {
            setObjects((prev) =>
              prev.map((o) => (o.id === object.id || o.id === obj.id ? { ...o, matched: true } : o)),
            );

            setScore((s) => {
              const newScore = s + 1;
              if (newScore >= TOTAL_ROUNDS) {
                setTimeout(() => endGameRef.current?.(newScore), 1000);
              } else {
                setTimeout(() => {
                  setRound((r) => r + 1);
                  generateRound();
                }, 1500);
              }
              return newScore;
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            speakTTS('Perfect match!', 0.9, 'en-US');
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            speakTTS('Try again!', 0.8, 'en-US');
          }
          setSelectedObject(null);
        }
      }
    },
    [done, objects, selectedObject, generateRound],
  );

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * SESSION5_4_PACING.xpPerScore;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);

      try {
        await logGameAndAward({
          type: MATCH_SHADOW_COPY.logType,
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: [...MATCH_SHADOW_COPY.skillTags],
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

  useEffect(() => {
    if (!showInfo && !done) {
      stopTTS();
      generateRound();
      setTimeout(() => speakTTS('Tap the animal, then its shadow!', 0.8, 'en-US'), 500);
    }
  }, [showInfo, round, done, generateRound]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
  }, []);

  const hint = selectedObject ? 'Now tap the matching shadow!' : 'Tap an animal on stage';

  return (
    <VisualFocusShell
      theme={MATCH_SHADOW_THEME}
      copy={MATCH_SHADOW_COPY}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint={hint}
      showHint
      onStart={() => setShowInfo(false)}
      onExit={handleExit}
      onContinue={onComplete}
      onBack={onBack}
    >
      <View style={styles.stageDivider} />
      <View
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {objects.map((obj) => {
          const size = obj.isShadow ? SHADOW_SIZE : OBJECT_SIZE;
          const selected = selectedObject && !obj.isShadow && obj.id === selectedObject.id;

          if (obj.isShadow) {
            return (
              <TouchableOpacity
                key={obj.id}
                activeOpacity={0.75}
                onPress={() => handleObjectTap(obj)}
                disabled={obj.matched}
                style={[
                  styles.shadowTile,
                  {
                    left: obj.x - size / 2,
                    top: obj.y - size / 2,
                    width: size,
                    height: size,
                    opacity: obj.matched ? 0.25 : 1,
                  },
                ]}
              >
                <Text style={styles.shadowEmoji}>{obj.emoji}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={obj.id}
              activeOpacity={0.75}
              onPress={() => handleObjectTap(obj)}
              disabled={obj.matched}
              style={[
                styles.tilePress,
                {
                  left: obj.x - size / 2,
                  top: obj.y - size / 2,
                  opacity: obj.matched ? 0.3 : 1,
                },
              ]}
            >
              <ThemedObjectTile size={size} highlight={!!selected} accentColor={MATCH_SHADOW_THEME.accent}>
                <Text style={styles.objectEmoji}>{obj.emoji}</Text>
              </ThemedObjectTile>
            </TouchableOpacity>
          );
        })}
      </View>
    </VisualFocusShell>
  );
};

const styles = StyleSheet.create({
  stageDivider: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '48%',
    height: 2,
    backgroundColor: 'rgba(244,114,182,0.25)',
    zIndex: 2,
  },
  gameArea: { flex: 1, position: 'relative' },
  tilePress: { position: 'absolute', zIndex: 10 },
  objectEmoji: { fontSize: 32 },
  shadowTile: {
    position: 'absolute',
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244,114,182,0.4)',
    zIndex: 10,
  },
  shadowEmoji: { fontSize: 30, opacity: 0.15 },
});

export default MatchShadowGame;
