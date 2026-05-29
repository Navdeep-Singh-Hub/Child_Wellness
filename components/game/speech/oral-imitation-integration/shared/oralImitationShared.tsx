import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { OralImitationSessionManager } from '@/components/game/speech/oral-imitation-integration/modules/OralImitationSessionManager';
import type { OralImitationGameId } from '@/components/game/speech/oral-imitation-integration/modules/oralImitationTypes';
import type { MouthPoseTarget } from '@/components/game/speech/mouth-pose/modules/mouthPoseTypes';
import {
  MouthPoseFooterStatus,
  MouthPosePlayArea,
  useMouthPosePromptWatcher,
} from '@/components/game/speech/mouth-pose/shared/mouthPoseShared';
import type { OralImitationSense } from '@/hooks/useOralImitationIntegration';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_ORAL_IMITATION_ROUNDS = 3;
export const ORAL_IMITATION_INTERACTIONS_PER_ROUND = 3;

export const PROMPT_LABELS: Record<string, string> = {
  open: 'Open mouth',
  close: 'Close mouth',
  smile: 'Smile',
  'funny-lips': 'Funny lips',
  'tongue-out': 'Tongue out',
  blow: 'Soft blow',
  watch: 'Watch',
  tap: 'Tap to try',
};

export function clearOralImitationSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakOralImitation(text: string, rate = DEFAULT_TTS_RATE) {
  clearOralImitationSpeech();
  speakTTS(text, rate);
}

export function hapticOralImitationReward() {
  try {
    Haptics.selectionAsync();
  } catch {
    /* ignore */
  }
}

export function useOralImitationSession(gameId: OralImitationGameId, rounds = DEFAULT_ORAL_IMITATION_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new OralImitationSessionManager(gameId, rounds));

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
        xpAwarded: stars * 12,
        durationMs: rounds * 45000,
        skillTags: [
          'oral-imitation-integration',
          'pre-oral-awareness',
          'mouth-imitation-confidence',
          'basic-oral-imitation',
        ],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[oral imitation] log failed', e);
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

export function OralImitationOverlays({
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
            message="Great copying and oral play!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 12}
            onHome={() => {
              clearOralImitationSpeech();
              onBack();
            }}
            onContinue={() => {
              clearOralImitationSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type OralImitationShellProps = {
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
  startTitle?: string;
  startHint?: string;
  children: React.ReactNode;
  onGoodTry?: () => void;
  sense?: OralImitationSense;
  /** When set, camera can auto-reward on approximate pose match. */
  poseTarget?: MouthPoseTarget | null;
  onPoseMatch?: () => void;
};

export function OralImitationShell({
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
  startEmoji = '😊',
  startTitle = 'Copy and play',
  startHint = 'Watch, copy if you want, and tap. Every try counts — no pressure.',
  children,
  onGoodTry,
  sense,
  poseTarget = null,
  onPoseMatch,
}: OralImitationShellProps) {
  return (
    <OralImitationShellInner
      title={title}
      subtitle={subtitle}
      skills={skills}
      gradient={gradient}
      accent={accent}
      onBack={onBack}
      round={round}
      rounds={rounds}
      hits={hits}
      canPlay={canPlay}
      onStart={onStart}
      phaseHint={phaseHint}
      startEmoji={startEmoji}
      startTitle={startTitle}
      startHint={startHint}
      onGoodTry={onGoodTry}
      sense={sense}
      poseTarget={poseTarget}
      onPoseMatch={onPoseMatch}
    >
      {children}
    </OralImitationShellInner>
  );
}

function OralImitationShellInner({
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
  startEmoji = '😊',
  startTitle = 'Copy and play',
  startHint = 'Watch, copy if you want, and tap. Every try counts — no pressure.',
  children,
  onGoodTry,
  sense,
  poseTarget,
  onPoseMatch,
}: OralImitationShellProps & { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearOralImitationSpeech();
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
            <Text style={styles.startTitle}>{startTitle}</Text>
            <Text style={styles.startHint}>{startHint}</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.hintBar, { borderColor: `${accent}55` }]}>
              <Ionicons name="heart" size={18} color={accent} />
              <Text style={styles.hintText}>{phaseHint}</Text>
            </View>
            <MouthPosePlayArea canPlay={canPlay}>
              {poseTarget && onPoseMatch ? (
                <OralImitationPoseWatcher
                  canPlay={canPlay}
                  poseTarget={poseTarget}
                  onPoseMatch={onPoseMatch}
                />
              ) : null}
              <View style={styles.playArea}>{children}</View>
            </MouthPosePlayArea>

            <View style={styles.helperRow}>
              <Pressable
                style={[styles.helperBtn, { backgroundColor: accent }]}
                onPress={() => {
                  onGoodTry?.();
                  hapticOralImitationReward();
                }}
              >
                <Text style={styles.helperBtnText}>😊 Good try</Text>
              </Pressable>
            </View>

            {sense && (
              <View style={styles.meterRow}>
                <View style={styles.meter}>
                  <View
                    style={[
                      styles.meterFill,
                      { width: `${Math.round(sense.engagementLevel * 100)}%`, backgroundColor: accent },
                    ]}
                  />
                </View>
                <Text style={styles.meterLabel}>
                  {sense.helperVisible ? 'Helper on' : `${sense.imitationAttempts} tries`}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.footer}>
          {canPlay && <MouthPoseFooterStatus canPlay={canPlay} />}
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {ORAL_IMITATION_INTERACTIONS_PER_ROUND} copies
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function OralImitationPoseWatcher({
  canPlay,
  poseTarget,
  onPoseMatch,
}: {
  canPlay: boolean;
  poseTarget: MouthPoseTarget;
  onPoseMatch: () => void;
}) {
  useMouthPosePromptWatcher(canPlay, poseTarget, onPoseMatch, 2200);
  return null;
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
  startHint: { fontSize: 16, color: '#475569', textAlign: 'center', marginTop: 10, lineHeight: 24, maxWidth: 360 },
  startBtn: { marginTop: 22, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
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
