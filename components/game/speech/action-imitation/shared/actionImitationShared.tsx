/**
 * Speech — Action Imitation (Level 2) shared UI & session helpers.
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { actionImageKey } from '@/components/game/speech/level2-shared/level2ActionImages';
import { Level2ChoiceTile } from '@/components/game/speech/level2-shared/Level2ChoiceTile';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import { SpeechLevel2Shell } from '@/components/game/speech/level2-shared/SpeechLevel2Shell';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export const DEFAULT_ACTION_ROUNDS = 3;

export type ActionGameId =
  | 'copy-the-clap'
  | 'jump-like-me'
  | 'dance-freeze'
  | 'silly-action-match'
  | 'follow-my-move';

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

export function useActionGameSession(gameId: ActionGameId, rounds = DEFAULT_ACTION_ROUNDS) {
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
          skillTags: ['action-imitation', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[action game] log failed', e);
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

export function ActionGameOverlays({
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
            message="Great copying!"
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

type ShellProps = {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  round: number;
  rounds: number;
  canPlay: boolean;
  onStart: () => void;
  phaseHint: string;
  avatarEmoji?: string;
  avatarImageKey?: Level2ImageKey;
  avatarAnimating?: boolean;
  children: React.ReactNode;
  startEmoji?: string;
  startTitle?: string;
  startHint?: string;
  instructionSteps?: string[];
  onSpeakStart?: () => void;
};

function ActionAvatarRow({
  emoji,
  imageKey,
  animating,
}: {
  emoji?: string;
  imageKey?: Level2ImageKey;
  animating: boolean;
}) {
  const bounce = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!animating) {
      bounce.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.14, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animating, bounce]);

  return (
    <View style={styles.avatarRow}>
      <Animated.View style={{ transform: [{ scale: bounce }] }}>
        <Level2Picture imageKey={imageKey ?? 'avatar-child-neutral'} emoji={emoji ?? '🧒'} variant="avatar" />
      </Animated.View>
      <Text style={styles.avatarLabel}>Your friend</Text>
    </View>
  );
}

export function ActionGameShell({
  avatarEmoji,
  avatarImageKey,
  avatarAnimating = false,
  startEmoji = '🎭',
  startTitle = 'Ready to copy?',
  startHint = 'Watch your friend first, then copy the same move. There is no rush!',
  instructionSteps,
  onSpeakStart,
  ...rest
}: ShellProps) {
  return (
    <SpeechLevel2Shell
      {...rest}
      onClearSpeech={clearActionSpeech}
      startEmoji={startEmoji}
      startTitle={startTitle}
      startHint={startHint}
      instructionSteps={instructionSteps}
      onSpeakStart={onSpeakStart}
      playHeaderExtra={
        rest.canPlay ? (
          <ActionAvatarRow emoji={avatarEmoji} imageKey={avatarImageKey} animating={avatarAnimating} />
        ) : undefined
      }
    />
  );
}

export function ActionChoiceButton({
  label,
  emoji,
  imageKey,
  actionId,
  accent,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
  /** Resolves to assets/speech/level2/actions/ when imageKey is omitted. */
  actionId?: string;
  accent: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const resolvedKey = imageKey ?? (actionId ? actionImageKey(actionId) : undefined);

  return (
    <Level2ChoiceTile
      label={label}
      emoji={emoji}
      imageKey={resolvedKey}
      accent={accent}
      onPress={onPress}
      selected={selected}
    />
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', paddingVertical: 6 },
  avatarEmoji: { fontSize: 80 },
  avatarLabel: { fontSize: 16, fontWeight: '800', color: '#334155', marginTop: 4 },
});
