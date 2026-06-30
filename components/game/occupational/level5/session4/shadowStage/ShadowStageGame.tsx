/**
 * OT Level 5 · Session 4 · Game 3 — Shadow Stage
 * Two-step puppet-to-shadow matching on a spotlight theater stage.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  MatchCelebration,
  PuppetTile,
  ShadowSilhouette,
  ShadowStageBackdrop,
  ShadowStageHUD,
  ShadowStageInfoScreen,
  StageDivider,
  WrongMatchRipple,
  type RippleData,
} from '@/components/game/occupational/level5/session4/shadowStage/ShadowStageVisuals';
import { SHADOW_STAGE_COPY as COPY } from '@/components/game/occupational/level5/session4/shadowStage/shadowStageTheme';
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

interface StageObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  isShadow: boolean;
  matched: boolean;
  isCorrectShadow: boolean;
}

const ShadowStageGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [objects, setObjects] = useState<StageObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebratePos, setCelebratePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<RippleData[]>([]);

  const playW = useRef(SCREEN_WIDTH);
  const playH = useRef(SCREEN_HEIGHT);
  const doneRef = useRef(false);
  const rippleIdRef = useRef(0);

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 550);
  }, []);

  const generateRound = useCallback(() => {
    const selected = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!;
    const w = playW.current;
    const h = playH.current;
    const newObjects: StageObject[] = [];

    newObjects.push({
      id: 'obj-1',
      x: Math.random() * (w - OBJECT_SIZE) + OBJECT_SIZE / 2,
      y: Math.random() * (h * 0.42 - OBJECT_SIZE) + OBJECT_SIZE / 2 + 12,
      emoji: selected.emoji,
      isShadow: false,
      matched: false,
      isCorrectShadow: false,
    });

    newObjects.push({
      id: 'shadow-correct',
      x: Math.random() * (w - SHADOW_SIZE) + SHADOW_SIZE / 2,
      y: h * 0.55 + Math.random() * (h * 0.38 - SHADOW_SIZE) + SHADOW_SIZE / 2,
      emoji: selected.emoji,
      isShadow: true,
      matched: false,
      isCorrectShadow: true,
    });

    const wrongObjects = OBJECTS.filter((o) => o.emoji !== selected.emoji);
    for (let i = 0; i < 2; i++) {
      const wrong = wrongObjects[Math.floor(Math.random() * wrongObjects.length)]!;
      newObjects.push({
        id: `shadow-wrong-${i}`,
        x: Math.random() * (w - SHADOW_SIZE) + SHADOW_SIZE / 2,
        y: h * 0.55 + Math.random() * (h * 0.38 - SHADOW_SIZE) + SHADOW_SIZE / 2,
        emoji: wrong.emoji,
        isShadow: true,
        matched: false,
        isCorrectShadow: false,
      });
    }

    const shadows = newObjects.filter((o) => o.isShadow);
    const puppet = newObjects.find((o) => !o.isShadow)!;
    for (let i = shadows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shadows[i], shadows[j]] = [shadows[j]!, shadows[i]!];
    }

    setObjects([puppet, ...shadows]);
    setSelectedId(null);
    setShowCelebrate(false);
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
    (obj: StageObject) => {
      if (doneRef.current || obj.matched) return;

      if (!obj.isShadow) {
        setSelectedId(obj.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        speakTTS(COPY.ttsSelect, 0.8).catch(() => {});
        return;
      }

      if (!selectedId) return;

      const puppet = objects.find((o) => !o.isShadow && !o.matched);
      if (!puppet) return;

      if (obj.isCorrectShadow) {
        setCelebratePos({ x: obj.x, y: obj.y });
        setShowCelebrate(true);
        setObjects((prev) =>
          prev.map((o) => (o.id === puppet.id || o.id === obj.id ? { ...o, matched: true } : o)),
        );
        setSelectedId(null);

        const newScore = score + 1;
        setScore(newScore);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS(COPY.ttsMatch, 0.9).catch(() => {});

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
        setSelectedId(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS(COPY.ttsWrong, 0.8).catch(() => {});
      }
    },
    [addRipple, endGame, generateRound, objects, score, selectedId],
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
    },
    [],
  );

  const handleExit = () => {
    stopTTS();
    cleanupSounds();
    onBack?.();
  };

  const hint = selectedId ? COPY.hintShadow : COPY.hintSelect;

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ShadowStageInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

      <ShadowStageHUD
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        hint={hint}
        hasSelection={!!selectedId}
      />

      <View
        style={styles.stage}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        <ShadowStageBackdrop selected={!!selectedId} />
        <StageDivider />

        {objects.map((obj) => {
          if (obj.isShadow) {
            return (
              <ShadowSilhouette
                key={obj.id}
                x={obj.x}
                y={obj.y}
                size={SHADOW_SIZE}
                emoji={obj.emoji}
                matched={obj.matched}
                onPress={() => handleTap(obj)}
              />
            );
          }
          return (
            <PuppetTile
              key={obj.id}
              x={obj.x}
              y={obj.y}
              size={OBJECT_SIZE}
              emoji={obj.emoji}
              selected={selectedId === obj.id}
              matched={obj.matched}
              onPress={() => handleTap(obj)}
            />
          );
        })}

        <MatchCelebration visible={showCelebrate} x={celebratePos.x} y={celebratePos.y} />
        <WrongMatchRipple ripples={ripples} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1F2937' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(31,41,55,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.4)',
  },
  backText: { color: '#F9FAFB', fontWeight: '800', fontSize: 14 },
  stage: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(244,114,182,0.35)',
    shadowColor: '#EC4899',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
});

export default ShadowStageGame;
