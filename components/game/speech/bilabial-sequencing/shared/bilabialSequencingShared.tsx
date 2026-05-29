import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { BilabialSequencingSessionManager } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingSessionManager';
import type { BilabialSequencingGameId } from '@/components/game/speech/bilabial-sequencing/modules/bilabialSequencingTypes';
import { useBilabialSequencing, type BilabialSequencingSense } from '@/hooks/useBilabialSequencing';
import { logGameAndAward } from '@/utils/api';
import { consumeLevel6Telemetry } from '@/utils/level6Telemetry';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_BILABIAL_SEQUENCING_ROUNDS = 3;
export const BILABIAL_SEQUENCING_INTERACTIONS_PER_ROUND = 3;

export function clearBilabialSequencingSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakBilabialSequencing(text: string, rate = DEFAULT_TTS_RATE) {
  clearBilabialSequencingSpeech();
  speakTTS(text, rate);
}

export function hapticBilabialReward() {
  try {
    Haptics.selectionAsync();
  } catch {
    /* ignore */
  }
}

export function useBilabialSequencingSession(
  gameId: BilabialSequencingGameId,
  rounds = DEFAULT_BILABIAL_SEQUENCING_ROUNDS,
) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new BilabialSequencingSessionManager(gameId, rounds));

  const finishGame = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    managerRef.current.markComplete();
    const accuracy = managerRef.current.accuracyPercent();
    const stars = accuracy >= 85 ? 3 : accuracy >= 65 ? 2 : 1;
    setFinalStats({ accuracy, totalStars: stars });
    setGameFinished(true);
    try {
      await logGameAndAward({
        type: gameId,
        correct: rounds,
        total: rounds,
        accuracy,
        xpAwarded: stars * 14,
        durationMs: rounds * 48000,
        skillTags: [
          'bilabial-sequencing',
          'speech-motor-readiness',
          'bilabial-readiness',
          'speech-repetition-rhythm',
        ],
        meta: { ...managerRef.current.getAnalytics(), level6: consumeLevel6Telemetry() },
      });
    } catch (e) {
      console.warn('[bilabial sequencing] log failed', e);
    }
  }, [gameId, rounds]);

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame();
      return;
    }
    setShowRoundSuccess(true);
    setTimeout(() => {
      setShowRoundSuccess(false);
      setRound((r) => r + 1);
      managerRef.current.advanceRound();
      managerRef.current.startRound();
    }, 1200);
  }, [round, rounds, finishGame]);

  return {
    round,
    rounds,
    showRoundSuccess,
    gameFinished,
    finalStats,
    completeRound,
    manager: managerRef.current,
  };
}

export function BilabialSequencingOverlays({
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
            message="Great repeated speech tries!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 14}
            onHome={() => {
              clearBilabialSequencingSpeech();
              onBack();
            }}
            onContinue={() => {
              clearBilabialSequencingSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type ShellProps = {
  gameId: BilabialSequencingGameId;
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  round: number;
  rounds: number;
  hits: number;
  canPlay: boolean;
  onStart: () => void;
  phaseHint: string;
  startEmoji?: string;
  startTitle?: string;
  startHint?: string;
  progressLabel?: string;
  children: (sense: BilabialSequencingSense) => React.ReactNode;
};

export function BilabialSequencingShell({
  gameId,
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  round,
  rounds,
  hits,
  canPlay,
  onStart,
  phaseHint,
  startEmoji = '🥁',
  startTitle = 'Repeated speech movements',
  startHint = 'Watch MA MA, PA PA, and BA BA rhythms. Copy or repeat any way you like — mouth movement counts. Optional voice is extra fun.',
  progressLabel = 'beats',
  children,
}: ShellProps) {
  const sense = useBilabialSequencing(canPlay, gameId, round);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              sense.setOptionalMicOn(false);
              clearBilabialSequencingSpeech();
              onBack();
            }}
            style={[styles.backBtn, { backgroundColor: `${accent}20` }]}
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
            <Text style={styles.startEmoji}>{startEmoji}</Text>
            <Text style={styles.startTitle}>{startTitle}</Text>
            <Text style={styles.startHint}>{startHint}</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.hintBar, { borderColor: `${accent}55` }]}>
              <Ionicons name="happy-outline" size={18} color={accent} />
              <Text style={styles.hintText}>{phaseHint}</Text>
            </View>
            {sense.postureHint && (
              <Text style={[styles.postureHint, { color: accent }]}>
                Gentle hint: {sense.postureHint.toLowerCase()} lips feeling — any repeat is great!
              </Text>
            )}
            <View style={styles.playArea}>{children(sense)}</View>

            <View style={styles.helperRow}>
              <Pressable
                style={[styles.helperBtn, { backgroundColor: accent }]}
                onPress={() => {
                  sense.goodTry();
                  hapticBilabialReward();
                }}
              >
                <Text style={styles.helperBtnText}>😊 Good try</Text>
              </Pressable>
              <Pressable
                style={[styles.micOptBtn, { borderColor: accent }]}
                onPress={() => void sense.startOptionalMic()}
              >
                <Text style={[styles.micOptText, { color: accent }]}>
                  {sense.optionalMicOn ? '🎤 Voice on' : '🎤 Optional voice'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.meterRow}>
              <View style={styles.meter}>
                <View
                  style={[
                    styles.meterFill,
                    {
                      width: `${Math.round(sense.engagementLevel * 100)}%`,
                      backgroundColor: accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.meterLabel}>
                {sense.helperVisible ? 'Helper on' : `${sense.repetitionAttempt} tries`}
              </Text>
            </View>
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {BILABIAL_SEQUENCING_INTERACTIONS_PER_ROUND}{' '}
            {progressLabel}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function useBilabialRewardCounter(
  sense: BilabialSequencingSense,
  active: boolean,
  onReward: () => void,
) {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!active) {
      handledRef.current = false;
      return;
    }
    if (!sense.rewardPulse) return;
    if (handledRef.current) return;
    if (!sense.consumeReward()) return;
    handledRef.current = true;
    hapticBilabialReward();
    onReward();
    const t = setTimeout(() => {
      handledRef.current = false;
    }, 450);
    return () => clearTimeout(t);
  }, [active, sense.rewardPulse, onReward, sense]);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderBottomWidth: 3,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12 },
  backText: { marginLeft: 6, fontWeight: '800', color: '#0F172A', fontSize: 16 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#334155', marginTop: 2, fontWeight: '600' },
  startWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  startEmoji: { fontSize: 64, marginBottom: 10 },
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  startHint: { fontSize: 16, color: '#475569', textAlign: 'center', marginTop: 10, lineHeight: 24, maxWidth: 380 },
  startBtn: { marginTop: 22, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
  },
  hintText: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0F172A', lineHeight: 22 },
  postureHint: {
    marginHorizontal: 14,
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  playArea: { flex: 1, padding: 12, justifyContent: 'center' },
  helperRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  helperBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  helperBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  micOptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  micOptText: { fontWeight: '900', fontSize: 14 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 8 },
  meter: { flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8, overflow: 'hidden' },
  meterFill: { height: '100%' },
  meterLabel: { fontSize: 12, fontWeight: '800', color: '#334155', minWidth: 88, textAlign: 'right' },
  footer: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 16 : 24, alignItems: 'center' },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  progressText: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
});
