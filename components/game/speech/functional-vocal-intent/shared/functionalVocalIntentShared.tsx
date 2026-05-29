import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  FunctionalVocalIntentSessionManager,
  functionalVocalIntentRoundDifficulty,
} from '@/components/game/speech/functional-vocal-intent/modules/FunctionalVocalIntentSessionManager';
import type { FunctionalVocalIntentGameId } from '@/components/game/speech/functional-vocal-intent/modules/functionalVocalIntentTypes';
import { useFunctionalVocalIntent, type FunctionalVocalIntentSense } from '@/hooks/useFunctionalVocalIntent';
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

export const DEFAULT_VOCAL_INTENT_ROUNDS = 3;
export const VOCAL_INTENT_INTERACTIONS_PER_ROUND = 3;

export function clearFunctionalVocalIntentSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakFunctionalVocalIntent(text: string, rate = DEFAULT_TTS_RATE) {
  clearFunctionalVocalIntentSpeech();
  speakTTS(text, rate);
}

export function hapticVocalIntentSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useFunctionalVocalIntentSession(
  gameId: FunctionalVocalIntentGameId,
  rounds = DEFAULT_VOCAL_INTENT_ROUNDS,
) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new FunctionalVocalIntentSessionManager(gameId, rounds));

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
        durationMs: rounds * 52000,
        skillTags: [
          'functional-vocal-intent',
          'speech-motor-readiness',
          'vocal-intent',
          'communication-readiness',
        ],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[functional vocal intent] log failed', e);
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

export function FunctionalVocalIntentOverlays({
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
            message="Your sounds communicate — great job!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 14}
            onHome={() => {
              clearFunctionalVocalIntentSpeech();
              onBack();
            }}
            onContinue={() => {
              clearFunctionalVocalIntentSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type FrameProps = {
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
  progressLabel?: string;
  children: (sense: FunctionalVocalIntentSense) => React.ReactNode;
};

export function FunctionalVocalIntentFrame({
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
  progressLabel = 'turns',
  children,
}: FrameProps) {
  const diff = functionalVocalIntentRoundDifficulty(round);
  const sense = useFunctionalVocalIntent(canPlay, diff);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              sense.stopMic();
              clearFunctionalVocalIntentSpeech();
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
            <Text style={styles.startEmoji}>💬</Text>
            <Text style={styles.startTitle}>Your sound can talk</Text>
            <Text style={styles.startHint}>
              Tap Start and allow the microphone. Any sound counts — hum, whisper, or squeak.
              Good try works too. No words needed.
            </Text>
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
            <VocalIntentMicBanner sense={sense} />
            <View style={styles.helperRow}>
              <Pressable
                style={[styles.goodTryBtn, { backgroundColor: accent }]}
                onPress={() => {
                  sense.tapResponse();
                  hapticVocalIntentSuccess();
                }}
              >
                <Text style={styles.goodTryText}>😊 Good try</Text>
              </Pressable>
            </View>
            <View style={styles.playArea}>{children(sense)}</View>
            <View style={styles.meterWrap}>
              <Ionicons name="mic" size={18} color={accent} />
              <View style={styles.meterTrack}>
                <View
                  style={[
                    styles.meterFill,
                    {
                      width: `${Math.round(Math.max(sense.smoothedLevel, sense.micLevel) * 100)}%`,
                      backgroundColor: accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.meterLabel}>
                {sense.micStatus !== 'active'
                  ? sense.micStatus === 'denied'
                    ? 'Mic blocked'
                    : 'Mic off'
                  : sense.responseDetected
                    ? 'Sound!'
                    : sense.calibrated
                      ? 'Make a sound'
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {VOCAL_INTENT_INTERACTIONS_PER_ROUND}{' '}
            {progressLabel}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function VocalIntentMicBanner({ sense }: { sense: FunctionalVocalIntentSense }) {
  if (sense.micStatus === 'active') return null;
  const message =
    sense.micStatus === 'requesting'
      ? 'Starting microphone…'
      : sense.micStatus === 'denied'
        ? 'Microphone off — use Good try or allow mic in Settings.'
        : sense.micStatus === 'error'
          ? sense.micError ?? 'Microphone unavailable'
          : 'Allow microphone for communication play';

  return (
    <View style={styles.micBanner}>
      {sense.micStatus === 'requesting' ? (
        <ActivityIndicator color="#0D9488" />
      ) : (
        <Ionicons name="mic-off" size={20} color="#0F766E" />
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

export function useVocalIntentPulseCounter(
  active: boolean,
  sense: FunctionalVocalIntentSense,
  onResponse: (intensity: number, durationMs: number) => void,
) {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!active) {
      handledRef.current = false;
      return;
    }
    if (!sense.responsePulse) return;
    if (handledRef.current) return;
    if (!sense.consumePulse()) return;
    handledRef.current = true;
    hapticVocalIntentSuccess();
    onResponse(sense.intensity, sense.duration);
    const t = setTimeout(() => {
      handledRef.current = false;
    }, 450);
    return () => clearTimeout(t);
  }, [active, sense.responsePulse, sense.intensity, sense.duration, onResponse, sense]);
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
  micBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#CCFBF1',
  },
  micBannerText: { flex: 1, fontSize: 13, color: '#0F766E', fontWeight: '600' },
  micRetry: { backgroundColor: '#14B8A6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  micRetryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  helperRow: { paddingHorizontal: 12, paddingTop: 8 },
  goodTryBtn: { paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  goodTryText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  playArea: { flex: 1, padding: 12, justifyContent: 'center' },
  meterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'web' ? 8 : 12,
  },
  meterTrack: { flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8, overflow: 'hidden' },
  meterFill: { height: '100%' },
  meterLabel: { fontSize: 12, fontWeight: '800', color: '#334155', minWidth: 88, textAlign: 'right' },
  footer: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 16 : 24, alignItems: 'center' },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  progressText: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
});
