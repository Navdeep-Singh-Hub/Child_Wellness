import { useVisualFocusExit, VisualFocusShell } from '@/components/game/occupational/level5/session4/VisualFocusShell';
import { SESSION5_4_PACING } from '@/components/game/occupational/level5/session4/session4Pacing';
import { SPOT_COLOR_COPY, SPOT_COLOR_THEME } from '@/components/game/occupational/level5/session4/visualFocusThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 50;
const OBJECT_COUNT = 10;

const COLORS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444' },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6' },
  { name: 'Green', emoji: '🟢', color: '#10B981' },
  { name: 'Yellow', emoji: '🟡', color: '#FCD34D' },
  { name: 'Purple', emoji: '🟣', color: '#8B5CF6' },
  { name: 'Orange', emoji: '🟠', color: '#F97316' },
];

interface ColorObject {
  id: string;
  x: number;
  y: number;
  colorIndex: number;
  scale: number;
  clicked: boolean;
}

const SpotTheColorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const handleExit = useVisualFocusExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<ColorObject[]>([]);
  const [targetColorIndex, setTargetColorIndex] = useState<number | null>(null);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const targetColorRef = useRef<number | null>(null);
  const endGameRef = useRef<(score: number) => Promise<void>>();

  const generateRound = useCallback(() => {
    const targetIdx = Math.floor(Math.random() * COLORS.length);
    setTargetColorIndex(targetIdx);
    targetColorRef.current = targetIdx;

    const newObjects: ColorObject[] = [];
    const usedPositions = new Set<string>();

    for (let i = 0; i < OBJECT_COUNT; i++) {
      let objX: number;
      let objY: number;
      let attempts = 0;
      do {
        objX = Math.random() * (screenWidth.current - OBJECT_SIZE) + OBJECT_SIZE / 2;
        objY = Math.random() * (screenHeight.current - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
        attempts++;
      } while (usedPositions.has(`${Math.floor(objX / 50)}-${Math.floor(objY / 50)}`) && attempts < 20);

      usedPositions.add(`${Math.floor(objX / 50)}-${Math.floor(objY / 50)}`);

      const targetCount = 3 + Math.floor(Math.random() * 2);
      const colorIdx = i < targetCount ? targetIdx : Math.floor(Math.random() * COLORS.length);

      newObjects.push({
        id: `obj-${i}`,
        x: objX,
        y: objY,
        colorIndex: colorIdx,
        scale: 1,
        clicked: false,
      });
    }

    for (let i = newObjects.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newObjects[i], newObjects[j]] = [newObjects[j]!, newObjects[i]!];
    }

    setObjects(newObjects);

    stopTTS();
    setTimeout(() => {
      speakTTS(`Find all ${COLORS[targetIdx]!.name.toLowerCase()} objects!`, 0.8, 'en-US');
    }, 400);
  }, []);

  const handleObjectTap = useCallback(
    (obj: ColorObject) => {
      const targetIdx = targetColorRef.current;
      if (done || targetIdx === null || obj.clicked) return;

      if (obj.colorIndex === targetIdx) {
        setObjects((prev) => {
          const updated = prev.map((o) => (o.id === obj.id ? { ...o, clicked: true } : o));
          const targetObjects = updated.filter((o) => o.colorIndex === targetIdx);
          const allClicked = targetObjects.every((o) => o.clicked);

          if (allClicked) {
            setTimeout(() => {
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
            }, 500);
          }

          return updated;
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Good!', 0.9, 'en-US');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Find the correct color!', 0.8, 'en-US');
      }
    },
    [done, generateRound],
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
          type: SPOT_COLOR_COPY.logType,
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: [...SPOT_COLOR_COPY.skillTags],
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
      generateRound();
    }
  }, [showInfo, round, done, generateRound]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
  }, []);

  const targetColor = targetColorIndex !== null ? COLORS[targetColorIndex] : null;
  const remaining =
    targetColorIndex !== null
      ? objects.filter((o) => o.colorIndex === targetColorIndex && !o.clicked).length
      : 0;
  const hint = targetColor ? `Find all ${targetColor.name} · ${remaining} left` : 'Watch the target color';

  return (
    <VisualFocusShell
      theme={SPOT_COLOR_THEME}
      copy={SPOT_COLOR_COPY}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint={hint}
      showHint
      hudExtra={
        targetColor ? (
          <View style={[styles.targetSwatch, { backgroundColor: targetColor.color, borderColor: SPOT_COLOR_THEME.accentDark }]}>
            <Text style={styles.targetEmoji}>{targetColor.emoji}</Text>
            <Text style={[styles.targetLabel, { color: SPOT_COLOR_THEME.title }]}>{targetColor.name}</Text>
          </View>
        ) : null
      }
      onStart={() => setShowInfo(false)}
      onExit={handleExit}
      onContinue={onComplete}
      onBack={onBack}
    >
      <View
        style={styles.gameArea}
        pointerEvents="box-none"
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {objects
          .filter((obj) => !obj.clicked)
          .map((obj) => (
            <TouchableOpacity
              key={obj.id}
              activeOpacity={0.75}
              onPress={() => handleObjectTap(obj)}
              style={[
                styles.colorDot,
                {
                  left: obj.x - OBJECT_SIZE / 2,
                  top: obj.y - OBJECT_SIZE / 2,
                  backgroundColor: COLORS[obj.colorIndex]!.color,
                  transform: [{ scale: obj.scale }],
                  borderColor: obj.colorIndex === targetColorIndex ? SPOT_COLOR_THEME.accentDark : 'rgba(255,255,255,0.7)',
                  borderWidth: obj.colorIndex === targetColorIndex ? 3 : 2,
                },
              ]}
            >
              <Text style={styles.objectEmoji}>{COLORS[obj.colorIndex]!.emoji}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </VisualFocusShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  colorDot: {
    position: 'absolute',
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: OBJECT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
  objectEmoji: { fontSize: 22 },
  targetSwatch: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    gap: 6,
  },
  targetEmoji: { fontSize: 18 },
  targetLabel: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
});

export default SpotTheColorGame;
