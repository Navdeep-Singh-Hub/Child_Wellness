import { ThemedObjectTile } from '@/components/game/occupational/level5/session4/VisualFocusVisuals';
import { useVisualFocusExit, VisualFocusShell } from '@/components/game/occupational/level5/session4/VisualFocusShell';
import { SESSION5_4_PACING } from '@/components/game/occupational/level5/session4/session4Pacing';
import { FIND_STAR_COPY, FIND_STAR_THEME } from '@/components/game/occupational/level5/session4/visualFocusThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 50;
const MIN_GAP = 56;

const DISTRACTORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '⚫', '⚪', '🔶', '🔷', '💎', '🎈', '🌙', '🔺'];

const getStarsForRound = (round: number) => {
  if (round <= 2) return 2;
  if (round <= 5) return 3;
  return 4;
};

interface GameObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  isStar: boolean;
  found: boolean;
  scale: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

const FindTheStarGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const handleExit = useVisualFocusExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [starsNeeded, setStarsNeeded] = useState(2);
  const [starsFound, setStarsFound] = useState(0);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const starsFoundRef = useRef(0);
  const starsNeededRef = useRef(2);

  const placeObject = useCallback((usedPositions: { x: number; y: number }[]) => {
    const w = screenWidth.current;
    const h = screenHeight.current;
    let attempts = 0;

    while (attempts < 40) {
      const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
      const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
      const tooClose = usedPositions.some((pos) => Math.hypot(pos.x - x, pos.y - y) < MIN_GAP);
      if (!tooClose) {
        usedPositions.push({ x, y });
        return { x, y };
      }
      attempts++;
    }

    const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
    const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
    usedPositions.push({ x, y });
    return { x, y };
  }, []);

  const generateObjects = useCallback(
    (roundNum: number) => {
      const starCount = getStarsForRound(roundNum);
      const distractorCount = 5 + starCount;
      const usedPositions: { x: number; y: number }[] = [];
      const newObjects: GameObject[] = [];

      for (let i = 0; i < starCount; i++) {
        const { x, y } = placeObject(usedPositions);
        newObjects.push({
          id: `star-${roundNum}-${i}-${Date.now()}`,
          x,
          y,
          emoji: '⭐',
          isStar: true,
          found: false,
          scale: 1,
        });
      }

      const distractorEmojis = shuffle(DISTRACTORS).slice(0, distractorCount);
      distractorEmojis.forEach((emoji, i) => {
        const { x, y } = placeObject(usedPositions);
        newObjects.push({
          id: `obj-${roundNum}-${i}-${Date.now()}`,
          x,
          y,
          emoji,
          isStar: false,
          found: false,
          scale: 1,
        });
      });

      setStarsNeeded(starCount);
      setStarsFound(0);
      starsNeededRef.current = starCount;
      starsFoundRef.current = 0;
      advancingRef.current = false;
      setObjects(shuffle(newObjects));

      stopTTS();
      setTimeout(() => {
        const starWord = starCount === 1 ? 'star' : 'stars';
        speakTTS(`Find all ${starCount} ${starWord}!`, 0.8, 'en-US');
      }, 400);
    },
    [placeObject],
  );

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * SESSION5_4_PACING.xpPerScore;
      const accuracy = (finalScore / total) * 100;

      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      doneRef.current = true;

      try {
        await logGameAndAward({
          type: FIND_STAR_COPY.logType,
          correct: finalScore,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: [...FIND_STAR_COPY.skillTags],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [router],
  );

  const completeRound = useCallback(() => {
    if (advancingRef.current || doneRef.current) return;
    advancingRef.current = true;

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('All stars found!', 0.9, 'en-US');

    if (newScore >= TOTAL_ROUNDS) {
      setTimeout(() => endGame(newScore), 900);
      return;
    }

    setTimeout(() => {
      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;
      setRound(nextRound);
    }, 900);
  }, [endGame]);

  const handleObjectTap = useCallback(
    (obj: GameObject) => {
      if (doneRef.current || advancingRef.current || obj.found) return;

      if (obj.isStar) {
        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, scale: 1.45, found: true } : o)),
        );

        setTimeout(() => {
          setObjects((prev) =>
            prev.map((o) => (o.id === obj.id ? { ...o, scale: 1 } : o)),
          );
        }, 180);

        const foundAfterTap = starsFoundRef.current + 1;
        starsFoundRef.current = foundAfterTap;
        setStarsFound(foundAfterTap);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        const needed = starsNeededRef.current;
        if (foundAfterTap >= needed) {
          completeRound();
        } else {
          const remaining = needed - foundAfterTap;
          const remainingWord = remaining === 1 ? 'star' : 'stars';
          speakTTS(`${remaining} more ${remainingWord} to find!`, 0.85, 'en-US');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Find the stars, not that one!', 0.8, 'en-US');
      }
    },
    [completeRound],
  );

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    if (!showInfo && !done) {
      generateObjects(round);
    }
  }, [showInfo, round, done, generateObjects]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
  }, []);

  const visibleObjects = objects.filter((obj) => !(obj.isStar && obj.found));
  const hint = `Find all ${starsNeeded} stars · ${starsFound}/${starsNeeded} found`;

  return (
    <VisualFocusShell
      theme={FIND_STAR_THEME}
      copy={FIND_STAR_COPY}
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
      <View
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {visibleObjects.map((obj) => (
          <Pressable
            key={obj.id}
            onPress={() => handleObjectTap(obj)}
            style={[
              styles.tilePress,
              {
                left: obj.x - OBJECT_SIZE / 2,
                top: obj.y - OBJECT_SIZE / 2,
                transform: [{ scale: obj.scale }],
              },
            ]}
          >
            <ThemedObjectTile size={OBJECT_SIZE} highlight={obj.isStar} accentColor={FIND_STAR_THEME.accent}>
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
  tilePress: { position: 'absolute', zIndex: 5 },
  objectEmoji: { fontSize: 28 },
});

export default FindTheStarGame;
