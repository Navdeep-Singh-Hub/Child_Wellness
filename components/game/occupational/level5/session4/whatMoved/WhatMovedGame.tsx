/**
 * OT Level 5 · Session 4 · Game 4 — What Moved?
 * Memorize evidence layout, then spot the object that shifted.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  CaseSolvedCelebration,
  DetectiveBackdrop,
  EvidenceTile,
  MemorizeBanner,
  WhatMovedHUD,
  WhatMovedInfoScreen,
  WrongSpotRipple,
  type RippleData,
} from '@/components/game/occupational/level5/session4/whatMoved/WhatMovedVisuals';
import { WHAT_MOVED_COPY as COPY } from '@/components/game/occupational/level5/session4/whatMoved/whatMovedTheme';
import { SESSION5_4_PACING as P } from '@/components/game/occupational/level5/session4/session4Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_ROUNDS = 8;
const MEMORIZE_MS = 2000;
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

const WhatMovedGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [showInitial, setShowInitial] = useState(true);
  const [movedObject, setMovedObject] = useState<GameObject | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebratePos, setCelebratePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<RippleData[]>([]);

  const playW = useRef(SCREEN_WIDTH);
  const playH = useRef(SCREEN_HEIGHT);
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);
  const rippleIdRef = useRef(0);

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 550);
  }, []);

  const generateRound = useCallback(() => {
    const newObjects: GameObject[] = [];
    const usedPositions = new Set<string>();
    const w = playW.current;
    const h = playH.current;

    for (let i = 0; i < OBJECT_COUNT; i++) {
      let objX: number;
      let objY: number;
      let attempts = 0;
      do {
        objX = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
        objY = Math.random() * (h - OBJECT_SIZE - 20) + OBJECT_SIZE / 2 + 10;
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
      newX = Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2;
      newY = Math.random() * (h - OBJECT_SIZE - 20) + OBJECT_SIZE / 2 + 10;
    } while (usedPositions.has(`${Math.floor(newX / 50)}-${Math.floor(newY / 50)}`));

    movedObj.x = newX;
    movedObj.y = newY;
    setMovedObject(movedObj);
    setObjects(newObjects);
    setShowInitial(true);
    setShowCelebrate(false);

    if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    changeTimerRef.current = setTimeout(() => {
      setShowInitial(false);
      speakTTS(COPY.ttsReveal, 0.8).catch(() => {});
    }, MEMORIZE_MS);
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      const total = TOTAL_ROUNDS;
      const xp = finalScore * P.xpPerScore;
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
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

  const handleTap = useCallback(
    (obj: GameObject) => {
      if (doneRef.current || showInitial || !movedObject) return;

      if (obj.id === movedObject.id) {
        setCelebratePos({ x: obj.x, y: obj.y });
        setShowCelebrate(true);
        const newScore = score + 1;
        setScore(newScore);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS(COPY.ttsCorrect, 0.9).catch(() => {});

        if (newScore >= TOTAL_ROUNDS) {
          setTimeout(() => endGame(newScore), 1000);
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            generateRound();
          }, 1200);
        }
      } else {
        addRipple(obj.x, obj.y);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(COPY.ttsWrong, 0.8).catch(() => {});
      }
    },
    [addRipple, endGame, generateRound, movedObject, score, showInitial],
  );

  useEffect(() => {
    if (!showInfo && !done) {
      stopTTS();
      generateRound();
      setTimeout(() => speakTTS(COPY.ttsCue, 0.8).catch(() => {}), 500);
    }
  }, [showInfo, round, done, generateRound]);

  useEffect(
    () => () => {
      stopTTS();
      cleanupSounds();
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    },
    [],
  );

  const handleExit = () => {
    if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    stopTTS();
    cleanupSounds();
    onBack?.();
  };

  const hint = showInitial ? COPY.hintMemorize : COPY.hintSpot;

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <WhatMovedInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <WhatMovedHUD
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        hint={hint}
        memorizing={showInitial}
      />

      <View
        style={styles.board}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        <DetectiveBackdrop scanning={!showInitial} />
        <MemorizeBanner visible={showInitial} />

        {objects.map((obj) => (
          <EvidenceTile
            key={obj.id}
            x={obj.x}
            y={obj.y}
            size={OBJECT_SIZE}
            emoji={obj.emoji}
            showAtInitial={showInitial}
            initialX={obj.initialX}
            initialY={obj.initialY}
            disabled={showInitial}
            onPress={() => handleTap(obj)}
          />
        ))}

        <CaseSolvedCelebration visible={showCelebrate} x={celebratePos.x} y={celebratePos.y} />
        <WrongSpotRipple ripples={ripples} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#78350F' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(66,32,6,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
  },
  backText: { color: '#FEF3C7', fontWeight: '800', fontSize: 14 },
  board: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(250,204,21,0.35)',
    shadowColor: '#422006',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
});

export default WhatMovedGame;
