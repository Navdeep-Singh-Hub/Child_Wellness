/**
 * Speech Level 2 — Body Parts & Self Awareness (shared UI).
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
  accent,
  selected,
  onPress,
}: {
  label: string;
  emoji: string;
  accent: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.partBtn, selected && { backgroundColor: accent, borderColor: accent }]}
      onPress={onPress}
    >
      <Text style={styles.partEmoji}>{emoji}</Text>
      <Text style={[styles.partLabel, selected && styles.partLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  partBtn: {
    flex: 1,
    minHeight: 96,
    margin: 5,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  partEmoji: { fontSize: speechLevel2ButtonStyles.emoji.fontSize, marginBottom: 6 },
  partLabel: speechLevel2ButtonStyles.label,
  partLabelOn: speechLevel2ButtonStyles.labelOn,
});
