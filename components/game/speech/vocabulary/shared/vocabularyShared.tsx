/**
 * Speech Level 2 — Objects, Animals & Vocabulary (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import {
  type Level2BaseShellProps,
  renderLevel2Shell,
} from '@/components/game/speech/level2-shared/level2ShellProps';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Level2ChoiceTile } from '@/components/game/speech/level2-shared/Level2ChoiceTile';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import { StyleSheet, View } from 'react-native';

export const DEFAULT_VOCAB_ROUNDS = 3;

export type VocabularyGameId =
  | 'find-the-animal'
  | 'fruit-basket'
  | 'vehicle-garage'
  | 'alphabet-hunt'
  | 'vegetable-farm';

export function clearVocabSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakVocab(text: string, rate = DEFAULT_TTS_RATE) {
  clearVocabSpeech();
  speakTTS(text, rate);
}

export function hapticVocabSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useVocabularySession(gameId: VocabularyGameId, rounds = DEFAULT_VOCAB_ROUNDS) {
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
          skillTags: ['vocabulary', 'objects-animals', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[vocabulary game] log failed', e);
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

export function VocabularyOverlays({
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
            message="Great vocabulary!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearVocabSpeech();
              onBack();
            }}
            onContinue={() => {
              clearVocabSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function VocabularyShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearVocabSpeech,
    {
      startEmoji: '📚',
      startTitle: 'Word adventure!',
      startHint: 'Listen, look, and tap the pictures that match the words.',
    },
    props,
  );
}

export function VocabTile({
  label,
  emoji,
  imageKey,
  accent,
  small,
  onPress,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
  accent: string;
  small?: boolean;
  onPress: () => void;
}) {
  return (
    <Level2ChoiceTile
      label={label}
      emoji={emoji}
      imageKey={imageKey}
      accent={accent}
      small={small}
      onPress={onPress}
    />
  );
}
