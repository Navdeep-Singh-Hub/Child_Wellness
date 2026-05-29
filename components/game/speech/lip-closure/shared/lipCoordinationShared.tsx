/**
 * Speech Level 5 Session 9 — Lip Coordination System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  LipCoordinationEngine,
  poseEmoji,
  poseLabel,
} from '@/components/game/speech/lip-closure/modules/LipCoordinationEngine';
import { LipCoordinationSessionManager } from '@/components/game/speech/lip-closure/modules/LipCoordinationSessionManager';
import type {
  CoordinationPose,
  LipCoordinationGameId,
} from '@/components/game/speech/lip-closure/modules/lipCoordinationTypes';
import { useLipCoordination, type LipCoordinationSense } from '@/hooks/useLipCoordination';
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

export const DEFAULT_COORDINATION_ROUNDS = 3;

export { poseEmoji, poseLabel };

export function clearCoordinationSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakCoordination(text: string, rate = DEFAULT_TTS_RATE) {
  clearCoordinationSpeech();
  speakTTS(text, rate);
}

export function hapticCoordinationSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useCoordinationSense(
  enabled: boolean,
  engine?: LipCoordinationEngine,
): LipCoordinationSense {
  return useLipCoordination(enabled, engine);
}

export function useCoordinationSuccessWatcher(
  coord: LipCoordinationSense,
  engine: LipCoordinationEngine,
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
      const won = coord.state === 'SUCCESS' || coord.state === 'REWARDING';
      if (won && !firedRef.current) {
        firedRef.current = true;
        if (engine.consumeSuccess()) {
          hapticCoordinationSuccess();
          onSuccessRef.current();
        } else {
          firedRef.current = false;
        }
      }
    }, 40);
    return () => clearInterval(id);
  }, [active, coord.state, engine]);
}

/** Watch phase for memory / copy games. */
export function usePoseDemoPhase(sequence: CoordinationPose[], active: boolean, onDone: () => void) {
  const [demoIndex, setDemoIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active) {
      setDemoIndex(-1);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setDemoIndex(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= sequence.length) {
        clearInterval(id);
        setDemoIndex(-1);
        setPlaying(false);
        onDone();
      } else {
        setDemoIndex(i);
      }
    }, 900);
    return () => clearInterval(id);
  }, [active, sequence.join('|')]);

  const demoPose = demoIndex >= 0 ? sequence[demoIndex] : null;
  return { playing, demoPose, demoIndex };
}

export function useCoordinationGameSession(
  gameId: LipCoordinationGameId,
  rounds = DEFAULT_COORDINATION_ROUNDS,
) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipCoordinationSessionManager(gameId, rounds));

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
          durationMs: rounds * 60000,
          skillTags: ['lip-coordination', 'mouth-timing', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[lip coordination game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 72 + round * 9));
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

export function CoordinationGameOverlays({
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
            message="Smooth lip patterns — wonderful coordination!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearCoordinationSpeech();
              onBack();
            }}
            onContinue={() => {
              clearCoordinationSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

function CoordinationCameraLayer({ coord, active }: { coord: LipCoordinationSense; active: boolean }) {
  if (Platform.OS === 'web' || !VisionCamera || !shouldMountLipCamera(active, coord.useCamera, coord.hasCamera, coord.device, coord.frameProcessor)) return null;
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={coord.device as never}
        isActive={active}
        frameProcessor={coord.frameProcessor as never}
        {...({ frameProcessorFps: 15 } as Record<string, unknown>)}
      />
    </View>
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
  coord: LipCoordinationSense;
  expectedPose?: CoordinationPose | null;
  showBeat?: boolean;
  children: React.ReactNode;
};

export function CoordinationGameShell({
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
  coord,
  expectedPose,
  showBeat = false,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearCoordinationSpeech();
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
            <Text style={styles.startTitle}>Move lips together in patterns</Text>
            <Text style={styles.startHint}>
              Follow timing cues and switch mouth shapes smoothly. Camera helps, or use the shape buttons.
              Small mistakes are okay — keep trying!
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CoordinationStatusBar coord={coord} accent={accent} />
            {!coord.useCamera && (
              <View style={styles.tapRow}>
                <Pressable
                  style={[styles.tapBtn, coord.effectivePose === 'CLOSED' && styles.tapBtnOn]}
                  onPress={coord.tapClosed}
                >
                  <Text style={styles.tapBtnText}>😐</Text>
                </Pressable>
                <Pressable
                  style={[styles.tapBtn, coord.effectivePose === 'ROUNDED' && styles.tapBtnOn]}
                  onPress={coord.tapRounded}
                >
                  <Text style={styles.tapBtnText}>😮</Text>
                </Pressable>
                <Pressable
                  style={[styles.tapBtn, coord.effectivePose === 'SPREAD' && styles.tapBtnOn]}
                  onPress={coord.tapSpread}
                >
                  <Text style={styles.tapBtnText}>😁</Text>
                </Pressable>
                <Pressable
                  style={[styles.tapBtn, coord.effectivePose === 'NEUTRAL' && styles.tapBtnOn]}
                  onPress={coord.tapNeutral}
                >
                  <Text style={styles.tapBtnText}>🙂</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>
              <CoordinationCameraLayer coord={coord} active={canPlay} />
              <View
                style={[
                  styles.glowRing,
                  {
                    shadowColor: coord.glowColor,
                    borderColor: coord.glowColor,
                    borderWidth: showBeat && coord.beatActive ? 4 : 3,
                  },
                ]}
              >
                {showBeat && (
                  <View
                    style={[
                      styles.beatRing,
                      {
                        opacity: 0.35 + coord.pulsePhase * 0.25,
                        borderColor: accent,
                      },
                    ]}
                    pointerEvents="none"
                  />
                )}
                {expectedPose != null && (
                  <View style={styles.expectedPill}>
                    <Text style={styles.expectedText}>Next: {poseEmoji(expectedPose)}</Text>
                  </View>
                )}
                {children}
              </View>
            </View>
            <CoordinationProgressBar progress={coord.sequenceProgress} accent={accent} />
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

function CoordinationStatusBar({ coord, accent }: { coord: LipCoordinationSense; accent: string }) {
  if (coord.unstable && coord.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — soft light helps</Text>
      </View>
    );
  }
  if (coord.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{coord.error}</Text>
      </View>
    );
  }
  if (!coord.faceTrackingAvailable) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Use mouth shape buttons below — or allow camera</Text>
      </View>
    );
  }
  if (coord.useCamera && !coord.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: coord.glowColor }]} />
      <Text style={styles.statusOkText}>{coord.helpfulHint}</Text>
    </View>
  );
}

export function CoordinationProgressBar({ progress, accent }: { progress: number; accent: string }) {
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
  tapRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  tapBtn: {
    flex: 1,
    maxWidth: 72,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapBtnOn: { borderColor: '#22C55E', backgroundColor: '#ECFDF5' },
  tapBtnText: { fontSize: 22 },
  playArea: { flex: 1, padding: 12 },
  glowRing: {
    flex: 1,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  beatRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 3,
    margin: 6,
  },
  expectedPill: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
  },
  expectedText: { fontWeight: '800', color: '#0F172A', fontSize: 15 },
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
  mouthPill: { width: 14, height: 14, borderRadius: 7 },
  barWrap: { paddingHorizontal: 24, paddingBottom: 8 },
  bar: { height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.85)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },
});
