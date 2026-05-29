/**
 * Speech Level 2 — Categories & Attributes (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { speechLevel2ButtonStyles } from '@/components/game/speech/level2-shared/SpeechLevel2Shell';
import {
  type Level2BaseShellProps,
  renderLevel2Shell,
} from '@/components/game/speech/level2-shared/level2ShellProps';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const DEFAULT_CATEGORY_ROUNDS = 3;

export type CategoriesGameId =
  | 'same-category'
  | 'pick-the-different-one'
  | 'big-vs-small'
  | 'soft-or-hard'
  | 'color-match-train';

export function clearCategorySpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakCategory(text: string, rate = DEFAULT_TTS_RATE) {
  clearCategorySpeech();
  speakTTS(text, rate);
}

export function hapticCategorySuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useCategoriesSession(gameId: CategoriesGameId, rounds = DEFAULT_CATEGORY_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);

  const finishGame = useCallback(
    async (accuracy: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
      setFinalStats({ accuracy, totalStars: stars });
      setGameFinished(true);
      try {
        await logGameAndAward({
          type: gameId,
          correct: rounds,
          total: rounds,
          accuracy,
          xpAwarded: stars * 15,
          durationMs: rounds * 40000,
          skillTags: ['categories', 'attributes', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[categories game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 70 + round * 10));
      return;
    }
    setShowRoundSuccess(true);
    setTimeout(() => {
      setShowRoundSuccess(false);
      setRound((r) => r + 1);
    }, 1400);
  }, [round, rounds, finishGame]);

  return { round, rounds, showRoundSuccess, gameFinished, finalStats, completeRound };
}

export function CategoriesOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
}: {
  showRoundSuccess: boolean;
  gameFinished: boolean;
  finalStats: { accuracy: number; totalStars: number } | null;
  onBack: () => void;
  onComplete?: () => void;
}) {
  return (
    <>
      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
      {gameFinished && finalStats && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CongratulationsScreen
            message="Great sorting!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearCategorySpeech();
              onBack();
            }}
            onContinue={() => {
              clearCategorySpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function CategoriesShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearCategorySpeech,
    {
      startEmoji: '🗂️',
      startTitle: 'Sort and compare!',
      startHint: 'Group things that belong together. Notice what is different.',
    },
    props,
  );
}

export function CategoryTile({
  label,
  emoji,
  accent,
  onPress,
  dimmed,
}: {
  label: string;
  emoji: string;
  accent: string;
  onPress: () => void;
  dimmed?: boolean;
}) {
  return (
    <Pressable
      style={[styles.tile, dimmed && styles.tileDimmed]}
      onPress={onPress}
    >
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={[styles.tileLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '42%',
    maxWidth: '48%',
    margin: 5,
    minHeight: 100,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tileDimmed: { opacity: 0.35 },
  tileEmoji: { fontSize: speechLevel2ButtonStyles.emoji.fontSize },
  tileLabel: { ...speechLevel2ButtonStyles.label, marginTop: 6 },
});
