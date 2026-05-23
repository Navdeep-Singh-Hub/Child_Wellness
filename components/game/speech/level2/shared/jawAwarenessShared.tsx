/**
 * Speech Level 2 — jaw / mouth-opening games (web + native APK).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { useJawDetection, type JawDetectionResult } from '@/hooks/useJawDetection';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

let VisionCamera: typeof import('react-native-vision-camera').Camera | null = null;
if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    /* VisionCamera not in this build */
  }
}
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_JAW_ROUNDS = 3;
export const WIDE_OPEN_RATIO = 0.38;

export function clearJawSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakJaw(text: string, rate = DEFAULT_TTS_RATE) {
  clearJawSpeech();
  speakTTS(text, rate);
}

export type JawSense = JawDetectionResult & {
  /** Manual fallback when camera unavailable */
  tapOpen: () => void;
  tapClose: () => void;
  manualOpen: boolean;
  useCamera: boolean;
  /** Native ML Kit face plugin linked in this APK */
  faceTrackingAvailable: boolean;
};

export function useJawSense(enabled: boolean): JawSense {
  const jaw = useJawDetection(enabled);
  const [manualOpen, setManualOpen] = useState(false);
  const faceTrackingAvailable =
    Platform.OS === 'web'
      ? jaw.hasCamera
      : Boolean(jaw.device && jaw.frameProcessor);
  const useCamera =
    enabled &&
    faceTrackingAvailable &&
    (jaw.isDetecting || (Platform.OS === 'web' && jaw.hasCamera));

  const isOpen = useCamera ? jaw.isOpen : manualOpen;
  const ratio = useCamera ? jaw.ratio : manualOpen ? 0.42 : 0.08;

  return {
    ...jaw,
    isOpen,
    ratio,
    tapOpen: () => setManualOpen(true),
    tapClose: () => setManualOpen(false),
    manualOpen,
    useCamera,
    faceTrackingAvailable,
  };
}

/** Small native camera preview — required for frame-processor jaw tracking */
function JawCameraLayer({ jaw, active }: { jaw: JawSense; active: boolean }) {
  if (Platform.OS === 'web' || !VisionCamera || !jaw.device || !jaw.frameProcessor) {
    return null;
  }
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={jaw.device}
        isActive={active}
        frameProcessor={jaw.frameProcessor}
        frameProcessorFps={15}
      />
    </View>
  );
}

export function useJawGameSession(gameId: string, rounds = DEFAULT_JAW_ROUNDS) {
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
          type: gameId as
            | 'hungry-crocodile'
            | 'big-mouth-lion'
            | 'jaw-elevator'
            | 'freeze-mouth'
            | 'open-close-rhythm',
          correct: rounds,
          total: rounds,
          accuracy,
          xpAwarded: stars * 15,
          durationMs: rounds * 45000,
          skillTags: ['jaw-awareness', 'mouth-opening', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[jaw game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 68 + round * 10));
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

export function JawGameOverlays({
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
            message="Great jaw work!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearJawSpeech();
              onBack();
            }}
            onContinue={() => {
              clearJawSpeech();
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
  jaw: JawSense;
  children: React.ReactNode;
};

export function JawGameShell({
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
  jaw,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearJawSpeech();
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
            <Text style={styles.startEmoji}>📷</Text>
            <Text style={styles.startTitle}>Ready to play?</Text>
            <Text style={styles.startHint}>
              {Platform.OS === 'web'
                ? 'Allow camera access. You can also use the Open / Close buttons.'
                : 'Allow camera on your tablet, or use Open / Close buttons below.'}
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <JawStatusBar jaw={jaw} accent={accent} />
            {!jaw.useCamera && (
              <View style={styles.tapRow}>
                <Pressable style={[styles.tapBtn, jaw.isOpen && styles.tapBtnOn]} onPress={jaw.tapOpen}>
                  <Text style={styles.tapBtnText}>😮 Open</Text>
                </Pressable>
                <Pressable style={[styles.tapBtn, !jaw.isOpen && styles.tapBtnOn]} onPress={jaw.tapClose}>
                  <Text style={styles.tapBtnText}>😐 Close</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>
              <JawCameraLayer jaw={jaw} active={canPlay} />
              {children}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.skills}>{skills}</Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: rounds }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { borderColor: accent },
                  i < round && { backgroundColor: accent },
                ]}
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

function JawStatusBar({ jaw, accent }: { jaw: JawSense; accent: string }) {
  if (jaw.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{jaw.error}</Text>
      </View>
    );
  }
  if (!jaw.faceTrackingAvailable) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>
          {Platform.OS === 'web'
            ? 'Allow camera access, or use Open / Close below'
            : 'Use Open / Close below — camera face tracking needs a new app build on this tablet'}
        </Text>
      </View>
    );
  }
  if (!jaw.useCamera && !jaw.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Using tap buttons — or allow camera in settings</Text>
      </View>
    );
  }
  if (!jaw.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }
  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, jaw.isOpen ? { backgroundColor: accent } : null]} />
      <Text style={styles.statusOkText}>{jaw.isOpen ? 'Mouth OPEN' : 'Mouth closed'}</Text>
    </View>
  );
}

export function hapticSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
  },
  statusOk: { backgroundColor: '#ECFDF5' },
  statusHint: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '600' },
  statusWarn: { flex: 1, fontSize: 13, color: '#B45309', fontWeight: '600' },
  statusOkText: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  mouthPill: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#94A3B8',
  },
  tapRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 6 },
  tapBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
  },
  tapBtnOn: { backgroundColor: '#FDE68A', borderWidth: 2, borderColor: '#F59E0B' },
  tapBtnText: { fontWeight: '800', fontSize: 15, color: '#0F172A' },
  playArea: { flex: 1, padding: 12, overflow: 'hidden' },
  cameraLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    borderRadius: 12,
    overflow: 'hidden',
  },
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
