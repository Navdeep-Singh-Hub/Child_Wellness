/**
 * Speech — Action Imitation (Level 2) shared UI & session helpers.
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { SpeechLevel2Shell, speechLevel2ButtonStyles } from '@/components/game/speech/level2-shared/SpeechLevel2Shell';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

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
  avatarEmoji: string;
  avatarAnimating?: boolean;
  children: React.ReactNode;
  startEmoji?: string;
  startTitle?: string;
  startHint?: string;
  instructionSteps?: string[];
  onSpeakStart?: () => void;
};

function ActionAvatarRow({ emoji, animating }: { emoji: string; animating: boolean }) {
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
      <Animated.Text style={[styles.avatarEmoji, { transform: [{ scale: bounce }] }]}>{emoji}</Animated.Text>
      <Text style={styles.avatarLabel}>Your friend</Text>
    </View>
  );
}

export function ActionGameShell({
  avatarEmoji,
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
        rest.canPlay ? <ActionAvatarRow emoji={avatarEmoji} animating={avatarAnimating} /> : undefined
      }
    />
  );
}

export function ActionChoiceButton({
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
      style={[styles.choiceBtn, selected && { backgroundColor: accent, borderColor: accent }]}
      onPress={onPress}
    >
      <Text style={styles.choiceEmoji}>{emoji}</Text>
      <Text style={[styles.choiceLabel, selected && styles.choiceLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', paddingVertical: 6 },
  avatarEmoji: { fontSize: 80 },
  avatarLabel: { fontSize: 16, fontWeight: '800', color: '#334155', marginTop: 4 },
  choiceBtn: {
    flex: 1,
    minHeight: 108,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  choiceEmoji: { fontSize: speechLevel2ButtonStyles.emoji.fontSize, marginBottom: 8 },
  choiceLabel: speechLevel2ButtonStyles.label,
  choiceLabelOn: speechLevel2ButtonStyles.labelOn,
});
