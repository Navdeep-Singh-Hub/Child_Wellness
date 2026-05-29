import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  BreathActivationSessionManager,
  breathActivationRoundDifficulty,
} from '@/components/game/speech/breath-activation/modules/BreathActivationSessionManager';
import type { BreathActivationGameId } from '@/components/game/speech/breath-activation/modules/breathActivationTypes';
import { useBreathActivation, type BreathActivationSense } from '@/hooks/useBreathActivation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_ACTIVATION_ROUNDS = 3;
export const ACTIVATION_CYCLES_PER_ROUND = 3;

export function clearActivationSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakActivation(text: string, rate = DEFAULT_TTS_RATE) {
  clearActivationSpeech();
  speakTTS(text, rate);
}

export function hapticActivationSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useBreathActivationGameSession(
  gameId: BreathActivationGameId,
  rounds = DEFAULT_ACTIVATION_ROUNDS,
) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new BreathActivationSessionManager(gameId, rounds));

  const finishGame = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
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
        xpAwarded: stars * 12,
        durationMs: rounds * 50000,
        skillTags: [
          'breath-activation',
          'start-stop-air',
          'oral-awareness',
          'pre-oral',
          'self-regulation',
        ],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[breath activation] log failed', e);
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

export function ActivationGameOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
  message = 'You started and stopped your air!',
}: {
  showRoundSuccess: boolean;
  gameFinished: boolean;
  finalStats: { accuracy: number; totalStars: number } | null;
  onBack: () => void;
  onComplete?: () => void;
  message?: string;
}) {
  return (
    <>
      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
      {gameFinished && finalStats && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CongratulationsScreen
            message={message}
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 12}
            onHome={() => {
              clearActivationSpeech();
              onBack();
            }}
            onContinue={() => {
              clearActivationSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type ActivationFrameProps = {
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
  startHint?: string;
  children: (breath: BreathActivationSense) => React.ReactNode;
};

export function BreathActivationGameFrame({
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
  startHint = 'Start your breath, then stop. Soft tries count! Tap Start–Stop if the mic is off.',
  children,
}: ActivationFrameProps) {
  const diff = breathActivationRoundDifficulty(round);
  const breath = useBreathActivation(canPlay, diff);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              breath.stopMic();
              clearActivationSpeech();
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
            <Text style={styles.startEmoji}>💨</Text>
            <Text style={styles.startTitle}>Start and stop your air</Text>
            <Text style={styles.startHint}>{startHint}</Text>
            <Pressable
              style={[styles.startBtn, { backgroundColor: accent }]}
              onPress={async () => {
                await breath.startMic();
                onStart();
              }}
            >
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ActivationMicBanner breath={breath} />
            {breath.micStatus !== 'active' && (
              <View style={styles.tapRow}>
                <Pressable
                  style={[styles.tapBtn, { borderColor: accent }]}
                  onPress={breath.tapStartStop}
                >
                  <Text style={styles.tapBtnText}>💨 Start–Stop (tap)</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>{children(breath)}</View>
            <View style={styles.meterWrap}>
              <Ionicons name="mic" size={18} color={accent} />
              <View style={styles.meterTrack}>
                <View
                  style={[
                    styles.meterFill,
                    {
                      width: `${Math.round(breath.smoothedLevel * 100)}%`,
                      backgroundColor: breath.breathActive ? accent : '#94A3B8',
                    },
                  ]}
                />
              </View>
              <Text style={styles.meterLabel}>
                {breath.micStatus !== 'active'
                  ? breath.micStatus === 'denied'
                    ? 'Mic blocked'
                    : 'Mic off'
                  : breath.breathActive
                    ? 'Air on'
                    : breath.calibrated
                      ? 'Air off'
                      : 'Listening…'}
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {ACTIVATION_CYCLES_PER_ROUND}{' '}
            start–stops
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function ActivationMicBanner({ breath }: { breath: BreathActivationSense }) {
  if (breath.micStatus === 'active') return null;

  const message =
    breath.micStatus === 'requesting'
      ? 'Starting microphone…'
      : breath.micStatus === 'denied'
        ? 'Microphone off — use Start–Stop tap or allow mic in Settings.'
        : breath.micStatus === 'error'
          ? breath.micError ?? 'Microphone unavailable'
          : 'Allow microphone for breath sounds';

  return (
    <View style={styles.micBanner}>
      {breath.micStatus === 'requesting' ? (
        <ActivityIndicator color="#0EA5E9" />
      ) : (
        <Ionicons name="mic-off" size={20} color="#0369A1" />
      )}
      <Text style={styles.micBannerText}>{message}</Text>
      {(breath.micStatus === 'denied' || breath.micStatus === 'error') && (
        <Pressable style={styles.micRetry} onPress={() => void Linking.openSettings()}>
          <Text style={styles.micRetryText}>Settings</Text>
        </Pressable>
      )}
      {breath.micStatus === 'idle' && (
        <Pressable style={styles.micRetry} onPress={() => void breath.startMic()}>
          <Text style={styles.micRetryText}>Enable</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Count start→stop breath cycles toward round goal */
export function useBreathCycleCounter(
  breath: BreathActivationSense,
  active: boolean,
  onCycle: (duration: number, intensity: number) => void,
) {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!active) {
      handledRef.current = false;
      return;
    }
    if (!breath.cyclePulse) return;
    if (handledRef.current) return;
    if (!breath.consumeCycle()) return;
    handledRef.current = true;
    hapticActivationSuccess();
    onCycle(breath.duration, breath.intensity);
    const t = setTimeout(() => {
      handledRef.current = false;
    }, 500);
    return () => clearTimeout(t);
  }, [active, breath.cyclePulse, breath.duration, breath.intensity, onCycle, breath]);
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
  startEmoji: { fontSize: 72, marginBottom: 12 },
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  startHint: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    maxWidth: 340,
  },
  startBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  micBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#E0F2FE',
  },
  micBannerText: { flex: 1, fontSize: 13, color: '#0369A1', fontWeight: '600' },
  micRetry: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  micRetryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  tapRow: { paddingHorizontal: 12, paddingTop: 8 },
  tapBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
  },
  tapBtnText: { fontWeight: '800', fontSize: 16, color: '#0F172A' },
  playArea: { flex: 1, padding: 12, justifyContent: 'center' },
  meterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  meterTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 8 },
  meterLabel: { fontSize: 12, fontWeight: '700', color: '#334155', minWidth: 56 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 24,
    alignItems: 'center',
  },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
});
