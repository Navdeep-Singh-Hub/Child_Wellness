/**
 * Speech Level 2 — Sequences, Missing Items & Logic (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  children: React.ReactNode;
};

export function SequencesShell({
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  round,
  rounds,
  canPlay,
  onStart,
  phaseHint,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearSequenceSpeech();
              onBack();
            }}
            style={[styles.backBtn, { backgroundColor: `${accent}22` }]}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {!canPlay ? (
          <View style={styles.startWrap}>
            <Text style={styles.startEmoji}>🧠</Text>
            <Text style={styles.startTitle}>Think in order!</Text>
            <Text style={styles.startHint}>Put stories in order, find what is missing, and solve clues.</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.hintBar, { backgroundColor: `${accent}33` }]}>
              <Text style={styles.hintText}>{phaseHint}</Text>
            </View>
            <View style={styles.playArea}>{children}</View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.skills}>{skills}</Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: rounds }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { borderColor: accent }, i < round && { backgroundColor: accent }]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            Round {Math.min(round, rounds)} / {rounds}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function SequenceChoiceTile({
  label,
  emoji,
  accent,
  onPress,
  selected,
  orderNum,
  dimmed,
}: {
  label: string;
  emoji: string;
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
      <Text style={styles.choiceEmoji}>{emoji}</Text>
      <Text style={[styles.choiceLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 2,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10 },
  backText: { marginLeft: 4, fontWeight: '700', color: '#0F172A', fontSize: 15 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  startWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  startEmoji: { fontSize: 56, marginBottom: 12 },
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  startHint: { fontSize: 15, color: '#475569', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  startBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  hintBar: { marginHorizontal: 12, marginTop: 8, padding: 10, borderRadius: 10 },
  hintText: { fontSize: 15, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  playArea: { flex: 1, padding: 12 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 24,
    alignItems: 'center',
  },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
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
  choiceEmoji: { fontSize: 36 },
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
