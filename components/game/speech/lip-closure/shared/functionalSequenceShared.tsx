/**
 * Speech Level 5 Session 10 — Functional Lip Sequencing System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  FunctionalSequenceEngine,
  poseEmoji,
  stepEmoji,
} from '@/components/game/speech/lip-closure/modules/FunctionalSequenceEngine';
import { FunctionalSequenceSessionManager } from '@/components/game/speech/lip-closure/modules/FunctionalSequenceSessionManager';
import type { FunctionalSequenceGameId } from '@/components/game/speech/lip-closure/modules/functionalSequenceTypes';
import { useFunctionalSequence, type FunctionalSequenceSense } from '@/hooks/useFunctionalSequence';
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

export const DEFAULT_FUNCTIONAL_ROUNDS = 3;

export { poseEmoji, stepEmoji };

export function clearFunctionalSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakFunctional(text: string, rate = DEFAULT_TTS_RATE) {
  clearFunctionalSpeech();
  speakTTS(text, rate);
}

export function hapticFunctionalSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useFunctionalSense(
  enabled: boolean,
  engine?: FunctionalSequenceEngine,
): FunctionalSequenceSense {
  return useFunctionalSequence(enabled, engine);
}

export function useFunctionalSuccessWatcher(
  seq: FunctionalSequenceSense,
  engine: FunctionalSequenceEngine,
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
      const won = seq.state === 'SUCCESS' || seq.state === 'REWARDING';
      if (won && !firedRef.current) {
        firedRef.current = true;
        if (engine.consumeSuccess()) {
          hapticFunctionalSuccess();
          onSuccessRef.current();
        } else {
          firedRef.current = false;
        }
      }
    }, 40);
    return () => clearInterval(id);
  }, [active, seq.state, engine]);
}

export function useFunctionalGameSession(
  gameId: FunctionalSequenceGameId,
  rounds = DEFAULT_FUNCTIONAL_ROUNDS,
) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new FunctionalSequenceSessionManager(gameId, rounds));

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
          durationMs: rounds * 65000,
          skillTags: ['functional-lip-sequence', 'speech-prep', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[functional sequence game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 74 + round * 9));
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

export function FunctionalGameOverlays({
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
            message="Smooth lip patterns — ready for speech!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearFunctionalSpeech();
              onBack();
            }}
            onContinue={() => {
              clearFunctionalSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

function FunctionalCameraLayer({ seq, active }: { seq: FunctionalSequenceSense; active: boolean }) {
  if (Platform.OS === 'web' || !VisionCamera || !shouldMountLipCamera(active, seq.useCamera, seq.hasCamera, seq.device, seq.frameProcessor)) return null;
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={seq.device as never}
        isActive={active}
        frameProcessor={seq.frameProcessor as never}
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
  seq: FunctionalSequenceSense;
  children: React.ReactNode;
};

export function FunctionalGameShell({
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
  seq,
  children,
}: ShellProps) {
  const step = seq.currentStep;
  const needsBurst = step?.state === 'BURST';
  const needsAirflow = step?.state === 'AIRFLOW';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearFunctionalSpeech();
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
            <Text style={styles.startEmoji}>🛤️</Text>
            <Text style={styles.startTitle}>Move lips smoothly through patterns</Text>
            <Text style={styles.startHint}>
              Follow the mouth path — shapes, gentle bursts, and soft airflow. No words needed.
              Camera and microphone help, or use the buttons below.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FunctionalStatusBar seq={seq} accent={accent} />
            {(!seq.useCamera || !seq.useMic) && (
              <View style={styles.tapRow}>
                {!seq.useCamera && (
                  <>
                    <Pressable
                      style={[styles.tapBtn, seq.effectivePose === 'CLOSED' && styles.tapBtnOn]}
                      onPress={seq.tapClosed}
                    >
                      <Text style={styles.tapBtnText}>😐</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.tapBtn, seq.effectivePose === 'ROUNDED' && styles.tapBtnOn]}
                      onPress={seq.tapRounded}
                    >
                      <Text style={styles.tapBtnText}>😮</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.tapBtn, seq.effectivePose === 'SPREAD' && styles.tapBtnOn]}
                      onPress={seq.tapSpread}
                    >
                      <Text style={styles.tapBtnText}>😁</Text>
                    </Pressable>
                  </>
                )}
                {!seq.useMic && needsBurst && (
                  <Pressable style={[styles.tapBtn, styles.tapWide]} onPress={seq.tapBurst}>
                    <Text style={styles.tapBtnText}>💥 Burst</Text>
                  </Pressable>
                )}
                {!seq.useMic && needsAirflow && (
                  <Pressable
                    style={[styles.tapBtn, styles.tapWide, seq.manualBlowing && styles.tapBtnOn]}
                    onPressIn={seq.tapBlow}
                    onPressOut={seq.tapStopBlow}
                  >
                    <Text style={styles.tapBtnText}>💨 Blow</Text>
                  </Pressable>
                )}
              </View>
            )}
            <View style={styles.playArea}>
              <FunctionalCameraLayer seq={seq} active={canPlay} />
              <View
                style={[
                  styles.glowRing,
                  { shadowColor: seq.glowColor, borderColor: seq.glowColor },
                ]}
              >
                <View style={styles.stepPill}>
                  <Text style={styles.stepText}>
                    Next: {stepEmoji(step)} {seq.helpfulHint}
                  </Text>
                </View>
                {children}
              </View>
            </View>
            <FunctionalPathBar progress={seq.sequenceProgress} accent={accent} />
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

function FunctionalStatusBar({ seq, accent }: { seq: FunctionalSequenceSense; accent: string }) {
  if (seq.unstable && seq.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — follow the mouth path</Text>
      </View>
    );
  }
  if (seq.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{seq.error}</Text>
      </View>
    );
  }
  if (!seq.faceTrackingAvailable && seq.micStatus === 'denied') {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Use shape + burst/blow buttons — or allow camera/mic</Text>
      </View>
    );
  }
  if (seq.useCamera && !seq.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: seq.glowColor }]} />
      <Text style={styles.statusOkText}>{seq.helpfulHint}</Text>
    </View>
  );
}

export function FunctionalPathBar({ progress, accent }: { progress: number; accent: string }) {
  return (
    <View style={styles.barWrap}>
      <View style={styles.pathTrack}>
        <View style={[styles.pathFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: accent }]} />
        <Text style={styles.pathWalker}>{progress > 0.05 ? '🚶' : '🏁'}</Text>
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
  tapRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  tapBtn: {
    minWidth: 56,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapWide: { minWidth: 88 },
  tapBtnOn: { borderColor: '#22C55E', backgroundColor: '#ECFDF5' },
  tapBtnText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  playArea: { flex: 1, padding: 12 },
  glowRing: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  stepPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 8,
    borderRadius: 12,
    zIndex: 2,
  },
  stepText: { fontWeight: '800', color: '#0F172A', fontSize: 13, textAlign: 'center' },
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
  statusOkText: { fontWeight: '800', color: '#0F172A', fontSize: 14, flex: 1, textAlign: 'center' },
  statusHint: { fontWeight: '700', color: '#475569', fontSize: 14, textAlign: 'center' },
  statusWarn: { fontWeight: '700', color: '#B45309', fontSize: 14, textAlign: 'center' },
  mouthPill: { width: 14, height: 14, borderRadius: 7 },
  barWrap: { paddingHorizontal: 24, paddingBottom: 8 },
  pathTrack: {
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pathFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 10, opacity: 0.85 },
  pathWalker: { position: 'absolute', right: 8, fontSize: 14 },
});
