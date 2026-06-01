/**
 * Speech Level 2 — Body Parts & Self Awareness (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Level2ChoiceTile } from '@/components/game/speech/level2-shared/Level2ChoiceTile';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import {
  type Level2BaseShellProps,
  renderLevel2Shell,
} from '@/components/game/speech/level2-shared/level2ShellProps';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export const DEFAULT_BODY_ROUNDS = 3;

export type BodyPartsGameId =
  | 'touch-the-nose'
  | 'speech-body-puzzle'
  | 'what-helps-you-see'
  | 'dress-the-character'
  | 'simon-says-body';

export function clearBodySpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakBody(text: string, rate = DEFAULT_TTS_RATE) {
  clearBodySpeech();
  speakTTS(text, rate);
}

export function hapticBodySuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useBodyPartsSession(gameId: BodyPartsGameId, rounds = DEFAULT_BODY_ROUNDS) {
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
          skillTags: ['body-parts', 'self-awareness', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[body parts game] log failed', e);
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

export function BodyPartsOverlays({
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
            message="Great body work!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearBodySpeech();
              onBack();
            }}
            onContinue={() => {
              clearBodySpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function BodyPartsShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearBodySpeech,
    {
      startEmoji: '🧍',
      startTitle: 'Learn your body!',
      startHint: 'Tap the right parts, build the puzzle, and dress the character. Go at your own pace.',
    },
    props,
  );
}

export function BodyPartButton({
  label,
  emoji,
  imageKey,
  accent,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
  accent: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Level2ChoiceTile
      label={label}
      emoji={emoji}
      imageKey={imageKey}
      accent={accent}
      selected={selected}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({});
