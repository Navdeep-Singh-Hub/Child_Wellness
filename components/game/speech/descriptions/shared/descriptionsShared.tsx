/**
 * Speech Level 2 — Descriptions & Reasoning (shared UI).
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

export const DEFAULT_DESCRIPTION_ROUNDS = 3;

export type DescriptionsGameId =
  | 'guess-the-object'
  | 'hidden-part-puzzle'
  | 'what-am-i-describing'
  | 'find-by-function'
  | 'mystery-bag';

export function clearDescriptionSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakDescription(text: string, rate = DEFAULT_TTS_RATE) {
  clearDescriptionSpeech();
  speakTTS(text, rate);
}

export function hapticDescriptionSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useDescriptionsSession(gameId: DescriptionsGameId, rounds = DEFAULT_DESCRIPTION_ROUNDS) {
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
          skillTags: ['descriptions', 'reasoning', 'inference', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[descriptions game] log failed', e);
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

export function DescriptionsOverlays({
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
            message="Great detective work!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearDescriptionSpeech();
              onBack();
            }}
            onContinue={() => {
              clearDescriptionSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function DescriptionsShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearDescriptionSpeech,
    {
      startEmoji: '🔍',
      startTitle: 'Use the clues!',
      startHint: 'Listen, look at the clues, and guess what it is.',
    },
    props,
  );
}

export function ClueCard({ clues, accent }: { clues: string[]; accent: string }) {
  return (
    <View style={[styles.clueCard, { borderColor: accent }]}>
      {clues.map((c, i) => (
        <Text key={i} style={styles.clueLine}>
          • {c}
        </Text>
      ))}
    </View>
  );
}

export function DescriptionChoiceTile({
  label,
  emoji,
  accent,
  onPress,
}: {
  label: string;
  emoji: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.choiceTile} onPress={onPress}>
      <Text style={styles.choiceEmoji}>{emoji}</Text>
      <Text style={[styles.choiceLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clueCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
  },
  clueLine: { fontSize: 17, fontWeight: '700', color: '#0F172A', lineHeight: 24, marginBottom: 4 },
  choiceTile: {
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
  choiceEmoji: { fontSize: 40 },
  choiceLabel: { fontSize: 13, fontWeight: '800', marginTop: 6, textAlign: 'center' },
});
