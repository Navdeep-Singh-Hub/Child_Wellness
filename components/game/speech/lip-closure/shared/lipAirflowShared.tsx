/**
 * Speech Level 5 Session 8 — Lip Airflow Control System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import type { LipAirflowCoordinator } from '@/components/game/speech/lip-closure/modules/LipAirflowCoordinator';
import { LipAirflowSessionManager } from '@/components/game/speech/lip-closure/modules/LipAirflowSessionManager';
import type { LipAirflowGameId } from '@/components/game/speech/lip-closure/modules/lipAirflowTypes';
import { useLipAirflow, type LipAirflowSense } from '@/hooks/useLipAirflow';
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
import { SafeAreaView } from 'react-native-safe-area-context';

let VisionCamera: typeof import('react-native-vision-camera').Camera | null = null;
if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    /* optional */
  }
}

export const DEFAULT_AIRFLOW_ROUNDS = 3;

export function clearAirflowSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakAirflow(text: string, rate = DEFAULT_TTS_RATE) {
  clearAirflowSpeech();
  speakTTS(text, rate);
}

export function hapticAirflowSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useAirflowSense(enabled: boolean, coordinator?: LipAirflowCoordinator): LipAirflowSense {
  return useLipAirflow(enabled, coordinator);
}

function AirflowCameraLayer({ flow, active }: { flow: LipAirflowSense; active: boolean }) {
  if (Platform.OS === 'web' || !VisionCamera || !shouldMountLipCamera(active, flow.useCamera, flow.hasCamera, flow.device, flow.frameProcessor)) return null;
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={flow.device as never}
        isActive={active}
        frameProcessor={flow.frameProcessor as never}
        {...({ frameProcessorFps: 15 } as Record<string, unknown>)}
      />
    </View>
  );
}

export function useAirflowRoundSuccess(
  flow: LipAirflowSense,
  coordinator: LipAirflowCoordinator,
  active: boolean,
  onSuccess: () => void,
  successResetKey = 0,
) {
  const firedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    firedRef.current = false;
  }, [active, successResetKey]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const won = flow.state === 'SUCCESS' || flow.state === 'REWARDING';
      if (won && !firedRef.current) {
        firedRef.current = true;
        const ms = coordinator.consumeSuccess();
        if (ms != null) {
          hapticAirflowSuccess();
          onSuccessRef.current();
        } else {
          firedRef.current = false;
        }
      }
    }, 40);
    return () => clearInterval(id);
  }, [active, flow.state, coordinator]);
}

export function useAirflowGameSession(gameId: LipAirflowGameId, rounds = DEFAULT_AIRFLOW_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipAirflowSessionManager(gameId, rounds));

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
          durationMs: rounds * 55000,
          skillTags: ['lip-airflow', 'breath-control', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[lip airflow game] log failed', e);
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

export function AirflowGameOverlays({
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
            message="Gentle airflow — wonderful breath control!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearAirflowSpeech();
              onBack();
            }}
            onContinue={() => {
              clearAirflowSpeech();
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
  flow: LipAirflowSense;
  targetMs: number;
  children: React.ReactNode;
};

export function AirflowGameShell({
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
  flow,
  targetMs,
  children,
}: ShellProps) {
  const progress = Math.min(1, flow.accumulatedMs / Math.max(1, targetMs));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearAirflowSpeech();
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
            <Text style={styles.startTitle}>Control air through your mouth</Text>
            <Text style={styles.startHint}>
              Round your lips and blow gently. Soft steady airflow works best — no loud shouting needed.
              Camera and microphone help, or use the buttons below.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <AirflowStatusBar flow={flow} accent={accent} />
            {(!flow.useCamera || !flow.useMic) && (
              <View style={styles.tapRow}>
                {!flow.useCamera && (
                  <>
                    <Pressable
                      style={[styles.tapBtn, flow.lipPose === 'ROUNDED' && styles.tapBtnOn]}
                      onPress={flow.tapRounded}
                    >
                      <Text style={styles.tapBtnText}>😮 Round</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.tapBtn, flow.lipPose === 'SPREAD' && styles.tapBtnOn]}
                      onPress={flow.tapSpread}
                    >
                      <Text style={styles.tapBtnText}>😁 Spread</Text>
                    </Pressable>
                  </>
                )}
                {!flow.useMic && (
                  <Pressable
                    style={[styles.tapBtn, flow.manualBlowing && styles.tapBtnOn]}
                    onPressIn={flow.tapBlow}
                    onPressOut={flow.tapStopBlow}
                  >
                    <Text style={styles.tapBtnText}>💨 Blow</Text>
                  </Pressable>
                )}
              </View>
            )}
            <View style={styles.playArea}>
              <AirflowCameraLayer flow={flow} active={canPlay} />
              <View
                style={[
                  styles.glowRing,
                  {
                    shadowColor: flow.glowColor,
                    borderColor: flow.glowColor,
                    backgroundColor: flow.particles ? 'rgba(186,230,253,0.2)' : 'rgba(255,255,255,0.35)',
                  },
                ]}
              >
                {flow.particles && (
                  <View style={styles.particles} pointerEvents="none">
                    <Text style={styles.particleText}>✨ · · 💨 · · ✨</Text>
                  </View>
                )}
                {children}
              </View>
            </View>
            <AirflowProgressBar progress={progress} accent={accent} />
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

function AirflowStatusBar({ flow, accent }: { flow: LipAirflowSense; accent: string }) {
  if (flow.unstable && flow.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — soft light helps</Text>
      </View>
    );
  }
  if (flow.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{flow.error}</Text>
      </View>
    );
  }
  if (!flow.faceTrackingAvailable && flow.micStatus === 'denied') {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Use Round + Blow buttons — or allow camera/mic</Text>
      </View>
    );
  }
  if (flow.useCamera && !flow.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: flow.glowColor }]} />
      <Text style={styles.statusOkText}>{flow.helpfulHint}</Text>
      {flow.useMic && (
        <View style={styles.micBar}>
          <View style={[styles.micFill, { width: `${Math.min(100, flow.airflowStrength * 100)}%` }]} />
        </View>
      )}
    </View>
  );
}

export function AirflowProgressBar({ progress, accent }: { progress: number; accent: string }) {
  return (
    <View style={styles.barWrap}>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: accent }]} />
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
  tapRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 8 },
  tapBtn: {
    flex: 1,
    minWidth: 96,
    maxWidth: 130,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapBtnOn: { borderColor: '#22C55E', backgroundColor: '#ECFDF5' },
  tapBtnText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  playArea: { flex: 1, padding: 12 },
  glowRing: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  particles: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center', zIndex: 2 },
  particleText: { fontSize: 18, opacity: 0.85 },
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
    flexWrap: 'wrap',
  },
  statusOk: { backgroundColor: 'rgba(255,255,255,0.95)' },
  statusOkText: { fontWeight: '800', color: '#0F172A', fontSize: 15 },
  statusHint: { fontWeight: '700', color: '#475569', fontSize: 14, textAlign: 'center' },
  statusWarn: { fontWeight: '700', color: '#B45309', fontSize: 14, textAlign: 'center' },
  mouthPill: { width: 14, height: 14, borderRadius: 7 },
  micBar: { width: 48, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  micFill: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 4 },
  barWrap: { paddingHorizontal: 24, paddingBottom: 8 },
  bar: { height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.85)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },
});
