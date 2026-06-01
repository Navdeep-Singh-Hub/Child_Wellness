/**
 * Speech Level 2 — Advanced Comprehension Concepts (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import {
  type Level2BaseShellProps,
  renderLevel2Shell,
} from '@/components/game/speech/level2-shared/level2ShellProps';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const DEFAULT_COMPREHENSION_ROUNDS = 3;

export type ComprehensionGameId =
  | 'follow-2-step-directions'
  | 'belongs-or-not'
  | 'singular-or-plural'
  | 'pronoun-match'
  | 'smart-listener-challenge';

export function clearComprehensionSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakComprehension(text: string, rate = DEFAULT_TTS_RATE) {
  clearComprehensionSpeech();
  speakTTS(text, rate);
}

export function hapticComprehensionSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useComprehensionSession(gameId: ComprehensionGameId, rounds = DEFAULT_COMPREHENSION_ROUNDS) {
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
          skillTags: ['comprehension', 'receptive-language', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[comprehension game] log failed', e);
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

export function ComprehensionOverlays({
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
            message="Amazing listening!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearComprehensionSpeech();
              onBack();
            }}
            onContinue={() => {
              clearComprehensionSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function ComprehensionShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearComprehensionSpeech,
    {
      startEmoji: '🎧',
      startTitle: 'Listen carefully!',
      startHint: 'Follow directions and show what you understand.',
    },
    props,
  );
}

export function ComprehensionChoiceTile({
  label,
  emoji,
  imageKey,
  accent,
  onPress,
  selected,
  wide,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
  accent: string;
  onPress: () => void;
  selected?: boolean;
  wide?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.choiceTile,
        wide && styles.choiceWide,
        selected && { borderColor: accent, borderWidth: 3 },
      ]}
      onPress={onPress}
    >
      <Level2Picture imageKey={imageKey} emoji={emoji} size={40} />
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
    minHeight: 96,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceWide: { minWidth: '88%', maxWidth: '95%' },
  choiceLabel: { fontSize: 13, fontWeight: '800', marginTop: 6, textAlign: 'center' },
});
