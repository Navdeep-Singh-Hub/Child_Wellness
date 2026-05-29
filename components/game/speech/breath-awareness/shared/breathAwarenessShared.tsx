import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  BreathSessionManager,
  breathRoundDifficulty,
} from '@/components/game/speech/breath-awareness/modules/BreathSessionManager';
import type { BreathGameId } from '@/components/game/speech/breath-awareness/modules/breathAwarenessTypes';
import { useBreathAwareness, type BreathAwarenessSense } from '@/hooks/useBreathAwareness';
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

export const DEFAULT_BREATH_ROUNDS = 3;
export const BREATH_INTERACTIONS_PER_ROUND = 3;

export function clearBreathSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakBreath(text: string, rate = DEFAULT_TTS_RATE) {
  clearBreathSpeech();
  speakTTS(text, rate);
}

export function hapticBreathSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useBreathGameSession(gameId: BreathGameId, rounds = DEFAULT_BREATH_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new BreathSessionManager(gameId, rounds));

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
        durationMs: rounds * 45000,
        skillTags: ['breath-awareness', 'airflow-cause-effect', 'oral-awareness', 'pre-oral'],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[breath game] log failed', e);
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

export function BreathGameOverlays({
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
            message="Your breath made things move!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 12}
            onHome={() => {
              clearBreathSpeech();
              onBack();
            }}
            onContinue={() => {
              clearBreathSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type BreathFrameProps = {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  round: number;
  rounds: number;
  hits: number;
  hitsNeeded?: number;
  canPlay: boolean;
  onStart: () => void;
  difficulty?: ReturnType<typeof breathRoundDifficulty>;
  children: (breath: BreathAwarenessSense) => React.ReactNode;
};

export function BreathGameFrame({
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  round,
  rounds,
  hits,
  hitsNeeded = BREATH_INTERACTIONS_PER_ROUND,
  canPlay,
  onStart,
  difficulty,
  children,
}: BreathFrameProps) {
  const diff = difficulty ?? breathRoundDifficulty(round);
  const breath = useBreathAwareness(canPlay, diff);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              breath.stopMic();
              clearBreathSpeech();
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
            <Text style={styles.startTitle}>Air can move things</Text>
            <Text style={styles.startHint}>
              Tap Start and allow the microphone, then blow softly toward the screen. You can also
              use Gentle breath (tap) anytime.
            </Text>
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
            <BreathMicBanner breath={breath} />
            {breath.micStatus !== 'active' && (
              <View style={styles.tapRow}>
                <Pressable style={[styles.tapBtn, { borderColor: accent }]} onPress={breath.tapBreath}>
                  <Text style={styles.tapBtnText}>💨 Gentle breath (tap)</Text>
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
                      width: `${Math.round(
                        Math.max(breath.smoothedLevel, breath.micLevel) * 100,
                      )}%`,
                      backgroundColor: accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.meterLabel}>
                {breath.micStatus !== 'active'
                  ? breath.micStatus === 'denied'
                    ? 'Mic blocked'
                    : 'Mic off'
                  : breath.breathDetected
                    ? 'Air!'
                    : breath.calibrated
                      ? 'Soft breath'
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {hitsNeeded} breaths
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function BreathMicBanner({ breath }: { breath: BreathAwarenessSense }) {
  if (breath.micStatus === 'active') return null;

  const message =
    breath.micStatus === 'requesting'
      ? 'Starting microphone…'
      : breath.micStatus === 'denied'
        ? 'Microphone off — use Gentle breath or allow mic in Settings.'
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

/** Watch breath pulses and count toward round goal */
export function useBreathInteractionCounter(
  breath: BreathAwarenessSense,
  active: boolean,
  onInteraction: (intensity: number) => void,
) {
  const handledPulseRef = useRef(false);

  useEffect(() => {
    if (!active) {
      handledPulseRef.current = false;
      return;
    }
    if (!breath.breathPulse) return;
    if (handledPulseRef.current) return;
    if (!breath.consumePulse()) return;
    handledPulseRef.current = true;
    hapticBreathSuccess();
    onInteraction(breath.intensity);
    const t = setTimeout(() => {
      handledPulseRef.current = false;
    }, 400);
    return () => clearTimeout(t);
  }, [active, breath.breathPulse, breath.intensity, onInteraction]);
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
  meterLabel: { fontSize: 12, fontWeight: '700', color: '#334155', minWidth: 72 },
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
