/**
 * Speech Level 2 — Actions, Verbs & Functions (shared UI).
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

export const DEFAULT_ACTION_ROUNDS = 3;

export type ActionsGameId =
  | 'who-is-running'
  | 'what-do-we-eat-with'
  | 'match-the-action'
  | 'what-does-a-doctor-do'
  | 'tool-match';

export function clearActionSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakAction(text: string, rate = DEFAULT_TTS_RATE) {
  clearActionSpeech();
  speakTTS(text, rate);
}

export function hapticActionSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useActionsSession(gameId: ActionsGameId, rounds = DEFAULT_ACTION_ROUNDS) {
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
          skillTags: ['verbs', 'actions', 'functions', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[actions game] log failed', e);
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

export function ActionsOverlays({
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
            message="Great action thinking!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearActionSpeech();
              onBack();
            }}
            onContinue={() => {
              clearActionSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function ActionsShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearActionSpeech,
    {
      startEmoji: '🏃',
      startTitle: 'What are they doing?',
      startHint: 'Learn actions, verbs, and what objects are for.',
    },
    props,
  );
}

export function ActionChoiceTile({
  label,
  emoji,
  accent,
  onPress,
  selected,
  dimmed,
}: {
  label: string;
  emoji: string;
  accent: string;
  onPress: () => void;
  selected?: boolean;
  dimmed?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.choiceTile,
        selected && { borderColor: accent, borderWidth: 3 },
        dimmed && styles.choiceDimmed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.choiceEmoji}>{emoji}</Text>
      <Text style={[styles.choiceLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choiceTile: {
    flex: 1,
    minWidth: '42%',
    maxWidth: '48%',
    margin: 5,
    minHeight: 108,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  choiceDimmed: { opacity: 0.35 },
  choiceEmoji: { fontSize: speechLevel2ButtonStyles.emoji.fontSize },
  choiceLabel: { ...speechLevel2ButtonStyles.label, marginTop: 6, textAlign: 'center' },
});
