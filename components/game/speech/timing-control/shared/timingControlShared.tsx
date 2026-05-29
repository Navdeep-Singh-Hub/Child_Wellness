import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { TimingControlSessionManager } from '@/components/game/speech/timing-control/modules/TimingControlSessionManager';
import type { TimingControlGameId } from '@/components/game/speech/timing-control/modules/timingControlTypes';
import type { TimingControlSense } from '@/hooks/useTimingControl';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_TIMING_ROUNDS = 3;
export const TIMING_INTERACTIONS_PER_ROUND = 3;

export function clearTimingSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakTiming(text: string, rate = DEFAULT_TTS_RATE) {
  clearTimingSpeech();
  speakTTS(text, rate);
}

export function hapticTimingReward() {
  try {
    Haptics.selectionAsync();
  } catch {
    /* ignore */
  }
}

export function useTimingSession(gameId: TimingControlGameId, rounds = DEFAULT_TIMING_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new TimingControlSessionManager(gameId, rounds));

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
          'timing-control',
          'oral-rhythm',
          'movement-pacing',
          'speech-readiness',
        ],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[timing control] log failed', e);
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

export function TimingOverlays({
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
            message="Great timing and pacing trying!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 14}
            onHome={() => {
              clearTimingSpeech();
              onBack();
            }}
            onContinue={() => {
              clearTimingSpeech();
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
  hits: number;
  canPlay: boolean;
  onStart: () => void;
  phaseHint: string;
  startEmoji?: string;
  startHint?: string;
  children: React.ReactNode;
  sense: TimingControlSense;
};

export function TimingControlShell({
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
  startEmoji = '⏱️',
  startHint = 'Watch the pace and try your own timing. All attempts count.',
  children,
  sense,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              sense.stopMic();
              clearTimingSpeech();
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
            <Text style={styles.startTitle}>Timing control</Text>
            <Text style={styles.startHint}>{startHint}</Text>
            <Pressable
              style={[styles.startBtn, { backgroundColor: accent }]}
              onPress={async () => {
                await sense.startMic();
                onStart();
              }}
            >
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <MicBanner sense={sense} />
            <View style={[styles.hintBar, { borderColor: `${accent}55` }]}>
              <Ionicons name="happy-outline" size={18} color={accent} />
              <Text style={styles.hintText}>{phaseHint}</Text>
            </View>
            <View style={styles.playArea}>{children}</View>
            <View style={styles.helperRow}>
              <Pressable
                style={[styles.helperBtn, { backgroundColor: accent }]}
                onPress={() => {
                  sense.goodTry();
                  hapticTimingReward();
                }}
              >
                <Text style={styles.helperBtnText}>😊 Good try</Text>
              </Pressable>
            </View>
            <View style={styles.meterRow}>
              <Ionicons name="mic" size={16} color={accent} />
              <View style={styles.meter}>
                <View
                  style={[
                    styles.meterFill,
                    {
                      width: `${Math.round(sense.smoothedLevel * 100)}%`,
                      backgroundColor: sense.airflowActive ? accent : '#94A3B8',
                    },
                  ]}
                />
              </View>
              <Text style={styles.meterLabel}>{sense.airflowActive ? 'Air on' : 'Air soft'}</Text>
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.skills}>{skills}</Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: rounds }).map((_, i) => (
              <View key={i} style={[styles.dot, { borderColor: accent }, i < round && { backgroundColor: accent }]} />
            ))}
          </View>
          <Text style={styles.progressText}>
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {TIMING_INTERACTIONS_PER_ROUND} tries
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function MicBanner({ sense }: { sense: TimingControlSense }) {
  if (sense.micStatus === 'active') return null;
  const message =
    sense.micStatus === 'requesting'
      ? 'Starting microphone...'
      : sense.micStatus === 'denied'
        ? 'Microphone blocked - use Good try or enable mic.'
        : sense.micStatus === 'error'
          ? sense.micError ?? 'Microphone unavailable'
          : 'Enable microphone for airflow play';

  return (
    <View style={styles.micBanner}>
      {sense.micStatus === 'requesting' ? (
        <ActivityIndicator color="#0EA5E9" />
      ) : (
        <Ionicons name="mic-off" size={20} color="#0369A1" />
      )}
      <Text style={styles.micBannerText}>{message}</Text>
      {(sense.micStatus === 'denied' || sense.micStatus === 'error') && (
        <Pressable style={styles.micRetry} onPress={() => void Linking.openSettings()}>
          <Text style={styles.micRetryText}>Settings</Text>
        </Pressable>
      )}
      {sense.micStatus === 'idle' && (
        <Pressable style={styles.micRetry} onPress={() => void sense.startMic()}>
          <Text style={styles.micRetryText}>Enable</Text>
        </Pressable>
      )}
    </View>
  );
}

export function useTimingHits({
  canPlay,
  sense,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  canPlay: boolean;
  sense: TimingControlSense;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: TimingControlSessionManager;
  onRoundComplete: () => void;
}) {
  React.useEffect(() => {
    if (!canPlay) return;
    if (!sense.coordinationPulse) return;
    if (!sense.consumeCoordinationPulse()) return;
    hapticTimingReward();
    const next = hits + 1;
    setHits(next);
    manager.recordAttempt(sense.timingProgress);
    if (next >= TIMING_INTERACTIONS_PER_ROUND) {
      setTimeout(() => onRoundComplete(), 700);
    }
  }, [canPlay, sense.coordinationPulse]); // eslint-disable-line react-hooks/exhaustive-deps
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
  micBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#E0F2FE' },
  micBannerText: { flex: 1, fontSize: 13, color: '#0369A1', fontWeight: '600' },
  micRetry: { backgroundColor: '#38BDF8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  micRetryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
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
  playArea: { flex: 1, padding: 12, justifyContent: 'center' },
  helperRow: { paddingHorizontal: 12, paddingBottom: 8 },
  helperBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  helperBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
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
