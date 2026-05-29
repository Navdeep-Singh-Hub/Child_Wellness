/**
 * Speech Level 5 — Lip Closure System (shared UI + session).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { LipClosureSessionManager } from '@/components/game/speech/lip-closure/modules/LipClosureSessionManager';
import type { LipGameId } from '@/components/game/speech/lip-closure/modules/types';
import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import { useLipDetection } from '@/hooks/useLipDetection';
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

let VisionCamera: typeof import('react-native-vision-camera').Camera | null = null;
if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    /* optional */
  }
}

export const DEFAULT_LIP_ROUNDS = 3;

export function clearLipSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakLip(text: string, rate = DEFAULT_TTS_RATE) {
  clearLipSpeech();
  speakTTS(text, rate);
}

export function hapticLipSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export type LipSense = ReturnType<typeof useLipDetection> & {
  tapClose: () => void;
  tapOpen: () => void;
  manualClosed: boolean;
  useCamera: boolean;
  faceTrackingAvailable: boolean;
};

export function useLipSense(enabled: boolean): LipSense {
  const lip = useLipDetection(enabled);
  const [manualClosed, setManualClosed] = useState(true);
  const faceTrackingAvailable = lip.hasCamera;
  const useCamera =
    enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const lipsClosed = useCamera ? lip.lipsClosed : manualClosed;
  const holdDuration = useCamera ? lip.holdDuration : manualClosed ? 9999 : 0;

  return {
    ...lip,
    lipsClosed,
    holdDuration,
    tapClose: () => setManualClosed(true),
    tapOpen: () => setManualClosed(false),
    manualClosed,
    useCamera,
    faceTrackingAvailable,
  };
}

function LipCameraLayer({ lip, active }: { lip: LipSense; active: boolean }) {
  if (
    Platform.OS === 'web' ||
    !VisionCamera ||
    !shouldMountLipCamera(active, lip.useCamera, lip.hasCamera, lip.device, lip.frameProcessor)
  ) {
    return null;
  }
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={lip.device as never}
        isActive={active}
        frameProcessor={lip.frameProcessor as never}
        frameProcessorFps={15}
      />
    </View>
  );
}

export function useLipGameSession(gameId: LipGameId, rounds = DEFAULT_LIP_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipClosureSessionManager(gameId, rounds));

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
          durationMs: rounds * 45000,
          skillTags: ['lip-closure', 'lip-seal', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[lip game] log failed', e);
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
      managerRef.current.resetRound();
    }, 1400);
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

export function LipGameOverlays({
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
            message="Nice lip seal!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearLipSpeech();
              onBack();
            }}
            onContinue={() => {
              clearLipSpeech();
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
  lip: LipSense;
  children: React.ReactNode;
};

export function LipGameShell({
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
  lip,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearLipSpeech();
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
            <Text style={styles.startEmoji}>👄</Text>
            <Text style={styles.startTitle}>Seal your lips gently</Text>
            <Text style={styles.startHint}>
              Close lips softly like holding a bubble. Camera or Close / Open buttons work.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <LipStatusBar lip={lip} accent={accent} />
            {!lip.useCamera && (
              <View style={styles.tapRow}>
                <Pressable style={[styles.tapBtn, lip.lipsClosed && styles.tapBtnOn]} onPress={lip.tapClose}>
                  <Text style={styles.tapBtnText}>😐 Close</Text>
                </Pressable>
                <Pressable style={[styles.tapBtn, !lip.lipsClosed && styles.tapBtnOn]} onPress={lip.tapOpen}>
                  <Text style={styles.tapBtnText}>😮 Open</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>
              <LipCameraLayer lip={lip} active={canPlay} />
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

function LipStatusBar({ lip, accent }: { lip: LipSense; accent: string }) {
  if (lip.unstable && lip.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — we are still listening</Text>
      </View>
    );
  }
  if (lip.error) {
    const needsSettings = /permission|settings/i.test(lip.error);
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{lip.error}</Text>
        {needsSettings ? (
          <Pressable
            style={styles.settingsBtn}
            onPress={() => {
              void Linking.openSettings();
            }}
          >
            <Text style={styles.settingsBtnText}>Open Settings</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (!lip.faceTrackingAvailable) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Use Close / Open below — or allow camera</Text>
      </View>
    );
  }
  if (!lip.useCamera && !lip.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Tap Close when lips are sealed</Text>
      </View>
    );
  }
  if (!lip.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }
  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, lip.lipsClosed ? { backgroundColor: accent } : null]} />
      <Text style={styles.statusOkText}>{lip.lipsClosed ? 'Lips sealed' : 'Lips open'}</Text>
    </View>
  );
}

/** Reusable hold progress for lip-closure games */
export function useLipHoldProgress(
  lip: LipSense,
  targetMs: number,
  active: boolean,
  onSuccess: () => void,
  resetKey = 0,
) {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    doneRef.current = false;
    setProgress(0);
  }, [targetMs, active, resetKey]);

  useEffect(() => {
    if (!active || doneRef.current) return;
    const id = setInterval(() => {
      if (lip.lipsClosed) {
        const p = Math.min(1, lip.holdDuration / targetMs);
        setProgress(p);
        if (lip.holdDuration >= targetMs) {
          doneRef.current = true;
          hapticLipSuccess();
          onSuccessRef.current();
        }
      } else {
        setProgress((prev) => Math.max(0, prev - 0.02));
      }
    }, 50);
    return () => clearInterval(id);
  }, [active, lip.lipsClosed, lip.holdDuration, targetMs]);

  return progress;
}

export function LipProgressRing({ progress, accent, label }: { progress: number; accent: string; label: string }) {
  return (
    <View style={styles.ringWrap}>
      <Text style={styles.ringEmoji}>{label}</Text>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  cameraLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.01 },
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
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  startHint: { fontSize: 15, color: '#475569', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  startBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  tapRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 8 },
  tapBtn: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapBtnOn: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  tapBtnText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  playArea: { flex: 1, padding: 12 },
  footer: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 16 : 24, alignItems: 'center' },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  statusBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusOk: { backgroundColor: 'rgba(255,255,255,0.95)' },
  statusOkText: { fontWeight: '800', color: '#0F172A', fontSize: 15 },
  statusHint: { fontWeight: '700', color: '#475569', fontSize: 14, textAlign: 'center' },
  statusWarn: { fontWeight: '700', color: '#B45309', fontSize: 14, textAlign: 'center' },
  settingsBtn: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
  },
  settingsBtnText: { fontWeight: '800', color: '#fff', fontSize: 14 },
  mouthPill: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#CBD5E1' },
  ringWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringEmoji: { fontSize: 72, marginBottom: 16 },
  bar: {
    width: '88%',
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 9 },
});
