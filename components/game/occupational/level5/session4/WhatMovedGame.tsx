import { ThemedObjectTile } from '@/components/game/occupational/level5/session4/VisualFocusVisuals';
import { useVisualFocusExit, VisualFocusShell } from '@/components/game/occupational/level5/session4/VisualFocusShell';
import { SESSION5_4_PACING } from '@/components/game/occupational/level5/session4/session4Pacing';
import { WHAT_MOVED_COPY, WHAT_MOVED_THEME } from '@/components/game/occupational/level5/session4/visualFocusThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const TOTAL_ROUNDS = 8;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 60;
const OBJECT_COUNT = 4;

const OBJECTS = ['🔴', '🔵', '🟢', '🟡', '🟣', '⭐', '💎', '🎈'];

interface GameObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  initialX: number;
  initialY: number;
  moved: boolean;
}

const WhatMovedGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const handleExit = useVisualFocusExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [showInitial, setShowInitial] = useState(true);
  const [movedObject, setMovedObject] = useState<GameObject | null>(null);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endGameRef = useRef<(score: number) => Promise<void>>();

  const generateRound = useCallback(() => {
    const newObjects: GameObject[] = [];
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

      newObjects.push({
        id: `obj-${i}`,
        x: objX,
        y: objY,
        emoji: OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!,
        initialX: objX,
        initialY: objY,
        moved: false,
      });
    }

    const moveIndex = Math.floor(Math.random() * newObjects.length);
    const movedObj = newObjects[moveIndex]!;
    movedObj.moved = true;

    let newX: number;
    let newY: number;
    do {
      newX = Math.random() * (screenWidth.current - OBJECT_SIZE) + OBJECT_SIZE / 2;
      newY = Math.random() * (screenHeight.current - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
    } while (usedPositions.has(`${Math.floor(newX / 50)}-${Math.floor(newY / 50)}`));

    movedObj.x = newX;
    movedObj.y = newY;
    setMovedObject(movedObj);

    setObjects(newObjects);
    setShowInitial(true);

    if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    changeTimerRef.current = setTimeout(() => {
      setShowInitial(false);
      speakTTS('Which object moved?', 0.8, 'en-US');
    }, 2000);
  }, []);

  const handleObjectTap = useCallback(
    (obj: GameObject) => {
      if (done || showInitial || !movedObject) return;

      if (obj.id === movedObject.id) {
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
        speakTTS('Correct!', 0.9, 'en-US');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Try again!', 0.8, 'en-US');
      }
    },
    [done, showInitial, movedObject, generateRound],
  );

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * SESSION5_4_PACING.xpPerScore;
      const accuracy = (finalScore / total) * 100;

      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);

      try {
        await logGameAndAward({
          type: WHAT_MOVED_COPY.logType,
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: [...WHAT_MOVED_COPY.skillTags],
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
      setTimeout(() => speakTTS('Watch carefully!', 0.8, 'en-US'), 500);
    }
  }, [showInfo, round, done, generateRound]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
  }, []);

  const hint = showInitial ? 'Memorize the layout…' : 'Tap the object that moved!';

  return (
    <VisualFocusShell
      theme={WHAT_MOVED_THEME}
      copy={WHAT_MOVED_COPY}
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
      onExit={() => {
        if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
        handleExit();
      }}
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
        {objects.map((obj) => (
          <Pressable
            key={obj.id}
            onPress={() => !showInitial && handleObjectTap(obj)}
            disabled={showInitial}
            style={[
              styles.tilePress,
              {
                left: (showInitial ? obj.initialX : obj.x) - OBJECT_SIZE / 2,
                top: (showInitial ? obj.initialY : obj.y) - OBJECT_SIZE / 2,
              },
            ]}
          >
            <ThemedObjectTile size={OBJECT_SIZE} accentColor={WHAT_MOVED_THEME.accent}>
              <Text style={styles.objectEmoji}>{obj.emoji}</Text>
            </ThemedObjectTile>
          </Pressable>
        ))}
      </View>
    </VisualFocusShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  tilePress: { position: 'absolute', zIndex: 10 },
  objectEmoji: { fontSize: 28 },
});

export default WhatMovedGame;
