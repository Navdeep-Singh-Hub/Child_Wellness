/**
 * OT Level 5 · Session 4 · Game 1 — Star Safari
 * Visual scanning — find all hidden stars among distractors.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  DistractorOrb,
  SafariNightBackdrop,
  StarFoundBurst,
  StarGem,
  StarSafariHUD,
  StarSafariInfoScreen,
  WrongTapRipple,
  type RippleData,
} from '@/components/game/occupational/level5/session4/findTheStars/FindTheStarsVisuals';
import { STAR_SAFARI_COPY as COPY } from '@/components/game/occupational/level5/session4/findTheStars/findTheStarsTheme';
import { SESSION5_4_PACING as P } from '@/components/game/occupational/level5/session4/session4Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 52;
const MIN_GAP = 56;

const DISTRACTORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '⚫', '⚪', '🔶', '🔷', '💎', '🎈', '🌙', '🔺'];

const getStarsForRound = (round: number) => {
  if (round <= 2) return 2;
  if (round <= 5) return 3;
  return 4;
};

interface SafariObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  isStar: boolean;
  found: boolean;
  pop: boolean;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

const FindTheStarsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [objects, setObjects] = useState<SafariObject[]>([]);
  const [starsNeeded, setStarsNeeded] = useState(2);
  const [starsFound, setStarsFound] = useState(0);
  const [bursts, setBursts] = useState<{ key: number; x: number; y: number }[]>([]);
  const [ripples, setRipples] = useState<RippleData[]>([]);

  const playW = useRef(SCREEN_WIDTH);
  const playH = useRef(SCREEN_HEIGHT);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const starsFoundRef = useRef(0);
  const starsNeededRef = useRef(2);
  const rippleIdRef = useRef(0);
  const burstKeyRef = useRef(0);

  const placeObject = useCallback((used: { x: number; y: number }[]) => {
    const w = playW.current;
    const h = playH.current;
    for (let attempt = 0; attempt < 40; attempt++) {
      const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
      const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
      if (!used.some((p) => Math.hypot(p.x - x, p.y - y) < MIN_GAP)) {
        used.push({ x, y });
        return { x, y };
      }
    }
    const x = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
    const y = Math.random() * (h - OBJECT_SIZE - 40) + OBJECT_SIZE / 2 + 20;
    used.push({ x, y });
    return { x, y };
  }, []);

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 550);
  }, []);

  const generateObjects = useCallback(
    (roundNum: number) => {
      const starCount = getStarsForRound(roundNum);
      const used: { x: number; y: number }[] = [];
      const newObjects: SafariObject[] = [];

      for (let i = 0; i < starCount; i++) {
        const { x, y } = placeObject(used);
        newObjects.push({
          id: `star-${roundNum}-${i}`,
          x,
          y,
          emoji: '⭐',
          isStar: true,
          found: false,
          pop: false,
        });
      }

      shuffle(DISTRACTORS)
        .slice(0, 5 + starCount)
        .forEach((emoji, i) => {
          const { x, y } = placeObject(used);
          newObjects.push({
            id: `obj-${roundNum}-${i}`,
            x,
            y,
            emoji,
            isStar: false,
            found: false,
            pop: false,
          });
        });

      setStarsNeeded(starCount);
      setStarsFound(0);
      starsNeededRef.current = starCount;
      starsFoundRef.current = 0;
      advancingRef.current = false;
      setObjects(shuffle(newObjects));

      stopTTS();
      setTimeout(() => speakTTS(COPY.ttsRound(starCount), 0.8).catch(() => {}), 400);
    },
    [placeObject],
  );

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * P.xpPerScore;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      doneRef.current = true;
      speakTTS(COPY.ttsComplete, 0.78).catch(() => {});
      try {
        await logGameAndAward({
          type: COPY.logType,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: [...COPY.skillTags],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error(e);
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
    speakTTS(COPY.ttsSuccess, 0.9).catch(() => {});
    if (newScore >= TOTAL_ROUNDS) {
      setTimeout(() => endGame(newScore), 900);
      return;
    }
    setTimeout(() => {
      roundRef.current += 1;
      setRound(roundRef.current);
    }, 900);
  }, [endGame]);

  const handleTap = useCallback(
    (obj: SafariObject) => {
      if (doneRef.current || advancingRef.current || (obj.isStar && obj.found)) return;

      if (obj.isStar) {
        const key = ++burstKeyRef.current;
        setBursts((prev) => [...prev.slice(-4), { key, x: obj.x, y: obj.y }]);
        setTimeout(() => setBursts((prev) => prev.filter((b) => b.key !== key)), 700);

        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, found: true, pop: true } : o)),
        );

        const foundAfter = starsFoundRef.current + 1;
        starsFoundRef.current = foundAfter;
        setStarsFound(foundAfter);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        if (foundAfter >= starsNeededRef.current) {
          completeRound();
        } else {
          speakTTS(COPY.ttsFound(starsNeededRef.current - foundAfter), 0.85).catch(() => {});
        }
      } else {
        addRipple(obj.x, obj.y);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(COPY.ttsWrong, 0.8).catch(() => {});
      }
    },
    [addRipple, completeRound],
  );

  useEffect(() => {
    scoreRef.current = score;
    roundRef.current = round;
  }, [score, round]);

  useEffect(() => {
    if (!showInfo && !done) generateObjects(round);
  }, [showInfo, round, done, generateObjects]);

  useEffect(
    () => () => {
      stopTTS();
      cleanupSounds();
    },
    [],
  );

  const handleExit = () => {
    stopTTS();
    cleanupSounds();
    onBack?.();
  };

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StarSafariInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={handleExit}
      />
    );
  }

  const visible = objects.filter((o) => !(o.isStar && o.found));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <StarSafariHUD
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        starsFound={starsFound}
        starsNeeded={starsNeeded}
        hint={COPY.huntHint(starsFound, starsNeeded)}
      />

      <View
        style={styles.safari}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        <SafariNightBackdrop />

        {visible.map((obj) => (
          <Pressable
            key={obj.id}
            onPress={() => handleTap(obj)}
            style={[styles.tileHit, { left: obj.x - OBJECT_SIZE / 2, top: obj.y - OBJECT_SIZE / 2 }]}
          >
            {obj.isStar ? (
              <StarGem size={OBJECT_SIZE} pop={obj.pop} />
            ) : (
              <DistractorOrb size={OBJECT_SIZE} emoji={obj.emoji} />
            )}
          </Pressable>
        ))}

        {bursts.map((b) => (
          <StarFoundBurst key={b.key} x={b.x} y={b.y} />
        ))}
        <WrongTapRipple ripples={ripples} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1E1B4B' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  backText: { color: '#FDE68A', fontWeight: '800', fontSize: 14 },
  safari: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.35)',
    shadowColor: '#D97706',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  tileHit: { position: 'absolute', zIndex: 5 },
});

export default FindTheStarsGame;
