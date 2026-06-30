/**
 * OT Level 5 · Session 4 · Game 5 — Color Hunt
 * Tap every orb matching the target color in the prism lab.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  ColorHuntHUD,
  ColorHuntInfoScreen,
  ColorOrb,
  PrismBackdrop,
  RoundClearCelebration,
  WrongColorRipple,
  type RippleData,
} from '@/components/game/occupational/level5/session4/colorHunt/ColorHuntVisuals';
import {
  COLOR_HUNT_COLORS,
  COLOR_HUNT_COPY as COPY,
} from '@/components/game/occupational/level5/session4/colorHunt/colorHuntTheme';
import { SESSION5_4_PACING as P } from '@/components/game/occupational/level5/session4/session4Pacing';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_ROUNDS = 10;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 50;
const OBJECT_COUNT = 10;

interface ColorObject {
  id: string;
  x: number;
  y: number;
  colorIndex: number;
  clicked: boolean;
}

const ColorHuntGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [objects, setObjects] = useState<ColorObject[]>([]);
  const [targetColorIndex, setTargetColorIndex] = useState<number | null>(null);
  const [showClear, setShowClear] = useState(false);
  const [ripples, setRipples] = useState<RippleData[]>([]);

  const playW = useRef(SCREEN_WIDTH);
  const playH = useRef(SCREEN_HEIGHT);
  const targetRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const rippleIdRef = useRef(0);

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 550);
  }, []);

  const generateRound = useCallback(() => {
    advancingRef.current = false;
    setShowClear(false);
    const targetIdx = Math.floor(Math.random() * COLOR_HUNT_COLORS.length);
    setTargetColorIndex(targetIdx);
    targetRef.current = targetIdx;

    const newObjects: ColorObject[] = [];
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

      const targetCount = 3 + Math.floor(Math.random() * 2);
      const colorIdx = i < targetCount ? targetIdx : Math.floor(Math.random() * COLOR_HUNT_COLORS.length);

      newObjects.push({
        id: `obj-${i}`,
        x: objX,
        y: objY,
        colorIndex: colorIdx,
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
      speakTTS(COPY.ttsRound(COLOR_HUNT_COLORS[targetIdx]!.name), 0.8).catch(() => {});
    }, 400);
  }, []);

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

  const handleTap = useCallback(
    (obj: ColorObject) => {
      const targetIdx = targetRef.current;
      if (doneRef.current || targetIdx === null || obj.clicked || advancingRef.current) return;

      if (obj.colorIndex === targetIdx) {
        setObjects((prev) => {
          const updated = prev.map((o) => (o.id === obj.id ? { ...o, clicked: true } : o));
          const targetObjects = updated.filter((o) => o.colorIndex === targetIdx);
          const allClicked = targetObjects.every((o) => o.clicked);

          if (allClicked && !advancingRef.current) {
            advancingRef.current = true;
            setShowClear(true);
            speakTTS(COPY.ttsRoundClear, 0.9).catch(() => {});
            setTimeout(() => {
              const newScore = score + 1;
              setScore(newScore);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              if (newScore >= TOTAL_ROUNDS) {
                setTimeout(() => endGame(newScore), 1000);
              } else {
                setTimeout(() => {
                  setRound((r) => r + 1);
                  generateRound();
                }, 1200);
              }
            }, 600);
          }

          return updated;
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        speakTTS(COPY.ttsFound, 0.9).catch(() => {});
      } else {
        addRipple(obj.x, obj.y);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(COPY.ttsWrong, 0.8).catch(() => {});
      }
    },
    [addRipple, endGame, generateRound, score],
  );

  useEffect(() => {
    if (!showInfo && !done) {
      generateRound();
    }
  }, [showInfo, round, done, generateRound]);

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

  const remaining =
    targetColorIndex !== null
      ? objects.filter((o) => o.colorIndex === targetColorIndex && !o.clicked).length
      : 0;
  const targetName = targetColorIndex !== null ? COLOR_HUNT_COLORS[targetColorIndex]!.name : '';
  const hint = targetColorIndex !== null ? COPY.hintTarget(targetName, remaining) : 'Watch the target color';

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ColorHuntInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

      <ColorHuntHUD
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        hint={hint}
        targetColorIndex={targetColorIndex}
      />

      <View
        style={styles.lab}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        <PrismBackdrop />
        <RoundClearCelebration visible={showClear} />

        {objects
          .filter((obj) => !obj.clicked)
          .map((obj) => (
            <ColorOrb
              key={obj.id}
              x={obj.x}
              y={obj.y}
              size={OBJECT_SIZE}
              colorIndex={obj.colorIndex}
              isTarget={obj.colorIndex === targetColorIndex}
              onPress={() => handleTap(obj)}
            />
          ))}

        <WrongColorRipple ripples={ripples} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3E8FF' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.35)',
  },
  backText: { color: '#5B21B6', fontWeight: '800', fontSize: 14 },
  lab: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(236,72,153,0.3)',
    shadowColor: '#DB2777',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
});

export default ColorHuntGame;
