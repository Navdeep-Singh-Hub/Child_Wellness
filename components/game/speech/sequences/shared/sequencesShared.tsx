/**
 * Speech Level 2 — Sequences, Missing Items & Logic (shared UI).
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

export const DEFAULT_SEQUENCE_ROUNDS = 3;

export type SequencesGameId =
  | 'story-order-cards'
  | 'what-is-missing'
  | 'complete-the-pattern'
  | 'first-middle-last'
  | 'find-the-hidden-toy';

export function clearSequenceSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakSequence(text: string, rate = DEFAULT_TTS_RATE) {
  clearSequenceSpeech();
  speakTTS(text, rate);
}

export function hapticSequenceSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useSequencesSession(gameId: SequencesGameId, rounds = DEFAULT_SEQUENCE_ROUNDS) {
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
          skillTags: ['sequencing', 'logic', 'reasoning', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[sequences game] log failed', e);
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

export function SequencesOverlays({
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
            message="Great thinking!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearSequenceSpeech();
              onBack();
            }}
            onContinue={() => {
              clearSequenceSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function SequencesShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearSequenceSpeech,
    {
      startEmoji: '🧠',
      startTitle: 'Think in order!',
      startHint: 'Put stories in order, find what is missing, and solve clues.',
    },
    props,
  );
}

export function SequenceChoiceTile({
  label,
  emoji,
  imageKey,
  accent,
  onPress,
  selected,
  orderNum,
  dimmed,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
  accent: string;
  onPress: () => void;
  selected?: boolean;
  orderNum?: number;
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
      {orderNum != null ? (
        <View style={[styles.orderBadge, { backgroundColor: accent }]}>
          <Text style={styles.orderBadgeText}>{orderNum}</Text>
        </View>
      ) : null}
      <Level2Picture imageKey={imageKey} emoji={emoji} size={36} />
      <Text style={[styles.choiceLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choiceTile: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '32%',
    margin: 4,
    minHeight: 96,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceDimmed: { opacity: 0.4 },
  choiceLabel: { fontSize: 11, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  orderBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});
