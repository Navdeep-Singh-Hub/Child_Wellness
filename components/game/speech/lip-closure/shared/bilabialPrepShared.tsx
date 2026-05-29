/**
 * Speech Level 5 Session 7 — Bilabial Preparation System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { BilabialPrepSessionManager } from '@/components/game/speech/lip-closure/modules/BilabialPrepSessionManager';
import type { BilabialEngine } from '@/components/game/speech/lip-closure/modules/BilabialEngine';
import type { BilabialPrepGameId } from '@/components/game/speech/lip-closure/modules/lipBilabialTypes';
import { useBilabialPrep, type BilabialPrepSense } from '@/hooks/useBilabialPrep';
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

export const DEFAULT_BILABIAL_ROUNDS = 3;

export function clearBilabialSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakBilabial(text: string, rate = DEFAULT_TTS_RATE) {
  clearBilabialSpeech();
  speakTTS(text, rate);
}

export function hapticBilabialSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useBilabialSense(enabled: boolean, engine?: BilabialEngine): BilabialPrepSense {
  return useBilabialPrep(enabled, engine);
}

function BilabialCameraLayer({ prep, active }: { prep: BilabialPrepSense; active: boolean }) {
  if (Platform.OS === 'web' || !VisionCamera || !shouldMountLipCamera(active, prep.useCamera, prep.hasCamera, prep.device, prep.frameProcessor)) return null;
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={prep.device as never}
        isActive={active}
        frameProcessor={prep.frameProcessor as never}
        {...({ frameProcessorFps: 15 } as Record<string, unknown>)}
      />
    </View>
  );
}

export function useBilabialSuccessWatcher(
  prep: BilabialPrepSense,
  engine: BilabialEngine,
  active: boolean,
  onSuccess: (timingMs: number) => void,
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
      const won = prep.state === 'SUCCESS' || prep.state === 'REWARDING';
      if (won && !firedRef.current) {
        firedRef.current = true;
        const ev = engine.consumeSuccess();
        if (ev) {
          hapticBilabialSuccess();
          onSuccessRef.current(ev.timingMs);
        } else {
          firedRef.current = false;
        }
      }
    }, 40);
    return () => clearInterval(id);
  }, [active, prep.state, engine]);
}

export function useBilabialGameSession(gameId: BilabialPrepGameId, rounds = DEFAULT_BILABIAL_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new BilabialPrepSessionManager(gameId, rounds));

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
          durationMs: rounds * 50000,
          skillTags: ['bilabial-prep', 'lip-closure', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[bilabial prep game] log failed', e);
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

export function BilabialGameOverlays({
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
            message="Close lips and release — amazing work!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearBilabialSpeech();
              onBack();
            }}
            onContinue={() => {
              clearBilabialSpeech();
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
  prep: BilabialPrepSense;
  children: React.ReactNode;
};

export function BilabialGameShell({
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
  prep,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearBilabialSpeech();
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
            <Text style={styles.startTitle}>Close lips and make a sound</Text>
            <Text style={styles.startHint}>
              Prepare for M, B, and P sounds. Close your lips, then release a soft burst — no perfect words needed.
              Camera and microphone help, or use the buttons below.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <BilabialStatusBar prep={prep} accent={accent} />
            {(!prep.useCamera || prep.micStatus !== 'active') && (
              <View style={styles.tapRow}>
                {!prep.useCamera && (
                  <>
                    <Pressable
                      style={[styles.tapBtn, prep.lipsClosed && styles.tapBtnOn]}
                      onPress={prep.tapClose}
                    >
                      <Text style={styles.tapBtnText}>👄 Close</Text>
                    </Pressable>
                    <Pressable style={[styles.tapBtn, !prep.lipsClosed && styles.tapBtnOn]} onPress={prep.tapOpen}>
                      <Text style={styles.tapBtnText}>Open</Text>
                    </Pressable>
                  </>
                )}
                {prep.micStatus !== 'active' && (
                  <Pressable style={[styles.tapBtn, styles.tapBtnWide]} onPress={prep.tapBurst}>
                    <Text style={styles.tapBtnText}>🔊 Sound</Text>
                  </Pressable>
                )}
              </View>
            )}
            <View style={styles.playArea}>
              <BilabialCameraLayer prep={prep} active={canPlay} />
              <View
                style={[
                  styles.glowRing,
                  {
                    shadowColor: prep.glowColor,
                    borderColor: prep.glowColor,
                    backgroundColor: prep.spark ? 'rgba(253,224,71,0.15)' : 'rgba(255,255,255,0.35)',
                  },
                ]}
              >
                {children}
              </View>
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

function BilabialStatusBar({ prep, accent }: { prep: BilabialPrepSense; accent: string }) {
  if (prep.unstable && prep.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — soft light helps</Text>
      </View>
    );
  }
  if (prep.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{prep.error}</Text>
      </View>
    );
  }
  if (!prep.faceTrackingAvailable && prep.micStatus === 'denied') {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Use Close + Sound buttons — allow camera or mic if you can</Text>
      </View>
    );
  }
  if (prep.useCamera && !prep.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }

  let label = 'Close lips and make a sound';
  if (prep.state === 'WAITING_FOR_CLOSURE' || (!prep.lipsClosed && prep.state !== 'SUCCESS')) {
    label = 'Close your lips first';
  } else if (prep.state === 'WAITING_FOR_SOUND' || prep.lipsClosed) {
    label = prep.spark ? 'Nice burst!' : 'Now release a soft sound';
  } else if (prep.state === 'SUCCESS' || prep.state === 'REWARDING') {
    label = 'Great job!';
  }

  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: prep.glowColor }]} />
      <Text style={styles.statusOkText}>{label}</Text>
      {prep.useMic && (
        <View style={styles.micBar}>
          <View style={[styles.micFill, { width: `${Math.min(100, prep.audioLevel * 100)}%` }]} />
        </View>
      )}
    </View>
  );
}

export function BilabialProgressBar({ progress, accent }: { progress: number; accent: string }) {
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
    minWidth: 100,
    maxWidth: 140,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapBtnWide: { maxWidth: 180 },
  tapBtnOn: { borderColor: '#22C55E', backgroundColor: '#ECFDF5' },
  tapBtnText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
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
  micBar: {
    width: 48,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  micFill: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 4 },
  barWrap: { width: '88%', marginTop: 12 },
  bar: {
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 9 },
});
